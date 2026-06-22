import { useState } from "react";
import CryptoJS from "crypto-js";
import {
  hashAdminPin,
  saveAdminPinHash,
  loadAdminPinHash,
  isAdminSetup,
  generateResetKey,
  saveResetKeyHash,
  verifyResetKey,
  resetAdminPin,
} from "./adminStorage";

type Mode = "login" | "setup" | "setup-confirm" | "reset" | "reset-done";

interface Props {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: Props) {
  const [mode, setMode] = useState<Mode>(!isAdminSetup() ? "setup" : "login");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [resetKey, setResetKey] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newPinConfirm, setNewPinConfirm] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // The expected email is securely hashed so it won't appear in the browser console or inspector
  const EXPECTED_EMAIL_HASH = "69fdeddff192c99bf5882f0e7fff96aa574b74cb5344a906262689ace0f1cff0";

  function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const enteredHash = CryptoJS.SHA256(email.trim().toLowerCase()).toString();
    if (enteredHash !== EXPECTED_EMAIL_HASH) {
      setError("Unauthorized admin email address");
      return;
    }
    if (pin.length < 4) { setError("PIN must be at least 4 digits"); return; }
    if (pin !== confirm) { setError("PINs do not match"); return; }
    const key = generateResetKey();
    setGeneratedKey(key);
    setMode("setup-confirm");
  }

  function handleSetupConfirm() {
    if (!generatedKey) return;
    saveAdminPinHash(hashAdminPin(pin));
    saveResetKeyHash(generatedKey);
    onLogin();
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (hashAdminPin(pin) === loadAdminPinHash()) {
        onLogin();
      } else {
        setError("Incorrect PIN");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!verifyResetKey(resetKey.toUpperCase())) {
      setError("Invalid recovery key");
      return;
    }
    if (newPin.length < 4) { setError("New PIN must be at least 4 digits"); return; }
    if (newPin !== newPinConfirm) { setError("PINs do not match"); return; }
    const key = generateResetKey();
    setGeneratedKey(key);
    resetAdminPin();
    saveAdminPinHash(hashAdminPin(newPin));
    saveResetKeyHash(key);
    // Use dedicated reset-done mode — NOT setup-confirm, which would
    // overwrite the new PIN hash using the stale `pin` state variable
    setMode("reset-done");
  }

  return (
    <div className="admin-login-screen">
      <div className="admin-login-card">

        {mode === "setup" && (
          <>
            <div className="admin-login-logo">
              <span className="admin-login-icon">⚙️</span>
              <h1 className="admin-login-title">Admin Panel Setup</h1>
              <p className="admin-login-sub">Create your admin PIN to get started</p>
            </div>
            <form onSubmit={handleSetup} className="admin-login-form">
              <div className="admin-form-field">
                <label className="admin-label">Authorized Admin Email</label>
                <input type="email"
                  className="admin-input" placeholder="Enter admin email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  autoFocus />
              </div>
              <div className="admin-form-field">
                <label className="admin-label">Admin PIN</label>
                <input type="password" inputMode="numeric" pattern="[0-9]*"
                  className="admin-input" placeholder="Min 4 digits"
                  value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  maxLength={12} />
              </div>
              <div className="admin-form-field">
                <label className="admin-label">Confirm PIN</label>
                <input type="password" inputMode="numeric" pattern="[0-9]*"
                  className="admin-input" placeholder="Confirm PIN"
                  value={confirm} onChange={(e) => setConfirm(e.target.value.replace(/\D/g, ""))}
                  maxLength={12} />
              </div>
              {error && <p className="admin-error">{error}</p>}
              <button type="submit" className="admin-btn-primary">Create Admin PIN</button>
            </form>
            <div className="admin-login-links">
              <a href="#" className="admin-link-btn" onClick={(e) => { e.preventDefault(); window.location.hash = ""; }}>
                ← Back to App
              </a>
            </div>
          </>
        )}

        {mode === "setup-confirm" && generatedKey && (
          <>
            <div className="admin-login-logo">
              <span className="admin-login-icon">🔑</span>
              <h1 className="admin-login-title">Save Your Recovery Key</h1>
              <p className="admin-login-sub">
                You'll need this to reset your PIN if you forget it.{" "}
                <strong>It will not be shown again.</strong>
              </p>
            </div>
            <div className="admin-recovery-key-box">
              <span className="admin-recovery-key">{generatedKey}</span>
              <button className="admin-recovery-copy"
                onClick={() => navigator.clipboard?.writeText(generatedKey)}
                title="Copy">📋 Copy</button>
            </div>
            <p className="admin-recovery-warn">
              ⚠️ Write this down — it's your only way to reset the admin PIN.
            </p>
            <button className="admin-btn-primary" style={{ marginTop: 12 }} onClick={handleSetupConfirm}>
              I've saved it — Continue
            </button>
          </>
        )}

        {mode === "login" && (
          <>
            <div className="admin-login-logo">
              <span className="admin-login-icon">⚙️</span>
              <h1 className="admin-login-title">Admin Panel</h1>
              <p className="admin-login-sub">Enter your admin PIN to continue</p>
            </div>
            <form onSubmit={handleLogin} className="admin-login-form">
              <div className="admin-form-field">
                <label className="admin-label">Admin PIN</label>
                <input type="password" inputMode="numeric" pattern="[0-9]*"
                  className="admin-input" placeholder="Enter PIN"
                  value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  maxLength={12} autoFocus />
              </div>
              {error && <p className="admin-error">{error}</p>}
              <button type="submit" className="admin-btn-primary" disabled={loading}>
                {loading ? "Verifying…" : "Unlock Admin Panel"}
              </button>
            </form>
            <div className="admin-login-links">
              <button className="admin-link-btn" onClick={() => { setError(""); setMode("reset"); }}>
                Forgot PIN? Use recovery key
              </button>
              <a href="#" className="admin-link-btn" onClick={(e) => { e.preventDefault(); window.location.hash = ""; }}>
                ← Back to App
              </a>
            </div>
          </>
        )}

        {mode === "reset" && (
          <>
            <div className="admin-login-logo">
              <span className="admin-login-icon">🔓</span>
              <h1 className="admin-login-title">Reset Admin PIN</h1>
              <p className="admin-login-sub">Enter your recovery key and choose a new PIN</p>
            </div>
            <form onSubmit={handleReset} className="admin-login-form">
              <div className="admin-form-field">
                <label className="admin-label">Recovery Key</label>
                <input className="admin-input admin-input-mono" placeholder="e.g. ABCD1234"
                  value={resetKey}
                  onChange={(e) => setResetKey(e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase())}
                  maxLength={8} autoFocus />
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
                  value={newPinConfirm} onChange={(e) => setNewPinConfirm(e.target.value.replace(/\D/g, ""))}
                  maxLength={12} />
              </div>
              {error && <p className="admin-error">{error}</p>}
              <button type="submit" className="admin-btn-primary">Reset PIN</button>
            </form>
            <div className="admin-login-links">
              <button className="admin-link-btn" onClick={() => { setError(""); setMode("login"); }}>
                ← Back to login
              </button>
            </div>
          </>
        )}

        {mode === "reset-done" && generatedKey && (
          <>
            <div className="admin-login-logo">
              <span className="admin-login-icon">🔑</span>
              <h1 className="admin-login-title">Save Your New Recovery Key</h1>
              <p className="admin-login-sub">
                Your PIN has been reset. Store this new recovery key safely.
                {" "}<strong>It will not be shown again.</strong>
              </p>
            </div>
            <div className="admin-recovery-key-box">
              <span className="admin-recovery-key">{generatedKey}</span>
              <button className="admin-recovery-copy"
                onClick={() => navigator.clipboard?.writeText(generatedKey)}
                title="Copy">📋 Copy</button>
            </div>
            <p className="admin-recovery-warn">
              ⚠️ The old recovery key no longer works. Write this one down now.
            </p>
            <button className="admin-btn-primary" style={{ marginTop: 12 }} onClick={onLogin}>
              I've saved it — Enter Admin Panel
            </button>
          </>
        )}

      </div>
    </div>
  );
}
