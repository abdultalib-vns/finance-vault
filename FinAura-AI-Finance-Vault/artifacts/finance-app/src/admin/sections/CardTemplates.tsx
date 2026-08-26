import { useState } from "react";
import { CardTemplate } from "../adminTypes";
import { saveCardTemplates } from "../adminStorage";
import { generateId } from "../../lib/utils";

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

  function handleDelete(id: string) {
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
          <h2 className="admin-section-title">Card Templates</h2>
          <p className="admin-section-desc">
            Manage cards users can apply for. Active cards appear in the "Apply for Card" section.
          </p>
        </div>
        <button className="admin-btn-primary admin-btn-sm" onClick={openAdd}>
          + Add Card
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="admin-empty">
          <span className="admin-empty-icon">💳</span>
          <p>No card templates yet. Add one to show offers to users.</p>
        </div>
      ) : (
        <div className="admin-card-grid">
          {templates.map((t) => (
            <div key={t.id} className={`admin-card-item ${!t.active ? "admin-card-inactive" : ""}`}>
              <div className="admin-card-visual" style={{ background: t.color }}>
                {t.imageUrl && <img src={t.imageUrl} alt="" className="admin-card-visual-img" />}
                <span className="admin-card-bank">{t.bank}</span>
                <span className="admin-card-name">{t.name}</span>
                <span className="admin-card-type-badge">{t.cardType.toUpperCase()}</span>
              </div>
              <div className="admin-card-meta">
                <div className="admin-card-row">
                  <span className="admin-card-fee">Annual Fee: {t.annualFee}</span>
                  {t.featured && <span className="admin-badge admin-badge-featured">Featured</span>}
                </div>
                <p className="admin-card-benefits">{t.benefits}</p>
                <div className="admin-card-actions">
                  <button
                    className={`admin-toggle ${t.active ? "active" : ""}`}
                    onClick={() => toggleActive(t.id)}
                    title={t.active ? "Deactivate" : "Activate"}
                  >
                    {t.active ? "● Active" : "○ Hidden"}
                  </button>
                  <button
                    className={`admin-toggle ${t.featured ? "featured" : ""}`}
                    onClick={() => toggleFeatured(t.id)}
                    title="Toggle featured"
                  >
                    {t.featured ? "★ Featured" : "☆ Feature"}
                  </button>
                  <button className="admin-btn-icon" onClick={() => openEdit(t)} title="Edit">✏️</button>
                  <button className="admin-btn-icon admin-btn-danger" onClick={() => setDeleteId(t.id)} title="Delete">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editId ? "Edit Card Template" : "Add Card Template"}</h3>
              <button className="admin-modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-grid">
                <div className="admin-form-field">
                  <label className="admin-label">Card Name *</label>
                  <input className="admin-input" placeholder="e.g. HDFC Millennia" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="admin-form-field">
                  <label className="admin-label">Bank / Issuer *</label>
                  <input className="admin-input" placeholder="e.g. HDFC Bank" value={form.bank}
                    onChange={(e) => setForm({ ...form, bank: e.target.value })} />
                </div>
                <div className="admin-form-field">
                  <label className="admin-label">Card Type</label>
                  <select className="admin-input" value={form.cardType}
                    onChange={(e) => setForm({ ...form, cardType: e.target.value as CardTemplate["cardType"] })}>
                    <option value="credit">Credit Card</option>
                    <option value="debit">Debit Card</option>
                    <option value="prepaid">Prepaid Card</option>
                    <option value="paylater">Pay Later</option>
                  </select>
                </div>
                <div className="admin-form-field">
                  <label className="admin-label">Annual Fee</label>
                  <input className="admin-input" placeholder="e.g. Free / ₹500 + GST" value={form.annualFee}
                    onChange={(e) => setForm({ ...form, annualFee: e.target.value })} />
                </div>
                <div className="admin-form-field admin-form-field-full">
                  <label className="admin-label">Benefits</label>
                  <textarea className="admin-input admin-textarea" placeholder="Key benefits, cashback offers, rewards..."
                    value={form.benefits}
                    onChange={(e) => setForm({ ...form, benefits: e.target.value })} rows={3} />
                </div>
                <div className="admin-form-field">
                  <label className="admin-label">Min. Salary (optional)</label>
                  <input className="admin-input" placeholder="e.g. ₹25,000/month" value={form.minSalary}
                    onChange={(e) => setForm({ ...form, minSalary: e.target.value })} />
                </div>
                <div className="admin-form-field">
                  <label className="admin-label">Apply URL (optional)</label>
                  <input className="admin-input" placeholder="https://..." value={form.applyUrl}
                    onChange={(e) => setForm({ ...form, applyUrl: e.target.value })} />
                </div>
                <div className="admin-form-field admin-form-field-full">
                  <label className="admin-label">Card Image (optional)</label>
                  <p className="admin-theme-hint" style={{ marginBottom: 6, fontSize: 11 }}>
                    Paste a URL or upload an image file (stored as base64).
                  </p>
                  <input className="admin-input" placeholder="https://... or upload below" value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                    <label className="admin-btn-ghost" style={{ cursor: "pointer", padding: "6px 12px", fontSize: 12 }}>
                      📁 Upload Image
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 500_000) { alert("Image too large (max 500KB)"); return; }
                        const reader = new FileReader();
                        reader.onload = () => setForm({ ...form, imageUrl: reader.result as string });
                        reader.readAsDataURL(file);
                      }} />
                    </label>
                    {form.imageUrl && (
                      <button className="admin-btn-icon admin-btn-danger" onClick={() => setForm({ ...form, imageUrl: "" })} title="Remove image">🗑️</button>
                    )}
                  </div>
                  {form.imageUrl && (
                    <div className="admin-card-image-preview" style={{ marginTop: 8 }}>
                      <img src={form.imageUrl} alt="Card preview" />
                    </div>
                  )}
                </div>
                <div className="admin-form-field admin-form-field-full">
                  <label className="admin-label">Card Color</label>
                  <div className="admin-color-picker">
                    {CARD_COLORS.map((c) => (
                      <button
                        key={c}
                        className={`admin-color-swatch ${form.color === c ? "selected" : ""}`}
                        style={{ background: c }}
                        onClick={() => setForm({ ...form, color: c })}
                        title={c}
                      />
                    ))}
                    <input type="color" className="admin-color-input" value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })} title="Custom color" />
                  </div>
                </div>
                <div className="admin-form-field admin-form-field-full admin-form-checks">
                  <label className="admin-check-label">
                    <input type="checkbox" checked={form.active}
                      onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                    Active (visible to users)
                  </label>
                  <label className="admin-check-label">
                    <input type="checkbox" checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                    Featured (highlighted card)
                  </label>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="admin-btn-primary" onClick={handleSave}
                disabled={!form.name.trim() || !form.bank.trim()}>
                {editId ? "Save Changes" : "Add Card"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="admin-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="admin-modal admin-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Delete Card Template?</h3>
              <button className="admin-modal-close" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <p>This will permanently remove the card template. This action cannot be undone.</p>
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
