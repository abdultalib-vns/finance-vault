import { XCircle, Archive, Upload, Download, Key, Timer, Smartphone, LayoutDashboard, CreditCard, Building2, Gift, Sun, Moon, Lock, CheckCircle, LogOut, Calendar, Trash, MessageSquare, Info, AlertTriangle, Send, DollarSign, Receipt, TrendingUp, RefreshCw, ClipboardList, Bot, Sparkles, Eye, EyeOff, User, Camera, Edit2, Save, Grid3x3, Code, Database, Cpu, RotateCcw, Bug, Terminal, Layers, Zap, QrCode, ScanLine, ShieldCheck, HelpCircle, BookOpen, Coins, Bell, Clock, Copy, Check, FileCode, Monitor } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { hashPin } from "../lib/crypto";
import { savePinHash, clearAll, saveItems, saveCurrency, saveIdleTimeout, loadItems, loadExpenses, loadCashbacks, loadBankExpenses, saveAIOptions, loadAIOptions, getVeloAIUsageCount, loadUserProfile, saveUserProfile, saveExpenses, saveCashbacks, saveBankExpenses, saveBills, loadPayAndRecordEnabled, savePayAndRecordEnabled, loadLoans, saveLoans, loadEmiPayments, saveEmiPayments, loadCurrency, loadTheme, loadIdleTimeout } from "../lib/storage";
import { customAlert } from "../components/CustomAlert";
import { encryptData, decryptData } from "../lib/crypto";
import { FinanceItem, Currency, AIOptions, UserProfile, LoanEntry, EmiPayment } from "../types";
import { OPENROUTER_MODELS, GROQ_MODELS } from "../lib/ai";
import ImageCropper from "../components/ImageCropper";
import VeloAppsModal from "../components/VeloAppsModal";
import { getDynamicCurrencies, getCurrency } from "../lib/currency";
import QuickSyncModal from "../components/QuickSyncModal";
import {
  isBiometricSupported,
  isBiometricEnrolled,
  enrollBiometric,
  disableBiometric,
  loginWithBiometric,
} from "../lib/biometric";
import { exportVault, importVault } from "../lib/importExport";
import {
  loadBackupReminderConfig,
  saveBackupReminderConfig,
  saveBackupReminderKey,
  clearBackupReminderKey,
  isBackupReminderEnabled,
  getNotificationPermissionStatus,
  requestNotificationPermission,
  BackupReminderConfig,
} from "../lib/backupReminder";
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
  onOpenHelp?: () => void;
}

