import React, { useState, useEffect, useMemo } from "react";
import { 
  Coins, X, ArrowRight, CreditCard, Building2, RefreshCw, 
  ChevronLeft, ChevronDown, Tag, ShoppingBag, Coffee, Zap, 
  ShoppingCart, Car, Receipt, AlertTriangle, CheckCircle2, ShieldAlert
} from "lucide-react";
import { FinanceItem, PaymentIntent } from "../types";
import { loadItems, savePaymentIntents, loadPaymentIntents, loadCurrency } from "../lib/storage";
import { getCurrency, formatAmount, formatCompactAmount, getCompactDenominationHint, Currency } from "../lib/currency";

export interface PaymentAppOption {
  name: string;
  icon: string;
  url: string;
  fallbackText: string;
  androidPackage?: string;
  iosScheme?: string;
}

export const PAYMENT_APPS: PaymentAppOption[] = [
  { 
    name: "Google Pay", 
    icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyVO9LUWF81Ov6LZR50eDNu5rNFCpkn0LwYQ&s", 
    url: "https://pay.google.com",
    fallbackText: "GPay",
    androidPackage: "com.google.android.apps.nbu.paisa.user",
    iosScheme: "gpay://"
  },
  { 
    name: "PhonePe", 
    icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo4x8kSTmPUq4PFzl4HNT0gObFuEhivHOFYg&s", 
    url: "https://www.phonepe.com",
    fallbackText: "Pe",
    androidPackage: "com.phonepe.app",
    iosScheme: "phonepe://"
  },
  { 
    name: "Paytm", 
    icon: "https://images.icon-icons.com/730/PNG/512/paytm_icon-icons.com_62778.png", 
    url: "https://paytm.com",
    fallbackText: "Paytm",
    androidPackage: "net.one97.paytm",
    iosScheme: "paytmmp://"
  },
  { 
    name: "CRED", 
    icon: "https://www.pngall.com/wp-content/uploads/16/Cred-Logo-PNG-Picture-thumb.png", 
    url: "https://cred.club",
    fallbackText: "CRED",
    androidPackage: "com.dreamplug.androidapp",
    iosScheme: "cred://"
  },
  { 
    name: "Amazon Pay", 
    icon: "https://static.vecteezy.com/system/resources/thumbnails/073/494/118/small_2x/amazon-pay-logo-modern-circular-icon-with-transparent-background-free-png.png", 
    url: "https://www.amazon.com/pay",
    fallbackText: "Amazon",
    androidPackage: "in.amazon.mShop.android.shopping",
    iosScheme: "amazon://"
  },
  { 
    name: "Navi", 
    icon: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Navi_Logo.png", 
    url: "https://navi.com",
    fallbackText: "Navi",
    androidPackage: "com.navi.navidotcom",
    iosScheme: "navipay://"
  },
  { 
    name: "Mobikwik", 
    icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEt03XLHujIry51KoZxt0DLJDqQMz9k5IqUA&s", 
    url: "https://www.mobikwik.com",
    fallbackText: "Mobi",
    androidPackage: "com.mobikwik_new",
    iosScheme: "mobikwik://"
  },
  { 
    name: "FreeCharge", 
    icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWd7gE_EU9okxdsbO0WMiR2Xt3I2qbMlb7Ng&s", 
    url: "https://www.freecharge.in",
    fallbackText: "FC",
    androidPackage: "com.freecharge.android",
    iosScheme: "freecharge://"
  },
  {
    name: "BHIM UPI",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/BHIM_app_logo.svg/200px-BHIM_app_logo.svg.png",
    url: "https://www.bhimupi.org.in/",
    fallbackText: "BHIM",
    androidPackage: "in.org.npci.upiapp",
    iosScheme: "bhim://"
  },
  {
    name: "WhatsApp",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/200px-WhatsApp.svg.png",
    url: "https://www.whatsapp.com/",
    fallbackText: "WA",
    androidPackage: "com.whatsapp",
    iosScheme: "whatsapp://"
  },
  {
    name: "Slice",
    icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEsV-4n6wQo7Q1Z7O2Y_WqL6rG_Mowu3a4iA&s",
    url: "https://www.sliceit.com/",
    fallbackText: "Slice",
    androidPackage: "indwin.c3.shareapp",
    iosScheme: "slice://"
  },
  {
    name: "FamPay",
    icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqY6U_xX5yY4PzP-Zp23z2yT89_G-01_1-0w&s",
    url: "https://fampay.in/",
    fallbackText: "FamPay",
    androidPackage: "com.fampay.in",
    iosScheme: "fampay://"
  },
  {
    name: "Groww",
    icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhX_V_64Z_Pj-lO8V5O68wQoZ-nO7GZ_jH0g&s",
    url: "https://groww.in/",
    fallbackText: "Groww",
    androidPackage: "com.nextbillion.groww",
    iosScheme: "groww://"
  },
  {
    name: "Any UPI App",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/320px-UPI-Logo-vector.svg.png",
    url: "https://www.npci.org.in/what-we-do/upi/product-overview",
    fallbackText: "UPI",
    androidPackage: "",
    iosScheme: "upi://"
  }
];

