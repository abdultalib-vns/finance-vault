import { Search, Check, ArrowLeft, Ban, CheckCircle, Calendar, Receipt } from "lucide-react";
import { useState, useMemo } from "react";
import { FinanceItem, CardExpense, CardBill, ExpenseStatus } from "../types";
import { Currency, formatAmount } from "../lib/currency";
import { saveExpenses, loadExpenses, saveBills, loadBills, saveCashbacks, loadCashbacks } from "../lib/storage";
import { generateId } from "../lib/utils";
import ExpenseForm from "./ExpenseForm";

interface Props {
  card: FinanceItem;
  currency: Currency;
  onBack: () => void;
}

type ExpenseFilter = "all" | "unpaid" | "paid" | "billed";
type MainTab = "expenses" | "bills";

function getMonthKey(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  } catch { return "unknown"; }
}

function getAvailableMonths(expenses: CardExpense[]): string[] {
  const monthSet = new Set<string>();
  expenses.forEach((e) => monthSet.add(getMonthKey(e.date)));
  return [...monthSet].sort((a, b) => b.localeCompare(a));
}

export default function CardDetail({ card, currency, onBack }: Props) {
  const [expenses, setExpenses] = useState<CardExpense[]>(() =>
    loadExpenses().filter((e) => e.cardId === card.id)
  );
  const [bills, setBills] = useState<CardBill[]>(() =>
    loadBills().filter((b) => b.cardId === card.id)
  );
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<ExpenseFilter>("all");
  const [mainTab, setMainTab] = useState<MainTab>("expenses");
  const [editingExpense, setEditingExpense] = useState<CardExpense | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedForBill, setSelectedForBill] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);

  const allExpenses = loadExpenses();
  const allBills = loadBills();

  const availableMonths = useMemo(() => getAvailableMonths(expenses), [expenses]);

  // ── Stats ──────────────────────────────────────────────────────
  const totalOutstanding = expenses
    .filter((e) => e.status === "unpaid" || e.status === "bill_generated_unpaid")
    .reduce((s, e) => s + e.amount, 0);

  const totalCashback = expenses.reduce((s, e) => s + e.cashback, 0);
  const totalPaid = expenses
    .filter((e) => e.status === "paid" || e.status === "bill_generated")
    .reduce((s, e) => s + e.amount, 0);

  const unpaidExpenses = expenses.filter((e) => e.status === "unpaid");
  const hasUnpaid = unpaidExpenses.length > 0;

  // ── Filtered list ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    let sorted = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (selectedMonth !== "all") {
      sorted = sorted.filter((e) => getMonthKey(e.date) === selectedMonth);
    }
    if (filter === "all") return sorted;
    if (filter === "unpaid") return sorted.filter((e) => e.status === "unpaid");
    if (filter === "paid") return sorted.filter((e) => e.status === "paid");
    if (filter === "billed") return sorted.filter((e) => e.status === "bill_generated" || e.status === "bill_generated_unpaid");
    return sorted;
  }, [expenses, filter, selectedMonth]);

  const sortedBills = [...bills].sort((a, b) => b.generatedAt - a.generatedAt);

  // ── Helpers ────────────────────────────────────────────────────
  function persistExpenses(updated: CardExpense[]) {
    const rest = allExpenses.filter((e) => e.cardId !== card.id);
    saveExpenses([...rest, ...updated]);
    setExpenses(updated);
  }

  function persistBills(updated: CardBill[]) {
    const rest = allBills.filter((b) => b.cardId !== card.id);
    saveBills([...rest, ...updated]);
    setBills(updated);
  }

  // ── Add Expense ─────────────────────────────────────────────────
  function handleAddExpense(expense: CardExpense) {
    // Auto-add cashback to the Cashback tracker
    if (expense.cashback > 0) {
      const cashbacks = loadCashbacks();
      const existing = cashbacks.find((c) => c.id === `cb-${expense.id}`);
      if (!existing) {
        cashbacks.push({
          id: `cb-${expense.id}`,
          source: card.name,
          amount: expense.cashback,
          date: expense.date,
          note: expense.description,
          createdAt: Date.now(),
        });
        saveCashbacks(cashbacks);
      }
    }
    const updated = [expense, ...expenses];
    persistExpenses(updated);
    setShowForm(false);
  }

  // ── Edit Expense ───────────────────────────────────────────────
  function handleEditExpense(expense: CardExpense) {
    // Update cashback entry
    const cashbacks = loadCashbacks();
    const cbIdx = cashbacks.findIndex((c) => c.id === `cb-${expense.id}`);
    if (expense.cashback > 0) {
      if (cbIdx >= 0) {
        cashbacks[cbIdx] = { ...cashbacks[cbIdx], amount: expense.cashback, date: expense.date, note: expense.description, source: card.name };
      } else {
        cashbacks.push({ id: `cb-${expense.id}`, source: card.name, amount: expense.cashback, date: expense.date, note: expense.description, createdAt: Date.now() });
      }
    } else if (cbIdx >= 0) {
      cashbacks.splice(cbIdx, 1);
    }
    saveCashbacks(cashbacks);

    const updated = expenses.map((e) => e.id === expense.id ? expense : e);
    persistExpenses(updated);
    setEditingExpense(null);
  }

  // ── Mark expense as paid directly ──────────────────────────────
  function markExpensePaid(id: string) {
    const updated = expenses.map((e) =>
      e.id === id ? { ...e, status: "paid" as ExpenseStatus } : e
    );
    persistExpenses(updated);
  }

  // ── Delete expense ─────────────────────────────────────────────
  function deleteExpense(id: string) {
    // Remove associated cashback
    const cashbacks = loadCashbacks().filter((c) => c.id !== `cb-${id}`);
    saveCashbacks(cashbacks);
    const updated = expenses.filter((e) => e.id !== id);
    persistExpenses(updated);
  }

  // ── Generate Bill (partial or full) ────────────────────────────
  function generateBill(expenseIds?: string[]) {
    const toBill = expenseIds
      ? expenses.filter((e) => expenseIds.includes(e.id) && e.status === "unpaid")
      : unpaidExpenses;

    if (toBill.length === 0) return;

    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 21);

    const bill: CardBill = {
      id: generateId(),
      cardId: card.id,
      month,
      expenseIds: toBill.map((e) => e.id),
      totalAmount: toBill.reduce((s, e) => s + e.amount, 0),
      totalCashback: toBill.reduce((s, e) => s + e.cashback, 0),
      status: "unpaid",
      generatedAt: Date.now(),
      dueDate: dueDate.toISOString().split("T")[0],
    };

    const billExpenseIds = new Set(toBill.map((e) => e.id));
    const updatedExpenses = expenses.map((e) =>
      billExpenseIds.has(e.id)
        ? { ...e, status: "bill_generated_unpaid" as ExpenseStatus, billId: bill.id }
        : e
    );

    persistBills([bill, ...bills]);
    persistExpenses(updatedExpenses);
    setSelectMode(false);
    setSelectedForBill(new Set());
    setMainTab("bills");
  }

  // ── Pay Bill ───────────────────────────────────────────────────
  function payBill(billId: string) {
    const updatedBills = bills.map((b) =>
      b.id === billId ? { ...b, status: "paid" as const, paidAt: Date.now() } : b
    );
    const updatedExpenses = expenses.map((e) =>
      e.billId === billId ? { ...e, status: "bill_generated" as ExpenseStatus } : e
    );
    persistBills(updatedBills);
    persistExpenses(updatedExpenses);
  }

  // ── Toggle selection ───────────────────────────────────────────
  function toggleSelect(id: string) {
    setSelectedForBill((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  // ── Status display ─────────────────────────────────────────────
  function statusInfo(status: ExpenseStatus) {
    switch (status) {
      case "paid": return { label: "Paid", color: "#10b981", bg: "#d1fae5" };
      case "unpaid": return { label: "Unpaid", color: "#f59e0b", bg: "#fef3c7" };
      case "bill_generated_unpaid": return { label: "Bill Due", color: "#ef4444", bg: "#fee2e2" };
      case "bill_generated": return { label: "Billed & Paid", color: "#6366f1", bg: "#ede9fe" };
    }
  }

  // ── Edit form overlay ─────────────────────────────────────────
  if (editingExpense) {
    return (
      <div className="screen">
        <header className="detail-header">
          <button className="back-btn" onClick={() => setEditingExpense(null)}><ArrowLeft size={16} /> Back</button>
          <div className="detail-header-info">
            <h2 className="detail-title">Edit Expense</h2>
          </div>
        </header>
        <div className="content">
          <ExpenseForm
            cardId={card.id}
            currency={currency}
            onAdd={handleEditExpense}
            onCancel={() => setEditingExpense(null)}
            initialValues={editingExpense}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      {/* Header */}
      <header className="detail-header">
        <button className="back-btn" onClick={onBack}><ArrowLeft size={16} /> Back</button>
        <div className="detail-header-info">
          <h2 className="detail-title">{card.name}</h2>
          {card.lastFour && (
            <span className="detail-subtitle">•••• {card.lastFour}</span>
          )}
        </div>
      </header>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-value outstanding">{formatAmount(totalOutstanding, currency)}</span>
          <span className="stat-label">Outstanding</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value paid-val">{formatAmount(totalPaid, currency)}</span>
          <span className="stat-label">Total Paid</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value cashback-val">+{formatAmount(totalCashback, currency)}</span>
          <span className="stat-label">Cashback</span>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="main-tabs">
        <button
          className={`main-tab ${mainTab === "expenses" ? "active" : ""}`}
          onClick={() => setMainTab("expenses")}
        >
          Expenses ({expenses.length})
        </button>
        <button
          className={`main-tab ${mainTab === "bills" ? "active" : ""}`}
          onClick={() => setMainTab("bills")}
        >
          Bills ({bills.length})
        </button>
      </div>

      <div className="content">
        {/* ── EXPENSES TAB ── */}
        {mainTab === "expenses" && (
          <>
            {/* Month Filter */}
            {availableMonths.length > 0 && !showForm && (
              <div className="form-group">
                <label><Calendar size={16} /> Month</label>
                <select className="select-input" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                  <option value="all">All Months</option>
                  {availableMonths.map((m) => (
                    <option key={m} value={m}>{formatMonth(m)}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Actions */}
            <div className="expense-actions">
              {!showForm && (() => {
                const limitReached = card.creditLimit !== undefined && card.creditLimit > 0 && totalOutstanding >= card.creditLimit;
                return (
                  <>
                    <button
                      className="btn-primary add-expense-btn"
                      onClick={() => !limitReached && setShowForm(true)}
                      disabled={limitReached}
                      title={limitReached ? "Credit limit reached — pay outstanding dues first" : ""}
                    >
                      {limitReached ? "<Ban size={20} /> Limit Reached" : "+ Add Expense"}
                    </button>
                    {limitReached && (
                      <p className="limit-reached-hint">Pay your outstanding dues to add more expenses.</p>
                    )}
                  </>
                );
              })()}
              {hasUnpaid && !showForm && !selectMode && (
                <button className="btn-outline generate-bill-btn" onClick={() => generateBill()}>
                  <Receipt size={20} /> Generate Full Bill ({unpaidExpenses.length})
                </button>
              )}
              {hasUnpaid && !showForm && !selectMode && (
                <button className="btn-outline" onClick={() => setSelectMode(true)}>
                  ☑️ Select & Generate Bill
                </button>
              )}
              {selectMode && (
                <div className="select-bill-actions">
                  <button
                    className="btn-primary"
                    disabled={selectedForBill.size === 0}
                    onClick={() => generateBill([...selectedForBill])}
                  >
                    <Receipt size={20} /> Generate Bill ({selectedForBill.size} selected)
                  </button>
                  <button className="btn-secondary" onClick={() => { setSelectMode(false); setSelectedForBill(new Set()); }}>
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {showForm && (
              <ExpenseForm
                cardId={card.id}
                currency={currency}
                onAdd={handleAddExpense}
                onCancel={() => setShowForm(false)}
                creditLimit={card.creditLimit}
                currentOutstanding={totalOutstanding}
              />
            )}

            {/* Filters */}
            {!showForm && expenses.length > 0 && (
              <div className="filter-chips">
                {(["all", "unpaid", "paid", "billed"] as ExpenseFilter[]).map((f) => (
                  <button
                    key={f}
                    className={`filter-chip ${filter === f ? "active" : ""}`}
                    onClick={() => setFilter(f)}
                  >
                    {f === "all" ? "All" : f === "unpaid" ? "⏳ Unpaid" : f === "paid" ? "<CheckCircle size={20} /> Paid" : "<Receipt size={20} /> Billed"}
                  </button>
                ))}
              </div>
            )}

            {/* Expense List */}
            {filtered.length === 0 ? (
              <div className="empty-state">
                <p className="empty-icon">{expenses.length === 0 ? "<Receipt size={20} />" : "<Search size={16} />"}</p>
                <p className="empty-text">
                  {expenses.length === 0 ? "No expenses yet" : `No ${filter} expenses`}
                </p>
                {expenses.length === 0 && (
                  <p className="empty-sub">Tap + Add Expense to track your spending</p>
                )}
              </div>
            ) : (
              <ul className="expense-list">
                {filtered.map((exp) => {
                  const si = statusInfo(exp.status);
                  const isSelected = selectedForBill.has(exp.id);
                  return (
                    <li
                      key={exp.id}
                      className={`expense-item ${selectMode && exp.status === "unpaid" ? "selectable" : ""} ${isSelected ? "selected" : ""}`}
                      onClick={selectMode && exp.status === "unpaid" ? () => toggleSelect(exp.id) : undefined}
                    >
                      <div className="expense-item-top">
                        {selectMode && exp.status === "unpaid" && (
                          <span className="select-checkbox">{isSelected ? "☑️" : "⬜"}</span>
                        )}
                        <div className="expense-item-left">
                          <span className="expense-desc">{exp.description}</span>
                          <span className="expense-date">
                            {formatDate(exp.date)}
                            {exp.dueDate && <> · <span style={{ color: "#ef4444" }}>Due: {formatDate(exp.dueDate)}</span></>}
                          </span>
                        </div>
                        <div className="expense-item-right">
                          <span className="expense-amount">{formatAmount(exp.amount, currency)}</span>
                          {exp.cashback > 0 && (
                            <span className="expense-cashback">+{formatAmount(exp.cashback, currency)} CB</span>
                          )}
                        </div>
                      </div>
                      <div className="expense-item-bottom">
                        <span
                          className="status-badge"
                          style={{ background: si.bg, color: si.color }}
                        >
                          {si.label}
                        </span>
                        {!selectMode && (
                          <div className="expense-item-actions">
                            {exp.status === "unpaid" && (
                              <button
                                className="exp-action-btn pay"
                                onClick={() => markExpensePaid(exp.id)}
                              >
                                Mark Paid
                              </button>
                            )}
                            <button
                              className="exp-action-btn edit"
                              onClick={() => setEditingExpense(exp)}
                            >
                              Edit
                            </button>
                            <button
                              className="exp-action-btn del"
                              onClick={() => deleteExpense(exp.id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}

        {/* ── BILLS TAB ── */}
        {mainTab === "bills" && (
          <>
            {bills.length === 0 ? (
              <div className="empty-state">
                <p className="empty-icon">📄</p>
                <p className="empty-text">No bills generated yet</p>
                <p className="empty-sub">Add unpaid expenses and click "Generate Bill"</p>
              </div>
            ) : (
              <ul className="bill-list">
                {sortedBills.map((bill) => {
                  const billExpenses = allExpenses.filter((e) => bill.expenseIds.includes(e.id));
                  return (
                    <li key={bill.id} className={`bill-item ${bill.status}`}>
                      <div className="bill-item-header">
                        <div>
                          <span className="bill-month">{formatMonth(bill.month)}</span>
                          <span
                            className="bill-status-badge"
                            style={
                              bill.status === "paid"
                                ? { background: "#d1fae5", color: "#10b981" }
                                : { background: "#fee2e2", color: "#ef4444" }
                            }
                          >
                            {bill.status === "paid" ? "<Check size={16} /> Paid" : "⚠ Unpaid"}
                          </span>
                        </div>
                        <span className="bill-total">{formatAmount(bill.totalAmount, currency)}</span>
                      </div>

                      <div className="bill-meta">
                        <span>{bill.expenseIds.length} expense{bill.expenseIds.length !== 1 ? "s" : ""}</span>
                        {bill.dueDate && bill.status === "unpaid" && (
                          <span className="bill-due">Due: {formatDate(bill.dueDate)}</span>
                        )}
                        {bill.totalCashback > 0 && (
                          <span className="bill-cashback">Cashback: +{formatAmount(bill.totalCashback, currency)}</span>
                        )}
                        {bill.paidAt && (
                          <span>Paid on {new Date(bill.paidAt).toLocaleDateString()}</span>
                        )}
                      </div>

                      {bill.status === "unpaid" && (
                        <button className="btn-primary pay-bill-btn" onClick={() => payBill(bill.id)}>
                          <CheckCircle size={20} /> Mark Bill as Paid
                        </button>
                      )}

                      {/* Expense breakdown */}
                      <details className="bill-breakdown">
                        <summary className="bill-breakdown-toggle">View expenses</summary>
                        <ul className="bill-breakdown-list">
                          {billExpenses.map((e) => (
                            <li key={e.id} className="bill-breakdown-item">
                              <span>{e.description}</span>
                              <span>{formatAmount(e.amount, currency)}</span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString(undefined, {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch { return dateStr; }
}

function formatMonth(monthStr: string): string {
  try {
    const [y, m] = monthStr.split("-");
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  } catch { return monthStr; }
}
