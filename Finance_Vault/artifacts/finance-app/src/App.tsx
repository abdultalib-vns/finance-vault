import { useEffect, useRef, useState } from "react";
import AuthScreen from "./pages/AuthScreen";
import Dashboard from "./pages/Dashboard";
import Cards from "./pages/Cards";
import Banks from "./pages/Banks";
import Cashback from "./pages/Cashback";
import Settings from "./pages/Settings";
import BottomNav from "./components/BottomNav";
import PopupAdBanner from "./components/PopupAdBanner";
import ThemeUpdateBanner from "./components/ThemeUpdateBanner";
import AdminApp from "./admin/AdminApp";
import { loadItems, loadCurrency, loadIdleTimeout, loadTheme, saveTheme } from "./lib/storage";
import { getCurrency } from "./lib/currency";
import { FinanceItem, NavTab, Currency } from "./types";
import { startSession, endSession, trackTabVisit, applyAdminTheme, loadAdminTheme, loadAdminConfigFromServer, seedDefaultCardTemplates } from "./admin/adminStorage";

const storedTheme = loadTheme();
if (storedTheme === "dark") document.documentElement.classList.add("dark-mode");

// Apply any admin theme overrides
applyAdminTheme(loadAdminTheme());

// Seed default card offers into admin storage on first run
seedDefaultCardTemplates();

export default function App() {
  const [isAdmin, setIsAdmin] = useState(() => window.location.hash === "#/admin");

  // React to hash changes so navigating #/admin ↔ main app works live
  useEffect(() => {
    const handler = () => setIsAdmin(window.location.hash === "#/admin");
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  if (isAdmin) return <AdminApp />;

  // key={Date.now()} forces MainApp to fully remount after returning from admin,
  // so it re-reads all localStorage (theme, card templates, popup ads, etc.)
  return <MainApp key={isAdmin ? "admin" : "main"} />;
}

function MainApp() {
  const [masterKey, setMasterKey] = useState<string | null>(null);
  const [items, setItems] = useState<FinanceItem[]>([]);
  const [tab, setTab] = useState<NavTab>("dashboard");
  const [currency, setCurrency] = useState<Currency>(() => getCurrency(loadCurrency()));
  const [idleMinutes, setIdleMinutes] = useState<number>(() => loadIdleTimeout());
  const [theme, setThemeState] = useState<"light" | "dark">(() => loadTheme());

  const idleTimerRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Re-apply admin theme overrides every time MainApp mounts (e.g. after returning from admin)
  useEffect(() => {
    // Fetch latest admin config from server so all devices stay in sync,
    // then re-apply the theme in case it changed.
    loadAdminConfigFromServer().then(() => {
      applyAdminTheme(loadAdminTheme());
    });
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

  if (!masterKey) {
    return <AuthScreen onUnlock={handleUnlock} />;
  }

  return (
    <div className="app-shell">
      <div className="screen-container">
        {tab === "dashboard" && (
          <Dashboard masterKey={masterKey} currency={currency} items={items} onItemsChange={setItems} onLock={handleLock} />
        )}
        {tab === "cards" && (
          <Cards masterKey={masterKey} currency={currency} items={items} onItemsChange={setItems} onReload={handleReload} />
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
      <PopupAdBanner />
      <ThemeUpdateBanner />
    </div>
  );
}
