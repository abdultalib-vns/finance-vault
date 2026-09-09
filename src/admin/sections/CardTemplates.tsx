import { customAlert, customConfirm } from "../../components/CustomAlert";
import { useState } from "react";
import { CardTemplate } from "../adminTypes";
import { saveCardTemplates } from "../adminStorage";
import { generateId } from "../../lib/utils";
import { 
  CreditCard, Plus, Edit2, Trash2, Star, 
  Upload, X, Check, Image as ImageIcon, AlertTriangle 
} from "lucide-react";

interface Props {
  templates: CardTemplate[];
  onUpdate: (templates: CardTemplate[]) => void;
}

const CARD_COLORS = [
  "#2563eb", "#7c3aed", "#059669", "#dc2626",
  "#d97706", "#0891b2", "#db2777", "#1e293b",
];

const EMPTY: Omit<CardTemplate, "id" | "createdAt"> = {
  name: "",
  bank: "",
  cardType: "credit",
  annualFee: "Free",
  benefits: "",
  minSalary: "",
  applyUrl: "",
  imageUrl: "",
  color: "#2563eb",
  shortDescription: "",
  tags: "",
  awesomeFeatures: "",
  eligibilityCriteria: "",
  feesAndCharges: "",
  importantInformation: "",
  documentsNeeded: "",
  stepsToApply: "",
  featured: false,
  active: true,
};

