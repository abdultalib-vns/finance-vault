import { useState, useRef, useEffect, useCallback } from "react";
import { X, Copy, Check, QrCode, Keyboard, Camera, Loader2, Shield, Clock, CheckCircle, AlertTriangle, Send } from "lucide-react";
import Lottie from "lottie-react";
import { verifySyncPin, generateSyncPayload, uploadSyncData, pollSyncData, initSyncSession, importSyncPayload } from "../lib/quickSync";
import { renderQRCode } from "../lib/qrGenerator";
import syncAnimation from "../../public/Sync.json";

interface Props {
  mode: "generate" | "scan"; // generate = Receiver, scan = Sender
  onClose: () => void;
  onSyncComplete: () => void;
}

type Step = 
  // Receiver Steps
  | "init" | "qr" | "decrypt" | "importing"
  // Sender Steps
  | "choose-method" | "camera" | "enter-code" | "grant" | "uploading"
  // Common
  | "success" | "error";

export default function QuickSyncModal({ mode, onClose, onSyncComplete }: Props) {
  const [step, setStep] = useState<Step>(mode === "generate" ? "init" : "choose-method");
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
  const pollRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
      stopCamera();
    };
  }, []);

  // ── RECEIVER: Init Session ────────────────────────────────────
  useEffect(() => {
    if (mode === "generate" && step === "init") {
      initSession();
    }
  }, [mode, step]);

  async function initSession() {
    try {
      const code = await initSyncSession();
      setSyncCode(code);
      setCountdown(600);
      setStep("qr");
    } catch (err: any) {
      setError(err.message || "Failed to initialize sync session.");
      setStep("error");
    }
  }

  // Draw QR when code is ready
  useEffect(() => {
    if (step === "qr" && syncCode && qrCanvasRef.current) {
      renderQRCode(qrCanvasRef.current, syncCode, 200);
    }
  }, [step, syncCode]);

  // Polling & Countdown for Receiver
  useEffect(() => {
    if (step === "qr" && syncCode) {
      // Countdown
      countdownRef.current = window.setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            if (pollRef.current) clearInterval(pollRef.current);
            setStep("error");
            setError("Sync code has expired. Please generate a new one.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Polling
      pollRef.current = window.setInterval(async () => {
        try {
          const data = await pollSyncData(syncCode);
          if (data) {
            // Data received!
            if (pollRef.current) clearInterval(pollRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
            setEncryptedData(data);
            setStep("decrypt");
          }
        } catch (err) {
          // Silent fail for polling errors, keep trying unless it's a hard error
        }
      }, 3000);

      return () => { 
        if (countdownRef.current) clearInterval(countdownRef.current); 
        if (pollRef.current) clearInterval(pollRef.current); 
      };
    }
  }, [step, syncCode]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  function handleCopyCode() {
    navigator.clipboard.writeText(syncCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── RECEIVER: Decrypt & Import ───────────────────────────────
  async function handleDecrypt() {
    setError("");
    if (pin.length < 4) { setError("PIN must be at least 4 digits."); return; }

    setStep("importing");
    // Adding slight delay so UI updates
    setTimeout(() => {
      try {
        const payload = importSyncPayload(encryptedData, pin);
        setSuccessMsg(`Synced ${payload.items.length} accounts, ${payload.expenses.length} expenses, and ${payload.cashbacks.length} cashbacks.`);
        setStep("success");
        onSyncComplete();
      } catch (err: any) {
        setError(err.message || "Decryption failed.");
        setStep("error");
      }
    }, 100);
  }

  // ── SENDER: Camera Scanner ───────────────────────────────────
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
            setStep("grant");
            return;
          }
        }
      } catch {}
      if (streamRef.current) requestAnimationFrame(scan);
    };
    
    // Wait for video to be ready
    setTimeout(scan, 500);
  }

  // ── SENDER: Upload ───────────────────────────────────────────
  async function handleGrantAccess() {
    setError("");
    if (pin.length < 4) { setError("PIN must be at least 4 digits."); return; }
    if (!verifySyncPin(pin)) { setError("Incorrect PIN."); return; }

    setStep("uploading");
    try {
      const payload = generateSyncPayload(pin);
      await uploadSyncData(manualCode, payload);
      setSuccessMsg("Your vault data has been securely sent to the receiver.");
      setStep("success");
    } catch (err: any) {
      setError(err.message || "Upload failed.");
      setStep("error");
    }
  }

  // ── RENDER ────────────────────────────────────────────────────
  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}>
      <div className="modal-sheet" style={{ maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "1rem" }}>
            <QrCode size={20} style={{ color: "var(--primary)" }} />
            {mode === "generate" ? "Receive Data" : "Send Data"}
          </h3>
          <button className="modal-close" onClick={() => { stopCamera(); onClose(); }}><X size={20} /></button>
        </div>

        <div style={{ padding: "8px 0 24px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* ── RECEIVER: Init Loading ── */}
          {step === "init" && (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <Loader2 size={40} style={{ color: "var(--primary)", animation: "spin 1s linear infinite" }} />
              <p style={{ color: "var(--text2)", marginTop: 12 }}>Generating secure code...</p>
            </div>
          )}

          {/* ── RECEIVER: QR Code Display ── */}
          {step === "qr" && (
            <>
              <div style={{ textAlign: "center" }}>
                <div style={{ background: "#fff", borderRadius: 16, padding: 20, display: "inline-block", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }}>
                  <canvas ref={qrCanvasRef} style={{ width: 200, height: 200 }} />
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "0.8rem", color: "var(--text3)", marginBottom: 8 }}>Scan the QR or enter this code on the other device:</p>
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
                Waiting for data... ({formatTime(countdown)})
              </div>

              <p style={{ fontSize: "0.78rem", color: "var(--text3)", textAlign: "center", lineHeight: 1.5 }}>
                Open FinAura on the other device → Settings → Velo's Quick Sync → Scan QR Code
              </p>
            </>
          )}

          {/* ── RECEIVER: Decrypt ── */}
          {step === "decrypt" && (
            <>
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <CheckCircle size={32} style={{ color: "var(--success)", margin: "0 auto 8px" }} />
                <p style={{ color: "var(--text)", fontSize: "1rem", fontWeight: 600 }}>Data Received!</p>
                <p style={{ color: "var(--text2)", fontSize: "0.85rem", marginTop: 4 }}>
                  Enter the PIN from the sender's device to confirm and decrypt.
                </p>
              </div>
              <input
                type="password"
                className="settings-input"
                placeholder="Sender's PIN"
                value={pin}
                onChange={e => { setPin(e.target.value); setError(""); }}
                inputMode="numeric"
                autoFocus
                style={{ textAlign: "center", letterSpacing: 6, fontSize: "1.2rem", fontWeight: 700 }}
                onKeyDown={e => e.key === "Enter" && handleDecrypt()}
              />
              {error && <p style={{ color: "var(--danger)", fontSize: "0.85rem", textAlign: "center" }}>{error}</p>}
              <button className="btn-primary" style={{ width: "100%" }} onClick={handleDecrypt} disabled={pin.length < 4}>
                <Shield size={16} /> Decrypt & Import
              </button>
            </>
          )}

          {/* ── SENDER: Choose Method ── */}
          {step === "choose-method" && (
            <>
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <QrCode size={32} style={{ color: "var(--primary)", margin: "0 auto 8px" }} />
                <p style={{ color: "var(--text2)", fontSize: "0.9rem", lineHeight: 1.5 }}>
                  Scan the QR code from the receiving device.
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

          {/* ── SENDER: Camera Scanner ── */}
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

          {/* ── SENDER: Manual Code Entry ── */}
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
              <button className="btn-primary" style={{ width: "100%", marginTop: 12 }} onClick={() => setStep("grant")} disabled={manualCode.length !== 8}>
                Continue
              </button>
            </>
          )}

          {/* ── SENDER: Grant Access ── */}
          {step === "grant" && (
            <>
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <Shield size={32} style={{ color: "var(--primary)", margin: "0 auto 8px" }} />
                <p style={{ color: "var(--text)", fontSize: "1rem", fontWeight: 600 }}>Sync Connection Found</p>
                <p style={{ color: "var(--text2)", fontSize: "0.85rem", marginTop: 4 }}>
                  Code: <strong style={{ letterSpacing: 3, fontFamily: "monospace" }}>{manualCode}</strong>
                </p>
                <p style={{ color: "var(--text2)", fontSize: "0.85rem", marginTop: 16 }}>
                  Enter your PIN to encrypt and send your vault data.
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
                style={{ textAlign: "center", letterSpacing: 6, fontSize: "1.2rem", fontWeight: 700 }}
                onKeyDown={e => e.key === "Enter" && handleGrantAccess()}
              />
              {error && <p style={{ color: "var(--danger)", fontSize: "0.85rem", textAlign: "center" }}>{error}</p>}
              <button className="btn-primary" style={{ width: "100%" }} onClick={handleGrantAccess} disabled={pin.length < 4}>
                <Send size={16} /> Encrypt & Send
              </button>
            </>
          )}

          {/* ── Loading (Importing or Uploading) ── */}
          {step === "importing" && (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <Loader2 size={40} style={{ color: "var(--primary)", animation: "spin 1s linear infinite" }} />
              <p style={{ color: "var(--text2)", marginTop: 12 }}>Decrypting & importing data...</p>
            </div>
          )}

          {step === "uploading" && (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <Loader2 size={40} style={{ color: "var(--primary)", animation: "spin 1s linear infinite" }} />
              <p style={{ color: "var(--text2)", marginTop: 12 }}>Encrypting & sending data...</p>
            </div>
          )}

          {/* ── Success ── */}
          {step === "success" && (
            <div style={{ textAlign: "center", padding: "16px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
              {mode === "scan" ? (
                <Lottie animationData={syncAnimation} loop={false} style={{ width: 140, height: 140, marginBottom: 8 }} />
              ) : (
                <CheckCircle size={48} style={{ color: "var(--success)", margin: "0 auto 12px" }} />
              )}
              <p style={{ color: "var(--text)", fontSize: "1.1rem", fontWeight: 700, marginBottom: 8 }}>
                {mode === "scan" ? "Sent Successfully!" : "Sync Complete!"}
              </p>
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
              <button className="btn-primary" style={{ width: "100%", marginTop: 20 }} onClick={() => { 
                if (mode === "generate") setStep("init");
                else { setStep("choose-method"); setManualCode(""); }
                setPin(""); setError(""); 
              }}>
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
