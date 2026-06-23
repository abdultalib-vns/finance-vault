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
      <div className="admin-section-header-bar">
        <h2>💱 Currency Manager</h2>
        <button className="admin-btn admin-btn-primary" onClick={handleSaveAll}>
          {saved ? "✅ Saved" : "💾 Save Changes"}
        </button>
      </div>
      <p className="admin-section-desc">
        Manage the currencies available for users to select during onboarding and in settings.
      </p>

      {/* Add / Edit Form */}
      <div className="admin-form-group" style={{ marginTop: 24, padding: 20, background: 'var(--surface2)', borderRadius: 12 }}>
        <h3 style={{ marginBottom: 16 }}>{editingId ? `Edit Currency (${editingId})` : "Add New Currency"}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 12, marginBottom: 16 }}>
          <div>
            <label className="admin-label">Code (e.g. USD)</label>
            <input type="text" className="admin-input" value={code} onChange={e => setCode(e.target.value)} maxLength={3} />
          </div>
          <div>
            <label className="admin-label">Symbol (e.g. $)</label>
            <input type="text" className="admin-input" value={symbol} onChange={e => setSymbol(e.target.value)} maxLength={5} />
          </div>
          <div>
            <label className="admin-label">Name (e.g. US Dollar)</label>
            <input type="text" className="admin-input" value={name} onChange={e => setName(e.target.value)} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="admin-btn admin-btn-primary" onClick={handleAdd}>
            {editingId ? "Update Currency" : "Add Currency"}
          </button>
          {editingId && (
            <button className="admin-btn admin-btn-secondary" onClick={() => { setEditingId(null); setCode(""); setSymbol(""); setName(""); }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Currencies Table */}
      <div className="admin-table-wrap" style={{ marginTop: 24 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Code</th>
              <th>Symbol</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currencies.map(c => (
              <tr key={c.code} style={{ opacity: c.active ? 1 : 0.5 }}>
                <td>
                  <button 
                    className={`admin-btn ${c.active ? 'admin-btn-success' : 'admin-btn-secondary'}`}
                    style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                    onClick={() => toggleActive(c.code)}
                  >
                    {c.active ? "Active" : "Hidden"}
                  </button>
                </td>
                <td style={{ fontWeight: 600 }}>{c.code}</td>
                <td>{c.symbol}</td>
                <td>{c.name}</td>
                <td>
                  <button className="admin-btn admin-btn-secondary" style={{ marginRight: 8, padding: "4px 8px" }} onClick={() => handleEdit(c)}>Edit</button>
                  <button className="admin-btn admin-btn-danger" style={{ padding: "4px 8px" }} onClick={() => handleDelete(c.code)}>Delete</button>
                </td>
              </tr>
            ))}
            {currencies.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 24 }}>No currencies added yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
