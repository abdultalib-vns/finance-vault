import { useEffect, useState } from "react";
import AdminLogin from "./AdminLogin";
import CardTemplatesSection from "./sections/CardTemplates";
import AnalyticsSection from "./sections/Analytics";
import ThemeManagerSection from "./sections/ThemeManager";
import PopupAdsSection from "./sections/PopupAds";
import ChangePinSection from "./sections/ChangePin";
import FeedbacksSection from "./sections/Feedbacks";
import { loadCardTemplates, loadPopupAds, loadAdminTheme, applyAdminTheme } from "./adminStorage";
import { CardTemplate, PopupAd, AdminTab, AdminThemeSettings } from "./adminTypes";

const ADMIN_AUTHED_KEY  = "admin_session_authed";
const ADMIN_DARK_KEY    = "admin_ui_dark";

export default function AdminApp() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(ADMIN_AUTHED_KEY) === "1");
  const [tab, setTab] = useState<AdminTab>("cards");
  const [adminDark, setAdminDark] = useState(() => localStorage.getItem(ADMIN_DARK_KEY) === "1");
  const [templates, setTemplates] = useState<CardTemplate[]>(() => loadCardTemplates());
  const [ads, setAds] = useState<PopupAd[]>(() => loadPopupAds());
  const [themeSettings, setThemeSettings] = useState<AdminThemeSettings>(() => loadAdminTheme());

  // Apply custom accent colors to admin shell on mount
  useEffect(() => {
    applyAdminTheme(themeSettings);
  }, [themeSettings]);

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
    // Stay on #/admin so the admin login screen shows, not the main app
    // (hash is already #/admin, so no change needed)
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

  if (!authed) {
    return (
      <div className={adminDark ? "admin-dark" : ""} style={{ height: "100dvh" }}>
        <AdminLogin onLogin={handleLogin} />
      </div>
    );
  }

  const NAV_ITEMS: { id: AdminTab; label: string; icon: string }[] = [
    { id: "cards",     label: "Card Templates", icon: "💳" },
    { id: "analytics", label: "Analytics",      icon: "📊" },
    { id: "theme",     label: "Theme",          icon: "🎨" },
    { id: "ads",       label: "Popup Ads",      icon: "📢" },
    { id: "feedbacks", label: "Feedbacks",      icon: "💬" },
    { id: "security",  label: "Security",       icon: "🔐" },
  ];

  return (
    <div className={`admin-shell ${adminDark ? "admin-dark" : ""}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span className="admin-sidebar-logo">⚙️</span>
          <div>
            <div className="admin-sidebar-name">Admin Panel</div>
            <div className="admin-sidebar-sub">FinAura</div>
          </div>
        </div>
        <nav className="admin-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`admin-nav-item ${tab === item.id ? "active" : ""}`}
              onClick={() => setTab(item.id)}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button className="admin-nav-item admin-theme-toggle-btn" onClick={toggleAdminDark}>
            <span className="admin-nav-icon">{adminDark ? "☀️" : "🌙"}</span>
            <span>{adminDark ? "Light Mode" : "Dark Mode"}</span>
          </button>
          <button className="admin-nav-item admin-nav-back" onClick={handleBackToApp}>
            <span className="admin-nav-icon">◀</span>
            <span>Back to App</span>
          </button>
          <button className="admin-nav-item admin-nav-logout" onClick={handleLogout}>
            <span className="admin-nav-icon">🔒</span>
            <span>Lock Admin</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        {/* Mobile top bar */}
        <div className="admin-topbar">
          <span className="admin-topbar-title">{NAV_ITEMS.find((n) => n.id === tab)?.icon} {NAV_ITEMS.find((n) => n.id === tab)?.label}</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="admin-topbar-lock" onClick={toggleAdminDark} title="Toggle theme">
              {adminDark ? "☀️" : "🌙"}
            </button>
            <button className="admin-topbar-lock" onClick={handleLogout} title="Lock admin">🔒</button>
          </div>
        </div>

        {tab === "cards" && (
          <CardTemplatesSection templates={templates} onUpdate={setTemplates} />
        )}
        {tab === "analytics" && <AnalyticsSection />}
        {tab === "theme" && (
          <ThemeManagerSection settings={themeSettings} onUpdate={setThemeSettings} />
        )}
        {tab === "ads" && (
          <PopupAdsSection ads={ads} onUpdate={setAds} />
        )}
        {tab === "feedbacks" && <FeedbacksSection />}
        {tab === "security" && <ChangePinSection />}
      </main>

      {/* Mobile bottom nav */}
      <nav className="admin-bottom-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`admin-bottom-nav-item ${tab === item.id ? "active" : ""}`}
            onClick={() => setTab(item.id)}
          >
            <span className="admin-bottom-nav-icon">{item.icon}</span>
            <span className="admin-bottom-nav-label">{item.label.split(" ")[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
