import { Construction, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import AuthScreen from "./pages/AuthScreen";
import Dashboard from "./pages/Dashboard";
import Cards from "./pages/Cards";
import Banks from "./pages/Banks";
import Cashback from "./pages/Cashback";
import Settings from "./pages/Settings";
import BottomNav from "./components/BottomNav";
import PopupAdBanner from "./components/PopupAdBanner";
import ThemeUpdateBanner from "./components/ThemeUpdateBanner";
import UpdatePrompt from "./components/UpdatePrompt";
import SplashScreen from "./components/SplashScreen";
import NewCardModal from "./components/NewCardModal";
import WelcomeSetup, { isOnboardingDone } from "./components/WelcomeSetup";
import AIAssistant from "./components/AIAssistant";
import { AlertContainer, customAlert } from "./components/CustomAlert";
import AdminApp from "./admin/AdminApp";
import Lottie from "lottie-react";
import aiAnimation from "../public/FinAura_AI_Lottie.json";
import { loadItems, loadCurrency, loadIdleTimeout, loadTheme, saveTheme, loadPinHash, loadAIOptions, loadExpenses } from "./lib/storage";
import { getCurrency } from "./lib/currency";
import { FinanceItem, NavTab, Currency } from "./types";
import { startSession, endSession, trackTabVisit, applyAdminTheme, loadAdminTheme, loadAdminConfigFromServer, seedDefaultCardTemplates, loadGlobalConfig } from "./admin/adminStorage";
import { GlobalAppConfig } from "./admin/adminTypes";

const storedTheme = loadTheme();
if (storedTheme === "dark") document.documentElement.classList.add("dark-mode");

// Apply any admin theme overrides
applyAdminTheme(loadAdminTheme());

// Seed default card offers into admin storage on first run
seedDefaultCardTemplates();

export default function App() {
  const [isAdmin, setIsAdmin] = useState(() => window.location.hash === "#/admin" && import.meta.env.VITE_ENABLE_ADMIN === "true");

  // React to hash changes so navigating #/admin ↔ main app works live
  useEffect(() => {
    const handler = () => {
      if (import.meta.env.VITE_ENABLE_ADMIN === "true") {
        setIsAdmin(window.location.hash === "#/admin");
      }
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  if (isAdmin && import.meta.env.VITE_ENABLE_ADMIN === "true") return <AdminApp />;

  // key={Date.now()} forces MainApp to fully remount after returning from admin,
  // so it re-reads all localStorage (theme, card templates, popup ads, etc.)
  return <MainApp key={isAdmin ? "admin" : "main"} />;
}

function MainApp() {
  const [showSplash, setShowSplash] = useState(true);
  const [masterKey, setMasterKey] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [items, setItems] = useState<FinanceItem[]>([]);
  const [tab, setTab] = useState<NavTab>("dashboard");
  const [currency, setCurrency] = useState<Currency>(() => getCurrency(loadCurrency()));
  const [idleMinutes, setIdleMinutes] = useState<number>(() => loadIdleTimeout());
  const [theme, setThemeState] = useState<"light" | "dark">(() => loadTheme());
  const [wasNewUser] = useState(() => !loadPinHash());

  const idleTimerRef = useRef<number | null>(null);
  const [globalConfig, setGlobalConfig] = useState<GlobalAppConfig>(() => loadGlobalConfig());
  const sessionIdRef = useRef<string | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const initialConfigVersion = useRef(globalConfig.configVersion || 1);
  const [targetCardId, setTargetCardId] = useState<string | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const aiOpts = loadAIOptions();

  const handleSplashDone = useCallback(() => setShowSplash(false), []);

  // Re-apply admin theme overrides every time MainApp mounts (e.g. after returning from admin)
  useEffect(() => {
    // Fetch latest admin config from server so all devices stay in sync,
    // then re-apply the theme and config in case it changed.
    const syncConfig = () => {
      loadAdminConfigFromServer().then(() => {
        applyAdminTheme(loadAdminTheme());
        const newConfig = loadGlobalConfig();
        setGlobalConfig(newConfig);
        if (newConfig.configVersion && newConfig.configVersion > initialConfigVersion.current) {
          setUpdateAvailable(true);
        }
      });
    };
    
    syncConfig();
    const interval = setInterval(syncConfig, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, []);

  const setTheme = (newTheme: "light" | "dark") => {
    setThemeState(newTheme);
    saveTheme(newTheme);
    if (newTheme === "dark") document.documentElement.classList.add("dark-mode");
    else document.documentElement.classList.remove("dark-mode");
  };

  function handleUnlock(key: string) {
    setMasterKey(key);
    setItems(loadItems());
    setCurrency(getCurrency(loadCurrency()));
    setIdleMinutes(loadIdleTimeout());
    const savedTheme = loadTheme();
    setThemeState(savedTheme);
    if (savedTheme === "dark") document.documentElement.classList.add("dark-mode");
    else document.documentElement.classList.remove("dark-mode");
    // Start analytics session
    sessionIdRef.current = startSession();
    // Show welcome setup for first-time users
    if (wasNewUser && !isOnboardingDone()) {
      setShowWelcome(true);
    }
  }

  function handleLock() {
    if (sessionIdRef.current) {
      endSession(sessionIdRef.current);
      sessionIdRef.current = null;
    }
    setMasterKey(null);
    setItems([]);
    setTab("dashboard");
  }

  function handleReload() {
    setItems(loadItems());
    setCurrency(getCurrency(loadCurrency()));
  }

  useEffect(() => {
    if (!masterKey) return;
    if (idleMinutes <= 0) return;

    const timeoutMs = idleMinutes * 60 * 1000;
    const reset = () => {
      if (idleTimerRef.current !== null) window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = window.setTimeout(() => handleLock(), timeoutMs);
    };

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"] as const;
    events.forEach((ev) => window.addEventListener(ev, reset, { passive: true }));
    document.addEventListener("visibilitychange", reset);
    reset();

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, reset));
      document.removeEventListener("visibilitychange", reset);
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };
  }, [masterKey, idleMinutes]);

  function handleTabChange(newTab: NavTab) {
    setTab(newTab);
    if (sessionIdRef.current) trackTabVisit(sessionIdRef.current, newTab);
  }

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashDone} />;
  }

  if (globalConfig.maintenanceMode) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', justifyContent: 'center', alignItems: 'center', background: 'var(--bg)', padding: '24px', textAlign: 'center' }}>
        <div style={{ background: 'var(--surface)', padding: '48px 32px', borderRadius: '32px', boxShadow: '0 12px 48px rgba(0,0,0,0.1)', border: '1px solid var(--border)', maxWidth: '400px', width: '100%' }}>
          <div style={{ fontSize: '5rem', marginBottom: '24px', animation: 'pulse 2s infinite' }}><Construction size={80} /></div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '16px', color: 'var(--text)' }}>We'll Be Right Back!</h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text2)', lineHeight: '1.6', margin: 0 }}>
            {globalConfig.maintenanceMessage || "We are currently performing some scheduled maintenance. Please check back shortly."}
          </p>
        </div>
      </div>
    );
  }

  if (!masterKey) {
    return <AuthScreen onUnlock={handleUnlock} />;
  }

  if (showWelcome) {
    return (
      <WelcomeSetup
        masterKey={masterKey}
        onComplete={(newCurrency, newTheme) => {
          setCurrency(newCurrency);
          setTheme(newTheme);
          setShowWelcome(false);
        }}
      />
    );
  }

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      {updateAvailable && (
        <div className="update-banner">
          App configuration has been updated. 
          <button onClick={() => window.location.reload()}>Refresh to Apply</button>
        </div>
      )}
      {globalConfig.showGlobalBanner && (
        <div style={{ background: 'var(--primary)', color: '#fff', padding: '10px 16px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, flexShrink: 0, zIndex: 9999 }}>
          {globalConfig.globalBannerText}
        </div>
      )}
      <PopupAdBanner />
      <ThemeUpdateBanner />
      <UpdatePrompt />
      <NewCardModal onShowMore={(cardId) => {
        setTargetCardId(cardId);
        setTab("cards");
      }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <div className="screen-container">
          {tab === "dashboard" && (
            <Dashboard masterKey={masterKey} currency={currency} items={items} onItemsChange={setItems} onLock={handleLock} />
          )}
          {tab === "cards" && (
            <Cards masterKey={masterKey} currency={currency} items={items} onItemsChange={setItems} onReload={handleReload} targetCardId={targetCardId} />
          )}
          {tab === "banks" && (
            <Banks masterKey={masterKey} currency={currency} items={items} onItemsChange={setItems} onReload={handleReload} />
          )}
          {tab === "cashback" && (
            <Cashback currency={currency} />
          )}
          {tab === "settings" && (
            <Settings
              masterKey={masterKey}
              currency={currency}
              onCurrencyChange={setCurrency}
              onLock={handleLock}
              onMasterKeyChange={setMasterKey}
              items={items}
              onItemsChange={setItems}
              idleMinutes={idleMinutes}
              onIdleMinutesChange={setIdleMinutes}
              theme={theme}
              onThemeChange={setTheme}
              onReload={handleReload}
            />
          )}
        </div>
        <BottomNav active={tab} onChange={handleTabChange} />

        {tab !== "settings" && (
          <button 
            className="fab-btn ai-fab-btn" 
            onClick={() => {
              if (aiOpts.provider === "none") {
                customAlert("Please select an AI Provider (Groq, OpenRouter, or Gemini) in Settings first!", "Provider Required", "error");
                return;
              } else {
                setShowAIAssistant(true);
              }
            }} 
            aria-label="Ask AI" 
            title="Ask AI"
            style={{ 
              left: '18px',
              right: 'auto',
              bottom: 'calc(var(--bottom-nav-h, 64px) + 14px)', 
              zIndex: 55,
              background: 'transparent',
              boxShadow: 'none',
              padding: 0,
              overflow: 'visible'
            }}
          >
            <Lottie animationData={aiAnimation} loop={true} style={{ width: 80, height: 80, filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.2))' }} />
          </button>
        )}

        <AlertContainer />
        {showAIAssistant && (
          <AIAssistant 
            aiOpts={aiOpts}
            contextData={{ items, expenses: loadExpenses() }}
            onClose={() => setShowAIAssistant(false)}
            onDataChanged={() => setItems(loadItems())}
          />
        )}
      </div>
    </div>
  );
}
