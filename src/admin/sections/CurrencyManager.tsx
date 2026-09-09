import { customAlert, customConfirm } from "../../components/CustomAlert";
import { useState, useEffect } from "react";
import { CustomCurrency } from "../adminTypes";
import { loadCustomCurrencies, saveCustomCurrencies } from "../adminStorage";
import { CURRENCIES as DEFAULT_CURRENCIES } from "../../lib/currency";
import { Coins, Plus, Edit2, Trash2, Check, Save, Globe, X } from "lucide-react";

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
      customAlert("Please fill all fields.");
      return;
    }
    if (currencies.some(c => c.code === code.toUpperCase() && c.code !== editingId)) {
      customAlert("Currency code already exists.");
      return;
    }

    let updatedCurrencies;
    if (editingId) {
      updatedCurrencies = currencies.map(c => c.code === editingId ? { code: code.toUpperCase(), symbol, name, active: c.active } : c);
    } else {
      updatedCurrencies = [...currencies, { code: code.toUpperCase(), symbol, name, active: true }];
    }
    
    setCurrencies(updatedCurrencies);
    saveCustomCurrencies(updatedCurrencies);

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

  async function handleDelete(code: string) {
    if (await customConfirm(`Remove currency ${code}?`)) {
      const updatedCurrencies = currencies.filter(c => c.code !== code);
      setCurrencies(updatedCurrencies);
      saveCustomCurrencies(updatedCurrencies);
    }
  }

  function toggleActive(code: string) {
    const updatedCurrencies = currencies.map(c => c.code === code ? { ...c, active: !c.active } : c);
    setCurrencies(updatedCurrencies);
    saveCustomCurrencies(updatedCurrencies);
  }

  return (
    <div className="admin-section-content">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Coins size={22} className="admin-title-icon" />
            <span>Currency Manager</span>
          </h2>
          <p className="admin-section-desc">
            Manage the fiat &amp; regional currencies available for user vaults and onboarding selection.
          </p>
        </div>
        <button 
          type="button"
          className="admin-btn admin-btn-primary" 
          onClick={handleSaveAll} 
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: '10px 22px', fontSize: '0.92rem' }}
        >
          {saved ? <Check size={16} color="#10B981" /> : <Save size={16} />}
          <span>{saved ? "Saved Changes" : "Save Changes"}</span>
        </button>
      </div>

      {/* Add / Edit Form */}
      <div className="admin-card">
        <h3 className="admin-card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {editingId ? <Edit2 size={18} color="var(--primary)" /> : <Plus size={18} color="var(--primary)" />}
          <span>{editingId ? `Edit Currency (${editingId})` : "Add New Currency"}</span>
        </h3>
        <p className="admin-card-desc">
          {editingId ? "Update details for the selected currency below." : "Enter a 3-letter currency code, symbol, and full name."}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginBottom: 18 }}>
          <div className="admin-form-row" style={{ marginBottom: 0 }}>
            <label className="admin-label">Code (e.g. USD)</label>
            <input 
              type="text" 
              className="admin-input" 
              style={{ fontSize: '1rem', fontWeight: 600, textTransform: "uppercase" }} 
              value={code} 
              onChange={e => setCode(e.target.value.toUpperCase())} 
              maxLength={3} 
            />
          </div>
          <div className="admin-form-row" style={{ marginBottom: 0 }}>
            <label className="admin-label">Symbol (e.g. $)</label>
            <input 
              type="text" 
              className="admin-input" 
              style={{ fontSize: '1rem', fontWeight: 600 }} 
              value={symbol} 
              onChange={e => setSymbol(e.target.value)} 
              maxLength={5} 
            />
          </div>
          <div className="admin-form-row" style={{ marginBottom: 0 }}>
            <label className="admin-label">Name (e.g. US Dollar)</label>
            <input 
              type="text" 
              className="admin-input" 
              style={{ fontSize: '1rem' }} 
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button 
            type="button"
            className="admin-btn admin-btn-primary" 
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: '10px 20px', fontSize: '0.92rem' }} 
            onClick={handleAdd}
          >
            {editingId ? <Check size={16} /> : <Plus size={16} />}
            <span>{editingId ? "Update Currency" : "Add Currency"}</span>
          </button>
          {editingId && (
            <button 
              type="button"
              className="admin-btn admin-btn-secondary" 
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: '10px 20px', fontSize: '0.92rem' }} 
              onClick={() => { setEditingId(null); setCode(""); setSymbol(""); setName(""); }}
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>

      {/* Currencies Table */}
      <div className="admin-card" style={{ marginTop: 24, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="admin-card-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <Globe size={18} color="var(--primary)" />
            <span>Available Currencies</span>
          </h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--text2)', fontWeight: 500 }}>
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
                      type="button"
                      className={`admin-btn ${c.active ? 'admin-btn-success' : 'admin-btn-secondary'}`}
                      style={{ padding: "5px 12px", fontSize: "0.78rem", fontWeight: 600, borderRadius: 20, cursor: "pointer" }}
                      onClick={() => toggleActive(c.code)}
                    >
                      {c.active ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>{c.code}</td>
                  <td style={{ fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 600 }}>{c.symbol}</td>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      type="button"
                      className="admin-btn admin-btn-secondary" 
                      style={{ marginRight: 8, padding: "6px 14px", display: "inline-flex", alignItems: "center", gap: 4 }} 
                      onClick={() => handleEdit(c)}
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>
                    <button 
                      type="button"
                      className="admin-btn admin-btn-danger" 
                      style={{ padding: "6px 14px", display: "inline-flex", alignItems: "center", gap: 4 }} 
                      onClick={() => handleDelete(c.code)}
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {currencies.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 40, color: 'var(--text2)' }}>
                    <div style={{ color: "var(--text3)", marginBottom: 12 }}>
                      <Coins size={38} />
                    </div>
                    No currencies configured yet.
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
