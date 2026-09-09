import { useState } from "react";
import { GlobalAppConfig } from "../adminTypes";
import { loadGlobalConfig, saveGlobalConfig } from "../adminStorage";
import { Sliders, Save, Check, AlertTriangle, Megaphone, Smartphone } from "lucide-react";

export default function AppConfigSection() {
  const [config, setConfig] = useState<GlobalAppConfig>(() => loadGlobalConfig());
  const [saved, setSaved] = useState(false);

  function handleChange(field: keyof GlobalAppConfig, value: any) {
    setConfig(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function handleSave() {
    saveGlobalConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="admin-section-content">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sliders size={22} className="admin-title-icon" />
            <span>Global App Configuration</span>
          </h2>
          <p className="admin-section-desc">
            Configure system-wide runtime parameters that apply to all user sessions instantly.
          </p>
        </div>
        <button 
          type="button"
          className="admin-btn admin-btn-primary" 
          onClick={handleSave} 
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: '10px 22px', fontSize: '0.92rem' }}
        >
          {saved ? <Check size={16} color="#10B981" /> : <Save size={16} />}
          <span>{saved ? "Saved Changes" : "Save Changes"}</span>
        </button>
      </div>

      <div className="admin-card">
        <h3 className="admin-card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={18} color="#f59e0b" />
          <span>Maintenance Mode</span>
        </h3>
        <p className="admin-card-desc">
          When enabled, the main app will be completely blocked for all users except admins. Use this when performing critical data migrations or infrastructure maintenance.
        </p>
        
        <div className="admin-form-row">
          <label className="admin-checkbox" style={{ background: 'var(--surface2)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)', display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={config.maintenanceMode}
              onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
              style={{ width: 18, height: 18, cursor: "pointer" }}
            />
            <span style={{ fontWeight: 600 }}>Enable Maintenance Mode</span>
          </label>
        </div>

        <div className="admin-form-row" style={{ marginTop: 12 }}>
          <label className="admin-label">Maintenance Message</label>
          <textarea
            className="admin-input"
            style={{ resize: 'vertical', minHeight: 80, fontSize: '0.92rem', width: "100%" }}
            value={config.maintenanceMessage}
            onChange={(e) => handleChange("maintenanceMessage", e.target.value)}
            placeholder="E.g. We are currently upgrading our servers. Please check back in an hour."
            disabled={!config.maintenanceMode}
          />
        </div>
      </div>

      <div className="admin-card">
        <h3 className="admin-card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Megaphone size={18} color="var(--primary)" />
          <span>Global Announcement Banner</span>
        </h3>
        <p className="admin-card-desc">
          Display a prominent, dismissible alert banner at the very top of the dashboard for all logged-in users. Great for welcoming users to a new version or broadcasting updates.
        </p>

        <div className="admin-form-row">
          <label className="admin-checkbox" style={{ background: 'var(--surface2)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)', display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={config.showGlobalBanner}
              onChange={(e) => handleChange("showGlobalBanner", e.target.checked)}
              style={{ width: 18, height: 18, cursor: "pointer" }}
            />
            <span style={{ fontWeight: 600 }}>Show Banner</span>
          </label>
        </div>

        <div className="admin-form-row" style={{ marginTop: 12 }}>
          <label className="admin-label">Banner Text</label>
          <input
            type="text"
            className="admin-input"
            style={{ fontSize: '0.92rem', width: "100%" }}
            value={config.globalBannerText}
            onChange={(e) => handleChange("globalBannerText", e.target.value)}
            placeholder="E.g. Welcome to FinAura v2.0! Check out our new features."
            disabled={!config.showGlobalBanner}
          />
        </div>
      </div>

      <div className="admin-card">
        <h3 className="admin-card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Smartphone size={18} color="var(--primary)" />
          <span>App Versioning</span>
        </h3>
        <p className="admin-card-desc">
          Enforce a minimum required app version. If a user's browser has an older version cached via the PWA service worker, they will be prompted to update.
        </p>
        
        <div className="admin-form-row">
          <label className="admin-label">Minimum Required Version</label>
          <input
            type="text"
            className="admin-input"
            style={{ maxWidth: 220, fontSize: '0.92rem' }}
            value={config.minAppVersion}
            onChange={(e) => handleChange("minAppVersion", e.target.value)}
            placeholder="e.g. 1.0.0"
          />
        </div>
      </div>
    </div>
  );
}
