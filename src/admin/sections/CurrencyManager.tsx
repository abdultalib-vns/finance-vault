import { useState, useEffect } from "react";
import { CustomCurrency } from "../adminTypes";
import { loadCustomCurrencies, saveCustomCurrencies } from "../adminStorage";
// We import the default currencies as a fallback/starting point
import { CURRENCIES as DEFAULT_CURRENCIES } from "../../lib/currency";

export default function CurrencyManagerSection() {
  const [currencies, setCurrencies] = useState<CustomCurrency[]>([]);
  const [saved, setSaved] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [code, setCode] = useState("");
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const loaded = loadCustomCurrencies();
    if (loaded.length > 0) {
      setCurrencies(loaded);
    } else {
      // Initialize with default if empty
      setCurrencies(DEFAULT_CURRENCIES.map(c => ({ ...c, active: true })));
    }
  }, []);

  function handleSaveAll() {
    saveCustomCurrencies(currencies);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleAdd() {
    if (!code || !symbol || !name) {
      alert("Please fill all fields.");
      return;
    }
    if (currencies.some(c => c.code === code.toUpperCase() && c.code !== editingId)) {
      alert("Currency code already exists.");
      return;
    }

    if (editingId) {
      setCurrencies(prev => prev.map(c => c.code === editingId ? { code: code.toUpperCase(), symbol, name, active: c.active } : c));
    } else {
      setCurrencies(prev => [...prev, { code: code.toUpperCase(), symbol, name, active: true }]);
    }

    // Reset form
    setCode("");
    setSymbol("");
    setName("");
    setEditingId(null);
  }

  function handleEdit(c: CustomCurrency) {
    setCode(c.code);
    setSymbol(c.symbol);
    setName(c.name);
    setEditingId(c.code);
  }

  function handleDelete(code: string) {
    if (confirm(`Remove currency ${code}?`)) {
      setCurrencies(prev => prev.filter(c => c.code !== code));
    }
  }

  function toggleActive(code: string) {
    setCurrencies(prev => prev.map(c => c.code === code ? { ...c, active: !c.active } : c));
  }

  return (
    <div className="admin-section-content">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">💱 Currency Manager</h2>
          <p className="admin-section-desc">
            Manage the currencies available for users to select during onboarding and in settings.
          </p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={handleSaveAll} style={{ padding: '8px 20px', fontSize: '0.95rem' }}>
          {saved ? "✅ Saved" : "💾 Save Changes"}
        </button>
      </div>

      {/* Add / Edit Form */}
      <div className="admin-card">
        <h3 className="admin-card-title">{editingId ? `📝 Edit Currency (${editingId})` : "➕ Add New Currency"}</h3>
        <p className="admin-card-desc">
          {editingId ? "Update the details for the selected currency below." : "Enter a 3-letter currency code, symbol, and full name to add a new option for your users."}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 16, marginBottom: 20 }}>
          <div className="admin-form-row" style={{ marginBottom: 0 }}>
            <label className="admin-label">Code (e.g. USD)</label>
            <input type="text" className="admin-input" style={{ fontSize: '1rem', fontWeight: 600 }} value={code} onChange={e => setCode(e.target.value)} maxLength={3} />
          </div>
          <div className="admin-form-row" style={{ marginBottom: 0 }}>
            <label className="admin-label">Symbol (e.g. $)</label>
            <input type="text" className="admin-input" style={{ fontSize: '1rem', fontWeight: 600 }} value={symbol} onChange={e => setSymbol(e.target.value)} maxLength={5} />
          </div>
          <div className="admin-form-row" style={{ marginBottom: 0 }}>
            <label className="admin-label">Name (e.g. US Dollar)</label>
            <input type="text" className="admin-input" style={{ fontSize: '1rem' }} value={name} onChange={e => setName(e.target.value)} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button className="admin-btn admin-btn-primary" style={{ padding: '10px 24px', fontSize: '0.95rem' }} onClick={handleAdd}>
            {editingId ? "Update Currency" : "Add Currency"}
          </button>
          {editingId && (
            <button className="admin-btn admin-btn-secondary" style={{ padding: '10px 24px', fontSize: '0.95rem' }} onClick={() => { setEditingId(null); setCode(""); setSymbol(""); setName(""); }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Currencies Table */}
      <div className="admin-card" style={{ marginTop: 24, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '24px 24px 16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="admin-card-title" style={{ margin: 0 }}>🌍 Available Currencies</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text2)', fontWeight: 500 }}>
            {currencies.length} total • {currencies.filter(c => c.active).length} active
          </span>
        </div>
        <div className="admin-table-wrap" style={{ border: 'none', borderRadius: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Code</th>
                <th>Symbol</th>
                <th>Name</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currencies.map(c => (
                <tr key={c.code} style={{ opacity: c.active ? 1 : 0.6, transition: 'opacity 0.2s' }}>
                  <td>
                    <button 
                      className={`admin-btn ${c.active ? 'admin-btn-success' : 'admin-btn-secondary'}`}
                      style={{ padding: "6px 12px", fontSize: "0.8rem", fontWeight: 600, borderRadius: 20 }}
                      onClick={() => toggleActive(c.code)}
                    >
                      {c.active ? "● Active" : "○ Hidden"}
                    </button>
                  </td>
                  <td style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)' }}>{c.code}</td>
                  <td style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{c.symbol}</td>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="admin-btn admin-btn-secondary" style={{ marginRight: 8, padding: "6px 16px" }} onClick={() => handleEdit(c)}>Edit</button>
                    <button className="admin-btn admin-btn-danger" style={{ padding: "6px 16px" }} onClick={() => handleDelete(c.code)}>Delete</button>
                  </td>
                </tr>
              ))}
              {currencies.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 40, color: 'var(--text2)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 12 }}>📭</div>
                    No custom currencies added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
