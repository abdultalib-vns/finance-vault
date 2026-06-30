import { Banknote, Search, Check, ArrowLeft, ArrowRight, Palette, Sun, Moon, Lock, Ban, CheckCircle, Rocket, User, Camera } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { getDynamicCurrencies, getCurrency } from "../lib/currency";
import { saveCurrency, saveTheme, loadTheme, saveUserProfile } from "../lib/storage";
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

type WelcomeStep = "currency" | "theme" | "profile" | "biometric" | "done";

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

  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    isBiometricSupported().then(setBioSupported);
  }, []);

  const ITEMS_PER_PAGE = 10;
  const isSearching = searchQuery.trim().length > 0;

  const dynamicCurrencies = getDynamicCurrencies();
  const filteredCurrencies = dynamicCurrencies.filter(
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
    setStep("profile");
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        setProfilePhoto(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  function handleProfileNext() {
    if (profileName || profileEmail || profilePhoto) {
      saveUserProfile({ name: profileName, email: profileEmail, photo: profilePhoto });
    }
    setStep("biometric");
  }

  function handleProfileSkip() {
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

  const stepIndex = step === "currency" ? 0 : step === "theme" ? 1 : step === "profile" ? 2 : 3;
  const stepLabels = ["Currency", "Theme", "Profile", "Security"];

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
                {i < stepIndex ? <Check size={16} /> : i + 1}
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
              <span className="welcome-step-icon"><Banknote size={20} /></span>
              <div>
                <h3>Select your Currency</h3>
                <p>This is used across all your accounts and cards</p>
              </div>
              <span className="welcome-badge-required">Required</span>
            </div>

            <div className="welcome-search-wrap">
              <span className="welcome-search-icon"><Search size={16} /></span>
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
                  {selectedCurrency === c.code && <span className="welcome-currency-check"><Check size={16} /></span>}
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
                  <ArrowLeft size={16} />
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
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

            <button className="welcome-btn-primary" onClick={handleCurrencyNext}>
              Continue <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ── Step 2: Theme (Optional) ── */}
        {step === "theme" && (
          <div className="welcome-step">
            <div className="welcome-step-header">
              <span className="welcome-step-icon"><Palette size={20} /></span>
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
                <span className="welcome-theme-label"><Sun size={16} /> Light Mode</span>
                {selectedTheme === "light" && <span className="welcome-theme-check"><Check size={16} /></span>}
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
                <span className="welcome-theme-label"><Moon size={16} /> Dark Mode</span>
                {selectedTheme === "dark" && <span className="welcome-theme-check"><Check size={16} /></span>}
              </button>
            </div>

            <div className="welcome-btn-row">
              <button className="welcome-btn-secondary" onClick={() => setStep("currency")}><ArrowLeft size={16} /> Back</button>
              <button className="welcome-btn-primary" onClick={handleThemeNext}>Continue <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {/* ── Step 2.5: Profile (Optional) ── */}
        {step === "profile" && (
          <div className="welcome-step">
            <div className="welcome-step-header">
              <span className="welcome-step-icon"><User size={20} /></span>
              <div>
                <h3>Setup your Profile</h3>
                <p>Personalize your Vault</p>
              </div>
              <span className="welcome-badge-optional">Optional</span>
            </div>

            <div className="welcome-profile-setup" style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "20px" }}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div 
                  style={{ 
                    width: 100, height: 100, borderRadius: "50%", background: "var(--surface2)", 
                    display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed var(--border)",
                    cursor: "pointer", position: "relative", overflow: "hidden"
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Camera size={32} color="var(--text2)" />
                  )}
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoUpload} style={{ display: "none" }} />
                </div>
              </div>

              <div className="form-group">
                <label>Name</label>
                <input type="text" className="text-input" placeholder="Enter your name" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
              </div>
              
              <div className="form-group">
                <label>Email (Optional)</label>
                <input type="email" className="text-input" placeholder="Enter your email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} />
              </div>
            </div>

            <div className="welcome-btn-row" style={{ marginTop: "30px" }}>
              <button className="welcome-btn-secondary" onClick={handleProfileSkip}>Skip for now</button>
              <button className="welcome-btn-primary" onClick={handleProfileNext} disabled={!profileName && !profilePhoto}>Continue <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {/* ── Step 3: Biometric (Optional) ── */}
        {step === "biometric" && (
          <div className="welcome-step">
            <div className="welcome-step-header">
              <span className="welcome-step-icon"><Lock size={20} /></span>
              <div>
                <h3>Enable Biometric Login</h3>
                <p>Use fingerprint or Face ID for quick access</p>
              </div>
              <span className="welcome-badge-optional">Optional</span>
            </div>

            <div className="welcome-bio-section">
              {!bioSupported && (
                <div className="welcome-bio-unavailable">
                  <span className="welcome-bio-unavail-icon"><Ban size={20} /></span>
                  <p>Biometric authentication is not available on this device or browser.</p>
                </div>
              )}

              {bioSupported && !bioSuccess && (
                <div className="welcome-bio-available">
                  <div className="welcome-bio-fingerprint"><Lock size={20} /></div>
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
                  <div className="welcome-bio-success-icon"><CheckCircle size={20} /></div>
                  <p>Biometric login has been enabled successfully!</p>
                </div>
              )}
            </div>

            <div className="welcome-btn-row">
              <button className="welcome-btn-secondary" onClick={() => setStep("theme")}><ArrowLeft size={16} /> Back</button>
              <button className="welcome-btn-primary welcome-btn-finish" onClick={handleFinish}>
                {bioSuccess || !bioSupported || isBiometricEnrolled()
                  ? <>Get Started <Rocket size={16} /></>
                  : <>Skip & Get Started <Rocket size={16} /></>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
