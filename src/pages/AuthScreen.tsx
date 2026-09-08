import { customAlert } from "../components/CustomAlert";
import { 
  Lock, AlertTriangle, Key, Smartphone, Fingerprint, 
  ShieldCheck, ArrowRight, Eye, EyeOff, Delete, Sparkles, Shield
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { hashPin } from "../lib/crypto";
import {
  loadPinHash, savePinHash,
  loadSecurityQuestion, saveSecurityQuestion,
  loadSecurityAnswerHash, saveSecurityAnswerHash,
  hasSecurityQuestion,
} from "../lib/storage";
import {
  isBiometricSupported,
  isBiometricEnrolled,
  loginWithBiometric,
  disableBiometric,
} from "../lib/biometric";

const SECURITY_QUESTIONS = [
  "What is your birth place?",
  "What is your favorite food?",
  "What is your best friend's name?",
  "What is your first pet's name?",
];

const MAX_ATTEMPTS = 5;

type Step =
  | "pin-enter"       // new user: enter PIN
  | "pin-confirm"     // new user: confirm PIN
  | "security-setup"  // new user: choose question + answer
  | "unlock"          // existing user: enter PIN
  | "recover-check"   // recovery: enter security answer
  | "recover-pin"     // recovery: enter new PIN
  | "recover-confirm"; // recovery: confirm new PIN

interface Props {
  onUnlock: (key: string) => void;
}

export default function AuthScreen({ onUnlock }: Props) {
  const existingHash = loadPinHash();
  const isNewUser = !existingHash;

  const [step, setStep] = useState<Step>(isNewUser ? "pin-enter" : "unlock");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [secQIdx, setSecQIdx] = useState(0);
  const [secAnswer, setSecAnswer] = useState("");
  const [recoverAnswer, setRecoverAnswer] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [bioReady, setBioReady] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [showPlainPin, setShowPlainPin] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [showInstallPopup, setShowInstallPopup] = useState(false);

  const pinRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    pinRef.current?.focus();
  }, [step]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isNewUser) return;
      if (!isBiometricEnrolled()) return;
      const supported = await isBiometricSupported();
      if (!cancelled) setBioReady(supported);
    })();
    return () => { cancelled = true; };
  }, [isNewUser]);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      if (isNewUser) {
        setShowInstallPopup(true);
      }
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallPopup(false);
    } else if (isNewUser && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
      setShowInstallPopup(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isNewUser]);

  useEffect(() => {
    const handler = () => setShowInstallPopup(false);
    window.addEventListener("appinstalled", handler);
    return () => window.removeEventListener("appinstalled", handler);
  }, []);

  async function handleInstall() {
    if (installPromptEvent) {
      installPromptEvent.prompt();
      const { outcome } = await installPromptEvent.userChoice;
      if (outcome === 'accepted') {
        setShowInstallPopup(false);
      }
      setInstallPromptEvent(null);
    } else if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      customAlert("To install on iOS: tap the Share button at the bottom of Safari and select 'Add to Home Screen'.");
    } else {
      customAlert("Installation is not supported on this browser, or the app is already installed.");
    }
  }

  function triggerError(msg: string) {
    setError(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  }

  function clearFields() {
    setPin(""); setConfirmPin(""); setSecAnswer("");
    setRecoverAnswer(""); setNewPin(""); setConfirmNewPin("");
    setError("");
  }

  // ── KEYPAD ACTIONS ─────────────────────────────────────────────
  function handleDigitPress(digit: string) {
    setError("");
    if (step === "pin-enter" || step === "unlock") {
      if (pin.length < 12) setPin((prev) => prev + digit);
    } else if (step === "pin-confirm") {
      if (confirmPin.length < 12) setConfirmPin((prev) => prev + digit);
    } else if (step === "recover-pin") {
      if (newPin.length < 12) setNewPin((prev) => prev + digit);
    } else if (step === "recover-confirm") {
      if (confirmNewPin.length < 12) setConfirmNewPin((prev) => prev + digit);
    }
  }

  function handleDeletePress() {
    setError("");
    if (step === "pin-enter" || step === "unlock") {
      setPin((prev) => prev.slice(0, -1));
    } else if (step === "pin-confirm") {
      setConfirmPin((prev) => prev.slice(0, -1));
    } else if (step === "recover-pin") {
      setNewPin((prev) => prev.slice(0, -1));
    } else if (step === "recover-confirm") {
      setConfirmNewPin((prev) => prev.slice(0, -1));
    }
  }

  // ── NEW USER FLOW ──────────────────────────────────────────────
  function handleNewUserSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (step === "pin-enter") {
      if (pin.length < 4) { 
        triggerError("PIN must be at least 4 digits."); 
        return; 
      }
      setStep("pin-confirm");
      setConfirmPin("");
      return;
    }

    if (step === "pin-confirm") {
      if (confirmPin !== pin) {
        triggerError("PINs do not match. Try again.");
        setPin(""); setConfirmPin(""); setStep("pin-enter");
        return;
      }
      setStep("security-setup");
      setSecAnswer("");
      return;
    }

    if (step === "security-setup") {
      if (!secAnswer.trim()) { 
        triggerError("Please enter an answer."); 
        return; 
      }
      if (secAnswer.trim().length < 2) { 
        triggerError("Answer is too short."); 
        return; 
      }
      savePinHash(hashPin(pin));
      saveSecurityQuestion(secQIdx);
      saveSecurityAnswerHash(hashPin(secAnswer.trim().toLowerCase()));
      onUnlock(pin);
    }
  }

  // ── EXISTING USER UNLOCK ───────────────────────────────────────
  function handleUnlockSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError("");

    if (!pin) {
      triggerError("Please enter your Master PIN.");
      return;
    }

    if (hashPin(pin) !== existingHash) {
      const next = failedAttempts + 1;
      setFailedAttempts(next);
      setPin("");
      if (next >= MAX_ATTEMPTS) {
        triggerError(`Incorrect PIN. ${MAX_ATTEMPTS} failed attempts reached.`);
      } else {
        triggerError(`Incorrect PIN. ${MAX_ATTEMPTS - next} attempt${MAX_ATTEMPTS - next !== 1 ? "s" : ""} left.`);
      }
      return;
    }
    setFailedAttempts(0);
    onUnlock(pin);
  }

  // ── RECOVERY FLOW ─────────────────────────────────────────────
  function handleRecoverCheck(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const savedHash = loadSecurityAnswerHash();
    if (!savedHash) { triggerError("No security question set."); return; }
    if (hashPin(recoverAnswer.trim().toLowerCase()) !== savedHash) {
      triggerError("Incorrect answer. Please try again.");
      setRecoverAnswer("");
      return;
    }
    setStep("recover-pin");
    setNewPin("");
  }

  function handleRecoverNewPin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPin.length < 4) { triggerError("PIN must be at least 4 digits."); return; }
    setStep("recover-confirm");
    setConfirmNewPin("");
  }

  function handleRecoverConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (confirmNewPin !== newPin) {
      triggerError("PINs do not match. Try again.");
      setNewPin(""); setConfirmNewPin(""); setStep("recover-pin");
      return;
    }
    savePinHash(hashPin(newPin));
    setFailedAttempts(0);
    clearFields();
    onUnlock(newPin);
  }

  async function handleBiometric() {
    setError("");
    setBioLoading(true);
    try {
      const recovered = await loginWithBiometric();
      if (hashPin(recovered) !== existingHash) {
        disableBiometric();
        setBioReady(false);
        throw new Error("Saved PIN no longer matches. Please use your PIN once to re-enable biometric.");
      }
      onUnlock(recovered);
    } catch (err) {
      triggerError(err instanceof Error ? err.message : "Biometric authentication failed.");
    } finally {
      setBioLoading(false);
    }
  }

  const hasSQ = hasSecurityQuestion();
  const savedQIdx = loadSecurityQuestion() ?? 0;

  // Active PIN value based on step
  const activePinValue = 
    step === "pin-enter" ? pin :
    step === "pin-confirm" ? confirmPin :
    step === "recover-pin" ? newPin :
    step === "recover-confirm" ? confirmNewPin :
    pin;

  const isPinStep = 
    step === "unlock" || 
    step === "pin-enter" || 
    step === "pin-confirm" || 
    step === "recover-pin" || 
    step === "recover-confirm";

  // Visual PIN Dots Component
  const renderPinDots = () => {
    const minSlots = 4;
    const totalSlots = Math.max(minSlots, Math.min(8, activePinValue.length));
    return (
      <div 
        className={`auth-pin-pips-wrap ${isShaking ? "shake" : ""}`}
        onClick={() => pinRef.current?.focus()}
        title="Tap to focus keyboard"
      >
        <div className="auth-pin-pips-container">
          {Array.from({ length: totalSlots }).map((_, i) => {
            const isFilled = i < activePinValue.length;
            return (
              <div 
                key={i} 
                className={`auth-pin-pip ${isFilled ? "filled" : ""}`}
              >
                {isFilled && <span className="auth-pip-pulse" />}
              </div>
            );
          })}
        </div>
        {activePinValue.length > 0 && (
          <button
            type="button"
            className="auth-pin-peek-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowPlainPin(!showPlainPin);
            }}
            title={showPlainPin ? "Hide PIN" : "Show PIN"}
          >
            {showPlainPin ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    );
  };

  // ── RENDER ────────────────────────────────────────────────────
  return (
    <div className="auth-screen-luxury">
      {/* Dynamic Ambient Radiant Mesh Background */}
      <div className="auth-ambient-glow" />
      <div className="auth-ambient-glow-secondary" />

      <div className="auth-luxury-card">
        {/* Brand Vault Emblem */}
        <div className="auth-brand-badge-wrap">
          <div className="auth-brand-halo">
            <img src="/icon-512.png" alt="FinAura" className="auth-brand-logo-img" />
          </div>
        </div>

        <div className="auth-header-text">
          <h1 className="auth-brand-name">FinAura</h1>
          <div className="auth-security-pill">
            <Shield size={12} className="auth-security-icon" />
            <span>PERSONAL VAULT</span>
          </div>
        </div>

        {/* ── EXISTING USER: Unlock ── */}
        {step === "unlock" && (
          <div className="auth-step-container">
            <h2 className="auth-step-title">Welcome Back</h2>
            <p className="auth-step-sub">Enter your Master PIN to unlock your vault</p>

            {/* Visual Indicator Dots */}
            {renderPinDots()}

            {/* Form for physical keyboard & screen readers */}
            <form className="auth-form-hidden" onSubmit={handleUnlockSubmit}>
              <input
                ref={pinRef}
                type={showPlainPin ? "text" : "password"}
                inputMode="numeric"
                maxLength={12}
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore
                className="auth-hidden-input"
                placeholder="Enter PIN"
                autoFocus
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError("");
                }}
              />
            </form>

            {error && (
              <div className="auth-luxury-error">
                <AlertTriangle size={15} />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Touch Keypad for Mobile / Seamless Entry */}
            <div className="auth-keypad">
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
                {bioReady ? (
                  <button 
                    type="button" 
                    className="auth-keypad-btn bio-key-btn" 
                    onClick={handleBiometric} 
                    disabled={bioLoading}
                    title="Unlock with Biometric"
                  >
                    <Fingerprint size={24} color="#10B981" />
                  </button>
                ) : (
                  <div className="auth-keypad-placeholder" />
                )}
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
              onClick={() => handleUnlockSubmit()}
              disabled={pin.length < 4}
            >
              <span>Unlock Vault</span>
              <ArrowRight size={18} />
            </button>

            {/* Biometric Banner Option */}
            {bioReady && (
              <button 
                type="button" 
                className="auth-bio-quick-btn" 
                onClick={handleBiometric} 
                disabled={bioLoading}
              >
                <Fingerprint size={18} />
                <span>{bioLoading ? "Verifying Identity…" : "Sign in with Biometric"}</span>
              </button>
            )}

            {/* Recovery Option */}
            {failedAttempts >= MAX_ATTEMPTS && hasSQ && (
              <button
                type="button"
                className="auth-recover-link"
                onClick={() => { clearFields(); setStep("recover-check"); }}
              >
                <Key size={14} />
                <span>Forgot PIN? Recover with Security Question</span>
              </button>
            )}
          </div>
        )}

        {/* ── NEW USER: Enter PIN ── */}
        {step === "pin-enter" && (
          <div className="auth-step-container">
            <h2 className="auth-step-title">Create Master PIN</h2>
            <p className="auth-step-sub">Set a secure PIN to encrypt your personal vault</p>

            {renderPinDots()}

            <form className="auth-form-hidden" onSubmit={handleNewUserSubmit}>
              <input
                ref={pinRef}
                type={showPlainPin ? "text" : "password"}
                inputMode="numeric"
                maxLength={12}
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore
                className="auth-hidden-input"
                placeholder="Enter PIN"
                autoFocus
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError("");
                }}
              />
            </form>

            {error && (
              <div className="auth-luxury-error">
                <AlertTriangle size={15} />
                <span>{error}</span>
              </div>
            )}

            {/* Keypad */}
            <div className="auth-keypad">
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
                <button type="button" className="auth-keypad-btn del-key-btn" onClick={handleDeletePress}>
                  <Delete size={20} />
                </button>
              </div>
            </div>

            <button 
              type="button" 
              className="auth-luxury-primary-btn"
              onClick={handleNewUserSubmit}
              disabled={pin.length < 4}
            >
              <span>Next: Confirm PIN</span>
              <ArrowRight size={18} />
            </button>

            <p className="auth-luxury-footnote">
              <ShieldCheck size={14} color="#10B981" />
              <span>Your PIN encrypts your financial data directly on this device.</span>
            </p>
          </div>
        )}

        {/* ── NEW USER: Confirm PIN ── */}
        {step === "pin-confirm" && (
          <div className="auth-step-container">
            <h2 className="auth-step-title">Confirm Master PIN</h2>
            <p className="auth-step-sub">Re-enter your PIN to verify</p>

            {renderPinDots()}

            <form className="auth-form-hidden" onSubmit={handleNewUserSubmit}>
              <input
                ref={pinRef}
                type={showPlainPin ? "text" : "password"}
                inputMode="numeric"
                maxLength={12}
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore
                className="auth-hidden-input"
                placeholder="Confirm PIN"
                autoFocus
                value={confirmPin}
                onChange={(e) => {
                  setConfirmPin(e.target.value);
                  setError("");
                }}
              />
            </form>

            {error && (
              <div className="auth-luxury-error">
                <AlertTriangle size={15} />
                <span>{error}</span>
              </div>
            )}

            <div className="auth-keypad">
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
                <button type="button" className="auth-keypad-btn del-key-btn" onClick={handleDeletePress}>
                  <Delete size={20} />
                </button>
              </div>
            </div>

            <button 
              type="button" 
              className="auth-luxury-primary-btn"
              onClick={handleNewUserSubmit}
              disabled={confirmPin.length < 4}
            >
              <span>Confirm & Continue</span>
              <ArrowRight size={18} />
            </button>

            <button 
              type="button" 
              className="auth-luxury-secondary-btn" 
              onClick={() => { setStep("pin-enter"); clearFields(); }}
            >
              Change PIN
            </button>
          </div>
        )}

        {/* ── NEW USER: Security Question Setup ── */}
        {step === "security-setup" && (
          <div className="auth-step-container">
            <h2 className="auth-step-title">Security Recovery</h2>
            <p className="auth-step-sub">Select a recovery question to restore access if you forget your PIN</p>

            <form onSubmit={handleNewUserSubmit} className="auth-setup-form">
              <div className="auth-sq-grid">
                {SECURITY_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`auth-sq-card ${secQIdx === i ? "active" : ""}`}
                    onClick={() => setSecQIdx(i)}
                  >
                    <span className="auth-sq-radio-dot" />
                    <span>{q}</span>
                  </button>
                ))}
              </div>

              <div className="auth-answer-input-wrap">
                <input
                  ref={pinRef}
                  type="text"
                  className="auth-answer-input"
                  placeholder="Enter your security answer…"
                  autoFocus
                  value={secAnswer}
                  onChange={(e) => { setSecAnswer(e.target.value); setError(""); }}
                />
              </div>

              {error && (
                <div className="auth-luxury-error">
                  <AlertTriangle size={15} />
                  <span>{error}</span>
                </div>
              )}

              <p className="auth-sq-hint">
                <Sparkles size={13} color="#F59E0B" />
                <span>Answers are case-insensitive and hashed securely on your device.</span>
              </p>

              <button type="submit" className="auth-luxury-primary-btn">
                <span>Complete Vault Setup</span>
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        )}

        {/* ── RECOVERY: Check Security Answer ── */}
        {step === "recover-check" && (
          <div className="auth-step-container">
            <h2 className="auth-step-title">Account Recovery</h2>
            <p className="auth-step-sub">Answer your security question to reset your Master PIN</p>

            <form onSubmit={handleRecoverCheck} className="auth-setup-form">
              <div className="auth-sq-active-display">
                <Key size={18} color="#F59E0B" />
                <span>{SECURITY_QUESTIONS[savedQIdx]}</span>
              </div>

              <div className="auth-answer-input-wrap">
                <input
                  ref={pinRef}
                  type="text"
                  className="auth-answer-input"
                  placeholder="Enter your answer…"
                  autoFocus
                  value={recoverAnswer}
                  onChange={(e) => { setRecoverAnswer(e.target.value); setError(""); }}
                />
              </div>

              {error && (
                <div className="auth-luxury-error">
                  <AlertTriangle size={15} />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className="auth-luxury-primary-btn">
                <span>Verify Answer</span>
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                className="auth-luxury-secondary-btn"
                onClick={() => { clearFields(); setFailedAttempts(0); setStep("unlock"); }}
              >
                Back to Login
              </button>
            </form>
          </div>
        )}

        {/* ── RECOVERY: Enter New PIN ── */}
        {step === "recover-pin" && (
          <div className="auth-step-container">
            <h2 className="auth-step-title">Reset Master PIN</h2>
            <p className="auth-step-sub">Enter a new Master PIN for your vault</p>

            {renderPinDots()}

            <form className="auth-form-hidden" onSubmit={handleRecoverNewPin}>
              <input
                ref={pinRef}
                type={showPlainPin ? "text" : "password"}
                inputMode="numeric"
                maxLength={12}
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore
                className="auth-hidden-input"
                placeholder="Enter New PIN"
                autoFocus
                value={newPin}
                onChange={(e) => { setNewPin(e.target.value); setError(""); }}
              />
            </form>

            {error && (
              <div className="auth-luxury-error">
                <AlertTriangle size={15} />
                <span>{error}</span>
              </div>
            )}

            <div className="auth-keypad">
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
                <button type="button" className="auth-keypad-btn del-key-btn" onClick={handleDeletePress}>
                  <Delete size={20} />
                </button>
              </div>
            </div>

            <button 
              type="button" 
              className="auth-luxury-primary-btn"
              onClick={handleRecoverNewPin}
              disabled={newPin.length < 4}
            >
              <span>Next: Confirm New PIN</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ── RECOVERY: Confirm New PIN ── */}
        {step === "recover-confirm" && (
          <div className="auth-step-container">
            <h2 className="auth-step-title">Confirm New PIN</h2>
            <p className="auth-step-sub">Re-enter your new PIN to complete reset</p>

            {renderPinDots()}

            <form className="auth-form-hidden" onSubmit={handleRecoverConfirm}>
              <input
                ref={pinRef}
                type={showPlainPin ? "text" : "password"}
                inputMode="numeric"
                maxLength={12}
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore
                className="auth-hidden-input"
                placeholder="Confirm New PIN"
                autoFocus
                value={confirmNewPin}
                onChange={(e) => { setConfirmNewPin(e.target.value); setError(""); }}
              />
            </form>

            {error && (
              <div className="auth-luxury-error">
                <AlertTriangle size={15} />
                <span>{error}</span>
              </div>
            )}

            <div className="auth-keypad">
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
                <button type="button" className="auth-keypad-btn del-key-btn" onClick={handleDeletePress}>
                  <Delete size={20} />
                </button>
              </div>
            </div>

            <button 
              type="button" 
              className="auth-luxury-primary-btn"
              onClick={handleRecoverConfirm}
              disabled={confirmNewPin.length < 4}
            >
              <span>Save & Unlock Vault</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Luxury Trust Badge Footer */}
        <div className="auth-trust-badge">
          <ShieldCheck size={14} className="auth-trust-icon" />
          <span>256-Bit Client Encrypted • Zero Server Knowledge</span>
        </div>
      </div>

      {/* PWA Floating Install Banner */}
      {showInstallPopup && (
        <div className="auth-luxury-install-banner">
          <div className="auth-install-icon-box">
            <Smartphone size={22} color="#F59E0B" />
          </div>
          <div className="auth-install-content">
            <h4>Install FinAura App</h4>
            <p>Native fullscreen experience with biometric support</p>
          </div>
          <div className="auth-install-actions">
            <button className="auth-install-btn-ok" onClick={handleInstall}>Install</button>
            <button className="auth-install-btn-dismiss" onClick={() => setShowInstallPopup(false)}>Later</button>
          </div>
        </div>
      )}
    </div>
  );
}