const CATEGORY_TAGS = [
  { label: "Dining", icon: Coffee },
  { label: "Groceries", icon: ShoppingCart },
  { label: "Utilities", icon: Zap },
  { label: "Shopping", icon: ShoppingBag },
  { label: "Travel", icon: Car },
  { label: "Bills", icon: Receipt },
];

export default function PayAutoRecordModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [sourceCategory, setSourceCategory] = useState<"bank" | "card">("bank");
  const [selectedBankId, setSelectedBankId] = useState("");
  const [selectedCardId, setSelectedCardId] = useState("");
  const [currency, setCurrency] = useState<Currency>(() => getCurrency(loadCurrency()));
  const [errorMsg, setErrorMsg] = useState("");
  const [appNotFoundMsg, setAppNotFoundMsg] = useState("");

  const [bankAccounts, setBankAccounts] = useState<FinanceItem[]>([]);
  const [cardAccounts, setCardAccounts] = useState<FinanceItem[]>([]);

  useEffect(() => {
    const cur = getCurrency(loadCurrency());
    setCurrency(cur);

    const allItems = loadItems();
    const banks = allItems.filter((i) => i.type === "bank");
    const cards = allItems.filter((i) => i.type === "card" || i.type === "paylater");

    setBankAccounts(banks);
    setCardAccounts(cards);

    if (banks.length > 0) {
      setSelectedBankId(banks[0].id);
      setSourceCategory("bank");
    } else if (cards.length > 0) {
      setSelectedCardId(cards[0].id);
      setSourceCategory("card");
    }

    if (cards.length > 0 && !selectedCardId) {
      setSelectedCardId(cards[0].id);
    }
  }, []);

  const selectedAccount = useMemo(() => {
    if (sourceCategory === "bank") {
      return bankAccounts.find((b) => b.id === selectedBankId) || bankAccounts[0];
    } else {
      return cardAccounts.find((c) => c.id === selectedCardId) || cardAccounts[0];
    }
  }, [sourceCategory, selectedBankId, selectedCardId, bankAccounts, cardAccounts]);

  // Calculate available amount or credit limit
  const availableAmount = useMemo(() => {
    if (!selectedAccount) return 0;
    if (selectedAccount.type === "bank") {
      return Math.max(0, selectedAccount.balance);
    }
    // For credit card / paylater
    if (selectedAccount.creditLimit !== undefined && selectedAccount.creditLimit > 0) {
      return Math.max(0, selectedAccount.creditLimit - selectedAccount.balance);
    }
    // If creditLimit is not specified, default to remaining safe threshold
    return Infinity;
  }, [selectedAccount]);

  const enteredAmt = parseFloat(amount) || 0;
  const isExceeding = enteredAmt > 0 && selectedAccount && isFinite(availableAmount) && enteredAmt > availableAmount;

  const quickAmounts = currency.code === "INR" 
    ? [100, 500, 1000, 2000]
    : [10, 25, 50, 100];

  const handleAddQuickAmount = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount(String(current + val));
    setErrorMsg("");
  };

  const handleProceed = () => {
    if (!amount || isNaN(enteredAmt) || enteredAmt <= 0) {
      setErrorMsg("Please enter a valid payment amount.");
      return;
    }
    if (!description.trim()) {
      setErrorMsg("Please enter what you are paying for.");
      return;
    }
    if (!selectedAccount) {
      setErrorMsg("Please select a funding account.");
      return;
    }
    if (isExceeding) {
      if (selectedAccount.type === "bank") {
        setErrorMsg(`Amount exceeds available bank balance (${formatAmount(availableAmount, currency)}).`);
      } else {
        setErrorMsg(`Amount exceeds available credit card limit (${formatAmount(availableAmount, currency)}).`);
      }
      return;
    }
    setErrorMsg("");
    setStep(2);
  };

  const handleAppClick = (e: React.MouseEvent, app: PaymentAppOption) => {
    e.preventDefault();
    if (!selectedAccount) return;

    // Clear any previous error
    setAppNotFoundMsg("");

    const newIntent: PaymentIntent = {
      id: crypto.randomUUID(),
      amount: enteredAmt,
      description: description.trim(),
      sourceAccountId: selectedAccount.id,
      sourceType: selectedAccount.type as "bank" | "card" | "paylater",
      status: "pending",
      createdAt: Date.now(),
    };

    const existingIntents = loadPaymentIntents();
    savePaymentIntents([...existingIntents, newIntent]);

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const formattedAmt = enteredAmt > 0 ? enteredAmt.toFixed(2) : "0.00";
    const encodedNote = encodeURIComponent(description.trim() || "Payment");

    // On desktop browsers: open the web URL in a new tab directly
    if (!isMobile) {
      window.open(app.url, "_blank", "noopener,noreferrer");
      onClose();
      return;
    }

    // Build targeted deep link or intent
    let deepLink = app.url;
    if (isAndroid) {
      if (app.androidPackage) {
        // Modern Chrome Android Intent syntax targeted to specific UPI package
        deepLink = `intent://upi/pay?am=${formattedAmt}&cu=INR&tn=${encodedNote}#Intent;scheme=upi;package=${app.androidPackage};end`;
      } else {
        // Generic native UPI chooser
        deepLink = `upi://pay?am=${formattedAmt}&cu=INR&tn=${encodedNote}`;
      }
    } else if (isIOS) {
      if (app.iosScheme) {
        deepLink = `${app.iosScheme}upi/pay?am=${formattedAmt}&cu=INR&tn=${encodedNote}`;
      } else {
        deepLink = `upi://pay?am=${formattedAmt}&cu=INR&tn=${encodedNote}`;
      }
    }

    // Launch deep link via programmatic anchor click for reliable user-gesture propagation
    let appSwitched = false;
    const onVisibilityChange = () => {
      if (document.hidden) {
        appSwitched = true;
      }
    };
    const onBlur = () => {
      appSwitched = true;
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);

    const link = document.createElement("a");
    link.href = deepLink;
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);

      // If user did not switch app and page is still visible, the app is not installed
      if (!appSwitched && !document.hidden) {
        const updatedIntents = loadPaymentIntents().filter(
          (intent) => intent.id !== newIntent.id
        );
        savePaymentIntents(updatedIntents);

        setAppNotFoundMsg(`"${app.name}" app was not found on your device. Please install it or choose another payment app.`);

        setTimeout(() => {
          setAppNotFoundMsg("");
        }, 5000);
      } else {
        // App launched successfully, dismiss the modal
        onClose();
      }
    }, 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10005 }}>
      <div className="modal-sheet pay-sheet" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="pay-sheet-header">
          <div className="pay-brand-badge">
            <div className="pay-badge-icon">
              <Coins size={22} />
            </div>
            <div>
              <h3 className="pay-badge-title">Pay & Auto-Record</h3>
              <p className="pay-badge-sub">
                {step === 1 ? "Step 1: Details & Funding Source" : "Step 2: Choose Payment App"}
              </p>
            </div>
          </div>
          <button className="pay-close-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="pay-steps-bar">
          <div className={`pay-step-pill ${step >= 1 ? "active" : ""}`} />
          <div className={`pay-step-pill ${step >= 2 ? "active" : ""}`} />
        </div>

        {appNotFoundMsg && (
          <div className="settings-msg error" style={{ margin: "0 0 16px" }}>
            <AlertTriangle size={16} />
            <span>{appNotFoundMsg}</span>
          </div>
        )}

        {step === 1 ? (
          <>
            {/* Hero Amount Input Card */}
            <div className={`pay-amount-hero ${isExceeding ? "error-ring" : ""}`}>
              <div className="pay-amount-label">
                <span>Enter Amount</span>
                <span>{currency.code}</span>
              </div>
              <div className="pay-amount-row">
                <span className="pay-amount-currency">{currency.symbol}</span>
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setErrorMsg("");
                  }}
                  placeholder="0.00"
                  className="pay-amount-input"
                  autoFocus
                />
              </div>

              {/* Real-time Large Amount Denomination Pill */}
              {enteredAmt >= 1000000 && (
                <div className="pay-denomination-badge">
                  <span className="pay-denomination-pill">
                    {getCompactDenominationHint(enteredAmt, currency)}
                  </span>
                </div>
              )}

              {/* Quick Amount Chips */}
              <div className="pay-chips-row">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className="pay-chip"
                    onClick={() => handleAddQuickAmount(q)}
                  >
                    +{currency.symbol}{q}
                  </button>
                ))}
              </div>

              {/* Real-time Exceeding Alert */}
              {isExceeding && (
                <div className="pay-limit-error-badge">
                  <ShieldAlert size={15} />
                  <span>
                    Amount exceeds available {selectedAccount?.type === "bank" ? "balance" : "credit limit"} ({formatAmount(availableAmount, currency)})
                  </span>
                </div>
              )}
            </div>

            {/* Purpose Input */}
            <div className="pay-input-group">
              <label className="pay-input-label">
                <Tag size={15} />
                <span>What are you paying for?</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrorMsg("");
                }}
                placeholder="e.g., Dinner, Electricity Bill, Groceries"
                className="pay-text-input"
              />

              {/* Category Chips */}
              <div className="pay-chips-row" style={{ marginTop: "8px" }}>
                {CATEGORY_TAGS.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    type="button"
                    className={`pay-chip ${description === label ? "selected" : ""}`}
                    onClick={() => {
                      setDescription(label);
                      setErrorMsg("");
                    }}
                  >
                    <Icon size={12} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pay From (Source Account) — Radio Buttons: 1. Bank Account 2. Credit Card */}
            <div className="pay-input-group">
              <label className="pay-input-label">
                <Building2 size={15} />
                <span>Pay From (Source Account)</span>
              </label>

              {/* Radio Group */}
              <div className="pay-radio-group">
                {/* 1. Bank Account */}
                <div 
                  className={`pay-radio-option ${sourceCategory === "bank" ? "selected" : ""}`}
                  onClick={() => {
                    setSourceCategory("bank");
                    setErrorMsg("");
                  }}
                >
                  <div className="pay-radio-circle">
                    <span className="pay-radio-dot" />
                  </div>
                  <div className="pay-account-icon-wrap bank" style={{ width: 30, height: 30 }}>
                    <Building2 size={16} />
                  </div>
                  <div className="pay-radio-label-wrap">
                    <span className="pay-radio-title">Bank Account</span>
                    <span className="pay-radio-sub">{bankAccounts.length} available</span>
                  </div>
                </div>

                {/* 2. Credit Card */}
                <div 
                  className={`pay-radio-option ${sourceCategory === "card" ? "selected" : ""}`}
                  onClick={() => {
                    setSourceCategory("card");
                    setErrorMsg("");
                  }}
                >
                  <div className="pay-radio-circle">
                    <span className="pay-radio-dot" />
                  </div>
                  <div className="pay-account-icon-wrap card" style={{ width: 30, height: 30 }}>
                    <CreditCard size={16} />
                  </div>
                  <div className="pay-radio-label-wrap">
                    <span className="pay-radio-title">Credit Card</span>
                    <span className="pay-radio-sub">{cardAccounts.length} available</span>
                  </div>
                </div>
              </div>

              {/* Account Dropdown */}
              {sourceCategory === "bank" ? (
                bankAccounts.length === 0 ? (
                  <div style={{ padding: "14px", borderRadius: "12px", background: "var(--surface2)", textAlign: "center", color: "var(--text3)", fontSize: "0.85rem" }}>
                    No bank accounts found. Please add a bank account first.
                  </div>
                ) : (
                  <>
                    <div className="pay-select-wrapper">
                      <select 
                        value={selectedBankId}
                        onChange={(e) => {
                          setSelectedBankId(e.target.value);
                          setErrorMsg("");
                        }}
                        className="pay-custom-select"
                      >
                        {bankAccounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name} {acc.lastFour ? `(•••• ${acc.lastFour})` : ""} — Available: {formatAmount(acc.balance, currency)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={18} className="pay-select-chevron" />
                    </div>

                    {/* Selected Bank Snapshot Card */}
                    {selectedAccount && (
                      <div className={`pay-account-snapshot ${isExceeding ? "exceeding" : ""}`}>
                        <div className="pay-snapshot-header">
                          <div className="pay-snapshot-title">
                            <Building2 size={16} color="#3b82f6" />
                            <span>{selectedAccount.name} {selectedAccount.lastFour ? `(•••• ${selectedAccount.lastFour})` : ""}</span>
                          </div>
                          <div className={`pay-snapshot-avail ${isExceeding ? "low" : ""}`}>
                            Bal: {formatAmount(selectedAccount.balance, currency)}
                          </div>
                        </div>

                        {enteredAmt > 0 && (
                          <div style={{ fontSize: "0.75rem", color: isExceeding ? "#ef4444" : "var(--text3)", marginTop: 4 }}>
                            {isExceeding ? (
                              <span>⚠️ Insufficient funds. Short by {formatAmount(enteredAmt - availableAmount, currency)}</span>
                            ) : (
                              <span>Remaining balance after payment: <strong>{formatAmount(selectedAccount.balance - enteredAmt, currency)}</strong></span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )
              ) : (
                cardAccounts.length === 0 ? (
                  <div style={{ padding: "14px", borderRadius: "12px", background: "var(--surface2)", textAlign: "center", color: "var(--text3)", fontSize: "0.85rem" }}>
                    No credit cards found. Please add a card in Cards tab first.
                  </div>
                ) : (
                  <>
                    <div className="pay-select-wrapper">
                      <select 
                        value={selectedCardId}
                        onChange={(e) => {
                          setSelectedCardId(e.target.value);
                          setErrorMsg("");
                        }}
                        className="pay-custom-select"
                      >
                        {cardAccounts.map((acc) => {
                          const avail = acc.creditLimit !== undefined && acc.creditLimit > 0
                            ? Math.max(0, acc.creditLimit - acc.balance)
                            : acc.balance;
                          return (
                            <option key={acc.id} value={acc.id}>
                              {acc.name} {acc.lastFour ? `(•••• ${acc.lastFour})` : ""} — Available Limit: {formatAmount(avail, currency)}
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown size={18} className="pay-select-chevron" />
                    </div>

                    {/* Selected Card Snapshot Card */}
                    {selectedAccount && (
                      <div className={`pay-account-snapshot ${isExceeding ? "exceeding" : ""}`}>
                        <div className="pay-snapshot-header">
                          <div className="pay-snapshot-title">
                            <CreditCard size={16} color="#8b5cf6" />
                            <span>{selectedAccount.name} {selectedAccount.lastFour ? `(•••• ${selectedAccount.lastFour})` : ""}</span>
                          </div>
                          <div className={`pay-snapshot-avail ${isExceeding ? "low" : ""}`}>
                            {selectedAccount.creditLimit ? (
                              <span>Avail: {formatAmount(availableAmount, currency)}</span>
                            ) : (
                              <span>Dues: {formatAmount(selectedAccount.balance, currency)}</span>
                            )}
                          </div>
                        </div>

                        {selectedAccount.creditLimit !== undefined && selectedAccount.creditLimit > 0 && (
                          <>
                            <div className="pay-snapshot-bar-wrap">
                              <div 
                                className="pay-snapshot-bar-fill" 
                                style={{ 
                                  width: `${Math.min(100, ((selectedAccount.balance + (isExceeding ? 0 : enteredAmt)) / selectedAccount.creditLimit) * 100)}%`,
                                  background: isExceeding ? "#ef4444" : "linear-gradient(90deg, #F59E0B, #DC2626)"
                                }} 
                              />
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text3)", marginTop: 4 }}>
                              <span>Outstanding: {formatAmount(selectedAccount.balance, currency)}</span>
                              <span>Total Limit: {formatAmount(selectedAccount.creditLimit, currency)}</span>
                            </div>
                          </>
                        )}

                        {enteredAmt > 0 && isExceeding && (
                          <div style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: 4 }}>
                            <span>⚠️ Exceeds limit by {formatAmount(enteredAmt - availableAmount, currency)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )
              )}
            </div>

            {errorMsg && (
              <div className="settings-msg error" style={{ margin: "0 0 16px" }}>
                <AlertTriangle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Proceed CTA */}
            <button
              type="button"
              className={`pay-primary-action-btn ${isExceeding ? "disabled" : ""}`}
              onClick={handleProceed}
              disabled={!selectedAccount || isExceeding}
              style={{ opacity: isExceeding ? 0.5 : 1, cursor: isExceeding ? "not-allowed" : "pointer" }}
            >
              <span>Continue to Select App</span>
              <ArrowRight size={18} />
            </button>
          </>
        ) : (
          <>
            {/* Step 2: Summary Card */}
            <div className="pay-summary-banner">
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text3)", textTransform: "uppercase", fontWeight: 600 }}>
                  Amount to Pay
                </div>
                <div className="pay-summary-amount">
                  {enteredAmt >= 1000000 
                    ? formatCompactAmount(enteredAmt, currency) 
                    : formatAmount(enteredAmt, currency)}
                </div>
                {enteredAmt >= 1000000 && (
                  <div style={{ fontSize: "0.72rem", color: "var(--text3)", marginTop: 2 }}>
                    Exact: {formatAmount(enteredAmt, currency)}
                  </div>
                )}
              </div>
              <div className="pay-summary-details">
                <div style={{ fontWeight: 600, color: "var(--text)" }}>
                  {description}
                </div>
                <div style={{ color: "var(--text3)", marginTop: 2 }}>
                  From: {selectedAccount?.name} {selectedAccount?.lastFour ? `(••${selectedAccount.lastFour})` : ""}
                </div>
              </div>
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--text2)", marginBottom: "14px", fontWeight: 500 }}>
              Select a UPI application to initiate payment:
            </p>

            {/* UPI Apps Grid */}
            <div className="pay-apps-grid-modern">
              {PAYMENT_APPS.map((app) => (
                <a
                  key={app.name}
                  href={app.url}
                  onClick={(e) => handleAppClick(e, app)}
                  className="pay-app-item"
                >
                  <div className="pay-app-logo-box">
                    <img
                      src={app.icon}
                      alt={app.name}
                      className="pay-app-logo-img"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const sibling = e.currentTarget.nextElementSibling as HTMLElement;
                        if (sibling) sibling.style.display = "flex";
                      }}
                    />
                    <span style={{ display: "none", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "var(--text)", background: "var(--surface2)", borderRadius: "10px" }}>
                      {app.fallbackText}
                    </span>
                  </div>
                  <span className="pay-app-label">{app.name}</span>
                </a>
              ))}
            </div>

            <button
              type="button"
              className="pay-secondary-action-btn"
              onClick={() => setStep(1)}
            >
              <ChevronLeft size={16} />
              <span>Back to Edit Details</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
