import React, { useState } from "react";
import { AdminThemeSettings } from "../adminTypes";
import { saveAdminTheme, applyAdminTheme } from "../adminStorage";
import { Palette, Save, Check, Sparkles, Sliders, Eye } from "lucide-react";

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
          <h2 className="admin-section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Palette size={22} className="admin-title-icon" />
            <span>Theme Engine</span>
          </h2>
          <p className="admin-section-desc">
            Control the app-wide brand accent colors and palette highlights across all user clients.
          </p>
        </div>
        <button 
          type="button"
          className="admin-btn admin-btn-primary" 
          onClick={handleSave}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: '10px 22px' }}
        >
          {saved ? <Check size={16} color="#10B981" /> : <Save size={16} />}
          <span>{saved ? "Theme Saved!" : "Save Theme Settings"}</span>
        </button>
      </div>

      {/* Preset Accent Swatches */}
      <div className="admin-card">
        <h3 className="admin-card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={18} color="var(--primary)" />
          <span>Curated Accent Palettes</span>
        </h3>
        <p className="admin-card-desc">
          Select a tailored fintech color scheme to instantly apply across buttons, tabs, and key balances:
        </p>
        <div className="admin-preset-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10, marginTop: 14 }}>
          {PRESET_ACCENTS.map((p) => (
            <button
              key={p.light}
              type="button"
              className={`admin-preset-chip ${local.accentColor === p.light ? "selected" : ""}`}
              onClick={() => applyPreset(p)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 12,
                border: local.accentColor === p.light ? "2px solid var(--primary)" : "1px solid var(--border)",
                background: "var(--surface2)",
                cursor: "pointer",
                textAlign: "left"
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${p.light}, ${p.dark})`,
                  flexShrink: 0,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
                }}
              />
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Custom hex color pickers */}
        <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid var(--border)" }}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
            <Sliders size={16} />
            <span>Custom Color Override</span>
            {isCustom && (
              <span className="admin-badge admin-badge-live" style={{ fontSize: "0.7rem" }}>
                Custom Active
              </span>
            )}
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
            <div className="admin-form-field">
              <label className="admin-label">Primary (Light mode)</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input 
                  type="color" 
                  value={local.accentColor}
                  onChange={(e) => { setLocal({ ...local, accentColor: e.target.value }); setSaved(false); }} 
                  style={{ width: 40, height: 38, borderRadius: 8, border: "1px solid var(--border)", cursor: "pointer", padding: 2 }}
                />
                <input 
                  className="admin-input" 
                  value={local.accentColor}
                  onChange={(e) => { setLocal({ ...local, accentColor: e.target.value }); setSaved(false); }}
                  maxLength={7} 
                  style={{ fontFamily: "monospace", textTransform: "uppercase" }}
                />
              </div>
            </div>

            <div className="admin-form-field">
              <label className="admin-label">Primary (Dark mode)</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input 
                  type="color" 
                  value={local.accentColorDark}
                  onChange={(e) => { setLocal({ ...local, accentColorDark: e.target.value }); setSaved(false); }} 
                  style={{ width: 40, height: 38, borderRadius: 8, border: "1px solid var(--border)", cursor: "pointer", padding: 2 }}
                />
                <input 
                  className="admin-input" 
                  value={local.accentColorDark}
                  onChange={(e) => { setLocal({ ...local, accentColorDark: e.target.value }); setSaved(false); }}
                  maxLength={7} 
                  style={{ fontFamily: "monospace", textTransform: "uppercase" }}
                />
              </div>
            </div>

            <div className="admin-form-field">
              <label className="admin-label">Soft Tint / Badge Fill</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input 
                  type="color" 
                  value={local.accentColorLight}
                  onChange={(e) => { setLocal({ ...local, accentColorLight: e.target.value }); setSaved(false); }} 
                  style={{ width: 40, height: 38, borderRadius: 8, border: "1px solid var(--border)", cursor: "pointer", padding: 2 }}
                />
                <input 
                  className="admin-input" 
                  value={local.accentColorLight}
                  onChange={(e) => { setLocal({ ...local, accentColorLight: e.target.value }); setSaved(false); }}
                  maxLength={7} 
                  style={{ fontFamily: "monospace", textTransform: "uppercase" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- ADVANCED STYLING --- */}
        <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid var(--border)" }}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
            <Sliders size={16} />
            <span>Advanced Styling</span>
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            
            <div className="admin-form-field">
              <label className="admin-label">Typography</label>
              <select 
                className="admin-input"
                value={local.fontFamily || "Inter, sans-serif"}
                onChange={(e) => { setLocal({ ...local, fontFamily: e.target.value }); setSaved(false); }}
              >
                <option value="Inter, sans-serif">Inter (Default)</option>
                <option value="Roboto, sans-serif">Roboto</option>
                <option value="'Outfit', sans-serif">Outfit</option>
                <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans</option>
              </select>
            </div>

            <div className="admin-form-field">
              <label className="admin-label">Border Radius</label>
              <select 
                className="admin-input"
                value={local.borderRadius || "12px"}
                onChange={(e) => { setLocal({ ...local, borderRadius: e.target.value }); setSaved(false); }}
              >
                <option value="4px">Sharp (4px)</option>
                <option value="8px">Standard (8px)</option>
                <option value="12px">Soft (12px)</option>
                <option value="24px">Pill (24px)</option>
              </select>
            </div>

            <div className="admin-form-field" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <label className="admin-checkbox" style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginTop: 22 }}>
                <input
                  type="checkbox"
                  checked={local.glassmorphism ?? true}
                  onChange={(e) => { setLocal({ ...local, glassmorphism: e.target.checked }); setSaved(false); }}
                  style={{ width: 18, height: 18, cursor: "pointer" }}
                />
                <span style={{ fontWeight: 600 }}>Enable Glassmorphism</span>
              </label>
            </div>
            
          </div>
        </div>

      </div>

      {/* Live Preview */}
      <div className="admin-card" style={{ marginTop: 20 }}>
        <h3 className="admin-card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Eye size={18} color="var(--primary)" />
          <span>Interactive Component Preview</span>
        </h3>
        <p className="admin-card-desc">Inspect how UI elements respond to your chosen accent color:</p>
        <div style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          alignItems: "center",
          padding: 20,
          background: "var(--surface2)",
          borderRadius: 14,
          border: "1px solid var(--border)"
        }}>
          <button
            type="button"
            style={{
              background: local.accentColor,
              color: "#ffffff",
              border: "none",
              borderRadius: 10,
              padding: "10px 20px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: `0 4px 12px ${local.accentColor}44`
            }}
          >
            Accent Button
          </button>

          <span style={{ color: local.accentColor, fontWeight: 700, fontSize: "0.95rem" }}>
            Accent Text Link
          </span>

          <span style={{
            background: local.accentColorLight,
            color: local.accentColor,
            fontWeight: 700,
            fontSize: "0.78rem",
            padding: "4px 12px",
            borderRadius: 20,
            border: `1px solid ${local.accentColor}33`
          }}>
            Status Badge
          </span>
        </div>
      </div>
    </div>
  );
}
