import { useState } from "react";
import { GlobalAppConfig } from "../adminTypes";
import { loadGlobalConfig, saveGlobalConfig } from "../adminStorage";

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
          <h2 className="admin-section-title">⚙️ Global App Configuration</h2>
          <p className="admin-section-desc">
            Configure global settings that apply to all users instantly.
          </p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={handleSave} style={{ padding: '8px 20px', fontSize: '0.95rem' }}>
          {saved ? "✅ Saved" : "💾 Save Changes"}
        </button>
      </div>

      <div className="admin-card">
        <h3 className="admin-card-title">🚧 Maintenance Mode</h3>
        <p className="admin-card-desc">
          When enabled, the main app will be completely blocked for all users except admins. Use this when performing critical database migrations or updates.
        </p>
        
        <div className="admin-form-row">
          <label className="admin-checkbox" style={{ background: 'var(--surface2)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
            <input
              type="checkbox"
              checked={config.maintenanceMode}
              onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
              style={{ width: 18, height: 18 }}
            />
            <span style={{ fontWeight: 600 }}>Enable Maintenance Mode</span>
          </label>
        </div>

        <div className="admin-form-row">
          <label className="admin-label">Maintenance Message</label>
          <textarea
            className="admin-input"
            style={{ resize: 'vertical', minHeight: 80, fontSize: '0.95rem' }}
            value={config.maintenanceMessage}
            onChange={(e) => handleChange("maintenanceMessage", e.target.value)}
            placeholder="E.g. We are currently upgrading our servers. Please check back in an hour."
            disabled={!config.maintenanceMode}
          />
        </div>
      </div>

      <div className="admin-card">
        <h3 className="admin-card-title">📢 Global Announcement Banner</h3>
        <p className="admin-card-desc">
          Display a prominent, dismissible alert banner at the very top of the dashboard for all logged-in users. Great for welcoming users to a new version or warning about upcoming downtime.
        </p>

        <div className="admin-form-row">
          <label className="admin-checkbox" style={{ background: 'var(--surface2)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
            <input
              type="checkbox"
              checked={config.showGlobalBanner}
              onChange={(e) => handleChange("showGlobalBanner", e.target.checked)}
              style={{ width: 18, height: 18 }}
            />
            <span style={{ fontWeight: 600 }}>Show Banner</span>
          </label>
        </div>

        <div className="admin-form-row">
          <label className="admin-label">Banner Text</label>
          <input
            type="text"
            className="admin-input"
            style={{ fontSize: '0.95rem' }}
            value={config.globalBannerText}
            onChange={(e) => handleChange("globalBannerText", e.target.value)}
            placeholder="E.g. Welcome to FinAura v2.0! Check out our new features."
            disabled={!config.showGlobalBanner}
          />
        </div>
      </div>

      <div className="admin-card">
        <h3 className="admin-card-title">📲 App Versioning</h3>
        <p className="admin-card-desc">
          Enforce a minimum app version. If a user's browser has an older version cached via the PWA service worker, they will be prompted to hard-refresh or update the app.
        </p>
        
        <div className="admin-form-row">
          <label className="admin-label">Minimum Required Version</label>
          <input
            type="text"
            className="admin-input"
            style={{ maxWidth: 200, fontSize: '0.95rem' }}
            value={config.minAppVersion}
            onChange={(e) => handleChange("minAppVersion", e.target.value)}
            placeholder="e.g. 1.0.0"
          />
        </div>
      </div>
    </div>
  );
}
