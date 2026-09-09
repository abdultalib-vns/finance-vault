import { useEffect, useState } from "react";
import AdminSplash from "./AdminSplash";
import AdminLogin from "./AdminLogin";
import CardTemplatesSection from "./sections/CardTemplates";
import AnalyticsSection from "./sections/Analytics";
import ThemeManagerSection from "./sections/ThemeManager";
import PopupAdsSection from "./sections/PopupAds";
import ChangePinSection from "./sections/ChangePin";
import FeedbacksSection from "./sections/Feedbacks";
import AppConfigSection from "./sections/AppConfig";
import CurrencyManagerSection from "./sections/CurrencyManager";
import SystemOperationsSection from "./sections/SystemOperations";
import { loadCardTemplates, loadPopupAds, loadAdminTheme, applyAdminTheme } from "./adminStorage";
import { CardTemplate, PopupAd, AdminTab, AdminThemeSettings } from "./adminTypes";
import { 
  Sliders, Coins, CreditCard, BarChart3, Palette, 
  Megaphone, MessageSquare, ShieldCheck, Sun, Moon, 
  ArrowLeft, Lock, MoreHorizontal, X, Shield, Activity, Server
} from "lucide-react";

const ADMIN_AUTHED_KEY = "admin_session_authed";
const ADMIN_DARK_KEY   = "admin_ui_dark";
const ADMIN_SPLASH_KEY = "admin_splash_seen";

interface NavItemDef {
  id: AdminTab;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
}

