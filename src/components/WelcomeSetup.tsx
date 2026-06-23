import { useEffect, useState } from "react";
import { CURRENCIES, getCurrency } from "../lib/currency";
import { saveCurrency, saveTheme, loadTheme } from "../lib/storage";
import {
  isBiometricSupported,
  isBiometricEnrolled,
  enrollBiometric,
} from "../lib/biometric";
import { Currency } from "../types";

interface Props {
  masterKey: string;
  onComplete: (currency: Currency, theme: "light" | "dark") => void;
}

type WelcomeStep = "currency" | "theme" | "biometric" | "done";

const ONBOARDING_DONE_KEY = "finaura_onboarding_done";

export function isOnboardingDone(): boolean {
  return localStorage.getItem(ONBOARDING_DONE_KEY) === "1";
}

export function markOnboardingDone(): void {
  localStorage.setItem(ONBOARDING_DONE_KEY, "1");
}

export default function WelcomeSetup({ masterKey, onComplete }: Props) {
  const [step, setStep] = useState<WelcomeStep>("currency");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [searchQuery, setSearchQuery] = useState("");
  const [currencyPage, setCurrencyPage] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark">(() => loadTheme());
  const [bioSupported, setBioSupported] = useState(false);
  const [bioEnrolling, setBioEnrolling] = useState(false);
  const [bioError, setBioError] = useState("");
  const [bioSuccess, setBioSuccess] = useState(false);

  useEffect(() => {
    isBiometricSupported().then(setBioSupported);
  }, []);

  const ITEMS_PER_PAGE = 10;
  const isSearching = searchQuery.trim().length > 0;

  const filteredCurrencies = CURRENCIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.symbol.includes(searchQuery)
  );

  const totalPages = Math.ceil(filteredCurrencies.length / ITEMS_PER_PAGE);
  const displayedCurrencies = isSearching
    ? filteredCurrencies
    : filteredCurrencies.slice(currencyPage * ITEMS_PER_PAGE, (currencyPage + 1) * ITEMS_PER_PAGE);

  function handleCurrencyNext() {
    saveCurrency(selectedCurrency);
    setStep("theme");
  }

  function handleThemeNext() {
    saveTheme(selectedTheme);
    if (selectedTheme === "dark") document.documentElement.classList.add("dark-mode");
    else document.documentElement.classList.remove("dark-mode");
    setStep("biometric");
  }

  async function handleEnrollBiometric() {
    setBioEnrolling(true);
    setBioError("");
    try {
      await enrollBiometric(masterKey);
      setBioSuccess(true);
    } catch (err) {
      setBioError(err instanceof Error ? err.message : "Failed to set up biometric.");
    } finally {
      setBioEnrolling(false);
    }
  }

  function handleFinish() {
    markOnboardingDone();
    onComplete(getCurrency(selectedCurrency), selectedTheme);
  }

  const stepIndex = step === "currency" ? 0 : step === "theme" ? 1 : 2;
  const stepLabels = ["Currency", "Theme", "Security"];

  return (
    <div className="welcome-overlay">
      <div className="welcome-card">
        {/* Header */}
        <div className="welcome-header">
          <div className="welcome-icon-wrap">
            <img src="/icon-512.png" alt="FinAura" className="welcome-app-icon" />
          </div>
          <h2 className="welcome-title">Welcome to FinAura</h2>
          <p className="welcome-subtitle">Let's personalize your experience</p>
        </div>

        {/* Progress dots */}
        <div className="welcome-progress">
          {stepLabels.map((label, i) => (
            <div key={i} className={`welcome-progress-step ${i <= stepIndex ? "active" : ""} ${i === stepIndex ? "current" : ""}`}>
              <div className="welcome-progress-dot">
                {i < stepIndex ? "✓" : i + 1}
              </div>
              <span className="welcome-progress-label">{label}</span>
            </div>
          ))}
          <div className="welcome-progress-line">
            <div className="welcome-progress-fill" style={{ width: `${(stepIndex / 2) * 100}%` }} />
          </div>
        </div>

        {/* ── Step 1: Currency (Mandatory) ── */}
        {step === "currency" && (
          <div className="welcome-step">
            <div className="welcome-step-header">
              <span className="welcome-step-icon">💱</span>
              <div>
                <h3>Select your Currency</h3>
                <p>This is used across all your accounts and cards</p>
              </div>
              <span className="welcome-badge-required">Required</span>
            </div>

            <div className="welcome-search-wrap">
              <span className="welcome-search-icon">🔍</span>
              <input
                type="text"
                className="welcome-search"
                placeholder="Search currencies..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrencyPage(0); }}
                autoFocus
              />
            </div>

            <div className="welcome-currency-grid">
              {displayedCurrencies.map((c) => (
                <button
                  key={c.code}
                  className={`welcome-currency-btn ${selectedCurrency === c.code ? "active" : ""}`}
                  onClick={() => setSelectedCurrency(c.code)}
                >
                  <span className="welcome-currency-symbol">{c.symbol}</span>
                  <div className="welcome-currency-info">
                    <span className="welcome-currency-code">{c.code}</span>
                    <span className="welcome-currency-name">{c.name}</span>
                  </div>
                  {selectedCurrency === c.code && <span className="welcome-currency-check">✓</span>}
                </button>
              ))}
              {displayedCurrencies.length === 0 && (
                <p className="welcome-currency-empty">No currencies match your search</p>
              )}
            </div>

            {/* Page indicator & navigation (hidden during search) */}
            {!isSearching && totalPages > 1 && (
              <div className="welcome-currency-pagination">
                <button
                  className="welcome-page-btn"
                  onClick={() => setCurrencyPage((p) => Math.max(0, p - 1))}
                  disabled={currencyPage === 0}
                >
                  ←
                </button>
                <div className="welcome-page-dots">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      className={`welcome-page-dot ${i === currencyPage ? "active" : ""}`}
                      onClick={() => setCurrencyPage(i)}
                    />
                  ))}
                </div>
                <button
                  className="welcome-page-btn"
                  onClick={() => setCurrencyPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currencyPage === totalPages - 1}
                >
                  →
                </button>
              </div>
            )}

            <button className="welcome-btn-primary" onClick={handleCurrencyNext}>
              Continue →
            </button>
          </div>
        )}

        {/* ── Step 2: Theme (Optional) ── */}
        {step === "theme" && (
          <div className="welcome-step">
            <div className="welcome-step-header">
              <span className="welcome-step-icon">🎨</span>
              <div>
                <h3>Choose your Theme</h3>
                <p>You can change this anytime in Settings</p>
              </div>
              <span className="welcome-badge-optional">Optional</span>
            </div>

            <div className="welcome-theme-grid">
              <button
                className={`welcome-theme-card ${selectedTheme === "light" ? "active" : ""}`}
                onClick={() => setSelectedTheme("light")}
              >
                <div className="welcome-theme-preview welcome-theme-light-preview">
                  <div className="wtp-header" />
                  <div className="wtp-body">
                    <div className="wtp-card" />
                    <div className="wtp-card short" />
                  </div>
                  <div className="wtp-nav" />
                </div>
                <span className="welcome-theme-label">☀️ Light Mode</span>
                {selectedTheme === "light" && <span className="welcome-theme-check">✓</span>}
              </button>

              <button
                className={`welcome-theme-card ${selectedTheme === "dark" ? "active" : ""}`}
                onClick={() => setSelectedTheme("dark")}
              >
                <div className="welcome-theme-preview welcome-theme-dark-preview">
                  <div className="wtp-header" />
                  <div className="wtp-body">
                    <div className="wtp-card" />
                    <div className="wtp-card short" />
                  </div>
                  <div className="wtp-nav" />
                </div>
                <span className="welcome-theme-label">🌙 Dark Mode</span>
                {selectedTheme === "dark" && <span className="welcome-theme-check">✓</span>}
              </button>
            </div>

            <div className="welcome-btn-row">
              <button className="welcome-btn-secondary" onClick={() => setStep("currency")}>← Back</button>
              <button className="welcome-btn-primary" onClick={handleThemeNext}>Continue →</button>
            </div>
          </div>
        )}

        {/* ── Step 3: Biometric (Optional) ── */}
        {step === "biometric" && (
          <div className="welcome-step">
            <div className="welcome-step-header">
              <span className="welcome-step-icon">🔐</span>
              <div>
                <h3>Enable Biometric Login</h3>
                <p>Use fingerprint or Face ID for quick access</p>
              </div>
              <span className="welcome-badge-optional">Optional</span>
            </div>

            <div className="welcome-bio-section">
              {!bioSupported && (
                <div className="welcome-bio-unavailable">
                  <span className="welcome-bio-unavail-icon">🚫</span>
                  <p>Biometric authentication is not available on this device or browser.</p>
                </div>
              )}

              {bioSupported && !bioSuccess && (
                <div className="welcome-bio-available">
                  <div className="welcome-bio-fingerprint">🔐</div>
                  <p>Secure your vault with biometric authentication for faster, more convenient access.</p>
                  {bioError && <p className="welcome-bio-error">{bioError}</p>}
                  <button
                    className="welcome-btn-bio"
                    onClick={handleEnrollBiometric}
                    disabled={bioEnrolling}
                  >
                    {bioEnrolling ? "Setting up..." : "Enable Biometric Login"}
                  </button>
                </div>
              )}

              {bioSupported && bioSuccess && (
                <div className="welcome-bio-success">
                  <div className="welcome-bio-success-icon">✅</div>
                  <p>Biometric login has been enabled successfully!</p>
                </div>
              )}
            </div>

            <div className="welcome-btn-row">
              <button className="welcome-btn-secondary" onClick={() => setStep("theme")}>← Back</button>
              <button className="welcome-btn-primary welcome-btn-finish" onClick={handleFinish}>
                {bioSuccess || !bioSupported || isBiometricEnrolled()
                  ? "Get Started 🚀"
                  : "Skip & Get Started 🚀"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
