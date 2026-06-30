import { LayoutDashboard, CreditCard, Building2, Check, LogOut, PieChart, AlignLeft, Calendar, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowRight, Sparkles, AlertTriangle, X, Coins, CheckCircle, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { FinanceItem } from "../types";
import { Currency, formatAmount } from "../lib/currency";
import { saveItems, loadExpenses, saveExpenses, loadBankExpenses, saveBankExpenses, suppressDueReminder, isDueReminderSuppressed } from "../lib/storage";
import AddItemForm from "../components/AddItemForm";
import ItemCard from "../components/ItemCard";
import NotificationBell from "../components/NotificationBell";
import PaymentAppsModal from "../components/PaymentAppsModal";

interface Props {
  masterKey: string;
  currency: Currency;
  items: FinanceItem[];
  onItemsChange: (items: FinanceItem[]) => void;
  onLock: () => void;
}

type ChartType = "donut" | "bar" | "horizontal";

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  const R = 52;
  const circ = 2 * Math.PI * R;
  let prevLen = 0;

  const segments = data.filter((d) => d.value > 0).map((seg) => {
    const len = (seg.value / total) * circ;
    const dashOffset = circ * 0.25 - prevLen;
    prevLen += len;
    return { ...seg, len, dashOffset };
  });

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={R} fill="none" stroke="var(--border)" strokeWidth="20" />
      {segments.map((seg, i) => (
        <circle key={i} cx="70" cy="70" r={R} fill="none" stroke={seg.color} strokeWidth="20" strokeDasharray={`${seg.len} ${circ - seg.len}`} strokeDashoffset={seg.dashOffset} />
      ))}
    </svg>
  );
}

