import React, { useState, useEffect, useRef } from "react";
import CryptoJS from "crypto-js";
import { 
  Shield, Key, ArrowRight, Eye, EyeOff, Delete, 
  Copy, Check, AlertTriangle, ArrowLeft, Sun, Moon, Lock
} from "lucide-react";
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
  const [isShaking, setIsShaking] = useState(false);
  const [showPlainPin, setShowPlainPin] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [adminDark, setAdminDark] = useState(() => {
    try {
      const saved = localStorage.getItem("admin_ui_dark");
      if (saved !== null) return saved === "1";
    } catch {}
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark-mode");
    }
    return false;
  });

  const EXPECTED_EMAIL_HASH = "69fdeddff192c99bf5882f0e7fff96aa574b74cb5344a906262689ace0f1cff0";

  function toggleTheme() {
    const next = !adminDark;
    setAdminDark(next);
    localStorage.setItem("admin_ui_dark", next ? "1" : "0");
  }

  function triggerError(msg: string) {
    setError(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  }

  // Determine active PIN based on mode
  const activePinValue = 
    mode === "login" ? pin :
    mode === "setup" ? pin :
    mode === "setup-confirm" ? confirm :
    mode === "reset" ? newPin :
    "";

  // Keypad actions
  function handleDigitPress(digit: string) {
    setError("");
    if (mode === "login") {
      if (pin.length < 12) setPin(prev => prev + digit);
    } else if (mode === "setup") {
      if (pin.length < 12) setPin(prev => prev + digit);
    } else if (mode === "reset") {
      if (newPin.length < 12) setNewPin(prev => prev + digit);
    }
  }

  function handleDeletePress() {
    setError("");
    if (mode === "login") {
      setPin(prev => prev.slice(0, -1));
    } else if (mode === "setup") {
      setPin(prev => prev.slice(0, -1));
    } else if (mode === "reset") {
      setNewPin(prev => prev.slice(0, -1));
    }
  }

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && activeEl instanceof HTMLInputElement && activeEl.type !== "hidden") {
        return;
      }

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigitPress(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleDeletePress();
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (mode === "login") {
          submitLogin();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, pin, newPin]);

  function submitLogin() {
    if (pin.length < 4) {
      triggerError("PIN must be at least 4 digits");
      return;
    }
    setError("");
    setLoading(true);
    try {
      if (hashAdminPin(pin) === loadAdminPinHash()) {
        onLogin();
      } else {
        triggerError("Incorrect PIN. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const enteredHash = CryptoJS.SHA256(email.trim().toLowerCase()).toString();
    if (enteredHash !== EXPECTED_EMAIL_HASH) {
      triggerError("Unauthorized admin email address");
      return;
    }
    if (pin.length < 4) {
      triggerError("PIN must be at least 4 digits");
      return;
    }
    if (pin !== confirm) {
      triggerError("PINs do not match");
      return;
    }
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

  function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!verifyResetKey(resetKey.toUpperCase())) {
      triggerError("Invalid recovery key");
      return;
    }
    if (newPin.length < 4) {
      triggerError("New PIN must be at least 4 digits");
      return;
    }
    if (newPin !== newPinConfirm) {
      triggerError("PINs do not match");
      return;
    }
    const key = generateResetKey();
    setGeneratedKey(key);
    resetAdminPin();
    saveAdminPinHash(hashAdminPin(newPin));
    saveResetKeyHash(key);
    setMode("reset-done");
  }

  function handleCopyKey(key: string) {
    navigator.clipboard?.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  }

  // Visual PIN Dots Component
  const renderPinDots = (val: string) => {
    const minSlots = 4;
    const totalSlots = Math.max(minSlots, Math.min(8, val.length));
    return (
      <div className={`auth-pin-pips-wrap ${isShaking ? "shake" : ""}`}>
        <div className="auth-pin-spacer" />
        <div className="auth-pin-pips-container">
          {Array.from({ length: totalSlots }).map((_, i) => {
            const isFilled = i < val.length;
            return (
              <div 
                key={i} 
                className={`auth-pin-pip ${isFilled ? "filled" : ""} ${showPlainPin && isFilled ? "show-text" : ""}`}
              >
                {isFilled && (
                  showPlainPin ? (
                    <span className="auth-pip-digit">{val[i]}</span>
                  ) : (
                    <span className="auth-pip-pulse" />
                  )
                )}
              </div>
            );
          })}
        </div>
        <div className="auth-pin-action-slot">
          {val.length > 0 ? (
            <button
              type="button"
              className="auth-pin-peek-btn"
              onClick={() => setShowPlainPin(!showPlainPin)}
              title={showPlainPin ? "Hide PIN" : "Show PIN"}
            >
              {showPlainPin ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          ) : (
            <div className="auth-pin-spacer" />
          )}
        </div>
      </div>
    );
  };

  const bgImage = adminDark
    ? "/Background_Image_(DarkMode).png"
    : "/Background_Image_(LightMode).png";

  return (
    <div className={`auth-screen-luxury ${adminDark ? "auth-dark-mode" : "auth-light-mode"}`}>
      {/* Theme-aware background image */}
      <img
        src={bgImage}
        alt=""
        className="auth-bg-image"
        aria-hidden="true"
      />

      {/* Dynamic Ambient Glow */}
      <div className="auth-ambient-glow" />
      <div className="auth-ambient-glow-secondary" />

      {/* Top Controls: Theme Toggle & Back to App */}
      <div style={{ position: "fixed", top: 16, right: 16, zIndex: 50, display: "flex", gap: 10 }}>
        <button
          type="button"
          onClick={toggleTheme}
          className="admin-login-theme-btn"
          title={adminDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            borderRadius: 12,
            padding: "8px 12px",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: "0.82rem",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            backdropFilter: "blur(10px)"
          }}
        >
          {adminDark ? <Sun size={15} color="#eab308" /> : <Moon size={15} color="#6366f1" />}
          <span>{adminDark ? "Light" : "Dark"}</span>
        </button>

        <button
          type="button"
          onClick={() => { window.location.hash = ""; }}
          className="admin-login-back-btn"
          title="Return to Main App"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            borderRadius: 12,
            padding: "8px 12px",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: "0.82rem",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            backdropFilter: "blur(10px)"
          }}
        >
          <ArrowLeft size={15} />
          <span>App</span>
        </button>
      </div>

      <div className="auth-luxury-card">
        {/* Brand Vault Emblem */}
        <div className="auth-brand-badge-wrap">
          <div className="auth-brand-halo">
            <img src="/icon-512.png" alt="FinAura Admin" className="auth-brand-logo-img" />
          </div>
        </div>

        <div className="auth-header-text">
          <h1 className="auth-brand-name">FinAura</h1>
          <div className="auth-security-pill">
            <Shield size={12} className="auth-security-icon" />
            <span>ADMIN PANEL</span>
          </div>
        </div>

        {/* ── MODE 1: LOGIN ── */}
        {mode === "login" && (
          <div className="auth-step-container">
            <h2 className="auth-step-title">Welcome Admin</h2>
            <p className="auth-step-sub">Enter your Master Admin PIN to unlock console</p>

            {renderPinDots(pin)}

            {error && (
              <div className="auth-error-pill">
                <AlertTriangle size={14} />
                <span>{error}</span>
              </div>
            )}

            {/* Interactive Luxury Keypad */}
            <div className="auth-luxury-keypad">
              <div className="auth-keypad-row">
                {["1", "2", "3"].map((d) => (
                  <button key={d} type="button" className="auth-keypad-btn" onClick={() => handleDigitPress(d)}>{d}</button>
                ))}
              </div>
              <div className="auth-keypad-row">
                {["4", "5", "6"].map((d) => (
                  <button key={d} type="button" className="auth-keypad-btn" onClick={() => handleDigitPress(d)}>{d}</button>
                ))}
              </div>
              <div className="auth-keypad-row">
                {["7", "8", "9"].map((d) => (
                  <button key={d} type="button" className="auth-keypad-btn" onClick={() => handleDigitPress(d)}>{d}</button>
                ))}
              </div>
              <div className="auth-keypad-row">
                <div className="auth-keypad-placeholder" />
                <button type="button" className="auth-keypad-btn" onClick={() => handleDigitPress("0")}>0</button>
                <button 
                  type="button" 
                  className="auth-keypad-btn del-key-btn" 
                  onClick={handleDeletePress} 
                  title="Delete"
                >
                  <Delete size={20} />
                </button>
              </div>
            </div>

            {/* Unlock Action Button */}
            <button 
              type="button" 
              className="auth-luxury-primary-btn"
              onClick={submitLogin}
              disabled={pin.length < 4 || loading}
            >
              <span>{loading ? "Verifying..." : "Unlock Admin Panel"}</span>
              <ArrowRight size={18} />
            </button>

            {/* Recovery Option */}
            <button
              type="button"
              className="auth-recover-link"
              onClick={() => { setError(""); setMode("reset"); }}
              style={{ marginTop: 14 }}
            >
              <Key size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
              Forgot Admin PIN? Use Recovery Key
            </button>
          </div>
        )}

        {/* ── MODE 2: SETUP ── */}
        {mode === "setup" && (
          <form onSubmit={handleSetup} className="auth-step-container">
            <h2 className="auth-step-title">Admin Setup</h2>
            <p className="auth-step-sub">Configure your Master Admin PIN to initialize</p>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text2)", marginBottom: 6, display: "block" }}>
                  Authorized Admin Email
                </label>
                <input
                  type="email"
                  className="admin-input"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--text)" }}
                  placeholder="Enter authorized email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text2)", marginBottom: 6, display: "block" }}>
                  Admin PIN (min 4 digits)
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  className="admin-input"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--text)" }}
                  placeholder="Create Admin PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  maxLength={12}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text2)", marginBottom: 6, display: "block" }}>
                  Confirm Admin PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  className="admin-input"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--text)" }}
                  placeholder="Re-enter Admin PIN"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value.replace(/\D/g, ""))}
                  maxLength={12}
                />
              </div>
            </div>

            {error && (
              <div className="auth-error-pill" style={{ marginTop: 12 }}>
                <AlertTriangle size={14} />
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="auth-luxury-primary-btn"
              style={{ marginTop: 16 }}
            >
              <span>Create Admin PIN</span>
              <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* ── MODE 3: SETUP-CONFIRM (SAVE RECOVERY KEY) ── */}
        {mode === "setup-confirm" && generatedKey && (
          <div className="auth-step-container">
            <h2 className="auth-step-title">Save Recovery Key</h2>
            <p className="auth-step-sub">Store this key in a safe place. You will need it to reset your PIN if forgotten.</p>

            <div style={{
              width: "100%",
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "16px",
              marginTop: 12,
              textAlign: "center"
            }}>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, letterSpacing: "0.2em", fontFamily: "monospace", color: "var(--primary)" }}>
                {generatedKey}
              </div>
              <button
                type="button"
                className="btn-outline"
                onClick={() => handleCopyKey(generatedKey)}
                style={{ marginTop: 12, padding: "6px 14px", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                {copiedKey ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                <span>{copiedKey ? "Copied to Clipboard!" : "Copy Key"}</span>
              </button>
            </div>

            <div style={{
              background: "rgba(245, 158, 11, 0.1)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              color: "#f59e0b",
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: "0.78rem",
              lineHeight: 1.4,
              marginTop: 14,
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <span>Write this down now. It will never be shown again!</span>
            </div>

            <button
              type="button"
              className="auth-luxury-primary-btn"
              onClick={handleSetupConfirm}
              style={{ marginTop: 16 }}
            >
              <span>I've Saved It — Continue</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ── MODE 4: RESET ── */}
        {mode === "reset" && (
          <form onSubmit={handleReset} className="auth-step-container">
            <h2 className="auth-step-title">Reset Admin PIN</h2>
            <p className="auth-step-sub">Enter your 8-character recovery key and set a new PIN</p>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text2)", marginBottom: 6, display: "block" }}>
                  Recovery Key
                </label>
                <input
                  type="text"
                  className="admin-input"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--text)", fontFamily: "monospace", letterSpacing: "0.1em" }}
                  placeholder="e.g. ABCD1234"
                  value={resetKey}
                  onChange={(e) => setResetKey(e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase())}
                  maxLength={8}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text2)", marginBottom: 6, display: "block" }}>
                  New Admin PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  className="admin-input"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--text)" }}
                  placeholder="Min 4 digits"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                  maxLength={12}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text2)", marginBottom: 6, display: "block" }}>
                  Confirm New Admin PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  className="admin-input"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--text)" }}
                  placeholder="Confirm PIN"
                  value={newPinConfirm}
                  onChange={(e) => setNewPinConfirm(e.target.value.replace(/\D/g, ""))}
                  maxLength={12}
                />
              </div>
            </div>

            {error && (
              <div className="auth-error-pill" style={{ marginTop: 12 }}>
                <AlertTriangle size={14} />
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="auth-luxury-primary-btn"
              style={{ marginTop: 16 }}
            >
              <span>Reset PIN</span>
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="auth-recover-link"
              onClick={() => { setError(""); setMode("login"); }}
              style={{ marginTop: 14 }}
            >
              <ArrowLeft size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
              Back to Login
            </button>
          </form>
        )}

        {/* ── MODE 5: RESET-DONE ── */}
        {mode === "reset-done" && generatedKey && (
          <div className="auth-step-container">
            <h2 className="auth-step-title">New Recovery Key</h2>
            <p className="auth-step-sub">Your PIN has been updated. Store this replacement recovery key.</p>

            <div style={{
              width: "100%",
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "16px",
              marginTop: 12,
              textAlign: "center"
            }}>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, letterSpacing: "0.2em", fontFamily: "monospace", color: "var(--primary)" }}>
                {generatedKey}
              </div>
              <button
                type="button"
                className="btn-outline"
                onClick={() => handleCopyKey(generatedKey)}
                style={{ marginTop: 12, padding: "6px 14px", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                {copiedKey ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                <span>{copiedKey ? "Copied to Clipboard!" : "Copy Key"}</span>
              </button>
            </div>

            <button
              type="button"
              className="auth-luxury-primary-btn"
              onClick={onLogin}
              style={{ marginTop: 16 }}
            >
              <span>Enter Admin Panel</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Card Footer Security Badge */}
        <div className="auth-luxury-footer" style={{ marginTop: 24 }}>
          <Shield size={14} />
          <span>256-Bit Client Encrypted • Zero Server Knowledge</span>
        </div>
      </div>
    </div>
  );
}
