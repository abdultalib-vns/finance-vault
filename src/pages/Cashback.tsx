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

  // Calculate this month's cashback
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const thisMonthCashback = entries
    .filter(e => e.date.startsWith(currentMonthStr))
    .reduce((s, e) => s + e.amount, 0);

  const bestSource = sourceSorted[0] ? sourceSorted[0][0] : "None";

  return (
    <div className="screen">
      <header className="page-header">
        <div className="page-header-row">
          <div>
            <h2 className="header-title"><Gift size={20} /> Cashback Tracker</h2>
            <span className="desktop-header-subtitle">Rewards, Rebates &amp; Performance</span>
          </div>
        </div>
      </header>

      {/* 4-KPI Row (Transforms to 4 equal cards on desktop) */}
      <div className="summary-grid desktop-kpi-grid cashback-kpi-grid">
        <div className="summary-card gold desktop-kpi-card">
          <div className="desktop-kpi-header">
            <span className="summary-lbl">Total Earned</span>
            <span className="desktop-kpi-trend positive"><Gift size={14} /> All Time</span>
          </div>
          <span className="summary-val tabular-nums">{formatAmount(totalCashback, currency)}</span>
        </div>

        <div className="summary-card green desktop-kpi-card">
          <div className="desktop-kpi-header">
            <span className="summary-lbl">This Month</span>
            <span className="desktop-kpi-trend positive">Active</span>
          </div>
          <span className="summary-val tabular-nums">{formatAmount(thisMonthCashback, currency)}</span>
        </div>

        <div className="summary-card slate desktop-kpi-card desktop-only-kpi">
          <div className="desktop-kpi-header">
            <span className="summary-lbl">Best Source</span>
            <span className="desktop-kpi-trend neutral">Top Earner</span>
          </div>
          <span className="summary-val desktop-kpi-text">{bestSource}</span>
        </div>

        <div className="summary-card slate desktop-kpi-card desktop-only-kpi">
          <div className="desktop-kpi-header">
            <span className="summary-lbl">Total Rewards</span>
            <span className="desktop-kpi-trend neutral">Entries</span>
          </div>
          <span className="summary-val tabular-nums">{entries.length} Logged</span>
        </div>
      </div>

      <div className="content">
        {/* Ranked Cashback by Card / Source */}
        {sourceSorted.length > 0 && (
          <div className="desktop-card cb-ranked-card">
            <h3 className="desktop-card-title">Cashback by Source</h3>
            <div className="cb-source-list">
              {sourceSorted.map(([src, amt]) => {
                const pct = totalCashback > 0 ? Math.round((amt / totalCashback) * 100) : 0;
                return (
                  <div key={src} className="cb-source-row">
                    <div className="cb-source-info">
                      <span className="cb-source-name">{src}</span>
                      <span className="cb-source-pct tabular-nums">{pct}%</span>
                    </div>
                    <div className="cb-source-bar-wrap">
                      <div className="cb-source-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="cb-source-amt tabular-nums">+{formatAmount(amt, currency)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="section-header desktop-action-header">
          <h3 className="section-title">Cashback History</h3>
          {!showForm && (
            <button type="button" className="btn-primary desktop-header-btn" onClick={() => setShowForm(true)}>
              + Add Cashback
            </button>
          )}
        </div>

        {showForm && (
          <form className="expense-form desktop-card" onSubmit={handleAdd}>
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
              <button type="submit" className="btn-primary">Save Entry</button>
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
          <ul className="expense-list desktop-grid-2">
            {entries.map((e) => (
              <li key={e.id} className="expense-item desktop-card">
                <div className="expense-item-top">
                  <div className="expense-item-left">
                    <span className="expense-desc">{e.source}</span>
                    <span className="expense-date">{fmtDate(e.date)}{e.note ? ` · ${e.note}` : ""}</span>
                  </div>
                  <div className="expense-item-right">
                    <span className="expense-amount cashback-val tabular-nums">+{formatAmount(e.amount, currency)}</span>
                  </div>
                </div>
                <div className="expense-item-bottom">
                  <span />
                  <button type="button" className="exp-action-btn del" onClick={() => deleteEntry(e.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
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