export default function Settings({
  masterKey, currency, onCurrencyChange,
  onLock, onMasterKeyChange, items, onItemsChange,
  idleMinutes, onIdleMinutesChange,
  theme, onThemeChange,
  onReload,
  onOpenHelp,
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
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const profileFileRef = useRef<HTMLInputElement>(null);
  const [showVeloApps, setShowVeloApps] = useState(false);

  // Developer Mode
  const [devTapCount, setDevTapCount] = useState(0);
  const devTapTimer = useRef<number | null>(null);
  const [showDevCodePrompt, setShowDevCodePrompt] = useState(false);
  const [devCode, setDevCode] = useState("");
  const [devCodeError, setDevCodeError] = useState("");
  const [showDevMode, setShowDevMode] = useState(false);
  const [devLog, setDevLog] = useState<string[]>([]);
  const [showStorageInspector, setShowStorageInspector] = useState(false);

  // Quick Sync
  const [syncMode, setSyncMode] = useState<"generate" | "scan" | null>(null);
  const [showSyncInfo, setShowSyncInfo] = useState(false);

  // Pay & Record toggle
  const [payRecordEnabled, setPayRecordEnabled] = useState(() => loadPayAndRecordEnabled());

  // Daily Backup Reminder State
  const [reminderConfig, setReminderConfig] = useState<BackupReminderConfig>(() => loadBackupReminderConfig());
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(() => getNotificationPermissionStatus());

  async function handleToggleReminder(enabled: boolean) {
    if (enabled) {
      if (masterKey) {
        saveBackupReminderKey(masterKey);
      }
      let perm = notifPermission;
      if (perm !== "granted") {
        perm = await requestNotificationPermission();
        setNotifPermission(perm);
      }
      const updated = { ...reminderConfig, enabled: true };
      setReminderConfig(updated);
      saveBackupReminderConfig(updated);
    } else {
      clearBackupReminderKey();
      const updated = { ...reminderConfig, enabled: false };
      setReminderConfig(updated);
      saveBackupReminderConfig(updated);
    }
  }

  function handleReminderTimeChange(newTime: string) {
    const updated = { ...reminderConfig, time: newTime, lastNotifiedDate: undefined };
    setReminderConfig(updated);
    saveBackupReminderConfig(updated);
  }

  async function handleRequestPermission() {
    const perm = await requestNotificationPermission();
    setNotifPermission(perm);
    // permission granted — no additional action needed
  }


  function formatTime12Hour(time24: string): string {
    if (!time24) return "9:00 PM";
    const [hStr, mStr] = time24.split(":");
    let h = parseInt(hStr, 10);
    const m = mStr || "00";
    if (isNaN(h)) return time24;
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  }

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
    if (isBackupReminderEnabled()) {
      saveBackupReminderKey(newPin);
    }
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
      setCropImageSrc(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
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
    clearBackupReminderKey();
    saveBackupReminderConfig({ enabled: false, time: "21:00" });
    onItemsChange([]);
    onLock();
  }

  // ── Developer Mode ──────────────────────────────────────────
  function handleDevTap() {
    if (devTapTimer.current) clearTimeout(devTapTimer.current);
    const next = devTapCount + 1;
    setDevTapCount(next);
    if (next >= 5) {
      setDevTapCount(0);
      setDevCode("");
      setDevCodeError("");
      setShowDevCodePrompt(true);
      return;
    }
    devTapTimer.current = window.setTimeout(() => setDevTapCount(0), 2000);
  }

  function handleDevCodeSubmit() {
    if (devCode === "0904") {
      setShowDevCodePrompt(false);
      setShowDevMode(true);
      setDevLog([]);
    } else {
      setDevCodeError("Invalid code.");
    }
  }

  function devAddLog(msg: string) {
    setDevLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 49)]);
  }

  function devLoadDummyData() {
    const dummyItems: FinanceItem[] = [
      { id: "dev-bank-1", name: "Chase Checking", balance: 12500, type: "bank", encryptedSecret: "", lastFour: "4521", createdAt: Date.now() },
      { id: "dev-bank-2", name: "HDFC Savings", balance: 85000, type: "bank", encryptedSecret: "", lastFour: "7892", createdAt: Date.now() },
      { id: "dev-bank-3", name: "SBI Current Account", balance: 32000, type: "bank", encryptedSecret: "", lastFour: "6140", createdAt: Date.now() },
      { id: "dev-card-1", name: "Amex Platinum", balance: 0, type: "card", encryptedSecret: "", lastFour: "1008", creditLimit: 150000, createdAt: Date.now() },
      { id: "dev-card-2", name: "ICICI Amazon Pay", balance: 0, type: "card", encryptedSecret: "", lastFour: "3345", creditLimit: 50000, createdAt: Date.now() },
      { id: "dev-card-3", name: "HDFC Regalia", balance: 0, type: "card", encryptedSecret: "", lastFour: "9021", creditLimit: 200000, createdAt: Date.now() },
      { id: "dev-fd-1", name: "SBI Fixed Deposit", balance: 100000, type: "fd", encryptedSecret: "", interestRate: 7.1, startDate: "2025-01-15", maturityDate: "2026-01-15", createdAt: Date.now() },
      { id: "dev-fd-2", name: "ICICI FD - Tax Saver", balance: 150000, type: "fd", encryptedSecret: "", interestRate: 6.9, startDate: "2025-04-01", maturityDate: "2030-04-01", createdAt: Date.now() },
      { id: "dev-rd-1", name: "HDFC Monthly RD", balance: 24000, type: "rd", encryptedSecret: "", interestRate: 6.5, startDate: "2025-06-01", maturityDate: "2026-06-01", monthlyAmount: 2000, createdAt: Date.now() },
      { id: "dev-paylater-1", name: "Simpl Pay Later", balance: 0, type: "paylater", encryptedSecret: "", creditLimit: 15000, createdAt: Date.now() },
    ];
    const existing = loadItems();
    const merged = [...existing, ...dummyItems];
    saveItems(merged);
    onItemsChange(merged);
    devAddLog(`Loaded ${dummyItems.length} dummy accounts (${dummyItems.map(i=>i.name).join(", ")}).`);
  }

  function devLoadDummyExpenses() {
    const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString().split("T")[0];
    const cards = items.filter(i => i.type === "card" || i.type === "paylater");
    const c1 = cards.length > 0 ? cards[0].id : "dev-card-1";
    const c2 = cards.length > 1 ? cards[1].id : c1;
    const c3 = cards.length > 2 ? cards[2].id : c1;
    const t = Date.now();
    const dummyExpenses = [
      { id: `dev-exp-${t}-1`,  cardId: c1, description: "Starbucks",          amount: 450,   date: d(0), status: "unpaid" as const, cashback: 22,  createdAt: t },
      { id: `dev-exp-${t}-2`,  cardId: c1, description: "Amazon Prime",       amount: 1499,  date: d(0), status: "unpaid" as const, cashback: 75,  createdAt: t },
      { id: `dev-exp-${t}-3`,  cardId: c2, description: "Uber Ride",          amount: 320,   date: d(1), status: "unpaid" as const, cashback: 0,   createdAt: t },
      { id: `dev-exp-${t}-4`,  cardId: c1, description: "Swiggy Order",       amount: 580,   date: d(1), status: "paid"   as const, cashback: 29,  createdAt: t },
      { id: `dev-exp-${t}-5`,  cardId: c2, description: "Netflix",            amount: 649,   date: d(0), status: "unpaid" as const, cashback: 0,   createdAt: t },
      { id: `dev-exp-${t}-6`,  cardId: c3, description: "Reliance Fresh",     amount: 2340,  date: d(2), status: "unpaid" as const, cashback: 117, createdAt: t },
      { id: `dev-exp-${t}-7`,  cardId: c1, description: "Zara Clothing",      amount: 4999,  date: d(3), status: "unpaid" as const, cashback: 250, createdAt: t },
      { id: `dev-exp-${t}-8`,  cardId: c2, description: "Electricity Bill",   amount: 1850,  date: d(4), status: "paid"   as const, cashback: 0,   createdAt: t },
      { id: `dev-exp-${t}-9`,  cardId: c3, description: "Flipkart Electronics", amount: 7999, date: d(5), status: "unpaid" as const, cashback: 400, createdAt: t },
      { id: `dev-exp-${t}-10`, cardId: c1, description: "Dominos Pizza",      amount: 890,   date: d(2), status: "unpaid" as const, cashback: 45,  createdAt: t },
      { id: `dev-exp-${t}-11`, cardId: c2, description: "Spotify Premium",    amount: 119,   date: d(0), status: "unpaid" as const, cashback: 0,   createdAt: t },
      { id: `dev-exp-${t}-12`, cardId: c3, description: "Petrol - HP",        amount: 3500,  date: d(6), status: "paid"   as const, cashback: 175, createdAt: t },
      { id: `dev-exp-${t}-13`, cardId: c1, description: "Myntra Fashion",     amount: 2199,  date: d(7), status: "unpaid" as const, cashback: 110, createdAt: t },
      { id: `dev-exp-${t}-14`, cardId: c2, description: "Gym Membership",     amount: 1500,  date: d(3), status: "unpaid" as const, cashback: 0,   createdAt: t },
      { id: `dev-exp-${t}-15`, cardId: c3, description: "BigBasket Groceries", amount: 1780, date: d(1), status: "unpaid" as const, cashback: 89,  createdAt: t },
    ];
    const existing = loadExpenses();
    saveExpenses([...dummyExpenses, ...existing]);
    devAddLog(`Loaded ${dummyExpenses.length} dummy card expenses across ${new Set([c1,c2,c3]).size} cards.`);
  }

  function devLoadDummyLoans() {
    const t = Date.now();
    const l1: LoanEntry = {
      id: `dev-loan-${t}-1`,
      type: "loan",
      name: "HDFC Home Loan",
      lender: "HDFC Bank",
      principalAmount: 2500000,
      tenureMonths: 120,
      interestRate: 8.5,
      monthlyEmi: 30997,
      taxes: [{ name: "CGST", percentage: 9 }, { name: "SGST", percentage: 9 }],
      totalPayable: 3719640,
      startDate: "2025-01",
      notes: "Fixed interest for first 3 years",
      createdAt: t
    };
    const l2: LoanEntry = {
      id: `dev-loan-${t}-2`,
      type: "credit_card",
      name: "iPhone 16 Pro Max EMI",
      lender: "HDFC Millennia",
      principalAmount: 144900,
      tenureMonths: 12,
      interestRate: 0,
      monthlyEmi: 12075,
      taxes: [],
      totalPayable: 144900,
      startDate: "2026-01",
      notes: "Purchased on Amazon Great Indian Festival",
      createdAt: t
    };

    const existingLoans = loadLoans();
    saveLoans([...existingLoans, l1, l2]);

    const emi1: EmiPayment[] = [
      { id: `dev-emi-${t}-1`, loanId: l1.id, monthIndex: 1, monthLabel: "Jan 2025", amount: 30997, paid: true, paidDate: "2025-01-05" },
      { id: `dev-emi-${t}-2`, loanId: l1.id, monthIndex: 2, monthLabel: "Feb 2025", amount: 30997, paid: true, paidDate: "2025-02-05" },
      { id: `dev-emi-${t}-3`, loanId: l1.id, monthIndex: 3, monthLabel: "Mar 2025", amount: 30997, paid: false },
    ];
    const emi2: EmiPayment[] = [
      { id: `dev-emi-${t}-4`, loanId: l2.id, monthIndex: 1, monthLabel: "Jan 2026", amount: 12075, paid: true, paidDate: "2026-01-10" },
      { id: `dev-emi-${t}-5`, loanId: l2.id, monthIndex: 2, monthLabel: "Feb 2026", amount: 12075, paid: true, paidDate: "2026-02-10" },
      { id: `dev-emi-${t}-6`, loanId: l2.id, monthIndex: 3, monthLabel: "Mar 2026", amount: 12075, paid: false },
    ];
    saveEmiPayments([...loadEmiPayments(), ...emi1, ...emi2]);
    devAddLog("Loaded 2 dummy loans (Home Loan & iPhone EMI) with EMI payments.");
  }

  function devLoadDummyCashbacks() {
    const t = Date.now();
    const dummyCashbacks = [
      { id: `dev-cb-${t}-1`, source: "HDFC Millennia (Amazon 5%)", amount: 750, date: new Date().toISOString().split("T")[0], createdAt: t },
      { id: `dev-cb-${t}-2`, source: "SBI Cashback (Online 5%)", amount: 1250, date: new Date(Date.now() - 3*86400000).toISOString().split("T")[0], createdAt: t },
      { id: `dev-cb-${t}-3`, source: "Axis Airtel (Utility 10%)", amount: 300, date: new Date(Date.now() - 7*86400000).toISOString().split("T")[0], createdAt: t },
      { id: `dev-cb-${t}-4`, source: "ICICI Amazon Pay", amount: 480, date: new Date(Date.now() - 12*86400000).toISOString().split("T")[0], createdAt: t },
      { id: `dev-cb-${t}-5`, source: "Swiggy HDFC (Food 10%)", amount: 260, date: new Date(Date.now() - 15*86400000).toISOString().split("T")[0], createdAt: t }
    ];
    saveCashbacks([...dummyCashbacks, ...loadCashbacks()]);
    devAddLog("Loaded 5 dummy cashback records across popular cards.");
  }

  function devClearSessionStorage() {
    sessionStorage.clear();
    devAddLog("Session storage cleared.");
  }

  function devForceReload() {
    devAddLog("Forcing full reload...");
    window.location.reload();
  }

  async function devPurgeCachesAndSW() {
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(r => r.unregister()));
      }
      devAddLog("Purged all CacheStorage and unregistered Service Workers.");
      customAlert("Cache cleared and service workers unregistered.", "Cache Cleared", "success");
    } catch (e: any) {
      devAddLog("Failed to purge caches: " + e.message);
    }
  }

  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonImportText, setJsonImportText] = useState("");
  const [jsonCopied, setJsonCopied] = useState(false);

  function devExportRawJson(): string {
    const rawData = {
      exportedAt: new Date().toISOString(),
      items: loadItems(),
      expenses: loadExpenses(),
      cashbacks: loadCashbacks(),
      bankExpenses: loadBankExpenses(),
      loans: loadLoans(),
      emiPayments: loadEmiPayments(),
      aiOptions: loadAIOptions(),
      userProfile: loadUserProfile(),
      settings: {
        currency: loadCurrency(),
        theme: loadTheme(),
        idleTimeout: loadIdleTimeout(),
        payAndRecordEnabled: loadPayAndRecordEnabled(),
      }
    };
    return JSON.stringify(rawData, null, 2);
  }

  function devCopyRawJson() {
    const json = devExportRawJson();
    navigator.clipboard.writeText(json);
    setJsonCopied(true);
    setTimeout(() => setJsonCopied(false), 2000);
    devAddLog("Copied full unencrypted vault JSON to clipboard.");
  }

  function devDownloadRawJson() {
    const json = devExportRawJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finaura_vault_debug_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    devAddLog("Downloaded raw vault JSON dump file.");
  }

  function devImportRawJson(text: string) {
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data.items)) { saveItems(data.items); onItemsChange(data.items); }
      if (Array.isArray(data.expenses)) saveExpenses(data.expenses);
      if (Array.isArray(data.cashbacks)) saveCashbacks(data.cashbacks);
      if (Array.isArray(data.bankExpenses)) saveBankExpenses(data.bankExpenses);
      if (Array.isArray(data.loans)) saveLoans(data.loans);
      if (Array.isArray(data.emiPayments)) saveEmiPayments(data.emiPayments);
      if (data.userProfile) saveUserProfile(data.userProfile);
      if (data.aiOptions) saveAIOptions(data.aiOptions);
      devAddLog("Successfully imported and restored raw vault JSON.");
      customAlert("Raw JSON data has been restored to your vault.", "Import Successful", "success");
      setShowJsonModal(false);
      setJsonImportText("");
    } catch (e: any) {
      customAlert("Invalid JSON format: " + e.message, "Import Error", "error");
    }
  }

  function getStorageUsage(): string {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) total += (localStorage.getItem(key) || "").length;
    }
    const kb = (total * 2 / 1024).toFixed(1);
    const mb = (total * 2 / 1024 / 1024).toFixed(2);
    return `${kb} KB (${mb} MB)`;
  }

  function getStorageKeys(): { key: string, size: string }[] {
    const keys: { key: string, size: string }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key) || "";
        keys.push({ key, size: `${((val.length * 2) / 1024).toFixed(1)} KB` });
      }
    }
    return keys.sort((a, b) => parseFloat(b.size) - parseFloat(a.size));
  }

  function devPurgeDummyData() {
    const updatedItems = items.filter(i => !i.id.startsWith("dev-"));
    saveItems(updatedItems);
    onItemsChange(updatedItems);
    const updatedExpenses = loadExpenses().filter((e: any) => !e.id.startsWith("dev-"));
    saveExpenses(updatedExpenses);
    const updatedLoans = loadLoans().filter((l: any) => !l.id.startsWith("dev-"));
    saveLoans(updatedLoans);
    const updatedEmis = loadEmiPayments().filter((p: any) => !p.id.startsWith("dev-"));
    saveEmiPayments(updatedEmis);
    const updatedCashbacks = loadCashbacks().filter((c: any) => !c.id.startsWith("dev-"));
    saveCashbacks(updatedCashbacks);
    devAddLog("Purged all dummy data (dev-* prefixed entries).");
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
        <div style={{ display: "flex", alignItems: "center" }}>
          <button onClick={() => setShowVeloApps(true)} style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", display: "flex", alignItems: "center", marginRight: 12 }}><Grid3x3 size={24} /></button>
          <a href="https://finaura-landingpage.vercel.app" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', height: '32px', marginRight: 8, background: 'linear-gradient(135deg, #F59E0B, #DC2626)', boxShadow: '0 2px 10px rgba(220, 38, 38, 0.25)', borderRadius: '8px', padding: '0 12px', textDecoration: 'none', opacity: 0.95, transition: 'all 0.2s ease' }} onMouseOver={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseOut={e => { e.currentTarget.style.opacity = "0.95"; e.currentTarget.style.transform = "translateY(0)"; }}>
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700, letterSpacing: '0.4px', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>👑 UPGRADE</span>
          </a>
          <a href="https://velolaunch-aistudio.vercel.app" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', height: '32px' }}>
            <img src={veloLaunchLogo} alt="VeloLaunch" style={{ display: 'block', height: "100%", width: 'auto', objectFit: "contain", opacity: 0.9, transition: "opacity 0.2s ease" }} onMouseOver={e => e.currentTarget.style.opacity = "1"} onMouseOut={e => e.currentTarget.style.opacity = "0.9"} />
          </a>
        </div>
      </header>
      {showVeloApps && <VeloAppsModal onClose={() => setShowVeloApps(false)} />}
      <div className="content">
        {/* ── Mobile Profile Section (hidden on desktop ≥1024px) ── */}
        <div className="mobile-only-profile settings-section" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: "var(--surface)", borderRadius: "12px", marginBottom: "20px" }}>
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

        <div className="desktop-settings-grid">
          {/* ── Left Column: Profile Card & Vault Status (desktop only) ── */}
          <div className="settings-left-col">
            <div className="desktop-profile-card">
              <div className="desktop-avatar-wrap">
                {profile?.photo ? (
                  <img src={profile.photo} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <User size={36} color="var(--text2)" />
                )}
              </div>
              <h3 className="desktop-profile-name">{profile?.name || "No Name Set"}</h3>
              {profile?.email && <p className="desktop-profile-email">{profile.email}</p>}
              <div className="desktop-profile-badge">
                <ShieldCheck size={14} /> Vault Member
              </div>

              <div className="desktop-profile-stats">
                <div className="desktop-stat-block">
                  <span className="desktop-stat-lbl">Accounts</span>
                  <span className="desktop-stat-val">{items.length} Active</span>
                </div>
                <div className="desktop-stat-block">
                  <span className="desktop-stat-lbl">Encryption</span>
                  <span className="desktop-stat-val">AES-256</span>
                </div>
              </div>

              <button className="btn-secondary" style={{ width: "100%", gap: 8, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={handleProfileEditOpen}>
                <Edit2 size={16} /> Edit Profile
              </button>
            </div>

            <div className="settings-section desktop-security-badge-card">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <ShieldCheck size={18} color="var(--primary)" />
                <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: "var(--text)" }}>Zero-Knowledge Vault</h4>
              </div>
              <p className="settings-hint" style={{ margin: 0, fontSize: "0.8rem", lineHeight: 1.45 }}>
                Your financial data, secrets, and credentials remain encrypted client-side on your device.
              </p>
            </div>
          </div>

          {/* ── Right Column: All Settings Sections ── */}
          <div className="settings-right-col">
            <div className="settings-section">
              <h3 className="settings-section-title">Appearance</h3>
              <p className="settings-label">Theme</p>
              <div className="theme-toggle">
                <button type="button" className={`theme-btn ${theme === "light" ? "active" : ""}`} onClick={() => onThemeChange("light")}><Sun size={16} /> Light</button>
                <button type="button" className={`theme-btn ${theme === "dark" ? "active" : ""}`} onClick={() => onThemeChange("dark")}><Moon size={16} /> Dark</button>
              </div>
            </div>

            <div className="settings-section">
              <h3 className="settings-section-title"><Coins size={20} /> Pay & Auto-Record</h3>
              <p className="settings-hint">Enable or disable the Pay & Auto-Record feature. When enabled, a Pay button appears on Dashboard and Cards for quick UPI payments with automatic transaction recording.</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, padding: "12px 16px", background: "var(--surface2)", borderRadius: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Coins size={18} color={payRecordEnabled ? "var(--primary)" : "var(--text3)"} />
                  <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--text)" }}>{payRecordEnabled ? "Enabled" : "Disabled"}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !payRecordEnabled;
                    setPayRecordEnabled(next);
                    savePayAndRecordEnabled(next);
                  }}
                  style={{
                    position: "relative",
                    width: 48,
                    height: 26,
                    borderRadius: 13,
                    border: "none",
                    cursor: "pointer",
                    background: payRecordEnabled ? "var(--primary)" : "var(--surface3, #555)",
                    transition: "background 0.25s ease",
                    padding: 0,
                  }}
                  aria-label="Toggle Pay & Record"
                >
                  <span style={{
                    position: "absolute",
                    top: 3,
                    left: payRecordEnabled ? 24 : 3,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "#fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    transition: "left 0.25s ease",
                  }} />
                </button>
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
                  <input type="text" inputMode="numeric" className="settings-input" value={aiPin} onChange={(e) => setAiPin(e.target.value)} placeholder="PIN" autoComplete="off" data-lpignore="true" data-1p-ignore style={{ WebkitTextSecurity: 'disc' } as any} />
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
                  <input type="text" inputMode="numeric" className="settings-input" placeholder="Enter PIN" value={ioPin} onChange={(e) => setIoPin(e.target.value)} autoFocus autoComplete="off" data-lpignore="true" data-1p-ignore style={{ WebkitTextSecurity: 'disc' } as any} />
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
                  <input type="text" inputMode="numeric" className="settings-input" placeholder="Enter PIN" value={ioPin} onChange={(e) => setIoPin(e.target.value)} autoFocus autoComplete="off" data-lpignore="true" data-1p-ignore style={{ WebkitTextSecurity: 'disc' } as any} />
                  <div className="io-actions">
                    <button type="button" className="btn-primary" onClick={handleImport} disabled={ioLoading || !ioPin}>{ioLoading ? "Importing…" : "Import"}</button>
                    <button type="button" className="btn-secondary" onClick={() => { setShowImportPin(false); setPendingFile(null); setIoPin(""); }}>Cancel</button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Daily Backup Reminder ── */}
          <div className="backup-reminder-card" style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Bell size={18} style={{ color: "var(--primary)" }} />
                <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "var(--text)" }}>Daily Backup Reminder</h4>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={reminderConfig.enabled}
                  onChange={(e) => handleToggleReminder(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <p className="settings-hint" style={{ marginTop: 6, marginBottom: reminderConfig.enabled ? 12 : 0 }}>
              Remind to back up your vault once a day. Whenever you open FinAura for the first time in a day, an instant "Create a backup now" prompt appears so you can immediately secure and export your data without entering your PIN or Biometrics.
            </p>

            {reminderConfig.enabled && (
              <div className="backup-reminder-body" style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 14 }}>
                {notifPermission !== "granted" && (
                  <div className="notif-permission-box" style={{ background: "rgba(234, 179, 8, 0.12)", border: "1px solid rgba(234, 179, 8, 0.3)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontSize: "0.82rem", color: "var(--text)" }}>
                      <AlertTriangle size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: 6, color: "#eab308" }} />
                      Enable notification permission to also receive alerts in your device notification panel.
                    </div>
                    <button type="button" className="btn-primary" style={{ padding: "5px 12px", fontSize: "0.78rem", whiteSpace: "nowrap" }} onClick={handleRequestPermission}>
                      Allow
                    </button>
                  </div>
                )}


                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", fontSize: "0.78rem", color: "var(--text3)", lineHeight: 1.5 }}>
                  🛡️ <strong>One-Tap Daily Backup:</strong> When you open the app each day, FinAura presents a "Create a backup now" bottom sheet. Tapping "Yes" instantly exports an encrypted backup file to your device without requiring PIN or Biometric re-authentication.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Velo's Quick Sync ────────────────────── */}
        <div className="settings-section">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 className="settings-section-title" style={{ margin: 0 }}><RefreshCw size={20} /> Velo's Quick Sync</h3>
            <button
              onClick={() => setShowSyncInfo(true)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--text3)" }}
              title="How does Quick Sync work?"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </button>
          </div>
          <p className="settings-hint" style={{ marginTop: 8 }}>Sync your vault between devices using a QR code or 8-digit code.</p>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button className="btn-primary" style={{ flex: 1, gap: 8 }} onClick={() => setSyncMode("generate")}>
              <QrCode size={16} /> Generate QR Code
            </button>
            <button className="btn-outline" style={{ flex: 1, gap: 8 }} onClick={() => setSyncMode("scan")}>
              <ScanLine size={16} /> Scan QR Code
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title"><Key size={20} /> Security</h3>
          <form className="settings-form" onSubmit={handleChangePin}>
            <p className="settings-label">Change Master PIN</p>
            <input type="text" inputMode="numeric" placeholder="New PIN (min 4 digits)" value={newPin} onChange={(e) => setNewPin(e.target.value)} className="settings-input" autoComplete="off" data-lpignore="true" data-1p-ignore style={{ WebkitTextSecurity: 'disc' } as any} />
            <input type="text" inputMode="numeric" placeholder="Confirm New PIN" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)} className="settings-input" autoComplete="off" data-lpignore="true" data-1p-ignore style={{ WebkitTextSecurity: 'disc' } as any} />
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
              <input type="text" inputMode="numeric" className="settings-input" value={clearPin} onChange={(e) => setClearPin(e.target.value)} placeholder="Enter PIN" autoComplete="off" data-lpignore="true" data-1p-ignore style={{ WebkitTextSecurity: 'disc' } as any} />
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

        {onOpenHelp && (
          <div className="settings-section">
            <h3 className="settings-section-title"><BookOpen size={20} /> Help &amp; User Guide</h3>
            <p className="settings-hint">Explore comprehensive step-by-step guides, zero-knowledge security architecture, AI scanning tutorials, and frequently asked questions.</p>
            <button 
              type="button" 
              className="btn-primary" 
              style={{ width: "100%", marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              onClick={onOpenHelp}
            >
              <HelpCircle size={18} /> Open Help &amp; Documentation
            </button>
          </div>
        )}

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
        <div 
          style={{ textAlign: "center", padding: "10px 0 30px", fontSize: "0.75rem", color: "var(--text3)", opacity: 0.8, lineHeight: 1.4, cursor: "default", userSelect: "none" }}
        >
          Developed by <a href="https://velolaunch-aistudio.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }} onClick={(e) => e.stopPropagation()}>VeloLaunch</a> <br /> A <span onClick={handleDevTap} style={{ cursor: "pointer", userSelect: "none", fontWeight: 600 }}>Company</span> by <a href="https://smartvistaitsolutions.in" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }} onClick={(e) => e.stopPropagation()}>Smart Vista IT Solutions</a>
        </div>
      </div>
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

      {cropImageSrc && (
        <ImageCropper
          imageSrc={cropImageSrc}
          onCropComplete={(croppedBase64) => {
            setProfilePhoto(croppedBase64);
            setCropImageSrc(null);
          }}
          onCancel={() => setCropImageSrc(null)}
        />
      )}

      {/* Quick Sync Modal */}
      {syncMode && (
        <QuickSyncModal
          mode={syncMode}
          onClose={() => setSyncMode(null)}
          onSyncComplete={onReload}
        />
      )}

      {/* Quick Sync Info Popup */}
      {showSyncInfo && (
        <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={() => setShowSyncInfo(false)}>
          <div className="modal-sheet" style={{ maxHeight: 'none', top: 'auto', bottom: 0, transform: 'none' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RefreshCw size={20} style={{ color: 'var(--primary)' }} /> How Quick Sync Works
              </h3>
              <button className="modal-close" onClick={() => setShowSyncInfo(false)}><XCircle size={20} /></button>
            </div>
            <div style={{ padding: '12px 0 24px', fontSize: '0.88rem', color: 'var(--text2)', lineHeight: 1.7 }}>
              <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Sync your FinAura data between any two devices — laptop, phone, or tablet.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>1</div>
                  <div><strong>Receive</strong> — On the receiving device (e.g., laptop), tap "Generate QR Code" to show a secure QR and 8-digit code.</div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>2</div>
                  <div><strong>Send</strong> — On the sending device (e.g., phone), tap "Scan QR Code", scan it, and enter your PIN to securely encrypt and upload your data.</div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>3</div>
                  <div><strong>Confirm</strong> — Back on the receiving device, enter the sender's PIN to decrypt and import the data.</div>
                </div>
              </div>

              <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 10, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', fontSize: '0.82rem' }}>
                <strong style={{ color: '#22c55e' }}>🔒 Secure by Design</strong>
                <p style={{ margin: '4px 0 0', color: 'var(--text2)' }}>Your data is AES-encrypted on your device before transfer. The server only sees encrypted data it cannot read. Codes expire after 10 minutes and are single-use.</p>
              </div>
            </div>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => setShowSyncInfo(false)}>Got it</button>
          </div>
        </div>
      )}

      {/* Developer Code Prompt */}
      {showDevCodePrompt && (
        <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={() => setShowDevCodePrompt(false)}>
          <div className="modal-sheet" style={{ maxHeight: 'none', top: 'auto', bottom: 0, transform: 'none' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Lock size={20} /> Enter Developer Code</h3>
              <button className="modal-close" onClick={() => setShowDevCodePrompt(false)}><XCircle size={20} /></button>
            </div>
            <div style={{ padding: "16px 0" }}>
              <input
                type="text"
                className="settings-input"
                placeholder="Enter 4-digit code"
                value={devCode}
                onChange={(e) => { setDevCode(e.target.value); setDevCodeError(""); }}
                maxLength={4}
                inputMode="numeric"
                autoFocus
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore
                onKeyDown={(e) => e.key === "Enter" && handleDevCodeSubmit()}
                style={{ textAlign: "center", letterSpacing: "8px", fontSize: "1.5rem", fontWeight: 700, WebkitTextSecurity: 'disc' } as any}
              />
              {devCodeError && <p style={{ color: "var(--danger)", fontSize: "0.85rem", marginTop: 8, textAlign: "center" }}>{devCodeError}</p>}
            </div>
            <button className="btn-primary" style={{ width: "100%" }} onClick={handleDevCodeSubmit}>Unlock</button>
          </div>
        </div>
      )}

      {/* Developer Mode Bottom Sheet */}
      {showDevMode && (
        <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={() => setShowDevMode(false)}>
          <div className="modal-sheet" style={{ maxHeight: '85vh', top: 'auto', bottom: 0, transform: 'none', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--surface)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Code size={20} style={{ color: 'var(--primary)' }} /> Developer Mode
              </h3>
              <button className="modal-close" onClick={() => setShowDevMode(false)}><XCircle size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '24px' }}>
              {/* Storage Info */}
              <div className="settings-section" style={{ margin: 0, padding: '12px 16px', background: 'var(--surface2)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Database size={16} style={{ color: 'var(--primary)' }} />
                  <strong style={{ fontSize: '0.9rem' }}>Storage</strong>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem', color: 'var(--text2)' }}>
                  <span>Usage</span><strong style={{ textAlign: 'right' }}>{getStorageUsage()}</strong>
                  <span>Keys</span><strong style={{ textAlign: 'right' }}>{localStorage.length}</strong>
                  <span>Items</span><strong style={{ textAlign: 'right' }}>{items.length}</strong>
                  <span>Expenses</span><strong style={{ textAlign: 'right' }}>{loadExpenses().length}</strong>
                  <span>Cashbacks</span><strong style={{ textAlign: 'right' }}>{loadCashbacks().length}</strong>
                  <span>Bank Txns</span><strong style={{ textAlign: 'right' }}>{loadBankExpenses().length}</strong>
                </div>
                <button
                  className="btn-outline" style={{ width: '100%', marginTop: 12, fontSize: '0.8rem', padding: '8px' }}
                  onClick={() => setShowStorageInspector(!showStorageInspector)}
                >
                  <Layers size={14} /> {showStorageInspector ? 'Hide' : 'Show'} Storage Inspector
                </button>
                {showStorageInspector && (
                  <div style={{ marginTop: 8, maxHeight: '150px', overflowY: 'auto', fontSize: '0.75rem', fontFamily: 'monospace', background: 'var(--bg)', borderRadius: 8, padding: 8 }}>
                    {getStorageKeys().map(({ key, size }) => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--primary)' }}>{key}</span>
                        <span style={{ color: 'var(--text3)' }}>{size}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Raw JSON Database Tools */}
              <div className="settings-section" style={{ margin: 0, padding: '12px 16px', background: 'var(--surface2)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <FileCode size={16} style={{ color: 'var(--primary)' }} />
                  <strong style={{ fontSize: '0.9rem' }}>Raw Vault JSON</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button className="btn-outline" style={{ fontSize: '0.85rem', padding: '10px 14px', justifyContent: 'flex-start' }} onClick={devCopyRawJson}>
                    {jsonCopied ? <Check size={16} style={{ color: 'var(--success)' }} /> : <Copy size={16} />}
                    {jsonCopied ? "Copied JSON to Clipboard!" : "Copy Raw Vault JSON"}
                  </button>
                  <button className="btn-outline" style={{ fontSize: '0.85rem', padding: '10px 14px', justifyContent: 'flex-start' }} onClick={devDownloadRawJson}>
                    <Download size={16} /> Download Raw JSON Dump
                  </button>
                  <button className="btn-outline" style={{ fontSize: '0.85rem', padding: '10px 14px', justifyContent: 'flex-start' }} onClick={() => setShowJsonModal(true)}>
                    <Upload size={16} /> Import / Restore Raw JSON
                  </button>
                </div>
              </div>

              {/* Data Seeding */}
              <div className="settings-section" style={{ margin: 0, padding: '12px 16px', background: 'var(--surface2)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Zap size={16} style={{ color: '#f59e0b' }} />
                  <strong style={{ fontSize: '0.9rem' }}>Data Seeding</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button className="btn-outline" style={{ fontSize: '0.85rem', padding: '10px 14px', justifyContent: 'flex-start' }} onClick={devLoadDummyData}>
                    <Database size={16} /> Load Dummy Accounts (10)
                  </button>
                  <button className="btn-outline" style={{ fontSize: '0.85rem', padding: '10px 14px', justifyContent: 'flex-start' }} onClick={devLoadDummyExpenses}>
                    <Receipt size={16} /> Load Dummy Card Expenses (15)
                  </button>
                  <button className="btn-outline" style={{ fontSize: '0.85rem', padding: '10px 14px', justifyContent: 'flex-start' }} onClick={devLoadDummyLoans}>
                    <Coins size={16} /> Load Dummy Loans &amp; EMIs (2)
                  </button>
                  <button className="btn-outline" style={{ fontSize: '0.85rem', padding: '10px 14px', justifyContent: 'flex-start' }} onClick={devLoadDummyCashbacks}>
                    <Gift size={16} /> Load Dummy Cashbacks (5)
                  </button>
                  <button className="btn-outline" style={{ fontSize: '0.85rem', padding: '10px 14px', justifyContent: 'flex-start', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={devPurgeDummyData}>
                    <Trash size={16} /> Purge All Dummy Data
                  </button>
                </div>
              </div>

              {/* Debug Actions */}
              <div className="settings-section" style={{ margin: 0, padding: '12px 16px', background: 'var(--surface2)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Bug size={16} style={{ color: '#ef4444' }} />
                  <strong style={{ fontSize: '0.9rem' }}>Debug Actions</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button className="btn-outline" style={{ fontSize: '0.85rem', padding: '10px 14px', justifyContent: 'flex-start' }} onClick={devClearSessionStorage}>
                    <RotateCcw size={16} /> Clear Session Storage
                  </button>
                  <button className="btn-outline" style={{ fontSize: '0.85rem', padding: '10px 14px', justifyContent: 'flex-start' }} onClick={devPurgeCachesAndSW}>
                    <RefreshCw size={16} /> Purge Cache &amp; Unregister SW
                  </button>
                  <button className="btn-outline" style={{ fontSize: '0.85rem', padding: '10px 14px', justifyContent: 'flex-start' }} onClick={devForceReload}>
                    <RefreshCw size={16} /> Force App Reload
                  </button>
                  <button className="btn-outline" style={{ fontSize: '0.85rem', padding: '10px 14px', justifyContent: 'flex-start' }} onClick={() => { console.log("[DEV] Items:", items); console.log("[DEV] Expenses:", loadExpenses()); console.log("[DEV] Cashbacks:", loadCashbacks()); console.log("[DEV] Loans:", loadLoans()); devAddLog("Dumped all data to browser console."); }}>
                    <Terminal size={16} /> Dump Data to Console
                  </button>
                </div>
              </div>

              {/* Environment & Diagnostics */}
              <div className="settings-section" style={{ margin: 0, padding: '12px 16px', background: 'var(--surface2)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Cpu size={16} style={{ color: 'var(--primary)' }} />
                  <strong style={{ fontSize: '0.9rem' }}>Environment &amp; Diagnostics</strong>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.78rem', color: 'var(--text2)' }}>
                  <span>Version</span><strong style={{ textAlign: 'right' }}>{APP_VERSION}</strong>
                  <span>Theme</span><strong style={{ textAlign: 'right' }}>{theme}</strong>
                  <span>Currency</span><strong style={{ textAlign: 'right' }}>{currency.code}</strong>
                  <span>AI Provider</span><strong style={{ textAlign: 'right' }}>{aiOpts.provider || 'none'}</strong>
                  <span>Viewport</span><strong style={{ textAlign: 'right' }}>{window.innerWidth} &times; {window.innerHeight}</strong>
                  <span>DPR</span><strong style={{ textAlign: 'right' }}>{window.devicePixelRatio}x</strong>
                  <span>Touch Device</span><strong style={{ textAlign: 'right' }}>{'ontouchstart' in window ? 'Yes' : 'No'}</strong>
                  <span>Biometric</span><strong style={{ textAlign: 'right' }}>{bioEnabled ? 'Enabled' : 'Disabled'}</strong>
                  <span>Memory</span><strong style={{ textAlign: 'right' }}>{(performance as any).memory ? `${Math.round((performance as any).memory.usedJSHeapSize / 1048576)} MB` : 'N/A'}</strong>
                </div>
              </div>

              {/* Activity Log */}
              {devLog.length > 0 && (
                <div className="settings-section" style={{ margin: 0, padding: '12px 16px', background: 'var(--surface2)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Terminal size={16} style={{ color: '#22c55e' }} />
                      <strong style={{ fontSize: '0.9rem' }}>Activity Log</strong>
                    </div>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '0.75rem' }} onClick={() => setDevLog([])}>Clear</button>
                  </div>
                  <div style={{ maxHeight: '120px', overflowY: 'auto', fontSize: '0.72rem', fontFamily: 'monospace', color: '#22c55e', background: '#0a0a0a', borderRadius: 8, padding: 8 }}>
                    {devLog.map((l, i) => <div key={i} style={{ padding: '2px 0' }}>{l}</div>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Raw JSON Import Modal */}
      {showJsonModal && (
        <div className="modal-overlay" onClick={() => setShowJsonModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxWidth: 480, width: '92%' }}>
            <div className="modal-header">
              <h3 className="form-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileCode size={18} /> Import Raw Vault JSON
              </h3>
              <button className="modal-close" onClick={() => setShowJsonModal(false)}><XCircle size={20} /></button>
            </div>
            <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text2)', margin: 0 }}>
                Paste unencrypted vault JSON data below. This will overwrite existing items, expenses, loans, and cashbacks.
              </p>
              <textarea
                rows={10}
                style={{ 
                  width: '100%', 
                  background: 'var(--surface2)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 8, 
                  padding: 10, 
                  fontFamily: 'monospace', 
                  fontSize: '0.75rem', 
                  color: 'var(--text)',
                  resize: 'vertical'
                }}
                placeholder="Paste raw JSON here..."
                value={jsonImportText}
                onChange={e => setJsonImportText(e.target.value)}
              />
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowJsonModal(false)}>Cancel</button>
                <button 
                  type="button" 
                  className="btn-primary" 
                  disabled={!jsonImportText.trim()}
                  onClick={() => devImportRawJson(jsonImportText)}
                >
                  Restore Data
                </button>
              </div>
            </div>
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
