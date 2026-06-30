import { XCircle, Archive, Upload, Download, Key, Timer, Smartphone, LayoutDashboard, CreditCard, Building2, Gift, Sun, Moon, Lock, CheckCircle, LogOut, Calendar, Trash, MessageSquare, Info, AlertTriangle, Send, DollarSign, Receipt, TrendingUp, RefreshCw, ClipboardList, Bot, Sparkles, Eye, EyeOff, User, Camera, Edit2, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { hashPin } from "../lib/crypto";
import { savePinHash, clearAll, saveItems, saveCurrency, saveIdleTimeout, loadItems, loadExpenses, loadCashbacks, loadBankExpenses, saveAIOptions, loadAIOptions, getVeloAIUsageCount, loadUserProfile, saveUserProfile } from "../lib/storage";
import { encryptData, decryptData } from "../lib/crypto";
import { FinanceItem, Currency, AIOptions, UserProfile } from "../types";
import { OPENROUTER_MODELS, GROQ_MODELS } from "../lib/ai";
import { getDynamicCurrencies, getCurrency } from "../lib/currency";
import {
  isBiometricSupported,
  isBiometricEnrolled,
  enrollBiometric,
  disableBiometric,
  loginWithBiometric,
} from "../lib/biometric";
import { exportVault, importVault } from "../lib/importExport";
import veloLaunchLogo from "../VeloLaunch.png";

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

  const [aiOpts, setAiOpts] = useState<AIOptions>(loadAIOptions());
  const [showAiKeys, setShowAiKeys] = useState(false);
  const [popupMsg, setPopupMsg] = useState<{title: string, desc: string, type: "success" | "error" | "info"} | null>(null);
  const [showAiPinPrompt, setShowAiPinPrompt] = useState(false);
  const [aiPin, setAiPin] = useState("");

  const [profile, setProfile] = useState<UserProfile | null>(loadUserProfile());
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const profileFileRef = useRef<HTMLInputElement>(null);

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
    setPinMsg("Success: PIN changed! All data re-encrypted.");
  }

  function handleProfileEditOpen() {
    setProfileName(profile?.name || "");
    setProfileEmail(profile?.email || "");
    setProfilePhoto(profile?.photo || "");
    setShowProfileModal(true);
  }

  function handleProfilePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
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
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
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

  function handleProfileSave() {
    const p = { name: profileName, email: profileEmail, photo: profilePhoto };
    saveUserProfile(p);
    setProfile(p);
    setShowProfileModal(false);
  }

  async function handleToggleBio() {
    if (isBiometricEnrolled()) {
      disableBiometric();
      setBioEnabled(false);
      setBioMsg("Error: Biometric login was disabled because the PIN changed. Re-enable it below.");
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
      setBioMsg("Success: Biometric login enabled!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not enable biometric login.";
      setBioMsg(`Error: ${msg}`);
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
    try {
      await exportVault(ioPin);
      setIoLoading(true);
      setIoMsg("Success: Backup downloaded successfully.");
      setShowExportPin(false);
      setIoPin("");
    } catch (err: any) {
      setIoMsg(`Error: ${err.message}`);
    } finally {
      setIoLoading(false);
    }
  }

  async function handleToggleShowAiKeys() {
    if (showAiKeys) {
      setShowAiKeys(false);
      return;
    }

    if (isBiometricEnrolled()) {
      try {
        await loginWithBiometric();
        setShowAiKeys(true);
        return;
      } catch (err) {
        // Fallback to PIN if biometric cancelled/fails
      }
    }

    setShowAiPinPrompt(true);
    setAiPin("");
  }

  function handleAiPinSubmit() {
    const storedHash = localStorage.getItem("vault_pin") || hashPin(masterKey);
    if (hashPin(aiPin) === storedHash) {
      setShowAiKeys(true);
      setShowAiPinPrompt(false);
    } else {
      setPopupMsg({
        title: "Authentication Failed",
        desc: "The PIN you entered is incorrect. Please try again.",
        type: "error"
      });
    }
  }

  function handleSaveAiSettings() {
    saveAIOptions(aiOpts);
    setPopupMsg({
      title: "Success",
      desc: "AI API keys and models have been saved securely.",
      type: "success"
    });
    setShowAiKeys(false); // Hide after saving for security
  }

  function handleDeleteAiKey() {
    const provider = aiOpts.provider;
    if (provider === "none" || provider === "veloai") return;
    
    let n = { ...aiOpts };
    if (provider === "gemini") n.geminiKey = "";
    if (provider === "openrouter") { n.openRouterKey = ""; n.openRouterModel = ""; }
    if (provider === "groq") { n.groqKey = ""; n.groqModel = ""; }
    
    setAiOpts(n);
    saveAIOptions(n);
    setPopupMsg({
      title: "Deleted",
      desc: "API key and model for this provider have been deleted.",
      type: "info"
    });
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
      setIoMsg(`Success: Imported successfully!`);
      setShowImportPin(false);
      setPendingFile(null);
      setIoPin("");
    } catch (err) {
      setIoMsg(`Error: ${err instanceof Error ? err.message : "Import failed."}`);
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
      setClearMsg(`Error: ${err instanceof Error ? err.message : "Biometric verification failed."}`);
    }
  }

  function verifyClearPin() {
    if (!clearPin) {
      setClearMsg("Enter your PIN.");
      return;
    }
    if (hashPin(clearPin) !== hashPin(masterKey)) {
      setClearMsg("Error: Incorrect PIN.");
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
      setFbMsg("Success: Thank you! Your feedback has been submitted.");
      setFbTitle("");
      setFbDesc("");
    } catch {
      setFbMsg("Error: Could not submit feedback. Please try again later.");
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
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="header-title">Settings</h2>
        <a href="https://velolaunch.lovable.app" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', height: '32px' }}>
          <img src={veloLaunchLogo} alt="VeloLaunch" style={{ display: 'block', height: "100%", width: 'auto', objectFit: "contain", opacity: 0.9, transition: "opacity 0.2s ease" }} onMouseOver={e => e.currentTarget.style.opacity = "1"} onMouseOut={e => e.currentTarget.style.opacity = "0.9"} />
        </a>
      </header>
      <div className="content">
        {/* ── User Profile Section ── */}
        <div className="settings-section" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: "var(--surface)", borderRadius: "12px", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {profile?.photo ? (
                <img src={profile.photo} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <User size={32} color="var(--text2)" />
              )}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--text)" }}>{profile?.name || "No Name Set"}</h3>
              {profile?.email && <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--text2)" }}>{profile.email}</p>}
            </div>
          </div>
          <button className="icon-btn" onClick={handleProfileEditOpen} style={{ background: "var(--surface2)", padding: "10px", borderRadius: "50%" }}>
            <Edit2 size={18} />
          </button>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">Appearance</h3>
          <p className="settings-label">Theme</p>
          <div className="theme-toggle">
            <button type="button" className={`theme-btn ${theme === "light" ? "active" : ""}`} onClick={() => onThemeChange("light")}><Sun size={16} /> Light</button>
            <button type="button" className={`theme-btn ${theme === "dark" ? "active" : ""}`} onClick={() => onThemeChange("dark")}><Moon size={16} /> Dark</button>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title"><Bot size={20} /> AI Assistant Settings</h3>
          <p className="settings-hint">Configure your AI provider to enable smart features like Receipt Scanning, Natural Language Entry, and the Vault Assistant.</p>
          
          <div className="form-group" style={{ marginTop: 12 }}>
            <label className="settings-label">AI Provider</label>
            <div className="type-tabs" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button 
                type="button" 
                className={`type-tab ${aiOpts.provider === "veloai" ? "active" : ""}`}
                onClick={() => { const n = { ...aiOpts, provider: "veloai" as const }; setAiOpts(n); saveAIOptions(n); }}
              >
                VeloAI
              </button>
              <button 
                type="button" 
                className={`type-tab ${aiOpts.provider === "gemini" ? "active" : ""}`}
                onClick={() => { const n = { ...aiOpts, provider: "gemini" as const }; setAiOpts(n); saveAIOptions(n); }}
              >
                Google Gemini
              </button>
              <button 
                type="button" 
                className={`type-tab ${aiOpts.provider === "openrouter" ? "active" : ""}`}
                onClick={() => { const n = { ...aiOpts, provider: "openrouter" as const }; setAiOpts(n); saveAIOptions(n); }}
              >
                OpenRouter
              </button>
              <button 
                type="button" 
                className={`type-tab ${aiOpts.provider === "groq" ? "active" : ""}`}
                onClick={() => { const n = { ...aiOpts, provider: "groq" as const }; setAiOpts(n); saveAIOptions(n); }}
              >
                Groq
              </button>
            </div>
          </div>

          {aiOpts.provider === "veloai" && (
            <div className="settings-msg info" style={{ marginBottom: 12 }}>
              <Bot size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
              You have {10 - getVeloAIUsageCount()}/10 messages left for today.
            </div>
          )}

          {aiOpts.provider === "gemini" && (
            <div className="form-group">
              <label className="settings-label">Gemini API Key</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input 
                  type="text" 
                  className="settings-input" 
                  style={{ flex: 1 }}
                  placeholder="AIzaSy..." 
                  readOnly={!showAiKeys && !!aiOpts.geminiKey}
                  value={(!showAiKeys && aiOpts.geminiKey) ? "••••••••••••••••••••••••••••••••" : aiOpts.geminiKey} 
                  onChange={(e) => { const n = { ...aiOpts, geminiKey: e.target.value }; setAiOpts(n); }} 
                />
                <button type="button" className="btn-outline" style={{ padding: '0 12px' }} onClick={handleToggleShowAiKeys}>
                  {showAiKeys ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="input-hint">Get a free key from Google AI Studio. Stored securely on your device.</p>
            </div>
          )}

          {aiOpts.provider === "openrouter" && (
            <>
              <div className="form-group">
                <label className="settings-label">OpenRouter API Key</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input 
                    type="text" 
                    className="settings-input" 
                    style={{ flex: 1 }}
                    placeholder="sk-or-v1-..." 
                    readOnly={!showAiKeys && !!aiOpts.openRouterKey}
                    value={(!showAiKeys && aiOpts.openRouterKey) ? "••••••••••••••••••••••••••••••••" : aiOpts.openRouterKey} 
                    onChange={(e) => { const n = { ...aiOpts, openRouterKey: e.target.value }; setAiOpts(n); }} 
                  />
                  <button type="button" className="btn-outline" style={{ padding: '0 12px' }} onClick={handleToggleShowAiKeys}>
                    {showAiKeys ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 12 }}>
                <label className="settings-label">OpenRouter Model</label>
                <input 
                  type="text"
                  list="openrouter-models"
                  className="settings-input" 
                  readOnly={!showAiKeys && !!aiOpts.openRouterModel}
                  value={(!showAiKeys && aiOpts.openRouterModel) ? "••••••••••••••••" : aiOpts.openRouterModel} 
                  placeholder="e.g. google/gemini-flash-1.5"
                  onChange={(e) => { const n = { ...aiOpts, openRouterModel: e.target.value }; setAiOpts(n); }}
                />
                <datalist id="openrouter-models">
                  {OPENROUTER_MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </datalist>
                <p className="input-hint">Select a model from the list or type a custom OpenRouter model ID.</p>
              </div>
            </>
          )}

          {aiOpts.provider === "groq" && (
            <>
              <div className="form-group">
                <label className="settings-label">Groq API Key</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input 
                    type="text" 
                    className="settings-input" 
                    style={{ flex: 1 }}
                    placeholder="gsk_..." 
                    readOnly={!showAiKeys && !!aiOpts.groqKey}
                    value={(!showAiKeys && aiOpts.groqKey) ? "••••••••••••••••••••••••••••••••" : aiOpts.groqKey} 
                    onChange={(e) => { const n = { ...aiOpts, groqKey: e.target.value }; setAiOpts(n); }} 
                  />
                  <button type="button" className="btn-outline" style={{ padding: '0 12px' }} onClick={handleToggleShowAiKeys}>
                    {showAiKeys ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 12 }}>
                <label className="settings-label">Groq Model</label>
                <input 
                  type="text"
                  list="groq-models"
                  className="settings-input" 
                  readOnly={!showAiKeys && !!aiOpts.groqModel}
                  value={(!showAiKeys && aiOpts.groqModel) ? "••••••••••••••••" : aiOpts.groqModel} 
                  placeholder="e.g. llama-3.1-8b-instant"
                  onChange={(e) => { const n = { ...aiOpts, groqModel: e.target.value }; setAiOpts(n); }}
                />
                <datalist id="groq-models">
                  {GROQ_MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </datalist>
                <p className="input-hint">Select a model from the list or type a custom Groq model ID.</p>
                <div className="settings-msg error" style={{ marginTop: 12 }}>
                  <AlertTriangle size={16} style={{display:'inline', verticalAlign:'middle', marginRight:6}}/>
                  Note: Groq currently does not support Receipt AI Scanning features.
                </div>
              </div>
            </>
          )}

          {aiOpts.provider !== "none" && (
            <div style={{ marginTop: 16 }}>
              {showAiPinPrompt && (
                <div className="pin-prompt-box" style={{ marginBottom: 12 }}>
                  <label className="settings-label">Enter PIN to view keys:</label>
                  <input type="password" inputMode="numeric" className="settings-input" value={aiPin} onChange={(e) => setAiPin(e.target.value)} placeholder="PIN" />
                  <div style={{display:'flex', gap:8, marginTop:12}}>
                    <button type="button" className="btn-outline" style={{flex:1}} onClick={() => setShowAiPinPrompt(false)}>Cancel</button>
                    <button type="button" className="btn-primary" style={{flex:1}} onClick={handleAiPinSubmit}>Unlock</button>
                  </div>
                </div>
              )}
              {aiOpts.provider !== "veloai" && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="btn-primary" style={{ flex: 1 }} onClick={handleSaveAiSettings}>
                    Save API Keys & Models
                  </button>
                  <button type="button" className="btn-danger" style={{ padding: '0 16px' }} onClick={handleDeleteAiKey}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">Display Currency</h3>
          <select className="settings-select" value={currency.code} onChange={(e) => handleCurrencyChange(e.target.value)}>
            {getDynamicCurrencies().map((c) => <option key={c.code} value={c.code}>{c.symbol} — {c.name} ({c.code})</option>)}
          </select>
          <p className="settings-hint">Affects how balances are displayed. Stored values are unchanged.</p>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title"><Archive size={20} /> Backup & Restore</h3>
          <p className="settings-hint">Export all your data as an encrypted backup file. Import it on another device using the same PIN.</p>
          {ioMsg && <p className={`settings-msg ${ioMsg.startsWith("Success:") ? "success" : "error"}`}>
                {ioMsg.startsWith("Success:") ? <CheckCircle size={20} style={{display:"inline", verticalAlign:"middle", marginRight: 4}}/> : <AlertTriangle size={20} style={{display:"inline", verticalAlign:"middle", marginRight: 4}}/>}
                {ioMsg.replace("Success: ", "").replace("Error: ", "")}
              </p>}
          {!showImportPin && (
            <>
              {!showExportPin ? (
                <button type="button" className="btn-primary" onClick={() => { setShowExportPin(true); setIoPin(""); setIoMsg(""); }}>
                  <Upload size={16} /> Export Backup
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
                  <Download size={16} /> Import Backup
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
          <h3 className="settings-section-title"><Key size={20} /> Security</h3>
          <form className="settings-form" onSubmit={handleChangePin}>
            <p className="settings-label">Change Master PIN</p>
            <input type="password" inputMode="numeric" placeholder="New PIN (min 4 digits)" value={newPin} onChange={(e) => setNewPin(e.target.value)} className="settings-input" />
            <input type="password" inputMode="numeric" placeholder="Confirm New PIN" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)} className="settings-input" />
            {pinMsg && <p className={`settings-msg ${pinMsg.startsWith("Success:") ? "success" : "error"}`}>
                {pinMsg.startsWith("Success:") ? <CheckCircle size={20} style={{display:"inline", verticalAlign:"middle", marginRight: 4}}/> : <AlertTriangle size={20} style={{display:"inline", verticalAlign:"middle", marginRight: 4}}/>}
                {pinMsg.replace("Success: ", "").replace("Error: ", "")}
              </p>}
            <button type="submit" className="btn-primary">Update PIN</button>
          </form>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title"><Lock size={20} /> Biometric Login</h3>
          {!bioSupported ? (
            <p className="settings-hint">Biometric login is not available on this device.</p>
          ) : bioEnabled ? (
            <>
              <p className="settings-hint"><CheckCircle size={20} /> Enabled — Sign in with Touch ID, Face ID, or fingerprint.</p>
              {bioMsg && <p className={`settings-msg ${bioMsg.startsWith("Success:") ? "success" : "error"}`}>
                {bioMsg.startsWith("Success:") ? <CheckCircle size={20} style={{display:"inline", verticalAlign:"middle", marginRight: 4}}/> : <AlertTriangle size={20} style={{display:"inline", verticalAlign:"middle", marginRight: 4}}/>}
                {bioMsg.replace("Success: ", "").replace("Error: ", "")}
              </p>}
              <button type="button" className="btn-outline" onClick={handleDisableBio}>Disable Biometric Login</button>
            </>
          ) : (
            <>
              <p className="settings-hint">Use Touch ID, Face ID, or Fingerprint instead of typing your PIN every time.</p>
              {bioMsg && <p className={`settings-msg ${bioMsg.startsWith("Success:") ? "success" : "error"}`}>
                {bioMsg.startsWith("Success:") ? <CheckCircle size={20} style={{display:"inline", verticalAlign:"middle", marginRight: 4}}/> : <AlertTriangle size={20} style={{display:"inline", verticalAlign:"middle", marginRight: 4}}/>}
                {bioMsg.replace("Success: ", "").replace("Error: ", "")}
              </p>}
              <button type="button" className="btn-primary" onClick={handleEnableBio} disabled={bioLoading}>{bioLoading ? "Setting up…" : "Enable Biometric Login"}</button>
            </>
          )}
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title"><Timer size={20} /> Session</h3>
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
          <button type="button" className="btn-danger lock-btn" onClick={onLock} style={{ marginTop: 12 }}><LogOut size={20} /> Logout</button>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title"><Smartphone size={20} /> Install App</h3>
          {pwaPrompt ? (
            <>
              <p className="settings-hint">Install FinAura on your home screen for a native app experience.</p>
              <button type="button" className="btn-primary" onClick={handleInstallPwa}><Smartphone size={16} /> Install on Home Screen</button>
            </>
          ) : (
            <p className="settings-hint">Open your browser menu and tap "Add to Home Screen" or "Install App".</p>
          )}
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title"><LayoutDashboard size={20} /> App Statistics</h3>
          <div className="stats-grid">
            {stats.bank > 0 && <div className="stat-chip"><Building2 size={16} /> {stats.bank} Bank</div>}
            {stats.card > 0 && <div className="stat-chip"><CreditCard size={16} /> {stats.card} Card</div>}
            {stats.paylater > 0 && <div className="stat-chip"><RefreshCw size={16} /> {stats.paylater} PayLater</div>}
            {stats.fd > 0 && <div className="stat-chip"><TrendingUp size={16} /> {stats.fd} FD</div>}
            {stats.rd > 0 && <div className="stat-chip"><Calendar size={16} /> {stats.rd} RD</div>}
            {stats.mf > 0 && <div className="stat-chip"><LayoutDashboard size={16} /> {stats.mf} MF</div>}
            {stats.other > 0 && <div className="stat-chip"><ClipboardList size={16} /> {stats.other} Other</div>}
            {stats.expenses > 0 && <div className="stat-chip"><Receipt size={16} /> {stats.expenses} Expenses</div>}
            {stats.cashbacks > 0 && <div className="stat-chip"><Gift size={16} /> {stats.cashbacks} Cashbacks</div>}
            {stats.bankExpenses > 0 && <div className="stat-chip"><DollarSign size={16} /> {stats.bankExpenses} Txns</div>}
          </div>
          <p className="settings-hint" style={{ marginTop: 8 }}>Storage used: ~{approxStorageKB()}</p>
        </div>

        <div className="settings-section danger-zone">
          <h3 className="settings-section-title danger-title"><AlertTriangle size={20} /> Danger Zone</h3>
          {!showClear ? (
            <button type="button" className="btn-danger" onClick={requestClear}><Trash size={16} /> Clear All Data</button>
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
          <h3 className="settings-section-title"><MessageSquare size={20} /> Feedback & Suggestions</h3>
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
              className="settings-input"
              style={{ fontFamily: "inherit", resize: "vertical", minHeight: "80px" }}
              placeholder="Describe your feedback or suggestion in detail..."
              value={fbDesc}
              onChange={(e) => setFbDesc(e.target.value)}
              rows={4}
              maxLength={1000}
            />
            {fbMsg && <p className={`settings-msg ${fbMsg.startsWith("Success:") ? "success" : "error"}`}>
                {fbMsg.startsWith("Success:") ? <CheckCircle size={20} style={{display:"inline", verticalAlign:"middle", marginRight: 4}}/> : <AlertTriangle size={20} style={{display:"inline", verticalAlign:"middle", marginRight: 4}}/>}
                {fbMsg.replace("Success: ", "").replace("Error: ", "")}
              </p>}
            <button type="submit" className="btn-primary" disabled={fbLoading}>
              {fbLoading ? "Submitting…" : <><Send size={16} /> Submit Feedback</>}
            </button>
          </form>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title"><Info size={20} /> About FinAura</h3>
          <div className="about-block">
            <div className="about-row"><span>Version</span><strong>{APP_VERSION}</strong></div>
            <div className="about-row"><span>Storage</span><strong>100% Local (localStorage)</strong></div>
            <div className="about-row"><span>Encryption</span><strong>AES via CryptoJS</strong></div>
            <div className="about-row"><span>Network</span><strong>No data sent anywhere</strong></div>
          </div>
          <p className="settings-info-text"><Lock size={20} /> All secrets are encrypted with AES using your PIN as the key. Your data never leaves your device.</p>
        </div>

        {/* Credit */}
        <div style={{ textAlign: "center", padding: "10px 0 30px", fontSize: "0.75rem", color: "var(--text3)", opacity: 0.8, lineHeight: 1.4 }}>
          Developed by Velo Launch <br /> A Company by <a href="https://smartvistaitsolutions.in" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>Smart Vista IT Solutions</a>
        </div>
      </div>

      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="form-title">Edit Profile</h3>
              <button className="modal-close" onClick={() => setShowProfileModal(false)}><XCircle size={20} /></button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "16px 0" }}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div 
                  style={{ 
                    width: 100, height: 100, borderRadius: "50%", background: "var(--surface2)", 
                    display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed var(--border)",
                    cursor: "pointer", position: "relative", overflow: "hidden"
                  }}
                  onClick={() => profileFileRef.current?.click()}
                >
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Camera size={32} color="var(--text2)" />
                  )}
                  <input type="file" accept="image/*" ref={profileFileRef} onChange={handleProfilePhotoUpload} style={{ display: "none" }} />
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

            <div className="form-actions">
              <button className="btn-outline" onClick={() => setShowProfileModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleProfileSave} disabled={!profileName && !profilePhoto}><Save size={16} /> Save</button>
            </div>
          </div>
        </div>
      )}

      {popupMsg && (
        <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={() => setPopupMsg(null)}>
          <div className="modal-sheet" style={{ paddingBottom: 24, maxHeight: 'none', top: 'auto', bottom: 0, transform: 'none' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {popupMsg.type === "success" && <CheckCircle size={20} style={{ color: "var(--success)" }} />}
                {popupMsg.type === "error" && <AlertTriangle size={20} style={{ color: "var(--danger)" }} />}
                {popupMsg.type === "info" && <Info size={20} style={{ color: "var(--primary)" }} />}
                {popupMsg.title}
              </h3>
            </div>
            <p style={{ margin: "16px 0", color: "var(--text)" }}>{popupMsg.desc}</p>
            <button className="btn-primary" style={{ width: "100%" }} onClick={() => setPopupMsg(null)}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
  }
}
