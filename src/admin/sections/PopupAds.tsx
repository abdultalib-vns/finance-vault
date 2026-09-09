import React, { useState } from "react";
import { PopupAd } from "../adminTypes";
import { savePopupAds } from "../adminStorage";
import { generateId } from "../../lib/utils";
import { 
  Megaphone, Plus, Edit2, Trash2, Info, Gift, 
  AlertTriangle, X, Check, Eye, ExternalLink, Calendar 
} from "lucide-react";

interface Props {
  ads: PopupAd[];
  onUpdate: (ads: PopupAd[]) => void;
}

const EMPTY: Omit<PopupAd, "id" | "createdAt"> = {
  title: "",
  message: "",
  ctaText: "Learn More",
  ctaUrl: "",
  type: "promo",
  active: true,
  startDate: "",
  endDate: "",
  allowDoNotShow: true,
};

const TYPE_COLORS: Record<string, string> = {
  info: "#0ea5e9",
  promo: "#7c3aed",
  warning: "#d97706",
};

function renderTypeIcon(type: string, size = 16) {
  if (type === "info") return <Info size={size} color="#0ea5e9" />;
  if (type === "warning") return <AlertTriangle size={size} color="#d97706" />;
  return <Gift size={size} color="#7c3aed" />;
}

export default function PopupAdsSection({ ads, onUpdate }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function openAdd() {
    setForm(EMPTY);
    setEditId(null);
    setShowForm(true);
  }

  function openEdit(ad: PopupAd) {
    setForm({
      title: ad.title,
      message: ad.message,
      ctaText: ad.ctaText,
      ctaUrl: ad.ctaUrl ?? "",
      type: ad.type,
      active: ad.active,
      startDate: ad.startDate ?? "",
      endDate: ad.endDate ?? "",
      allowDoNotShow: ad.allowDoNotShow ?? true,
    });
    setEditId(ad.id);
    setShowForm(true);
  }

  function handleSave() {
    if (!form.title.trim() || !form.message.trim()) return;
    let updated: PopupAd[];
    if (editId) {
      updated = ads.map((a) => (a.id === editId ? { ...a, ...form } : a));
    } else {
      updated = [...ads, { id: generateId(), createdAt: Date.now(), ...form }];
    }
    savePopupAds(updated);
    onUpdate(updated);
    setShowForm(false);
  }

  function handleDelete(id: string) {
    const updated = ads.filter((a) => a.id !== id);
    savePopupAds(updated);
    onUpdate(updated);
    setDeleteId(null);
  }

  function toggleActive(id: string) {
    const updated = ads.map((a) => (a.id === id ? { ...a, active: !a.active } : a));
    savePopupAds(updated);
    onUpdate(updated);
  }

  const activeAds = ads.filter((a) => a.active);

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Megaphone size={22} className="admin-title-icon" />
            <span>Popup Ads &amp; Banners</span>
          </h2>
          <p className="admin-section-desc">
            Configure broadcast modal announcements shown to users. Only one active ad displays at a time.
          </p>
        </div>
        <button 
          type="button"
          className="admin-btn admin-btn-primary" 
          onClick={openAdd}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px" }}
        >
          <Plus size={16} />
          <span>New Popup Ad</span>
        </button>
      </div>

      {activeAds.length > 0 && (
        <div className="admin-ads-active-notice" style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", color: "#10b981", padding: "10px 16px", borderRadius: 12, display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", fontWeight: 600 }}>
          <span className="admin-pulse active" />
          <span>{activeAds.length} active ad{activeAds.length > 1 ? "s" : ""} — users will see the first active one</span>
        </div>
      )}

      {ads.length === 0 ? (
        <div className="admin-empty">
          <div style={{ color: "var(--text3)", marginBottom: 12 }}>
            <Megaphone size={42} />
          </div>
          <p>No popup ads yet. Create one to broadcast announcements or promotions.</p>
        </div>
      ) : (
        <div className="admin-ads-list" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {ads.map((ad) => (
            <div key={ad.id} className={`admin-ad-item ${!ad.active ? "admin-ad-inactive" : ""}`} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", display: "flex" }}>
              <div className="admin-ad-stripe" style={{ width: 6, background: TYPE_COLORS[ad.type], flexShrink: 0 }} />
              <div className="admin-ad-content" style={{ padding: "16px 20px", flex: 1 }}>
                <div className="admin-ad-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                  <div className="admin-ad-title-row" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="admin-ad-type-icon">{renderTypeIcon(ad.type, 18)}</span>
                    <span className="admin-ad-title" style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)" }}>{ad.title}</span>
                    <span
                      className="admin-badge"
                      style={{ background: TYPE_COLORS[ad.type] + "22", color: TYPE_COLORS[ad.type], textTransform: "capitalize", fontWeight: 600, padding: "2px 8px", borderRadius: 6, fontSize: "0.75rem" }}
                    >
                      {ad.type}
                    </span>
                  </div>
                  <div className="admin-ad-controls" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      type="button"
                      className={`admin-toggle ${ad.active ? "active" : ""}`}
                      onClick={() => toggleActive(ad.id)}
                      style={{ padding: "4px 12px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", border: "none", background: ad.active ? "#10b981" : "var(--surface2)", color: ad.active ? "#fff" : "var(--text2)" }}
                    >
                      {ad.active ? "Showing" : "Hidden"}
                    </button>
                    <button 
                      type="button"
                      className="admin-btn-icon" 
                      onClick={() => openEdit(ad)}
                      title="Edit Ad"
                      style={{ padding: 6, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", color: "var(--text)" }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      type="button"
                      className="admin-btn-icon admin-btn-danger" 
                      onClick={() => setDeleteId(ad.id)}
                      title="Delete Ad"
                      style={{ padding: 6, background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: 8, cursor: "pointer", color: "#ef4444" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className="admin-ad-message" style={{ margin: "10px 0", color: "var(--text2)", fontSize: "0.92rem", lineHeight: 1.5 }}>
                  {ad.message}
                </p>

                <div className="admin-ad-meta" style={{ display: "flex", gap: 14, fontSize: "0.8rem", color: "var(--text3)", flexWrap: "wrap" }}>
                  {ad.ctaText && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <ExternalLink size={13} />
                      CTA: "{ad.ctaText}"
                    </span>
                  )}
                  {ad.startDate && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Calendar size={13} />
                      From: {ad.startDate}
                    </span>
                  )}
                  {ad.endDate && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Calendar size={13} />
                      Until: {ad.endDate}
                    </span>
                  )}
                  {!ad.startDate && !ad.endDate && <span>Always active while enabled</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview of active ad */}
      {activeAds.length > 0 && (
        <div className="admin-card" style={{ marginTop: 24 }}>
          <h3 className="admin-card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Eye size={18} color="var(--primary)" />
            <span>User Viewport Preview</span>
          </h3>
          <p className="admin-card-desc">Simulated rendering of the first active popup banner:</p>
          <div style={{ maxWidth: 420, margin: "16px auto", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 18, padding: 20, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {renderTypeIcon(activeAds[0].type, 18)}
                <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text)" }}>{activeAds[0].title}</span>
              </div>
              <X size={16} color="var(--text3)" />
            </div>
            <p style={{ margin: "0 0 16px 0", color: "var(--text2)", fontSize: "0.9rem", lineHeight: 1.5 }}>
              {activeAds[0].message}
            </p>
            {activeAds[0].ctaText && (
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  style={{ flex: 1, padding: "9px 16px", borderRadius: 10, border: "none", background: TYPE_COLORS[activeAds[0].type], color: "#fff", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
                >
                  {activeAds[0].ctaText}
                </button>
                <button
                  type="button"
                  style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--text2)", fontSize: "0.85rem", cursor: "pointer" }}
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="admin-modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="admin-card" style={{ maxWidth: 540, width: "90%", margin: "auto", position: "relative", zIndex: 1100 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 14, marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>
                {editId ? "Edit Popup Ad" : "Create New Popup Ad"}
              </h3>
              <button 
                type="button" 
                className="admin-header-icon-btn" 
                onClick={() => setShowForm(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="admin-form-field">
                <label className="admin-label">Title *</label>
                <input 
                  className="admin-input" 
                  placeholder="e.g. Special Offer!" 
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} 
                  style={{ width: "100%" }}
                />
              </div>

              <div className="admin-form-field">
                <label className="admin-label">Message *</label>
                <textarea 
                  className="admin-input" 
                  rows={3}
                  placeholder="Describe the announcement..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })} 
                  style={{ width: "100%", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="admin-form-field">
                  <label className="admin-label">Type</label>
                  <select 
                    className="admin-input" 
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as PopupAd["type"] })}
                    style={{ width: "100%" }}
                  >
                    <option value="promo">Promo</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                  </select>
                </div>

                <div className="admin-form-field">
                  <label className="admin-label">CTA Button Text</label>
                  <input 
                    className="admin-input" 
                    placeholder="e.g. Learn More" 
                    value={form.ctaText}
                    onChange={(e) => setForm({ ...form, ctaText: e.target.value })} 
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div className="admin-form-field">
                <label className="admin-label">CTA URL (optional)</label>
                <input 
                  className="admin-input" 
                  placeholder="https://..." 
                  value={form.ctaUrl}
                  onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })} 
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="admin-form-field">
                  <label className="admin-label">Start Date (optional)</label>
                  <input 
                    type="date" 
                    className="admin-input" 
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })} 
                    style={{ width: "100%" }}
                  />
                </div>

                <div className="admin-form-field">
                  <label className="admin-label">End Date (optional)</label>
                  <input 
                    type="date" 
                    className="admin-input" 
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })} 
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <label className="admin-checkbox" style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer", marginTop: 4 }}>
                <input 
                  type="checkbox" 
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })} 
                  style={{ width: 18, height: 18 }}
                />
                <span style={{ fontWeight: 600 }}>Active (broadcast to users)</span>
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button 
                type="button"
                className="admin-btn admin-btn-secondary" 
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="admin-btn admin-btn-primary" 
                onClick={handleSave}
                disabled={!form.title.trim() || !form.message.trim()}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Check size={16} />
                <span>{editId ? "Save Changes" : "Create Ad"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="admin-modal-backdrop" onClick={() => setDeleteId(null)}>
          <div className="admin-card" style={{ maxWidth: 400, width: "90%", margin: "auto", position: "relative", zIndex: 1100 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <AlertTriangle size={20} color="#ef4444" />
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>Delete Popup Ad?</h3>
            </div>
            <p style={{ color: "var(--text2)", fontSize: "0.9rem", margin: "0 0 16px 0" }}>
              Are you sure you want to delete this ad? This action cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button type="button" className="admin-btn admin-btn-danger" onClick={() => handleDelete(deleteId)}>
                Delete Ad
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