export default function CardTemplatesSection({ templates, onUpdate }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function openAdd() {
    setForm(EMPTY);
    setEditId(null);
    setShowForm(true);
  }

  function openEdit(t: CardTemplate) {
    setForm({
      name: t.name,
      bank: t.bank,
      cardType: t.cardType,
      annualFee: t.annualFee,
      benefits: t.benefits,
      minSalary: t.minSalary ?? "",
      applyUrl: t.applyUrl ?? "",
      imageUrl: t.imageUrl ?? "",
      color: t.color,
      shortDescription: t.shortDescription ?? "",
      tags: t.tags ?? "",
      awesomeFeatures: t.awesomeFeatures ?? "",
      eligibilityCriteria: t.eligibilityCriteria ?? "",
      feesAndCharges: t.feesAndCharges ?? "",
      importantInformation: t.importantInformation ?? "",
      documentsNeeded: t.documentsNeeded ?? "",
      stepsToApply: t.stepsToApply ?? "",
      featured: t.featured,
      active: t.active,
    });
    setEditId(t.id);
    setShowForm(true);
  }

  function handleSave() {
    if (!form.name.trim() || !form.bank.trim()) return;
    let updated: CardTemplate[];
    if (editId) {
      updated = templates.map((t) =>
        t.id === editId ? { ...t, ...form } : t
      );
    } else {
      updated = [
        ...templates,
        { id: generateId(), createdAt: Date.now(), ...form },
      ];
    }
    saveCardTemplates(updated);
    onUpdate(updated);
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    const updated = templates.filter((t) => t.id !== id);
    saveCardTemplates(updated);
    onUpdate(updated);
    setDeleteId(null);
  }

  function toggleActive(id: string) {
    const updated = templates.map((t) =>
      t.id === id ? { ...t, active: !t.active } : t
    );
    saveCardTemplates(updated);
    onUpdate(updated);
  }

  function toggleFeatured(id: string) {
    const updated = templates.map((t) =>
      t.id === id ? { ...t, featured: !t.featured } : t
    );
    saveCardTemplates(updated);
    onUpdate(updated);
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CreditCard size={22} className="admin-title-icon" />
            <span>Card Templates</span>
          </h2>
          <p className="admin-section-desc">
            Manage recommended and partnered cards available in the user discovery and marketplace catalog.
          </p>
        </div>
        <button 
          type="button"
          className="admin-btn admin-btn-primary" 
          onClick={openAdd}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px" }}
        >
          <Plus size={16} />
          <span>Add Card Template</span>
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="admin-empty">
          <div style={{ color: "var(--text3)", marginBottom: 12 }}>
            <CreditCard size={42} />
          </div>
          <p>No card templates yet. Add one to show offers to users.</p>
        </div>
      ) : (
        <div className="admin-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {templates.map((t) => (
            <div key={t.id} className={`admin-card-item ${!t.active ? "admin-card-inactive" : ""}`} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div className="admin-card-visual" style={{ background: t.color, padding: 18, position: "relative", minHeight: 120, display: "flex", flexDirection: "column", justifyContent: "space-between", color: "#fff" }}>
                {t.imageUrl && <img src={t.imageUrl} alt="" className="admin-card-visual-img" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.35 }} />}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 1 }}>
                  <span className="admin-card-bank" style={{ fontSize: "0.85rem", fontWeight: 600, opacity: 0.9 }}>{t.bank}</span>
                  <span className="admin-card-type-badge" style={{ background: "rgba(0,0,0,0.3)", padding: "2px 8px", borderRadius: 6, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em" }}>
                    {t.cardType.toUpperCase()}
                  </span>
                </div>
                <div style={{ zIndex: 1 }}>
                  <span className="admin-card-name" style={{ fontSize: "1.1rem", fontWeight: 700, display: "block" }}>{t.name}</span>
                </div>
              </div>

              <div className="admin-card-meta" style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div className="admin-card-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span className="admin-card-fee" style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text2)" }}>
                      Fee: {t.annualFee}
                    </span>
                    {t.featured && (
                      <span className="admin-badge admin-badge-featured" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", padding: "2px 8px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 }}>
                        <Star size={11} fill="#f59e0b" />
                        <span>Featured</span>
                      </span>
                    )}
                  </div>
                  <p className="admin-card-benefits" style={{ fontSize: "0.85rem", color: "var(--text3)", margin: "0 0 14px 0", lineHeight: 1.4 }}>
                    {t.benefits}
                  </p>
                </div>

                <div className="admin-card-actions" style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                  <button
                    type="button"
                    className={`admin-toggle ${t.active ? "active" : ""}`}
                    onClick={() => toggleActive(t.id)}
                    title={t.active ? "Deactivate" : "Activate"}
                    style={{ padding: "4px 10px", borderRadius: 16, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", border: "none", background: t.active ? "#10b981" : "var(--surface2)", color: t.active ? "#fff" : "var(--text2)" }}
                  >
                    {t.active ? "Active" : "Hidden"}
                  </button>
                  <button
                    type="button"
                    className={`admin-toggle ${t.featured ? "featured" : ""}`}
                    onClick={() => toggleFeatured(t.id)}
                    title="Toggle featured"
                    style={{ padding: "4px 10px", borderRadius: 16, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", border: "1px solid var(--border)", background: t.featured ? "rgba(245, 158, 11, 0.15)" : "transparent", color: t.featured ? "#f59e0b" : "var(--text2)", display: "inline-flex", alignItems: "center", gap: 4 }}
                  >
                    <Star size={12} fill={t.featured ? "#f59e0b" : "none"} />
                    <span>{t.featured ? "Featured" : "Feature"}</span>
                  </button>
                  <button 
                    type="button"
                    className="admin-btn-icon" 
                    onClick={() => openEdit(t)} 
                    title="Edit"
                    style={{ padding: 6, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", color: "var(--text)", marginLeft: "auto" }}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button 
                    type="button"
                    className="admin-btn-icon admin-btn-danger" 
                    onClick={() => setDeleteId(t.id)} 
                    title="Delete"
                    style={{ padding: 6, background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: 8, cursor: "pointer", color: "#ef4444" }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="admin-modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="admin-card" style={{ maxWidth: 640, width: "92%", maxHeight: "90vh", overflowY: "auto", margin: "auto", position: "relative", zIndex: 1100 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 14, marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--text)" }}>
                {editId ? "Edit Card Template" : "Add New Card Template"}
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="admin-form-field">
                  <label className="admin-label">Card Name *</label>
                  <input className="admin-input" placeholder="e.g. HDFC Millennia" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: "100%" }} />
                </div>
                <div className="admin-form-field">
                  <label className="admin-label">Bank / Issuer *</label>
                  <input className="admin-input" placeholder="e.g. HDFC Bank" value={form.bank}
                    onChange={(e) => setForm({ ...form, bank: e.target.value })} style={{ width: "100%" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="admin-form-field">
                  <label className="admin-label">Card Type</label>
                  <select className="admin-input" value={form.cardType}
                    onChange={(e) => setForm({ ...form, cardType: e.target.value as CardTemplate["cardType"] })} style={{ width: "100%" }}>
                    <option value="credit">Credit Card</option>
                    <option value="debit">Debit Card</option>
                    <option value="prepaid">Prepaid Card</option>
                    <option value="paylater">Pay Later</option>
                  </select>
                </div>
                <div className="admin-form-field">
                  <label className="admin-label">Annual Fee</label>
                  <input className="admin-input" placeholder="e.g. Free / ₹500 + GST" value={form.annualFee}
                    onChange={(e) => setForm({ ...form, annualFee: e.target.value })} style={{ width: "100%" }} />
                </div>
              </div>

              <div className="admin-form-field">
                <label className="admin-label">Key Benefits</label>
                <textarea className="admin-input admin-textarea" placeholder="Key benefits, cashback offers, rewards..."
                  value={form.benefits}
                  onChange={(e) => setForm({ ...form, benefits: e.target.value })} rows={2} style={{ width: "100%" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="admin-form-field">
                  <label className="admin-label">Short Description</label>
                  <input className="admin-input" placeholder="e.g. Best for everyday cashback" value={form.shortDescription}
                    onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} style={{ width: "100%" }} />
                </div>
                <div className="admin-form-field">
                  <label className="admin-label">Tags (comma separated)</label>
                  <input className="admin-input" placeholder="e.g. Rewards, Lounge" value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })} style={{ width: "100%" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="admin-form-field">
                  <label className="admin-label">Min. Salary (optional)</label>
                  <input className="admin-input" placeholder="e.g. ₹25,000/month" value={form.minSalary}
                    onChange={(e) => setForm({ ...form, minSalary: e.target.value })} style={{ width: "100%" }} />
                </div>
                <div className="admin-form-field">
                  <label className="admin-label">Apply URL (optional)</label>
                  <input className="admin-input" placeholder="https://..." value={form.applyUrl}
                    onChange={(e) => setForm({ ...form, applyUrl: e.target.value })} style={{ width: "100%" }} />
                </div>
              </div>

              {/* Upload image */}
              <div className="admin-form-field">
                <label className="admin-label">Card Image (optional)</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input className="admin-input" placeholder="https://... or upload image" value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} style={{ flex: 1 }} />
                  <label className="admin-btn-ghost" style={{ cursor: "pointer", padding: "8px 14px", display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.82rem" }}>
                    <Upload size={14} />
                    <span>Upload</span>
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 500_000) { customAlert("Image too large (max 500KB)"); return; }
                      const reader = new FileReader();
                      reader.onload = () => setForm({ ...form, imageUrl: reader.result as string });
                      reader.readAsDataURL(file);
                    }} />
                  </label>
                  {form.imageUrl && (
                    <button type="button" className="admin-btn-icon admin-btn-danger" onClick={() => setForm({ ...form, imageUrl: "" })} title="Clear image">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Card Color */}
              <div className="admin-form-field">
                <label className="admin-label">Card Accent Color</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  {CARD_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        background: c,
                        border: form.color === c ? "2px solid #fff" : "1px solid transparent",
                        boxShadow: form.color === c ? "0 0 0 2px var(--primary)" : "none",
                        cursor: "pointer"
                      }}
                      onClick={() => setForm({ ...form, color: c })}
                      title={c}
                    />
                  ))}
                  <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)", cursor: "pointer" }} />
                </div>
              </div>

              <div style={{ display: "flex", gap: 20 }}>
                <label className="admin-checkbox" style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} style={{ width: 17, height: 17 }} />
                  <span style={{ fontWeight: 600 }}>Active (live in catalog)</span>
                </label>
                <label className="admin-checkbox" style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} style={{ width: 17, height: 17 }} />
                  <span style={{ fontWeight: 600 }}>Featured Card</span>
                </label>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
              <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button 
                type="button" 
                className="admin-btn admin-btn-primary" 
                onClick={handleSave}
                disabled={!form.name.trim() || !form.bank.trim()}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Check size={16} />
                <span>{editId ? "Save Changes" : "Add Card"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="admin-modal-backdrop" onClick={() => setDeleteId(null)}>
          <div className="admin-card" style={{ maxWidth: 400, width: "90%", margin: "auto", position: "relative", zIndex: 1100 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <AlertTriangle size={20} color="#ef4444" />
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>Delete Card Template?</h3>
            </div>
            <p style={{ color: "var(--text2)", fontSize: "0.9rem", margin: "0 0 16px 0" }}>
              Are you sure you want to delete this card template? This action cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button type="button" className="admin-btn admin-btn-danger" onClick={() => handleDelete(deleteId)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
