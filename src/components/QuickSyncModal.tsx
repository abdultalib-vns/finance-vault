import { useState, useRef, useEffect, useCallback } from "react";
import { X, Copy, Check, QrCode, Keyboard, Camera, Loader2, Shield, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { verifySyncPin, generateSyncPayload, uploadSyncData, downloadSyncData, importSyncPayload } from "../lib/quickSync";
import { renderQRCode } from "../lib/qrGenerator";

interface Props {
  mode: "generate" | "scan";
  onClose: () => void;
  onSyncComplete: () => void;
}

type Step = "pin" | "loading" | "qr" | "enter-code" | "camera" | "download-pin" | "importing" | "success" | "error";

export default function QuickSyncModal({ mode, onClose, onSyncComplete }: Props) {
  const [step, setStep] = useState<Step>("pin");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [syncCode, setSyncCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const [manualCode, setManualCode] = useState("");
  const [encryptedData, setEncryptedData] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const countdownRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      stopCamera();
    };
  }, []);

  // Draw QR when code is ready
  useEffect(() => {
    if (step === "qr" && syncCode && qrCanvasRef.current) {
      renderQRCode(qrCanvasRef.current, syncCode, 200);
    }
  }, [step, syncCode]);

  // Countdown timer
  useEffect(() => {
    if (step === "qr") {
      countdownRef.current = window.setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            setStep("error");
            setError("Sync code has expired. Please generate a new one.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
    }
  }, [step]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ── GENERATE FLOW ─────────────────────────────────────────────
  async function handleGeneratePin() {
    setError("");
    if (pin.length < 4) { setError("PIN must be at least 4 digits."); return; }
    if (!verifySyncPin(pin)) { setError("Incorrect PIN."); return; }

    setStep("loading");
    try {
      const encrypted = generateSyncPayload(pin);
      const code = await uploadSyncData(encrypted);
      setSyncCode(code);
      setCountdown(600);
      setStep("qr");
    } catch (err: any) {
      setError(err.message || "Failed to generate sync code.");
      setStep("error");
    }
  }

  function handleCopyCode() {
    navigator.clipboard.writeText(syncCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── SCAN/ENTER FLOW ───────────────────────────────────────────
  function handleScanInit() {
    setStep("pin");
  }

  async function handleScanPin() {
    setError("");
    if (manualCode.length !== 8) { setError("Please enter a valid 8-digit code."); return; }
    if (pin.length < 4) { setError("PIN must be at least 4 digits."); return; }

    setStep("importing");
    try {
      const data = await downloadSyncData(manualCode);
      setEncryptedData(data);
      const payload = importSyncPayload(data, pin);
      setSuccessMsg(`Synced ${payload.items.length} accounts, ${payload.expenses.length} expenses, ${payload.cashbacks.length} cashbacks, and ${payload.bankExpenses.length} bank transactions.`);
      setStep("success");
      onSyncComplete();
    } catch (err: any) {
      setError(err.message || "Sync failed.");
      setStep("error");
    }
  }

  // ── Camera Scanner ────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  async function startCamera() {
    setStep("camera");
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      scanForQR();
    } catch {
      setError("Could not access camera. Please enter the code manually.");
      setStep("enter-code");
    }
  }

  async function scanForQR() {
    if (!("BarcodeDetector" in window)) {
      stopCamera();
      setError("QR scanning not supported on this browser. Please enter the code manually.");
      setStep("enter-code");
      return;
    }

    const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
    
    const scan = async () => {
      if (!videoRef.current || !streamRef.current) return;
      try {
        const barcodes = await detector.detect(videoRef.current);
        if (barcodes.length > 0) {
          const value = barcodes[0].rawValue;
          if (/^\d{8}$/.test(value)) {
            stopCamera();
            setManualCode(value);
            setStep("download-pin");
            return;
          }
        }
      } catch {}
      if (streamRef.current) requestAnimationFrame(scan);
    };
    
    // Wait for video to be ready
    setTimeout(scan, 500);
  }

  // ── RENDER ────────────────────────────────────────────────────
  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}>
      <div className="modal-sheet" style={{ maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "1rem" }}>
            <QrCode size={20} style={{ color: "var(--primary)" }} />
            {mode === "generate" ? "Generate Sync Code" : "Receive Data"}
          </h3>
          <button className="modal-close" onClick={() => { stopCamera(); onClose(); }}><X size={20} /></button>
        </div>

        <div style={{ padding: "8px 0 24px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* ── PIN Entry (Generate) ── */}
          {step === "pin" && mode === "generate" && (
            <>
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <Shield size={32} style={{ color: "var(--primary)", margin: "0 auto 8px" }} />
                <p style={{ color: "var(--text2)", fontSize: "0.9rem", lineHeight: 1.5 }}>
                  Enter your PIN to encrypt and sync your vault data.
                </p>
              </div>
              <input
                type="password"
                className="settings-input"
                placeholder="Enter your PIN"
                value={pin}
                onChange={e => { setPin(e.target.value); setError(""); }}
                inputMode="numeric"
                autoFocus
                onKeyDown={e => e.key === "Enter" && handleGeneratePin()}
                style={{ textAlign: "center", letterSpacing: 6, fontSize: "1.3rem", fontWeight: 700 }}
              />
              {error && <p style={{ color: "var(--danger)", fontSize: "0.85rem", textAlign: "center" }}>{error}</p>}
              <button className="btn-primary" style={{ width: "100%" }} onClick={handleGeneratePin}>
                <QrCode size={16} /> Generate Sync Code
              </button>
            </>
          )}

          {/* ── PIN Entry (Scan/Enter mode — choose method) ── */}
          {step === "pin" && mode === "scan" && (
            <>
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <QrCode size={32} style={{ color: "var(--primary)", margin: "0 auto 8px" }} />
                <p style={{ color: "var(--text2)", fontSize: "0.9rem", lineHeight: 1.5 }}>
                  How would you like to receive data?
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button className="btn-primary" style={{ width: "100%", gap: 8 }} onClick={startCamera}>
                  <Camera size={16} /> Scan QR Code
                </button>
                <button className="btn-outline" style={{ width: "100%", gap: 8 }} onClick={() => setStep("enter-code")}>
                  <Keyboard size={16} /> Enter Code Manually
                </button>
              </div>
            </>
          )}

          {/* ── Loading ── */}
          {step === "loading" && (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <Loader2 size={40} style={{ color: "var(--primary)", animation: "spin 1s linear infinite" }} />
              <p style={{ color: "var(--text2)", marginTop: 12 }}>Encrypting & uploading your vault...</p>
            </div>
          )}

          {/* ── QR Code Display ── */}
          {step === "qr" && (
            <>
              <div style={{ textAlign: "center" }}>
                <div style={{ background: "#fff", borderRadius: 16, padding: 20, display: "inline-block", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }}>
                  <canvas ref={qrCanvasRef} style={{ width: 200, height: 200 }} />
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "0.8rem", color: "var(--text3)", marginBottom: 8 }}>Or enter this code on the other device:</p>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                  background: "var(--surface2)", borderRadius: 12, padding: "14px 20px"
                }}>
                  <span style={{ fontSize: "1.8rem", fontWeight: 800, letterSpacing: 6, fontFamily: "monospace", color: "var(--text)" }}>
                    {syncCode.slice(0, 4)} {syncCode.slice(4)}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "var(--success)" : "var(--primary)", padding: 4 }}
                    title="Copy"
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "10px 16px", borderRadius: 10,
                background: countdown < 60 ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
                color: countdown < 60 ? "#ef4444" : "#22c55e",
                fontSize: "0.85rem", fontWeight: 600
              }}>
                <Clock size={16} />
                Expires in {formatTime(countdown)}
              </div>

              <p style={{ fontSize: "0.78rem", color: "var(--text3)", textAlign: "center", lineHeight: 1.5 }}>
                Open FinAura on your other device → Settings → Velo's Quick Sync → Scan QR Code
              </p>
            </>
          )}

          {/* ── Camera Scanner ── */}
          {step === "camera" && (
            <>
              <div style={{ borderRadius: 16, overflow: "hidden", background: "#000", position: "relative" }}>
                <video
                  ref={videoRef}
                  style={{ width: "100%", height: 280, objectFit: "cover" }}
                  playsInline
                  muted
                />
                <div style={{
                  position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                  width: 180, height: 180, border: "3px solid rgba(255,255,255,0.6)", borderRadius: 16
                }} />
              </div>
              <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text2)" }}>Point your camera at the QR code</p>
              <button className="btn-outline" style={{ width: "100%" }} onClick={() => { stopCamera(); setStep("enter-code"); }}>
                <Keyboard size={16} /> Enter Code Manually Instead
              </button>
            </>
          )}

          {/* ── Manual Code Entry ── */}
          {step === "enter-code" && (
            <>
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <Keyboard size={32} style={{ color: "var(--primary)", margin: "0 auto 8px" }} />
                <p style={{ color: "var(--text2)", fontSize: "0.9rem" }}>Enter the 8-digit sync code</p>
              </div>
              <input
                type="text"
                className="settings-input"
                placeholder="Enter 8-digit code"
                value={manualCode}
                onChange={e => { setManualCode(e.target.value.replace(/\D/g, "").slice(0, 8)); setError(""); }}
                inputMode="numeric"
                maxLength={8}
                autoFocus
                style={{ textAlign: "center", letterSpacing: 8, fontSize: "1.5rem", fontWeight: 700 }}
              />
              <p style={{ fontSize: "0.8rem", color: "var(--text3)", textAlign: "center" }}>
                Now enter the sender's PIN to decrypt the data:
              </p>
              <input
                type="password"
                className="settings-input"
                placeholder="Enter sender's PIN"
                value={pin}
                onChange={e => { setPin(e.target.value); setError(""); }}
                inputMode="numeric"
                style={{ textAlign: "center", letterSpacing: 6, fontSize: "1.2rem", fontWeight: 700 }}
                onKeyDown={e => e.key === "Enter" && handleScanPin()}
              />
              {error && <p style={{ color: "var(--danger)", fontSize: "0.85rem", textAlign: "center" }}>{error}</p>}
              <button className="btn-primary" style={{ width: "100%" }} onClick={handleScanPin} disabled={manualCode.length !== 8 || pin.length < 4}>
                <Shield size={16} /> Sync Now
              </button>
            </>
          )}

          {/* ── Download PIN (after QR scan) ── */}
          {step === "download-pin" && (
            <>
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <CheckCircle size={32} style={{ color: "var(--success)", margin: "0 auto 8px" }} />
                <p style={{ color: "var(--text)", fontSize: "1rem", fontWeight: 600 }}>QR Code Scanned!</p>
                <p style={{ color: "var(--text2)", fontSize: "0.85rem", marginTop: 4 }}>
                  Code: <strong style={{ letterSpacing: 3, fontFamily: "monospace" }}>{manualCode}</strong>
                </p>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text3)", textAlign: "center" }}>
                Enter the sender's PIN to decrypt and import the data:
              </p>
              <input
                type="password"
                className="settings-input"
                placeholder="Enter sender's PIN"
                value={pin}
                onChange={e => { setPin(e.target.value); setError(""); }}
                inputMode="numeric"
                autoFocus
                style={{ textAlign: "center", letterSpacing: 6, fontSize: "1.2rem", fontWeight: 700 }}
                onKeyDown={e => e.key === "Enter" && handleScanPin()}
              />
              {error && <p style={{ color: "var(--danger)", fontSize: "0.85rem", textAlign: "center" }}>{error}</p>}
              <button className="btn-primary" style={{ width: "100%" }} onClick={handleScanPin} disabled={pin.length < 4}>
                <Shield size={16} /> Decrypt & Import
              </button>
            </>
          )}

          {/* ── Importing ── */}
          {step === "importing" && (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <Loader2 size={40} style={{ color: "var(--primary)", animation: "spin 1s linear infinite" }} />
              <p style={{ color: "var(--text2)", marginTop: 12 }}>Downloading & importing data...</p>
            </div>
          )}

          {/* ── Success ── */}
          {step === "success" && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <CheckCircle size={48} style={{ color: "var(--success)", margin: "0 auto 12px" }} />
              <p style={{ color: "var(--text)", fontSize: "1.1rem", fontWeight: 700, marginBottom: 8 }}>Sync Complete!</p>
              <p style={{ color: "var(--text2)", fontSize: "0.85rem", lineHeight: 1.6 }}>{successMsg}</p>
              <button className="btn-primary" style={{ width: "100%", marginTop: 20 }} onClick={onClose}>
                Done
              </button>
            </div>
          )}

          {/* ── Error ── */}
          {step === "error" && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <AlertTriangle size={48} style={{ color: "var(--danger)", margin: "0 auto 12px" }} />
              <p style={{ color: "var(--text)", fontSize: "1rem", fontWeight: 600, marginBottom: 8 }}>Sync Failed</p>
              <p style={{ color: "var(--text2)", fontSize: "0.85rem", lineHeight: 1.6 }}>{error}</p>
              <button className="btn-primary" style={{ width: "100%", marginTop: 20 }} onClick={() => { setStep("pin"); setPin(""); setError(""); setManualCode(""); }}>
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
