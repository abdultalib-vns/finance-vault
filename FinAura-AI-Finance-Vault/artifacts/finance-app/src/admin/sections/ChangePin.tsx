import { useState } from "react";
import {
  hashAdminPin,
  saveAdminPinHash,
  loadAdminPinHash,
  generateResetKey,
  saveResetKeyHash,
  loadPlainResetKey,
} from "../adminStorage";

export default function ChangePinSection() {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [done, setDone] = useState(false);

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

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">Security</h2>
          <p className="admin-section-desc">Manage your admin PIN and recovery key.</p>
        </div>
      </div>

      {/* ── Recovery Key Card ── */}
      {!done && (
        <div className="admin-theme-block" style={{ maxWidth: 420 }}>
          <h3 className="admin-analytics-subtitle">🔑 Recovery Key</h3>
          <p className="admin-theme-hint">
            Your recovery key lets you reset the admin PIN if you forget it. Confirm your PIN to reveal it.
          </p>

          {!revealed ? (
            <form onSubmit={handleReveal} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
              <div className="admin-form-field">
                <label className="admin-label">Enter PIN to Reveal</label>
                <input type="password" inputMode="numeric" pattern="[0-9]*"
                  className="admin-input" placeholder="Current admin PIN"
                  value={revealPin} onChange={(e) => setRevealPin(e.target.value.replace(/\D/g, ""))}
                  maxLength={12} />
              </div>
              {revealError && <p className="admin-error">{revealError}</p>}
              <button type="submit" className="admin-btn-ghost">👁 Reveal Recovery Key</button>
            </form>
          ) : (
            <div style={{ marginTop: 12 }}>
              <div className="admin-recovery-key-box">
                <span className="admin-recovery-key">{plainKey}</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button className="admin-recovery-copy"
                    onClick={() => navigator.clipboard?.writeText(plainKey ?? "")}
                    title="Copy">📋 Copy</button>
                  <button className="admin-recovery-copy"
                    style={{ background: "var(--bg)", color: "var(--text2)" }}
                    onClick={() => { setRevealed(false); setPlainKey(null); }}>
                    🙈 Hide
                  </button>
                </div>
              </div>
              <p className="admin-recovery-warn" style={{ marginTop: 8 }}>
                Keep this key private and stored somewhere safe.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Change PIN Card ── */}
      {!done ? (
        <div className="admin-theme-block" style={{ maxWidth: 420 }}>
          <h3 className="admin-analytics-subtitle">🔒 Change Admin PIN</h3>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="admin-form-field">
              <label className="admin-label">Current PIN</label>
              <input type="password" inputMode="numeric" pattern="[0-9]*"
                className="admin-input" placeholder="Enter current PIN"
                value={currentPin} onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))}
                maxLength={12} />
            </div>
            <div className="admin-form-field">
              <label className="admin-label">New PIN</label>
              <input type="password" inputMode="numeric" pattern="[0-9]*"
                className="admin-input" placeholder="Min 4 digits"
                value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                maxLength={12} />
            </div>
            <div className="admin-form-field">
              <label className="admin-label">Confirm New PIN</label>
              <input type="password" inputMode="numeric" pattern="[0-9]*"
                className="admin-input" placeholder="Confirm new PIN"
                value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                maxLength={12} />
            </div>
            {error && <p className="admin-error">{error}</p>}
            <button type="submit" className="admin-btn-primary">Change PIN</button>
          </form>
        </div>
      ) : (
        <div className="admin-theme-block" style={{ maxWidth: 420 }}>
          <h3 className="admin-analytics-subtitle">✅ PIN Changed Successfully</h3>
          <p className="admin-theme-hint">
            A new recovery key has been generated.{" "}
            <strong>Save it now — it won't be shown again after you leave this screen.</strong>
          </p>
          <div className="admin-recovery-key-box" style={{ marginTop: 12 }}>
            <span className="admin-recovery-key">{newKey}</span>
            <button className="admin-recovery-copy"
              onClick={() => navigator.clipboard?.writeText(newKey ?? "")}
              title="Copy">📋 Copy</button>
          </div>
          <p className="admin-recovery-warn" style={{ marginTop: 10 }}>
            ⚠️ This replaces your old recovery key. The old one no longer works.
          </p>
          <button className="admin-btn-ghost" style={{ marginTop: 14 }} onClick={() => setDone(false)}>
            ← Back to Security
          </button>
        </div>
      )}
    </div>
  );
}