function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="bar-chart">
      {data.filter((d) => d.value > 0).map((d) => (
        <div key={d.label} className="bar-chart-col">
          <div className="bar-chart-bar-wrap">
            <div
              className="bar-chart-bar"
              style={{
                height: `${Math.max(4, (d.value / maxVal) * 100)}%`,
                background: d.color,
              }}
            />
          </div>
          <span className="bar-chart-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function HorizontalBarChart({ data, total }: { data: { label: string; value: number; color: string }[]; total: number }) {
  if (total === 0) return null;
  return (
    <div className="h-bar-chart">
      {data.filter((d) => d.value > 0).map((d) => (
        <div key={d.label} className="h-bar-row">
          <span className="h-bar-label">{d.label}</span>
          <div className="h-bar-track">
            <div className="h-bar-fill" style={{ width: `${Math.round((d.value / total) * 100)}%`, background: d.color }} />
          </div>
          <span className="h-bar-val">{Math.round((d.value / total) * 100)}%</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard({ masterKey, currency, items, onItemsChange, onLock }: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editItem, setEditItem] = useState<FinanceItem | null>(null);
  const [chartType, setChartType] = useState<ChartType>("donut");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
  });

  // Upcoming Due Modal State
  const [upcomingDue, setUpcomingDue] = useState<{
    cardId: string;
    cardName: string;
    lastFour: string;
    dueDate: string;
    amount: number;
    daysLeft: number;
  } | null>(null);
  const [allUpcomingDues, setAllUpcomingDues] = useState<any[]>([]);
  const [showPaymentApps, setShowPaymentApps] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const allExpenses = loadExpenses();
    const todayStr = new Date().toISOString().split("T")[0];
    const todayMs = new Date(todayStr).getTime();
    
    // Find all unpaid expenses with a due date
    const unpaidDues = allExpenses.filter(e => 
      (e.status === "unpaid" || e.status === "bill_generated_unpaid") && e.dueDate
    );

    // Group by cardId and dueDate
    const grouped = unpaidDues.reduce((acc, exp) => {
      const key = `${exp.cardId}_${exp.dueDate!}`;
      if (!acc[key]) acc[key] = { ...exp, totalAmount: 0 };
      acc[key].totalAmount += exp.amount;
      return acc;
    }, {} as Record<string, any>);

    let mostUrgent = null;
    let minDays = Infinity;
    const allDues: any[] = [];

    Object.values(grouped).forEach(group => {
      const dueMs = new Date(group.dueDate).getTime();
      const diffDays = Math.ceil((dueMs - todayMs) / (1000 * 60 * 60 * 24));
      
      // If due within next 3 days (or past due)
      if (diffDays <= 3) {
        const card = items.find(i => i.id === group.cardId);
        const isSuppressed = isDueReminderSuppressed(group.cardId, group.dueDate);
        
        allDues.push({
          cardId: group.cardId,
          cardName: card?.name || "Unknown Card",
          lastFour: card?.lastFour || "",
          dueDate: group.dueDate,
          amount: group.totalAmount,
          daysLeft: diffDays,
          isSuppressed
        });

        if (!isSuppressed && diffDays < minDays) {
          minDays = diffDays;
          mostUrgent = {
            cardId: group.cardId,
            cardName: card?.name || "Unknown Card",
            lastFour: card?.lastFour || "",
            dueDate: group.dueDate,
            amount: group.totalAmount,
            daysLeft: diffDays
          };
        }
      }
    });

    setUpcomingDue(mostUrgent);
    setAllUpcomingDues(allDues);
  }, [items, refreshKey]);

  function handleMarkPaid() {
    if (!upcomingDue) return;
    const allExps = loadExpenses();
    const updated = allExps.map(e => {
      if (e.cardId === upcomingDue.cardId && e.dueDate === upcomingDue.dueDate) {
        if (e.status === "bill_generated_unpaid") return { ...e, status: "bill_generated" as const };
        if (e.status === "unpaid") return { ...e, status: "paid" as const };
      }
      return e;
    });
    saveExpenses(updated);
    setUpcomingDue(null);
    setRefreshKey(k => k + 1);
  }

  function handleSuppress() {
    if (!upcomingDue) return;
    suppressDueReminder(upcomingDue.cardId, upcomingDue.dueDate);
    setUpcomingDue(null);
  }

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  function prevMonth() {
    const [y, m] = selectedMonth.split("-").map(Number);
    const d = new Date(y, m - 2, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  function nextMonth() {
    if (selectedMonth >= currentMonth) return;
    const [y, m] = selectedMonth.split("-").map(Number);
    const d = new Date(y, m, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  const [selY, selM] = selectedMonth.split("-").map(Number);
  const selMonthLabel = new Date(selY, selM - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });

  // Last calendar day string of selectedMonth e.g. "2026-06-30"
  const lastDay = new Date(selY, selM, 0);
  const lastDayStr = `${selY}-${String(selM).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;

  const expenses   = loadExpenses();
  const bankExpAll = loadBankExpenses();

  // ── Bank activity for selected month ──────────────────────────
  const monthBankTxns  = bankExpAll.filter(e => e.date.startsWith(selectedMonth));
  const monthCredits   = monthBankTxns.filter(e => e.type === "credit").reduce((s, e) => s + e.amount, 0);
  const monthDebits    = monthBankTxns.filter(e => e.type === "debit").reduce((s, e) => s + e.amount, 0);

  // Closing bank balance at end of selected month (reconstruct from current balance)
  const bankItems = items.filter(i => i.type === "bank");
  const closingBankBalance = bankItems.reduce((total, bank) => {
    const txnsAfter = bankExpAll.filter(e => e.bankId === bank.id && e.date > lastDayStr);
    const futureDebits  = txnsAfter.filter(e => e.type === "debit").reduce((s, e) => s + e.amount, 0);
    const futureCredits = txnsAfter.filter(e => e.type === "credit").reduce((s, e) => s + e.amount, 0);
    // closing = current + future_debits − future_credits (reversing future movement)
    return total + bank.balance + futureDebits - futureCredits;
  }, 0);

  // ── Card dues for selected month ───────────────────────────────
  // "Due this month" = expenses whose dueDate (or date if no dueDate) falls in selectedMonth
  const dueThisMonth = expenses.filter(e => (e.dueDate || e.date).startsWith(selectedMonth));
  const dueThisMonthTotal   = dueThisMonth.reduce((s, e) => s + e.amount, 0);
  const dueThisMonthPaid    = dueThisMonth.filter(e => e.status === "paid" || e.status === "bill_generated").reduce((s, e) => s + e.amount, 0);
  const dueThisMonthUnpaid  = dueThisMonth.filter(e => e.status === "unpaid" || e.status === "bill_generated_unpaid").reduce((s, e) => s + e.amount, 0);

  // Unpaid dues from ALL prior months (carried in to this month)
  const carriedInDues = expenses
    .filter(e => (e.dueDate || e.date).slice(0, 7) < selectedMonth && (e.status === "unpaid" || e.status === "bill_generated_unpaid"))
    .reduce((s, e) => s + e.amount, 0);

  // Total dues to clear this month = this month's dues + carried-in
  const totalDuesToClear = dueThisMonthTotal + carriedInDues;
  // What's still not cleared (carries to NEXT month)
  const carryOutDues = dueThisMonthUnpaid + carriedInDues;

  // ── Summary stats (all-time) ──────────────────────────────────
  const unpaidTotal  = expenses.filter(e => e.status === "unpaid" || e.status === "bill_generated_unpaid").reduce((s, e) => s + e.amount, 0);
  const bankTotal    = items.filter(i => i.type === "bank").reduce((s, i) => s + i.balance, 0);
  const fdTotal      = items.filter(i => i.type === "fd").reduce((s, i) => s + i.balance, 0);
  const rdTotal      = items.filter(i => i.type === "rd").reduce((s, i) => s + i.balance, 0);
  const mfTotal      = items.filter(i => i.type === "mf").reduce((s, i) => s + i.balance, 0);
  const cardCount    = items.filter(i => i.type === "card" || i.type === "paylater").length;
  const savingsTotal = bankTotal + fdTotal + rdTotal + mfTotal;

  const chartData = [
    { label: "Bank", value: bankTotal, color: "#3b82f6" },
    { label: "FD", value: fdTotal, color: "#f59e0b" },
    { label: "RD", value: rdTotal, color: "#10b981" },
    { label: "MF", value: mfTotal, color: "#06b6d4" },
    { label: "Dues", value: unpaidTotal, color: "#ef4444" },
  ].filter(d => d.value > 0);

  const chartTotal = chartData.reduce((s, d) => s + d.value, 0);

  function handleAdd(item: FinanceItem) {
    const updated = [item, ...items];
    saveItems(updated);
    onItemsChange(updated);
    setShowAddForm(false);
  }

  function handleDelete(id: string) {
    const updated = items.filter((i) => i.id !== id);
    saveItems(updated);
    onItemsChange(updated);
    saveExpenses(loadExpenses().filter((e) => e.cardId !== id));
    saveBankExpenses(loadBankExpenses().filter((e) => e.bankId !== id));
  }

  function handleEditSave(updated: FinanceItem) {
    const updatedItems = items.map(i => i.id === updated.id ? updated : i);
    saveItems(updatedItems);
    onItemsChange(updatedItems);
    setEditItem(null);
  }

  return (
    <div className="screen">
      {upcomingDue && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-sheet">
            <div className="modal-header">
              <h3 className="form-title" style={{ color: "var(--danger)" }}><AlertTriangle size={20} /> Bill Due Reminder</h3>
              <button className="modal-close" onClick={() => setUpcomingDue(null)}><X size={16} /></button>
            </div>
            <div className="form-group" style={{ textAlign: "center", padding: "10px 0" }}>
              <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>{upcomingDue.cardName}</p>
              <p style={{ fontSize: "0.85rem", color: "var(--text2)", marginBottom: 16 }}>{upcomingDue.lastFour ? `•••• ${upcomingDue.lastFour}` : "•••• •••• ••••"}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface2)", padding: "12px 16px", borderRadius: "12px", marginBottom: "16px" }}>
                <span style={{ fontSize: "0.9rem", color: "var(--text2)" }}>Amount Due</span>
                <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--danger)" }}>{formatAmount(upcomingDue.amount, currency)}</span>
              </div>
              <p style={{ fontSize: "0.9rem", color: "var(--danger)", fontWeight: 500, marginBottom: "20px" }}>
                {upcomingDue.daysLeft < 0 ? `Overdue by ${Math.abs(upcomingDue.daysLeft)} day(s)` : upcomingDue.daysLeft === 0 ? "Due Today!" : `Due in ${upcomingDue.daysLeft} day(s)`}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button type="button" className="btn-primary" onClick={() => setShowPaymentApps(true)}><Coins size={16} /> Pay Now</button>
              <button type="button" className="btn-outline" onClick={handleMarkPaid} style={{ borderColor: "var(--success)", color: "var(--success)" }}><CheckCircle size={16} /> Paid Already</button>
              <button type="button" className="btn-outline" onClick={handleSuppress} style={{ borderColor: "var(--border)", color: "var(--text2)" }}><EyeOff size={16} /> Do not show again</button>
            </div>
          </div>
        </div>
      )}
      
      {showPaymentApps && <PaymentAppsModal onClose={() => setShowPaymentApps(false)} />}

      <header className="dashboard-header">
        <div className="header-top">
          <h2 className="header-title"><LayoutDashboard size={20} /> Dashboard</h2>
          <div className="header-actions">
            <span className="header-count">{items.length} item{items.length !== 1 ? "s" : ""}</span>
            <NotificationBell 
              customNotifs={allUpcomingDues.map(d => ({
                id: `due_${d.cardId}_${d.dueDate}`,
                type: "warning",
                title: "Bill Due Reminder",
                message: `${d.cardName} (${d.lastFour ? "•••• " + d.lastFour : ""}) bill of ${formatAmount(d.amount, currency)} is ${d.daysLeft < 0 ? `overdue by ${Math.abs(d.daysLeft)} day(s)` : d.daysLeft === 0 ? "due today!" : `due in ${d.daysLeft} day(s)`}.`,
                ctaText: "Pay Now",
                ctaAction: () => setShowPaymentApps(true)
              }))} 
            />
            <button type="button" className="btn-logout" onClick={onLock} aria-label="Logout" title="Logout"><LogOut size={20} /></button>
          </div>
        </div>
        <div className="summary-grid">
          <div className="summary-card green">
            <span className="summary-val">{formatAmount(savingsTotal, currency)}</span>
            <span className="summary-lbl">Total Savings</span>
          </div>
          <div className="summary-card red">
            <span className="summary-val">{formatAmount(unpaidTotal, currency)}</span>
            <span className="summary-lbl">Outstanding Dues</span>
          </div>
        </div>
      </header>

      <div className="content">
        {chartData.length > 0 && (
          <div className="chart-section">
            {/* Chart Type Switcher */}
            <div className="chart-type-switcher">
              <button className={`chart-type-btn ${chartType === "donut" ? "active" : ""}`} onClick={() => setChartType("donut")} title="Donut Chart"><PieChart size={16} /></button>
              <button className={`chart-type-btn ${chartType === "bar" ? "active" : ""}`} onClick={() => setChartType("bar")} title="Bar Chart"><LayoutDashboard size={20} /></button>
              <button className={`chart-type-btn ${chartType === "horizontal" ? "active" : ""}`} onClick={() => setChartType("horizontal")} title="Horizontal Bars"><AlignLeft size={16} /></button>
            </div>

            {chartType === "donut" && (
              <div className="chart-donut-wrap">
                <div className="chart-donut">
                  <DonutChart data={chartData} />
                  <div className="chart-center-text">
                    <span className="chart-center-val">{formatAmount(savingsTotal, currency)}</span>
                    <span className="chart-center-lbl">Net Worth</span>
                  </div>
                </div>
                <div className="chart-legend">
                  {chartData.map(d => (
                    <div key={d.label} className="legend-item">
                      <span className="legend-dot" style={{ background: d.color }} />
                      <span className="legend-label">{d.label}</span>
                      <span className="legend-val" style={d.label === "Dues" ? { color: "#ef4444" } : undefined}>
                        {d.label === "Dues" ? `−${formatAmount(d.value, currency)}` : formatAmount(d.value, currency)}
                      </span>
                    </div>
                  ))}
                  {cardCount > 0 && (
                    <div className="legend-item">
                      <span className="legend-dot" style={{ background: "#8b5cf6" }} />
                      <span className="legend-label">Cards</span>
                      <span className="legend-val">{cardCount} card{cardCount > 1 ? "s" : ""}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {chartType === "bar" && (
              <div className="chart-bar-wrap">
                <BarChart data={chartData} />
                <div className="chart-legend">
                  {chartData.map(d => (
                    <div key={d.label} className="legend-item">
                      <span className="legend-dot" style={{ background: d.color }} />
                      <span className="legend-label">{d.label}</span>
                      <span className="legend-val" style={d.label === "Dues" ? { color: "#ef4444" } : undefined}>
                        {d.label === "Dues" ? `−${formatAmount(d.value, currency)}` : formatAmount(d.value, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {chartType === "horizontal" && (
              <div className="chart-hbar-wrap">
                <HorizontalBarChart data={chartData} total={chartTotal} />
              </div>
            )}

            {chartData.length > 1 && chartType !== "horizontal" && (
              <div className="asset-bars">
                {chartData.map(d => (
                  <div key={d.label} className="asset-bar-row">
                    <span className="asset-bar-label">{d.label}</span>
                    <div className="asset-bar-track">
                      <div className="asset-bar-fill" style={{ width: `${Math.round((d.value / chartTotal) * 100)}%`, background: d.color }} />
                    </div>
                    <span className="asset-bar-pct">{Math.round((d.value / chartTotal) * 100)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Monthly Overview ─────────────────────────────── */}
        <div className="monthly-overview">
          {/* Month Navigator */}
          <div className="month-nav-bar">
            <button className="month-nav-btn" onClick={prevMonth}><ChevronLeft size={16} /></button>
            <span className="month-nav-label"><Calendar size={16} /> {selMonthLabel}</span>
            <button className="month-nav-btn" onClick={nextMonth} disabled={selectedMonth >= currentMonth}><ChevronRight size={16} /></button>
          </div>

          {/* Bank Activity */}
          <div className="monthly-row">
            <div className="monthly-stat-card">
              <span className="monthly-stat-icon"><Building2 size={20} /></span>
              <div className="monthly-stat-body">
                <span className="monthly-stat-lbl">Closing Bank Balance</span>
                <span className="monthly-stat-val">{formatAmount(closingBankBalance, currency)}</span>
                <span className="monthly-stat-sub">
                  <span className="credit-text"><ArrowUp size={12} /> {formatAmount(monthCredits, currency)}</span>
                  {" · "}
                  <span className="debit-text"><ArrowDown size={12} /> {formatAmount(monthDebits, currency)}</span>
                </span>
              </div>
            </div>

            <div className="monthly-stat-card">
              <span className="monthly-stat-icon"><CreditCard size={20} /></span>
              <div className="monthly-stat-body">
                <span className="monthly-stat-lbl">Dues This Month</span>
                <span className="monthly-stat-val">{formatAmount(dueThisMonthTotal, currency)}</span>
                <span className="monthly-stat-sub">
                  {carriedInDues > 0
                    ? <span className="carried-text">+{formatAmount(carriedInDues, currency)} carried in</span>
                    : <span className="paid-text"><Check size={16} /> {formatAmount(dueThisMonthPaid, currency)} paid</span>
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown rows */}
          <div className="monthly-breakdown">
            <div className="monthly-breakdown-row">
              <span className="mbd-label">Total to clear</span>
              <span className="mbd-val">{formatAmount(totalDuesToClear, currency)}</span>
            </div>
            <div className="monthly-breakdown-row">
              <span className="mbd-label">Paid / Billed</span>
              <span className="mbd-val credit-text">{formatAmount(dueThisMonthPaid, currency)}</span>
            </div>
            <div className={`monthly-breakdown-row ${carryOutDues > 0 ? "carry-row" : ""}`}>
              <span className="mbd-label"><ArrowRight size={12} /> Carrying to next month</span>
              <span className={`mbd-val ${carryOutDues > 0 ? "debit-text" : "credit-text"}`}>
                {carryOutDues > 0 ? formatAmount(carryOutDues, currency) : <>Nothing — all cleared <Check size={16} /></>}
              </span>
            </div>
          </div>
        </div>

        <div className="section-header">
          <h3 className="section-title">All Entries</h3>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon"><Building2 size={20} /></p>
            <p className="empty-text">No entries yet.</p>
            <p className="empty-sub">Tap + to add bank accounts, cards, FDs, RDs, or mutual funds.</p>
          </div>
        ) : (
          <ul className="item-list">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                masterKey={masterKey}
                currency={currency}
                onDelete={handleDelete}
                onEdit={setEditItem}
              />
            ))}
          </ul>
        )}
      </div>

      <button className="fab-btn" onClick={() => setShowAddForm(true)} aria-label="Add Entry" title="Add Entry">+</button>

      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <AddItemForm
              masterKey={masterKey}
              currency={currency}
              onAdd={handleAdd}
              startOpen
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}

      {editItem && (
        <div className="modal-overlay" onClick={() => setEditItem(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <AddItemForm
              masterKey={masterKey}
              currency={currency}
              onAdd={() => {}}
              initialValues={editItem}
              onSave={handleEditSave}
              onCancel={() => setEditItem(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
