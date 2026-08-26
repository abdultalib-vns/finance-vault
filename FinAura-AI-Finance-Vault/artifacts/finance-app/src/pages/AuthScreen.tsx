import { useEffect, useRef, useState } from "react";
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
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [bioReady, setBioReady] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);

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

  function clearFields() {
    setPin(""); setConfirmPin(""); setSecAnswer("");
    setRecoverAnswer(""); setNewPin(""); setConfirmNewPin("");
    setError("");
  }

  // ── NEW USER FLOW ──────────────────────────────────────────────
  function handleNewUserSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (step === "pin-enter") {
      if (pin.length < 4) { setError("PIN must be at least 4 digits."); return; }
      setStep("pin-confirm");
      setConfirmPin("");
      return;
    }

    if (step === "pin-confirm") {
      if (confirmPin !== pin) {
        setError("PINs do not match. Try again.");
        setPin(""); setConfirmPin(""); setStep("pin-enter");
        return;
      }
      setStep("security-setup");
      setSecAnswer("");
      return;
    }

    if (step === "security-setup") {
      if (!secAnswer.trim()) { setError("Please enter an answer."); return; }
      if (secAnswer.trim().length < 2) { setError("Answer is too short."); return; }
      savePinHash(hashPin(pin));
      saveSecurityQuestion(secQIdx);
      saveSecurityAnswerHash(hashPin(secAnswer.trim().toLowerCase()));
      onUnlock(pin);
    }
  }

  // ── EXISTING USER UNLOCK ───────────────────────────────────────
  function handleUnlockSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (hashPin(pin) !== existingHash) {
      const next = failedAttempts + 1;
      setFailedAttempts(next);
      setPin("");
      if (next >= MAX_ATTEMPTS) {
        setError(`Incorrect PIN. ${MAX_ATTEMPTS} failed attempts reached.`);
      } else {
        setError(`Incorrect PIN. ${MAX_ATTEMPTS - next} attempt${MAX_ATTEMPTS - next !== 1 ? "s" : ""} left.`);
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
    if (!savedHash) { setError("No security question set."); return; }
    if (hashPin(recoverAnswer.trim().toLowerCase()) !== savedHash) {
      setError("Incorrect answer. Please try again.");
      setRecoverAnswer("");
      return;
    }
    setStep("recover-pin");
    setNewPin("");
  }

  function handleRecoverNewPin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPin.length < 4) { setError("PIN must be at least 4 digits."); return; }
    setStep("recover-confirm");
    setConfirmNewPin("");
  }

  function handleRecoverConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (confirmNewPin !== newPin) {
      setError("PINs do not match. Try again.");
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
      setError(err instanceof Error ? err.message : "Biometric login failed.");
    } finally {
      setBioLoading(false);
    }
  }

  const hasSQ = hasSecurityQuestion();
  const savedQIdx = loadSecurityQuestion() ?? 0;

  // ── RENDER ────────────────────────────────────────────────────
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">💰</div>
        <h1 className="auth-title">FinanceVault</h1>

        {/* ── NEW USER: Enter PIN ── */}
        {step === "pin-enter" && (
          <>
            <p className="auth-subtitle">Create your Master PIN to secure your data</p>
            <form className="auth-form" onSubmit={handleNewUserSubmit}>
              <input ref={pinRef} type="password" inputMode="numeric" maxLength={20}
                className="pin-input" placeholder="Enter PIN" autoFocus
                value={pin} onChange={(e) => { setPin(e.target.value); setError(""); }} />
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" className="btn-primary auth-btn">Next</button>
            </form>
            <p className="auth-warning">⚠️ Your PIN encrypts all data. If lost, data cannot be recovered without your security answer.</p>
          </>
        )}

        {/* ── NEW USER: Confirm PIN ── */}
        {step === "pin-confirm" && (
          <>
            <p className="auth-subtitle">Confirm your Master PIN</p>
            <form className="auth-form" onSubmit={handleNewUserSubmit}>
              <input ref={pinRef} type="password" inputMode="numeric" maxLength={20}
                className="pin-input" placeholder="Confirm PIN" autoFocus
                value={confirmPin} onChange={(e) => { setConfirmPin(e.target.value); setError(""); }} />
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" className="btn-primary auth-btn">Confirm PIN</button>
              <button type="button" className="btn-secondary" onClick={() => { setStep("pin-enter"); clearFields(); }}>Back</button>
            </form>
          </>
        )}

        {/* ── NEW USER: Security Question Setup ── */}
        {step === "security-setup" && (
          <>
            <p className="auth-subtitle">Set a security question for account recovery</p>
            <form className="auth-form" onSubmit={handleNewUserSubmit}>
              <div className="sq-list">
                {SECURITY_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`sq-option${secQIdx === i ? " active" : ""}`}
                    onClick={() => setSecQIdx(i)}
                  >
                    {q}
                  </button>
                ))}
              </div>
              <input
                ref={pinRef}
                type="text"
                className="pin-input"
                placeholder="Your answer"
                autoFocus
                value={secAnswer}
                onChange={(e) => { setSecAnswer(e.target.value); setError(""); }}
              />
              {error && <p className="auth-error">{error}</p>}
              <p className="auth-sq-hint">Answer is case-insensitive and saved securely.</p>
              <button type="submit" className="btn-primary auth-btn">Finish Setup</button>
            </form>
          </>
        )}

        {/* ── EXISTING USER: Unlock ── */}
        {step === "unlock" && (
          <>
            <p className="auth-subtitle">Enter your Master PIN to continue</p>
            <form className="auth-form" onSubmit={handleUnlockSubmit}>
              <input ref={pinRef} type="password" inputMode="numeric" maxLength={20}
                className="pin-input" placeholder="Enter PIN" autoFocus
                value={pin} onChange={(e) => { setPin(e.target.value); setError(""); }} />
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" className="btn-primary auth-btn">Unlock</button>

              {failedAttempts >= MAX_ATTEMPTS && hasSQ && (
                <button
                  type="button"
                  className="btn-recover"
                  onClick={() => { clearFields(); setStep("recover-check"); }}
                >
                  🔑 Recover your password
                </button>
              )}
            </form>

            {bioReady && (
              <>
                <div className="auth-divider"><span>or</span></div>
                <button type="button" className="btn-bio" onClick={handleBiometric} disabled={bioLoading}>
                  {bioLoading ? "Authenticating…" : "🔐 Sign in with Biometric"}
                </button>
              </>
            )}
            <p className="auth-warning">⚠️ Your PIN encrypts all data.</p>
          </>
        )}

        {/* ── RECOVERY: Check Security Answer ── */}
        {step === "recover-check" && (
          <>
            <p className="auth-subtitle">Answer your security question to reset your PIN</p>
            <form className="auth-form" onSubmit={handleRecoverCheck}>
              <div className="sq-display">{SECURITY_QUESTIONS[savedQIdx]}</div>
              <input ref={pinRef} type="text" className="pin-input"
                placeholder="Your answer" autoFocus
                value={recoverAnswer} onChange={(e) => { setRecoverAnswer(e.target.value); setError(""); }} />
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" className="btn-primary auth-btn">Verify Answer</button>
              <button type="button" className="btn-secondary" onClick={() => { clearFields(); setFailedAttempts(0); setStep("unlock"); }}>Back to Login</button>
            </form>
          </>
        )}

        {/* ── RECOVERY: Enter New PIN ── */}
        {step === "recover-pin" && (
          <>
            <p className="auth-subtitle">Create a new Master PIN</p>
            <form className="auth-form" onSubmit={handleRecoverNewPin}>
              <input ref={pinRef} type="password" inputMode="numeric" maxLength={20}
                className="pin-input" placeholder="New PIN" autoFocus
                value={newPin} onChange={(e) => { setNewPin(e.target.value); setError(""); }} />
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" className="btn-primary auth-btn">Next</button>
            </form>
          </>
        )}

        {/* ── RECOVERY: Confirm New PIN ── */}
        {step === "recover-confirm" && (
          <>
            <p className="auth-subtitle">Confirm your new Master PIN</p>
            <form className="auth-form" onSubmit={handleRecoverConfirm}>
              <input ref={pinRef} type="password" inputMode="numeric" maxLength={20}
                className="pin-input" placeholder="Confirm new PIN" autoFocus
                value={confirmNewPin} onChange={(e) => { setConfirmNewPin(e.target.value); setError(""); }} />
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" className="btn-primary auth-btn">Save New PIN</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
