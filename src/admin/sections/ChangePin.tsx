import { useState } from "react";
import {
  hashAdminPin,
  saveAdminPinHash,
  loadAdminPinHash,
  generateResetKey,
  saveResetKeyHash,
  loadPlainResetKey,
} from "../adminStorage";
import { 
  ShieldCheck, Key, Eye, EyeOff, Copy, Check, 
  Lock, AlertTriangle, ArrowLeft, CheckCircle2 
} from "lucide-react";

export default function ChangePinSection() {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  // Recovery key reveal
  const [revealed, setRevealed] = useState(false);
  const [revealPin, setRevealPin] = useState("");
  const [revealError, setRevealError] = useState("");
  const [plainKey, setPlainKey] = useState<string | null>(null);

  function handleReveal(e: React.FormEvent) {
    e.preventDefault();
    setRevealError("");
    if (hashAdminPin(revealPin) !== loadAdminPinHash()) {
      setRevealError("Incorrect PIN");
      return;
    }
    const key = loadPlainResetKey();
    if (!key) {
      setRevealError("Recovery key not found. Change your PIN to generate a new one.");
      return;
    }
    setPlainKey(key);
    setRevealed(true);
    setRevealPin("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (hashAdminPin(currentPin) !== loadAdminPinHash()) {
      setError("Current PIN is incorrect");
      return;
    }
    if (newPin.length < 4) {
      setError("New PIN must be at least 4 digits");
      return;
    }
    if (newPin !== confirmPin) {
      setError("New PINs do not match");
      return;
    }
    const key = generateResetKey();
    saveAdminPinHash(hashAdminPin(newPin));
    saveResetKeyHash(key);
    setNewKey(key);
    setDone(true);
    setPlainKey(null);
    setRevealed(false);
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
  }

  function handleCopy(k: string) {
    navigator.clipboard?.writeText(k);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ShieldCheck size={22} className="admin-title-icon" />
            <span>Master Security</span>
          </h2>
          <p className="admin-section-desc">Manage your admin console authentication PIN and recovery credentials.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        {/* ── Recovery Key Card ── */}
        {!done && (
          <div className="admin-card">
            <h3 className="admin-card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Key size={18} color="var(--primary)" />
              <span>Recovery Key</span>
            </h3>
            <p className="admin-card-desc">
              Your recovery key lets you reset the admin PIN if forgotten. Confirm your current PIN to reveal it.
            </p>

            {!revealed ? (
              <form onSubmit={handleReveal} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
                <div className="admin-form-field">
                  <label className="admin-label">Enter PIN to Reveal</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    className="admin-input"
                    placeholder="Current admin PIN"
                    value={revealPin}
                    onChange={(e) => setRevealPin(e.target.value.replace(/\D/g, ""))}
                    maxLength={12}
                    style={{ width: "100%" }}
                  />
                </div>
                {revealError && <p className="admin-error">{revealError}</p>}
                <button
                  type="submit"
                  className="admin-btn-ghost"
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 16px" }}
                >
                  <Eye size={16} />
                  <span>Reveal Recovery Key</span>
                </button>
              </form>
            ) : (
              <div style={{ marginTop: 14 }}>
                <div className="admin-recovery-key-box" style={{ background: "var(--surface2)", padding: 14, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid var(--border)" }}>
                  <span className="admin-recovery-key" style={{ fontFamily: "monospace", fontSize: "1.2rem", fontWeight: 700, letterSpacing: "0.15em", color: "var(--primary)" }}>
                    {plainKey}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      className="admin-btn-ghost"
                      style={{ padding: "6px 12px", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 4 }}
                      onClick={() => handleCopy(plainKey ?? "")}
                      title="Copy Key"
                    >
                      {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                    <button
                      type="button"
                      className="admin-btn-ghost"
                      style={{ padding: "6px 12px", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 4 }}
                      onClick={() => { setRevealed(false); setPlainKey(null); }}
                    >
                      <EyeOff size={14} />
                      <span>Hide</span>
                    </button>
                  </div>
                </div>
                <p className="admin-recovery-warn" style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "var(--text3)" }}>
                  <AlertTriangle size={14} color="#f59e0b" />
                  <span>Keep this key private and stored in a safe vault.</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Change PIN Card ── */}
        {!done ? (
          <div className="admin-card">
            <h3 className="admin-card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Lock size={18} color="var(--primary)" />
              <span>Change Admin PIN</span>
            </h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
              <div className="admin-form-field">
                <label className="admin-label">Current PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  className="admin-input"
                  placeholder="Enter current PIN"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))}
                  maxLength={12}
                  style={{ width: "100%" }}
                />
              </div>
              <div className="admin-form-field">
                <label className="admin-label">New PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  className="admin-input"
                  placeholder="Min 4 digits"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                  maxLength={12}
                  style={{ width: "100%" }}
                />
              </div>
              <div className="admin-form-field">
                <label className="admin-label">Confirm New PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  className="admin-input"
                  placeholder="Confirm new PIN"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                  maxLength={12}
                  style={{ width: "100%" }}
                />
              </div>
              {error && <p className="admin-error">{error}</p>}
              <button
                type="submit"
                className="admin-btn-primary"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 20px" }}
              >
                <ShieldCheck size={16} />
                <span>Update Admin PIN</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="admin-card">
            <h3 className="admin-card-title" style={{ display: "flex", alignItems: "center", gap: 8, color: "#10b981" }}>
              <CheckCircle2 size={20} color="#10b981" />
              <span>PIN Changed Successfully</span>
            </h3>
            <p className="admin-card-desc">
              A new recovery key has been generated. Save it now — it will not be shown again after leaving this view.
            </p>
            <div className="admin-recovery-key-box" style={{ marginTop: 14, background: "var(--surface2)", padding: 14, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid var(--border)" }}>
              <span className="admin-recovery-key" style={{ fontFamily: "monospace", fontSize: "1.2rem", fontWeight: 700, letterSpacing: "0.15em", color: "var(--primary)" }}>
                {newKey}
              </span>
              <button
                type="button"
                className="admin-btn-ghost"
                style={{ padding: "6px 12px", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 4 }}
                onClick={() => handleCopy(newKey ?? "")}
                title="Copy Key"
              >
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <p className="admin-recovery-warn" style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "#f59e0b" }}>
              <AlertTriangle size={14} />
              <span>This replaces your old recovery key. The old one no longer works.</span>
            </p>
            <button
              type="button"
              className="admin-btn-ghost"
              style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6 }}
              onClick={() => setDone(false)}
            >
              <ArrowLeft size={16} />
              <span>Back to Security</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
