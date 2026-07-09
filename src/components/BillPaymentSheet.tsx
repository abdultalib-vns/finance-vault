import { useState, useEffect, useRef } from "react";
import { ChevronDown, AlertTriangle, Lock, Fingerprint, X } from "lucide-react";
import Lottie from "lottie-react";
import { FinanceItem, CardBill, Currency } from "../types";
import { formatAmount } from "../lib/currency";
import { hashPin } from "../lib/crypto";
import { isBiometricEnrolled, loginWithBiometric } from "../lib/biometric";
import successAnimation from "../../public/success.json";

type Step = "select" | "verify" | "success";

interface Props {
  bill: CardBill;
  card: FinanceItem;
  bankItems: FinanceItem[];
  currency: Currency;
  masterKey: string;
  onConfirm: (bankId: string, bankName: string) => void;
  onClose: () => void;
}

export default function BillPaymentSheet({
  bill,
  card,
  bankItems,
  currency,
  masterKey,
  onConfirm,
  onClose,
}: Props) {
  const [step, setStep] = useState<Step>("select");
  const [selectedBankId, setSelectedBankId] = useState("");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [bioError, setBioError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const pinRef = useRef<HTMLInputElement>(null);

  const selectedBank = bankItems.find((b) => b.id === selectedBankId) || null;
  const newBalance = selectedBank ? selectedBank.balance - bill.totalAmount : 0;
  const isLowBalance = selectedBank ? newBalance < 0 : false;

  // Auto-focus PIN input when entering verify step
  useEffect(() => {
    if (step === "verify" && !isBiometricEnrolled()) {
      setTimeout(() => pinRef.current?.focus(), 300);
    }
  }, [step]);

  // Try biometric first when entering verify step
  useEffect(() => {
    if (step === "verify" && isBiometricEnrolled()) {
      handleBiometricVerify();
    }
  }, [step]);

  async function handleBiometricVerify() {
    setVerifying(true);
    setBioError("");
    try {
      await loginWithBiometric();
      // Success — proceed to payment
      executePayment();
    } catch (err) {
      setBioError("Biometric verification failed. Please enter your PIN instead.");
    } finally {
      setVerifying(false);
    }
  }

  function handlePinSubmit() {
    setPinError("");
    if (!pin || pin.length < 4) {
      setPinError("PIN must be at least 4 digits.");
      return;
    }
    const storedHash = localStorage.getItem("finance_pin_hash") || hashPin(masterKey);
    if (hashPin(pin) === storedHash) {
      executePayment();
    } else {
      setPinError("Incorrect PIN. Please try again.");
      setPin("");
    }
  }

  function executePayment() {
    if (!selectedBank) return;
    onConfirm(selectedBank.id, selectedBank.name);
    setStep("success");
  }

  function handleConfirmAndPay() {
    if (!selectedBank) return;
    setStep("verify");
  }

  // ── Step 1: Select Bank Account ──────────────────────────────────
  function renderSelectStep() {
    return (
      <>
        <div className="bps-header">
          <h3 className="bps-title">Pay Statement</h3>
          <button className="bps-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="bps-body">
          <div className="bps-bill-summary">
            <span className="bps-bill-label">Statement Amount</span>
            <span className="bps-bill-amount">
              {formatAmount(bill.totalAmount, currency)}
            </span>
            <span className="bps-bill-card">{card.name} {card.lastFour ? `•••• ${card.lastFour}` : ""}</span>
          </div>

          <div className="bps-select-group">
            <label className="bps-label">Pay from Bank Account</label>
            <div className="bps-select-wrapper">
              <select
                className="bps-select"
                value={selectedBankId}
                onChange={(e) => setSelectedBankId(e.target.value)}
              >
                <option value="">— Select a bank account —</option>
                {bankItems.map((bank) => (
                  <option key={bank.id} value={bank.id}>
                    {bank.name} {bank.lastFour ? `(•••• ${bank.lastFour})` : ""}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="bps-select-icon" />
            </div>
          </div>

          {selectedBank && (
            <div className="bps-balance-card">
              <div className="bps-balance-row">
                <span className="bps-balance-label">Current Balance</span>
                <span className="bps-balance-value">
                  {formatAmount(selectedBank.balance, currency)}
                </span>
              </div>
              <div className="bps-balance-divider" />
              <div className="bps-balance-row">
                <span className="bps-balance-label">After Payment</span>
                <span
                  className={`bps-balance-value ${isLowBalance ? "negative" : "positive"}`}
                >
                  {formatAmount(newBalance, currency)}
                </span>
              </div>
              {isLowBalance && (
                <div className="bps-warning">
                  <AlertTriangle size={14} />
                  <span>Insufficient balance. Your account will go negative.</span>
                </div>
              )}
            </div>
          )}

          {bankItems.length === 0 && (
            <div className="bps-warning">
              <AlertTriangle size={14} />
              <span>No bank accounts found. Please add a bank account first.</span>
            </div>
          )}
        </div>

        <div className="bps-footer">
          <button
            className="btn-primary bps-confirm-btn"
            disabled={!selectedBank}
            onClick={handleConfirmAndPay}
          >
            Confirm & Pay
          </button>
        </div>
      </>
    );
  }

  // ── Step 2: PIN / Biometric Verification ─────────────────────────
  function renderVerifyStep() {
    const hasBio = isBiometricEnrolled();

    return (
      <>
        <div className="bps-header">
          <h3 className="bps-title">Verify Identity</h3>
          <button className="bps-close" onClick={() => { setStep("select"); setPin(""); setPinError(""); setBioError(""); }}>
            <X size={20} />
          </button>
        </div>

        <div className="bps-body bps-verify-body">
          <div className="bps-verify-icon">
            <Lock size={40} />
          </div>

          <p className="bps-verify-text">
            Confirm payment of{" "}
            <strong>{formatAmount(bill.totalAmount, currency)}</strong>{" "}
            from <strong>{selectedBank?.name}</strong>
          </p>

          {hasBio && bioError && (
            <div className="bps-warning" style={{ marginBottom: 16 }}>
              <AlertTriangle size={14} />
              <span>{bioError}</span>
            </div>
          )}

          {hasBio && !bioError && verifying && (
            <div className="bps-bio-prompt">
              <Fingerprint size={32} className="bps-bio-icon" />
              <span>Waiting for biometric verification...</span>
            </div>
          )}

          {/* Show PIN input if: no biometric, or biometric failed */}
          {(!hasBio || bioError) && (
            <div className="bps-pin-group">
              <label className="bps-label">Enter your PIN</label>
              <input
                ref={pinRef}
                type="password"
                inputMode="numeric"
                className="bps-pin-input"
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                maxLength={8}
                onKeyDown={(e) => { if (e.key === "Enter") handlePinSubmit(); }}
              />
              {pinError && <p className="bps-pin-error">{pinError}</p>}
            </div>
          )}

          {hasBio && bioError && (
            <button
              className="btn-outline bps-retry-bio"
              onClick={handleBiometricVerify}
              disabled={verifying}
            >
              <Fingerprint size={16} /> Retry Biometric
            </button>
          )}
        </div>

        <div className="bps-footer">
          {(!hasBio || bioError) && (
            <button
              className="btn-primary bps-confirm-btn"
              onClick={handlePinSubmit}
              disabled={!pin}
            >
              <Lock size={16} /> Verify & Pay
            </button>
          )}
        </div>
      </>
    );
  }

  // ── Step 3: Success ──────────────────────────────────────────────
  function renderSuccessStep() {
    return (
      <>
        <div className="bps-body bps-success-body">
          <div className="bps-success-lottie">
            <Lottie animationData={successAnimation} loop={true} style={{ width: 120, height: 120 }} />
          </div>

          <h3 className="bps-success-title">
            PAID {card.name} Bill
          </h3>

          <div className="bps-success-details">
            <span className="bps-success-via">
              via {selectedBank?.name} — {formatAmount(bill.totalAmount, currency)}
            </span>
            <span className="bps-success-remaining">
              Remaining Balance: {formatAmount(newBalance, currency)}
            </span>
          </div>
        </div>

        <div className="bps-footer bps-footer-sticky">
          <button className="btn-primary bps-confirm-btn" onClick={onClose}>
            OK, Got it
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={step !== "success" ? onClose : undefined}>
      <div
        className="modal-sheet bps-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        {step === "select" && renderSelectStep()}
        {step === "verify" && renderVerifyStep()}
        {step === "success" && renderSuccessStep()}
      </div>
    </div>
  );
}
