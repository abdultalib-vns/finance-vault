import { Gift } from "lucide-react";
import { useState } from "react";
import { CashbackEntry } from "../types";
import { Currency, formatAmount } from "../lib/currency";
import { loadCashbacks, saveCashbacks, loadExpenses } from "../lib/storage";
import { generateId } from "../lib/utils";

interface Props {
  currency: Currency;
}

export default function Cashback({ currency }: Props) {
  const [entries, setEntries] = useState<CashbackEntry[]>(() =>
    [...loadCashbacks()].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  );
  const [showForm, setShowForm] = useState(false);
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate]     = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote]     = useState("");
  const [error, setError]   = useState("");

  const totalCashback = entries.reduce((s, e) => s + e.amount, 0);

  const bySource = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.source] = (acc[e.source] ?? 0) + e.amount;
    return acc;
  }, {});
  const sourceSorted = Object.entries(bySource).sort((a, b) => b[1] - a[1]);

  function persist(updated: CashbackEntry[]) {
    saveCashbacks(updated);
    setEntries([...updated].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!source.trim()) { setError("Source is required."); return; }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { setError("Enter a valid amount."); return; }
    const entry: CashbackEntry = {
      id: generateId(),
      source: source.trim(),
      amount: amt,
      date,
      note: note.trim() || undefined,
      createdAt: Date.now(),
    };
    persist([entry, ...entries]);
    setSource(""); setAmount(""); setNote("");
    setDate(new Date().toISOString().split("T")[0]);
    setShowForm(false);
  }

  function deleteEntry(id: string) {
    persist(entries.filter((e) => e.id !== id));
  }

  return (
    <div className="screen">
      <header className="page-header">
        <h2 className="header-title"><Gift size={20} /> Cashback Tracker</h2>
      </header>

      <div className="cashback-hero">
        <span className="cashback-hero-label">Total Cashback Earned</span>
        <span className="cashback-hero-amount">{formatAmount(totalCashback, currency)}</span>
      </div>

      {sourceSorted.length > 0 && (
        <div className="cb-source-list">
          {sourceSorted.map(([src, amt]) => (
            <div key={src} className="cb-source-row">
              <span className="cb-source-name">{src}</span>
              <span className="cb-source-amt">{formatAmount(amt, currency)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="content">
        {!showForm ? (
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add Cashback</button>
        ) : (
          <form className="expense-form" onSubmit={handleAdd}>
            <h3 className="form-title">Add Cashback</h3>
            {error && <p className="form-error">{error}</p>}

            <div className="form-group">
              <label>Source (Card / App)</label>
              <input type="text" placeholder="e.g. HDFC Visa, Amazon Pay"
                value={source} onChange={(e) => setSource(e.target.value)} autoFocus />
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label>Amount ({currency.code})</label>
                <input type="number" step="0.01" min="0" placeholder="0.00"
                  value={amount} onChange={(e) => setAmount(e.target.value)} />
                {amount && !isNaN(parseFloat(amount)) && (
                  <span className="input-hint cashback-hint">+{formatAmount(parseFloat(amount), currency)}</span>
                )}
              </div>
              <div className="form-group flex-1">
                <label>Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label>Note <span className="label-badge">Optional</span></label>
              <input type="text" placeholder="e.g. 5% on groceries"
                value={note} onChange={(e) => setNote(e.target.value)} />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">Save</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        {entries.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon"><Gift size={20} /></p>
            <p className="empty-text">No cashback logged yet.</p>
            <p className="empty-sub">Track cashback from credit cards, apps, and offers.</p>
          </div>
        ) : (
          <>
            <h3 className="section-title">History</h3>
            <ul className="expense-list">
              {entries.map((e) => (
                <li key={e.id} className="expense-item">
                  <div className="expense-item-top">
                    <div className="expense-item-left">
                      <span className="expense-desc">{e.source}</span>
                      <span className="expense-date">{fmtDate(e.date)}{e.note ? ` · ${e.note}` : ""}</span>
                    </div>
                    <div className="expense-item-right">
                      <span className="expense-amount cashback-val">+{formatAmount(e.amount, currency)}</span>
                    </div>
                  </div>
                  <div className="expense-item-bottom">
                    <span />
                    <button className="exp-action-btn del" onClick={() => deleteEntry(e.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function fmtDate(d: string) {
  try {
    return new Date(d + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch { return d; }
}
