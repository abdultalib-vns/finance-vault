import { useState } from "react";
import { PopupAd } from "../adminTypes";
import { savePopupAds } from "../adminStorage";
import { generateId } from "../../lib/utils";

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

const TYPE_ICONS: Record<string, string> = {
  info: "ℹ️",
  promo: "🎁",
  warning: "⚠️",
};

const TYPE_COLORS: Record<string, string> = {
  info: "#0ea5e9",
  promo: "#7c3aed",
  warning: "#d97706",
};

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
          <h2 className="admin-section-title">Popup Ads & Banners</h2>
          <p className="admin-section-desc">
            Create popup notifications shown to users. Only one active ad shows at a time (first match wins).
          </p>
        </div>
        <button className="admin-btn-primary admin-btn-sm" onClick={openAdd}>
          + New Ad
        </button>
      </div>

      {activeAds.length > 0 && (
        <div className="admin-ads-active-notice">
          <span className="admin-pulse active" />
          <span>{activeAds.length} active ad{activeAds.length > 1 ? "s" : ""} — users will see the first active one</span>
        </div>
      )}

      {ads.length === 0 ? (
        <div className="admin-empty">
          <span className="admin-empty-icon">📢</span>
          <p>No popup ads yet. Create one to show announcements or promotions to users.</p>
        </div>
      ) : (
        <div className="admin-ads-list">
          {ads.map((ad) => (
            <div key={ad.id} className={`admin-ad-item ${!ad.active ? "admin-ad-inactive" : ""}`}>
              <div className="admin-ad-stripe" style={{ background: TYPE_COLORS[ad.type] }} />
              <div className="admin-ad-content">
                <div className="admin-ad-top">
                  <div className="admin-ad-title-row">
                    <span className="admin-ad-type-icon">{TYPE_ICONS[ad.type]}</span>
                    <span className="admin-ad-title">{ad.title}</span>
                    <span
                      className="admin-badge"
                      style={{ background: TYPE_COLORS[ad.type] + "22", color: TYPE_COLORS[ad.type] }}
                    >
                      {ad.type}
                    </span>
                  </div>
                  <div className="admin-ad-controls">
                    <button
                      className={`admin-toggle ${ad.active ? "active" : ""}`}
                      onClick={() => toggleActive(ad.id)}
                    >
                      {ad.active ? "● Showing" : "○ Hidden"}
                    </button>
                    <button className="admin-btn-icon" onClick={() => openEdit(ad)}>✏️</button>
                    <button className="admin-btn-icon admin-btn-danger" onClick={() => setDeleteId(ad.id)}>🗑️</button>
                  </div>
                </div>
                <p className="admin-ad-message">{ad.message}</p>
                <div className="admin-ad-meta">
                  {ad.ctaText && <span className="admin-ad-cta">CTA: "{ad.ctaText}"</span>}
                  {ad.startDate && <span className="admin-ad-date">From: {ad.startDate}</span>}
                  {ad.endDate && <span className="admin-ad-date">Until: {ad.endDate}</span>}
                  {!ad.startDate && !ad.endDate && <span className="admin-ad-date">No date restriction</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview of what user sees */}
      {activeAds.length > 0 && (
        <div className="admin-theme-block">
          <h3 className="admin-analytics-subtitle">User Preview</h3>
          <p className="admin-theme-hint">This is how the first active ad looks to users.</p>
          <div className="admin-popup-preview">
            <PopupPreview ad={activeAds[0]} />
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editId ? "Edit Ad" : "New Popup Ad"}</h3>
              <button className="admin-modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-grid">
                <div className="admin-form-field admin-form-field-full">
                  <label className="admin-label">Title *</label>
                  <input className="admin-input" placeholder="e.g. Limited Time Offer!" value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="admin-form-field admin-form-field-full">
                  <label className="admin-label">Message *</label>
                  <textarea className="admin-input admin-textarea" rows={3}
                    placeholder="Describe the offer or announcement..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })} />
                </div>
                <div className="admin-form-field">
                  <label className="admin-label">Type</label>
                  <select className="admin-input" value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as PopupAd["type"] })}>
                    <option value="promo">🎁 Promo</option>
                    <option value="info">ℹ️ Info</option>
                    <option value="warning">⚠️ Warning</option>
                  </select>
                </div>
                <div className="admin-form-field">
                  <label className="admin-label">CTA Button Text</label>
                  <input className="admin-input" placeholder="e.g. Learn More, Apply Now" value={form.ctaText}
                    onChange={(e) => setForm({ ...form, ctaText: e.target.value })} />
                </div>
                <div className="admin-form-field admin-form-field-full">
                  <label className="admin-label">CTA URL (optional)</label>
                  <input className="admin-input" placeholder="https://..." value={form.ctaUrl}
                    onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })} />
                </div>
                <div className="admin-form-field">
                  <label className="admin-label">Start Date (optional)</label>
                  <input type="date" className="admin-input" value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="admin-form-field">
                  <label className="admin-label">End Date (optional)</label>
                  <input type="date" className="admin-input" value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </div>
                <div className="admin-form-field admin-form-field-full admin-form-checks">
                  <label className="admin-check-label">
                    <input type="checkbox" checked={form.active}
                      onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                    Active (show to users)
                  </label>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="admin-btn-primary" onClick={handleSave}
                disabled={!form.title.trim() || !form.message.trim()}>
                {editId ? "Save Changes" : "Create Ad"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="admin-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="admin-modal admin-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Delete Popup Ad?</h3>
              <button className="admin-modal-close" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <p>This will permanently remove the popup ad.</p>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="admin-btn-danger" onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PopupPreview({ ad }: { ad: PopupAd }) {
  const color = TYPE_COLORS[ad.type];
  return (
    <div className="popup-ad-preview-wrap">
      <div className="popup-ad" style={{ "--ad-color": color } as React.CSSProperties}>
        <div className="popup-ad-header">
          <span className="popup-ad-icon">{TYPE_ICONS[ad.type]}</span>
          <span className="popup-ad-title">{ad.title}</span>
          <button className="popup-ad-close">✕</button>
        </div>
        <p className="popup-ad-message">{ad.message}</p>
        {ad.ctaText && (
          <div className="popup-ad-footer">
            <button className="popup-ad-cta" style={{ background: color }}>{ad.ctaText}</button>
            <button className="popup-ad-dismiss">Dismiss</button>
          </div>
        )}
      </div>
    </div>
  );
}
