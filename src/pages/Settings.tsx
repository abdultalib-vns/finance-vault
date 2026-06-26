import { useEffect, useRef, useState } from "react";
import { hashPin } from "../lib/crypto";
import { savePinHash, clearAll, saveItems, saveCurrency, saveIdleTimeout, loadItems, loadExpenses, loadCashbacks, loadBankExpenses } from "../lib/storage";
import { encryptData, decryptData } from "../lib/crypto";
import { FinanceItem, Currency } from "../types";
import { getDynamicCurrencies, getCurrency } from "../lib/currency";
import {
  isBiometricSupported,
  isBiometricEnrolled,
  enrollBiometric,
  disableBiometric,
} from "../lib/biometric";
import { exportVault, importVault } from "../lib/importExport";

const APP_VERSION = "2.0.0";

interface Props {
  masterKey: string;
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  onLock: () => void;
  onMasterKeyChange: (newKey: string) => void;
  items: FinanceItem[];
  onItemsChange: (items: FinanceItem[]) => void;
  idleMinutes: number;
  onIdleMinutesChange: (m: number) => void;
  theme: "light" | "dark";
  onThemeChange: (t: "light" | "dark") => void;
  onReload: () => void;
}

export default function Settings({
  masterKey, currency, onCurrencyChange,
  onLock, onMasterKeyChange, items, onItemsChange,
  idleMinutes, onIdleMinutesChange,
  theme, onThemeChange,
  onReload,
}: Props) {
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinMsg, setPinMsg] = useState("");
  const [showClear, setShowClear] = useState(false);
  const [pwaPrompt, setPwaPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const [bioSupported, setBioSupported] = useState(false);
  const [bioEnabled, setBioEnabled] = useState<boolean>(isBiometricEnrolled());
  const [bioMsg, setBioMsg] = useState("");
  const [bioLoading, setBioLoading] = useState(false);

  const [ioPin, setIoPin] = useState("");
  const [ioMsg, setIoMsg] = useState("");
  const [ioLoading, setIoLoading] = useState(false);
  const [showExportPin, setShowExportPin] = useState(false);
  const [showImportPin, setShowImportPin] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [clearStep, setClearStep] = useState<"idle" | "pin" | "bio">("idle");
  const [clearPin, setClearPin] = useState("");
  const [clearMsg, setClearMsg] = useState("");

  useEffect(() => {
    isBiometricSupported().then(setBioSupported);
  }, []);

  if (typeof window !== "undefined") {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setPwaPrompt(e as BeforeInstallPromptEvent);
    }, { once: true });
  }

  function handleChangePin(e: React.FormEvent) {
    e.preventDefault();
    setPinMsg("");
    if (newPin.length < 4) { setPinMsg("PIN must be at least 4 digits."); return; }
    if (newPin !== confirmPin) { setPinMsg("PINs do not match."); return; }

    const reEncrypted = items.map((item) => {
      const secret = decryptData(item.encryptedSecret, masterKey);
      return { ...item, encryptedSecret: encryptData(secret, newPin) };
    });

    savePinHash(hashPin(newPin));
    saveItems(reEncrypted);
    onItemsChange(reEncrypted);
    onMasterKeyChange(newPin);
    setNewPin("");
    setConfirmPin("");
    setPinMsg("✅ PIN changed! All data re-encrypted.");

    if (isBiometricEnrolled()) {
      disableBiometric();
      setBioEnabled(false);
      setBioMsg("⚠️ Biometric login was disabled because the PIN changed. Re-enable it below.");
    }
  }

  function handleCurrencyChange(code: string) {
    const c = getCurrency(code);
    saveCurrency(code);
    onCurrencyChange(c);
  }

  async function handleInstallPwa() {
    if (!pwaPrompt) return;
    await pwaPrompt.prompt();
    setPwaPrompt(null);
  }

  async function handleEnableBio() {
    setBioMsg("");
    setBioLoading(true);
    try {
      await enrollBiometric(masterKey);
      setBioEnabled(true);
      setBioMsg("✅ Biometric login enabled!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not enable biometric login.";
      setBioMsg(`⚠️ ${msg}`);
    } finally {
      setBioLoading(false);
    }
  }

  function handleDisableBio() {
    disableBiometric();
    setBioEnabled(false);
    setBioMsg("Biometric login disabled.");
  }

  function handleClearAll() {
    clearAll();
    onItemsChange([]);
    onLock();
  }

  async function handleExport() {
    setIoMsg("");
    setIoLoading(true);
    try {
      await exportVault(ioPin);
      setIoMsg("✅ Backup downloaded successfully.");
      setShowExportPin(false);
      setIoPin("");
    } catch (err) {
      setIoMsg(`❌ ${err instanceof Error ? err.message : "Export failed."}`);
    } finally {
      setIoLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPendingFile(file);
      setShowImportPin(true);
      setShowExportPin(false);
    }
    e.target.value = "";
  }

  async function handleImport() {
    if (!pendingFile) return;
    setIoMsg("");
    setIoLoading(true);
    try {
      await importVault(pendingFile, ioPin);
      onReload();
      setIoMsg(`✅ Imported successfully!`);
      setShowImportPin(false);
      setPendingFile(null);
      setIoPin("");
    } catch (err) {
      setIoMsg(`❌ ${err instanceof Error ? err.message : "Import failed."}`);
    } finally {
      setIoLoading(false);
    }
  }

  function requestClear() {
    setClearMsg("");
    setShowClear(true);
    if (bioSupported && bioEnabled) {
      setClearStep("bio");
      return;
    }
    setClearStep("pin");
  }

  async function verifyClearBiometric() {
    setClearMsg("");
    try {
      await enrollBiometric(masterKey);
      handleClearAll();
    } catch (err) {
      setClearMsg(`❌ ${err instanceof Error ? err.message : "Biometric verification failed."}`);
    }
  }

  function verifyClearPin() {
    if (!clearPin) {
      setClearMsg("Enter your PIN.");
      return;
    }
    if (hashPin(clearPin) !== hashPin(masterKey)) {
      setClearMsg("❌ Incorrect PIN.");
      return;
    }
    handleClearAll();
  }

  const [fbTitle, setFbTitle] = useState("");
  const [fbDesc, setFbDesc] = useState("");
  const [fbMsg, setFbMsg] = useState("");
  const [fbLoading, setFbLoading] = useState(false);

  async function handleFeedbackSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFbMsg("");
    if (!fbTitle.trim()) { setFbMsg("Please enter a title."); return; }
    if (!fbDesc.trim()) { setFbMsg("Please enter a description."); return; }
    setFbLoading(true);
    try {
      const resp = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: fbTitle.trim(), description: fbDesc.trim() }),
      });
      if (!resp.ok) throw new Error("Server error");
      setFbMsg("✅ Thank you! Your feedback has been submitted.");
      setFbTitle("");
      setFbDesc("");
    } catch {
      setFbMsg("❌ Could not submit feedback. Please try again later.");
    } finally {
      setFbLoading(false);
    }
  }

  const stats = {
    bank: items.filter(i => i.type === "bank").length,
    card: items.filter(i => i.type === "card").length,
    fd: items.filter(i => i.type === "fd").length,
    rd: items.filter(i => i.type === "rd").length,
    mf: items.filter(i => i.type === "mf").length,
    paylater: items.filter(i => i.type === "paylater").length,
    other: items.filter(i => i.type === "other").length,
    expenses: loadExpenses().length,
    cashbacks: loadCashbacks().length,
    bankExpenses: loadBankExpenses().length,
  };

  function approxStorageKB(): string {
    try {
      let total = 0;
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key) && key.startsWith("finance_")) {
          total += (localStorage.getItem(key) ?? "").length * 2;
        }
      }
      return `${(total / 1024).toFixed(1)} KB`;
    } catch { return "N/A"; }
  }

  return (
    <div className="screen">
      <header className="page-header">
        <h2 className="header-title">Settings</h2>
      </header>
      <div className="content">
        <div className="settings-section">
          <h3 className="settings-section-title">Appearance</h3>
          <p className="settings-label">Theme</p>
          <div className="theme-toggle">
            <button type="button" className={`theme-btn ${theme === "light" ? "active" : ""}`} onClick={() => onThemeChange("light")}>☀️ Light</button>
            <button type="button" className={`theme-btn ${theme === "dark" ? "active" : ""}`} onClick={() => onThemeChange("dark")}>🌙 Dark</button>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">Display Currency</h3>
          <select className="settings-select" value={currency.code} onChange={(e) => handleCurrencyChange(e.target.value)}>
            {getDynamicCurrencies().map((c) => <option key={c.code} value={c.code}>{c.symbol} — {c.name} ({c.code})</option>)}
          </select>
          <p className="settings-hint">Affects how balances are displayed. Stored values are unchanged.</p>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">📦 Backup & Restore</h3>
          <p className="settings-hint">Export all your data as an encrypted backup file. Import it on another device using the same PIN.</p>
          {ioMsg && <p className={`settings-msg ${ioMsg.startsWith("✅") ? "success" : "error"}`}>{ioMsg}</p>}
          {!showImportPin && (
            <>
              {!showExportPin ? (
                <button type="button" className="btn-primary" onClick={() => { setShowExportPin(true); setIoPin(""); setIoMsg(""); }}>
                  📤 Export Backup
                </button>
              ) : (
                <div className="io-pin-block">
                  <p className="settings-label">Enter your PIN to confirm export</p>
                  <input type="password" inputMode="numeric" className="settings-input" placeholder="Enter PIN" value={ioPin} onChange={(e) => setIoPin(e.target.value)} autoFocus />
                  <div className="io-actions">
                    <button type="button" className="btn-primary" onClick={handleExport} disabled={ioLoading || !ioPin}>{ioLoading ? "Exporting…" : "Export"}</button>
                    <button type="button" className="btn-secondary" onClick={() => { setShowExportPin(false); setIoPin(""); }}>Cancel</button>
                  </div>
                </div>
              )}
            </>
          )}
          {!showExportPin && (
            <>
              <input type="file" ref={importFileRef} accept=".fvbackup,.json" style={{ display: "none" }} onChange={handleFileChange} />
              {!showImportPin ? (
                <button type="button" className="btn-outline" style={{ marginTop: 8 }} onClick={() => { setIoMsg(""); importFileRef.current?.click(); }}>
                  📥 Import Backup
                </button>
              ) : (
                <div className="io-pin-block">
                  <p className="settings-label">File: <strong>{pendingFile?.name}</strong></p>
                  <p className="settings-label">Enter your PIN to confirm import</p>
                  <input type="password" inputMode="numeric" className="settings-input" placeholder="Enter PIN" value={ioPin} onChange={(e) => setIoPin(e.target.value)} autoFocus />
                  <div className="io-actions">
                    <button type="button" className="btn-primary" onClick={handleImport} disabled={ioLoading || !ioPin}>{ioLoading ? "Importing…" : "Import"}</button>
                    <button type="button" className="btn-secondary" onClick={() => { setShowImportPin(false); setPendingFile(null); setIoPin(""); }}>Cancel</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">🔑 Security</h3>
          <form className="settings-form" onSubmit={handleChangePin}>
            <p className="settings-label">Change Master PIN</p>
            <input type="password" inputMode="numeric" placeholder="New PIN (min 4 digits)" value={newPin} onChange={(e) => setNewPin(e.target.value)} className="settings-input" />
            <input type="password" inputMode="numeric" placeholder="Confirm New PIN" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)} className="settings-input" />
            {pinMsg && <p className={`settings-msg ${pinMsg.startsWith("✅") ? "success" : "error"}`}>{pinMsg}</p>}
            <button type="submit" className="btn-primary">Update PIN</button>
          </form>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">🔐 Biometric Login</h3>
          {!bioSupported ? (
            <p className="settings-hint">Biometric login is not available on this device.</p>
          ) : bioEnabled ? (
            <>
              <p className="settings-hint">✅ Enabled — Sign in with Touch ID, Face ID, or fingerprint.</p>
              {bioMsg && <p className={`settings-msg ${bioMsg.startsWith("✅") ? "success" : "error"}`}>{bioMsg}</p>}
              <button type="button" className="btn-outline" onClick={handleDisableBio}>Disable Biometric Login</button>
            </>
          ) : (
            <>
              <p className="settings-hint">Use Touch ID, Face ID, or Fingerprint instead of typing your PIN every time.</p>
              {bioMsg && <p className={`settings-msg ${bioMsg.startsWith("✅") ? "success" : "error"}`}>{bioMsg}</p>}
              <button type="button" className="btn-primary" onClick={handleEnableBio} disabled={bioLoading}>{bioLoading ? "Setting up…" : "Enable Biometric Login"}</button>
            </>
          )}
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">⏱ Session</h3>
          <p className="settings-label">Auto-logout when idle</p>
          <select className="settings-select" value={idleMinutes} onChange={(e) => { const m = parseInt(e.target.value, 10); saveIdleTimeout(m); onIdleMinutesChange(m); }}>
            <option value={1}>1 minute</option>
            <option value={2}>2 minutes</option>
            <option value={5}>5 minutes</option>
            <option value={10}>10 minutes</option>
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={0}>Never</option>
          </select>
          <p className="settings-hint">The app locks automatically after this much inactivity.</p>
          <button type="button" className="btn-danger lock-btn" onClick={onLock} style={{ marginTop: 12 }}>🚪 Logout</button>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">📲 Install App</h3>
          {pwaPrompt ? (
            <>
              <p className="settings-hint">Install FinAura on your home screen for a native app experience.</p>
              <button type="button" className="btn-primary" onClick={handleInstallPwa}>📲 Install on Home Screen</button>
            </>
          ) : (
            <p className="settings-hint">Open your browser menu and tap "Add to Home Screen" or "Install App".</p>
          )}
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">📊 App Statistics</h3>
          <div className="stats-grid">
            {stats.bank > 0 && <div className="stat-chip">🏦 {stats.bank} Bank</div>}
            {stats.card > 0 && <div className="stat-chip">💳 {stats.card} Card</div>}
            {stats.paylater > 0 && <div className="stat-chip">🔄 {stats.paylater} PayLater</div>}
            {stats.fd > 0 && <div className="stat-chip">📈 {stats.fd} FD</div>}
            {stats.rd > 0 && <div className="stat-chip">📅 {stats.rd} RD</div>}
            {stats.mf > 0 && <div className="stat-chip">📊 {stats.mf} MF</div>}
            {stats.other > 0 && <div className="stat-chip">📋 {stats.other} Other</div>}
            {stats.expenses > 0 && <div className="stat-chip">🧾 {stats.expenses} Expenses</div>}
            {stats.cashbacks > 0 && <div className="stat-chip">🎁 {stats.cashbacks} Cashbacks</div>}
            {stats.bankExpenses > 0 && <div className="stat-chip">💸 {stats.bankExpenses} Txns</div>}
          </div>
          <p className="settings-hint" style={{ marginTop: 8 }}>Storage used: ~{approxStorageKB()}</p>
        </div>

        <div className="settings-section danger-zone">
          <h3 className="settings-section-title danger-title">⚠️ Danger Zone</h3>
          {!showClear ? (
            <button type="button" className="btn-danger" onClick={requestClear}>🗑️ Clear All Data</button>
          ) : clearStep === "pin" ? (
            <div className="confirm-block">
              <p className="confirm-text">Enter your PIN to clear all data.</p>
              <input type="password" inputMode="numeric" className="settings-input" value={clearPin} onChange={(e) => setClearPin(e.target.value)} placeholder="Enter PIN" />
              {clearMsg && <p className="settings-msg error">{clearMsg}</p>}
              <div className="confirm-actions">
                <button type="button" className="btn-danger" onClick={verifyClearPin}>Continue</button>
                <button type="button" className="btn-secondary" onClick={() => { setShowClear(false); setClearStep("idle"); setClearPin(""); setClearMsg(""); }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="confirm-block">
              <p className="confirm-text">Verify with biometric to clear all data.</p>
              {clearMsg && <p className="settings-msg error">{clearMsg}</p>}
              <div className="confirm-actions">
                <button type="button" className="btn-danger" onClick={verifyClearBiometric}>Verify Biometric</button>
                <button type="button" className="btn-secondary" onClick={() => { setShowClear(false); setClearStep("idle"); setClearMsg(""); }}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">💬 Feedback & Suggestions</h3>
          <p className="settings-hint">Have a feature idea or found a bug? Let us know!</p>
          <form className="settings-form" onSubmit={handleFeedbackSubmit}>
            <input
              type="text"
              className="settings-input"
              placeholder="Title (e.g. Add new currency, Bug report...)"
              value={fbTitle}
              onChange={(e) => setFbTitle(e.target.value)}
              maxLength={100}
            />
            <textarea
              className="settings-textarea"
              placeholder="Describe your feedback or suggestion in detail..."
              value={fbDesc}
              onChange={(e) => setFbDesc(e.target.value)}
              rows={4}
              maxLength={1000}
            />
            {fbMsg && <p className={`settings-msg ${fbMsg.startsWith("✅") ? "success" : "error"}`}>{fbMsg}</p>}
            <button type="submit" className="btn-primary" disabled={fbLoading}>
              {fbLoading ? "Submitting…" : "📩 Submit Feedback"}
            </button>
          </form>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">ℹ️ About FinAura</h3>
          <div className="about-block">
            <div className="about-row"><span>Version</span><strong>{APP_VERSION}</strong></div>
            <div className="about-row"><span>Storage</span><strong>100% Local (localStorage)</strong></div>
            <div className="about-row"><span>Encryption</span><strong>AES via CryptoJS</strong></div>
            <div className="about-row"><span>Network</span><strong>No data sent anywhere</strong></div>
          </div>
          <p className="settings-info-text">🔐 All secrets are encrypted with AES using your PIN as the key. Your data never leaves your device.</p>
        </div>

        {/* Credit */}
        <div style={{ textAlign: "center", padding: "10px 0 30px", fontSize: "0.75rem", color: "var(--text3)", opacity: 0.8, lineHeight: 1.4 }}>
          Developed by VeloLaunch <br /> A Company by <a href="https://smartvistaitsolutions.in" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>Smart Vista IT Solutions</a>
        </div>
      </div>
    </div>
  );
}

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
  }
}