export default function AdminApp() {
  const [showSplash, setShowSplash] = useState(true);
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(ADMIN_AUTHED_KEY) === "1");
  const [tab, setTab] = useState<AdminTab>("cards");
  const [adminDark, setAdminDark] = useState(() => {
    const saved = localStorage.getItem(ADMIN_DARK_KEY);
    if (saved !== null) return saved === "1";
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark-mode");
    }
    return false;
  });
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);
  const [templates, setTemplates] = useState<CardTemplate[]>(() => loadCardTemplates());
  const [ads, setAds] = useState<PopupAd[]>(() => loadPopupAds());
  const [themeSettings, setThemeSettings] = useState<AdminThemeSettings>(() => loadAdminTheme());

  // Apply custom accent colors on mount & changes
  useEffect(() => {
    applyAdminTheme(themeSettings);
  }, [themeSettings]);

  // Sync dark mode class on document
  useEffect(() => {
    if (adminDark) {
      document.documentElement.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
    }
  }, [adminDark]);

  function handleSplashDone() {
    setShowSplash(false);
  }

  function handleLogin() {
    setTemplates(loadCardTemplates());
    setAds(loadPopupAds());
    setThemeSettings(loadAdminTheme());
    sessionStorage.setItem(ADMIN_AUTHED_KEY, "1");
    setAuthed(true);
  }

  function handleLogout() {
    sessionStorage.removeItem(ADMIN_AUTHED_KEY);
    setAuthed(false);
  }

  function handleBackToApp() {
    sessionStorage.removeItem(ADMIN_AUTHED_KEY);
    setAuthed(false);
    window.location.hash = "";
  }

  function toggleAdminDark() {
    const next = !adminDark;
    setAdminDark(next);
    localStorage.setItem(ADMIN_DARK_KEY, next ? "1" : "0");
  }

  const NAV_ITEMS: NavItemDef[] = [
    { id: "cards",      label: "Card Templates", shortLabel: "Cards",      icon: <CreditCard size={20} /> },
    { id: "analytics",  label: "User Analytics", shortLabel: "Analytics",  icon: <BarChart3 size={20} /> },
    { id: "config",     label: "App Config",     shortLabel: "Config",     icon: <Sliders size={20} /> },
    { id: "currencies", label: "Currencies",     shortLabel: "Currency",   icon: <Coins size={20} /> },
    { id: "ads",        label: "Popup Ads",      shortLabel: "Ads",        icon: <Megaphone size={20} /> },
    { id: "feedbacks",  label: "User Feedbacks", shortLabel: "Feedbacks",  icon: <MessageSquare size={20} /> },
    { id: "theme",      label: "Theme Engine",   shortLabel: "Theme",      icon: <Palette size={20} /> },
    { id: "system",     label: "System Ops",     shortLabel: "System",     icon: <Server size={20} /> },
    { id: "security",   label: "Master Security",shortLabel: "Security",   icon: <ShieldCheck size={20} /> },
  ];

  const currentItem = NAV_ITEMS.find((n) => n.id === tab) || NAV_ITEMS[0];

  // 1. Splash Screen Phase
  if (showSplash) {
    return <AdminSplash onFinish={handleSplashDone} />;
  }

  // 2. Authentication Phase
  if (!authed) {
    return (
      <div className={adminDark ? "dark-mode" : ""} style={{ height: "100dvh" }}>
        <AdminLogin onLogin={handleLogin} />
      </div>
    );
  }

  // 3. Authenticated Admin Console
  // Primary mobile tabs shown on the main bar, others accessible in "More"
  const mobilePrimaryTabs = NAV_ITEMS.slice(0, 4);
  const mobileMoreTabs = NAV_ITEMS.slice(4);

  return (
    <div className={`admin-luxury-shell ${adminDark ? "dark-mode admin-dark-mode" : "admin-light-mode"}`}>
      {/* ── DESKTOP WIDE-SCREEN SIDEBAR (≥ 1024px) ── */}
      <aside className="admin-desktop-sidebar">
        {/* Brand Header */}
        <div className="admin-sidebar-brand-header">
          <div className="admin-brand-icon-box">
            <img src="/icon-512.png" alt="FinAura Admin" className="admin-brand-img" />
          </div>
          <div className="admin-brand-text-box">
            <span className="admin-brand-title">FinAura</span>
            <span className="admin-brand-badge">ADMIN CONSOLE</span>
          </div>
        </div>

        {/* Navigation Item List */}
        <nav className="admin-sidebar-nav-list">
          {NAV_ITEMS.map((item) => {
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`admin-nav-button ${isActive ? "active" : ""}`}
                onClick={() => setTab(item.id)}
              >
                <span className="admin-nav-btn-icon">{item.icon}</span>
                <span className="admin-nav-btn-label">{item.label}</span>
                {isActive && <span className="admin-nav-active-pip" />}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="admin-sidebar-footer-box">
          <button
            type="button"
            className="admin-sidebar-footer-btn"
            onClick={toggleAdminDark}
            title={adminDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {adminDark ? <Sun size={17} color="#eab308" /> : <Moon size={17} color="#6366f1" />}
            <span>{adminDark ? "Light Mode" : "Dark Mode"}</span>
          </button>

          <button
            type="button"
            className="admin-sidebar-footer-btn"
            onClick={handleBackToApp}
            title="Return to FinAura App"
          >
            <ArrowLeft size={17} />
            <span>Back to Main App</span>
          </button>

          <button
            type="button"
            className="admin-sidebar-footer-btn logout"
            onClick={handleLogout}
            title="Lock Admin Session"
          >
            <Lock size={17} />
            <span>Lock Admin</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT VIEWPORT ── */}
      <div className="admin-main-viewport">
        {/* Top Header Bar */}
        <header className="admin-viewport-header">
          <div className="admin-header-left">
            <div className="admin-header-tab-icon">{currentItem.icon}</div>
            <div>
              <h1 className="admin-header-tab-title">{currentItem.label}</h1>
              <div className="admin-header-tab-sub">System Management &amp; Configuration</div>
            </div>
          </div>

          <div className="admin-header-right">
            <div className="admin-session-badge">
              <span className="admin-session-pulse" />
              <span>Admin Mode Active</span>
            </div>

            <button
              type="button"
              className="admin-header-icon-btn"
              onClick={toggleAdminDark}
              title="Toggle Theme"
            >
              {adminDark ? <Sun size={18} color="#eab308" /> : <Moon size={18} color="#6366f1" />}
            </button>

            <button
              type="button"
              className="admin-header-icon-btn lock-btn"
              onClick={handleLogout}
              title="Lock Console"
            >
              <Lock size={18} />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="admin-viewport-content">
          <div className="admin-content-inner">
            {tab === "config" && <AppConfigSection />}
            {tab === "currencies" && <CurrencyManagerSection />}
            {tab === "cards" && (
              <CardTemplatesSection templates={templates} onUpdate={setTemplates} />
            )}
            {tab === "analytics" && <AnalyticsSection />}
            {tab === "theme" && (
              <ThemeManagerSection settings={themeSettings} onUpdate={setThemeSettings} />
            )}
            {tab === "system" && <SystemOperationsSection />}
            {tab === "ads" && (
              <PopupAdsSection ads={ads} onUpdate={setAds} />
            )}
            {tab === "feedbacks" && <FeedbacksSection />}
            {tab === "security" && <ChangePinSection />}
          </div>
        </main>
      </div>

      {/* ── MOBILE & TABLET BOTTOM NAVIGATION (< 1024px) ── */}
      <nav className="admin-mobile-bottom-nav">
        {mobilePrimaryTabs.map((item) => {
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`admin-bottom-tab-btn ${isActive ? "active" : ""}`}
              onClick={() => {
                setTab(item.id);
                setShowMoreDrawer(false);
              }}
            >
              <span className="admin-bottom-icon">{item.icon}</span>
              <span className="admin-bottom-label">{item.shortLabel}</span>
            </button>
          );
        })}

        {/* 5th Tab: More Button for remaining tabs */}
        <button
          type="button"
          className={`admin-bottom-tab-btn ${showMoreDrawer || mobileMoreTabs.some(t => t.id === tab) ? "active" : ""}`}
          onClick={() => setShowMoreDrawer(!showMoreDrawer)}
        >
          <span className="admin-bottom-icon">
            <MoreHorizontal size={20} />
          </span>
          <span className="admin-bottom-label">More</span>
        </button>
      </nav>

      {/* ── MOBILE "MORE" DRAWER BOTTOM SHEET ── */}
      {showMoreDrawer && (
        <div className="admin-drawer-backdrop" onClick={() => setShowMoreDrawer(false)}>
          <div className="admin-drawer-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="admin-drawer-handle-bar" />
            <div className="admin-drawer-header">
              <span className="admin-drawer-title">More Admin Options</span>
              <button
                type="button"
                className="admin-drawer-close"
                onClick={() => setShowMoreDrawer(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-drawer-grid">
              {mobileMoreTabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`admin-drawer-item ${tab === item.id ? "active" : ""}`}
                  onClick={() => {
                    setTab(item.id);
                    setShowMoreDrawer(false);
                  }}
                >
                  <span className="admin-drawer-item-icon">{item.icon}</span>
                  <span className="admin-drawer-item-label">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="admin-drawer-footer">
              <button
                type="button"
                className="admin-drawer-footer-action"
                onClick={handleBackToApp}
              >
                <ArrowLeft size={16} />
                <span>Return to Main App</span>
              </button>

              <button
                type="button"
                className="admin-drawer-footer-action logout"
                onClick={handleLogout}
              >
                <Lock size={16} />
                <span>Lock Console</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
