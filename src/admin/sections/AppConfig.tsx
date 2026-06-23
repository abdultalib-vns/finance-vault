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
      <div className="admin-section-header-bar">
        <h2>⚙️ Global App Configuration</h2>
        <button className="admin-btn admin-btn-primary" onClick={handleSave}>
          {saved ? "✅ Saved" : "💾 Save Changes"}
        </button>
      </div>
      <p className="admin-section-desc">
        Configure global settings that apply to all users instantly.
      </p>

      <div className="admin-form-group" style={{ marginTop: 24, padding: 20, background: 'var(--surface2)', borderRadius: 12 }}>
        <h3 style={{ marginBottom: 16 }}>🚧 Maintenance Mode</h3>
        <label className="admin-toggle-label">
          <input
            type="checkbox"
            className="admin-toggle"
            checked={config.maintenanceMode}
            onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
          />
          <span className="admin-toggle-text">Enable Maintenance Mode</span>
        </label>
        <p className="admin-input-hint" style={{ marginTop: 4, marginBottom: 16 }}>
          When enabled, the main app will be blocked for all users except admins.
        </p>

        <label className="admin-label">Maintenance Message</label>
        <textarea
          className="admin-input"
          style={{ resize: 'vertical', minHeight: 80 }}
          value={config.maintenanceMessage}
          onChange={(e) => handleChange("maintenanceMessage", e.target.value)}
          placeholder="E.g. We are currently upgrading our servers. Please check back in an hour."
          disabled={!config.maintenanceMode}
        />
      </div>

      <div className="admin-form-group" style={{ marginTop: 24, padding: 20, background: 'var(--surface2)', borderRadius: 12 }}>
        <h3 style={{ marginBottom: 16 }}>📢 Global Announcement Banner</h3>
        <label className="admin-toggle-label">
          <input
            type="checkbox"
            className="admin-toggle"
            checked={config.showGlobalBanner}
            onChange={(e) => handleChange("showGlobalBanner", e.target.checked)}
          />
          <span className="admin-toggle-text">Show Banner</span>
        </label>
        <p className="admin-input-hint" style={{ marginTop: 4, marginBottom: 16 }}>
          Shows a dismissible alert banner at the top of the dashboard for all users.
        </p>

        <label className="admin-label">Banner Text</label>
        <input
          type="text"
          className="admin-input"
          value={config.globalBannerText}
          onChange={(e) => handleChange("globalBannerText", e.target.value)}
          placeholder="E.g. Welcome to FinAura v2.0! Check out our new features."
          disabled={!config.showGlobalBanner}
        />
      </div>

      <div className="admin-form-group" style={{ marginTop: 24, padding: 20, background: 'var(--surface2)', borderRadius: 12 }}>
        <h3 style={{ marginBottom: 16 }}>📲 App Versioning</h3>
        <label className="admin-label">Minimum Required Version</label>
        <input
          type="text"
          className="admin-input"
          value={config.minAppVersion}
          onChange={(e) => handleChange("minAppVersion", e.target.value)}
          placeholder="e.g. 1.0.0"
        />
        <p className="admin-input-hint">
          If a user's browser has an older version cached, they will be prompted to clear their cache or update.
          (Current app version is typically 1.0.0 or 2.0.0)
        </p>
      </div>
    </div>
  );
}
