import { useState } from "react";
import { AdminThemeSettings } from "../adminTypes";
import { saveAdminTheme, applyAdminTheme } from "../adminStorage";

interface Props {
  settings: AdminThemeSettings;
  onUpdate: (s: AdminThemeSettings) => void;
}

const PRESET_ACCENTS = [
  { label: "Blue (Default)",   light: "#2563eb", dark: "#3b82f6", lighter: "#dbeafe" },
  { label: "Purple",           light: "#7c3aed", dark: "#8b5cf6", lighter: "#ede9fe" },
  { label: "Teal",             light: "#0d9488", dark: "#14b8a6", lighter: "#ccfbf1" },
  { label: "Rose",             light: "#e11d48", dark: "#f43f5e", lighter: "#ffe4e6" },
  { label: "Amber",            light: "#d97706", dark: "#f59e0b", lighter: "#fef3c7" },
  { label: "Indigo",           light: "#4338ca", dark: "#6366f1", lighter: "#e0e7ff" },
  { label: "Emerald",          light: "#059669", dark: "#10b981", lighter: "#d1fae5" },
  { label: "Slate",            light: "#334155", dark: "#64748b", lighter: "#e2e8f0" },
];

export default function ThemeManagerSection({ settings, onUpdate }: Props) {
  const [local, setLocal] = useState(settings);
  const [saved, setSaved] = useState(false);

  function applyPreset(preset: typeof PRESET_ACCENTS[0]) {
    const next: AdminThemeSettings = {
      ...local,
      accentColor: preset.light,
      accentColorDark: preset.dark,
      accentColorLight: preset.lighter,
    };
    setLocal(next);
    setSaved(false);
  }

  function handleSave() {
    saveAdminTheme(local);
    applyAdminTheme(local);
    onUpdate(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const isCustom = !PRESET_ACCENTS.some((p) => p.light === local.accentColor);

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">Theme Manager</h2>
          <p className="admin-section-desc">
            Control the app's default theme and accent color for all users.
          </p>
        </div>
      </div>

      {/* Accent Color */}
      <div className="admin-theme-block">
        <h3 className="admin-analytics-subtitle">Accent Color</h3>
        <p className="admin-theme-hint">
          The primary accent color used for buttons, links, and highlights throughout the app.
        </p>
        <div className="admin-preset-grid">
          {PRESET_ACCENTS.map((p) => (
            <button
              key={p.light}
              className={`admin-preset-chip ${local.accentColor === p.light ? "selected" : ""}`}
              onClick={() => applyPreset(p)}
            >
              <span
                className="admin-preset-dot"
                style={{ background: `linear-gradient(135deg, ${p.light}, ${p.dark})` }}
              />
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Custom color pickers */}
        <div className="admin-custom-color-section">
          <h4 className="admin-custom-color-title">Custom Colors {isCustom && <span className="admin-badge admin-badge-featured">Active</span>}</h4>
          <div className="admin-color-row-grid">
            <div className="admin-form-field">
              <label className="admin-label">Primary (Light mode)</label>
              <div className="admin-color-with-input">
                <input type="color" value={local.accentColor}
                  onChange={(e) => { setLocal({ ...local, accentColor: e.target.value }); setSaved(false); }} />
                <input className="admin-input admin-color-hex" value={local.accentColor}
                  onChange={(e) => { setLocal({ ...local, accentColor: e.target.value }); setSaved(false); }}
                  maxLength={7} />
              </div>
            </div>
            <div className="admin-form-field">
              <label className="admin-label">Primary (Dark mode)</label>
              <div className="admin-color-with-input">
                <input type="color" value={local.accentColorDark}
                  onChange={(e) => { setLocal({ ...local, accentColorDark: e.target.value }); setSaved(false); }} />
                <input className="admin-input admin-color-hex" value={local.accentColorDark}
                  onChange={(e) => { setLocal({ ...local, accentColorDark: e.target.value }); setSaved(false); }}
                  maxLength={7} />
              </div>
            </div>
            <div className="admin-form-field">
              <label className="admin-label">Light tint</label>
              <div className="admin-color-with-input">
                <input type="color" value={local.accentColorLight}
                  onChange={(e) => { setLocal({ ...local, accentColorLight: e.target.value }); setSaved(false); }} />
                <input className="admin-input admin-color-hex" value={local.accentColorLight}
                  onChange={(e) => { setLocal({ ...local, accentColorLight: e.target.value }); setSaved(false); }}
                  maxLength={7} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="admin-theme-block">
        <h3 className="admin-analytics-subtitle">Preview</h3>
        <div className="admin-theme-preview" style={{ "--preview-accent": local.accentColor } as React.CSSProperties}>
          <div className="admin-preview-card">
            <div className="admin-preview-header" style={{ background: local.accentColor }}>
              <span>FinanceVault</span>
            </div>
            <div className="admin-preview-body">
              <button className="admin-preview-btn" style={{ background: local.accentColor }}>
                Primary Button
              </button>
              <div className="admin-preview-link" style={{ color: local.accentColor }}>
                Accent Link
              </div>
              <div
                className="admin-preview-badge"
                style={{ background: local.accentColorLight, color: local.accentColor }}
              >
                Badge
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-save-bar">
        <button className="admin-btn-primary" onClick={handleSave}>
          {saved ? "✓ Saved!" : "Save Theme Settings"}
        </button>
      </div>
    </div>
  );
}
