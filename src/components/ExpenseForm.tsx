import { Ban, CheckCircle, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { CardExpense } from "../types";
import { Currency, formatAmount } from "../lib/currency";
import { generateId } from "../lib/utils";

interface Props {
  cardId: string;
  currency: Currency;
  onAdd: (expense: CardExpense) => void;
  onCancel: () => void;
  initialValues?: CardExpense;
  creditLimit?: number;
  currentOutstanding?: number;
}

export default function ExpenseForm({ cardId, currency, onAdd, onCancel, initialValues, creditLimit, currentOutstanding = 0 }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const isEdit = !!initialValues;
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [amount, setAmount] = useState(initialValues ? String(initialValues.amount) : "");
  const [date, setDate] = useState(initialValues?.date ?? today);
  const [dueDate, setDueDate] = useState(initialValues?.dueDate ?? "");
  const [status, setStatus] = useState<"paid" | "unpaid">(
    initialValues ? (initialValues.status === "paid" || initialValues.status === "bill_generated" ? "paid" : "unpaid") : "unpaid"
  );
  const [cashback, setCashback] = useState(initialValues ? (initialValues.cashback > 0 ? String(initialValues.cashback) : "") : "");
  const [error, setError] = useState("");

  const enteredAmt = parseFloat(amount) || 0;
  const projectedOutstanding = currentOutstanding + enteredAmt;
  const utilizationPct = creditLimit && creditLimit > 0 ? (projectedOutstanding / creditLimit) * 100 : 0;
  const wouldExceedLimit = !initialValues && creditLimit !== undefined && creditLimit > 0 && enteredAmt > 0 && projectedOutstanding > creditLimit;
  const showLimitWarning = !wouldExceedLimit && !initialValues && creditLimit !== undefined && creditLimit > 0 && enteredAmt > 0 && utilizationPct >= 90;
  const remainingLimit = creditLimit !== undefined ? Math.max(0, creditLimit - currentOutstanding) : undefined;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!description.trim()) { setError("Description is required."); return; }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { setError("Enter a valid amount."); return; }
    // Block if exceeds credit limit
    if (!initialValues && creditLimit !== undefined && creditLimit > 0 && currentOutstanding + amt > creditLimit) {
      setError(`Exceeds your credit limit. Available: ${remainingLimit !== undefined ? remainingLimit.toFixed(2) : "0"} ${currency.code}`);
      return;
    }
    const cb = parseFloat(cashback) || 0;
    if (cb < 0) { setError("Cashback cannot be negative."); return; }
    if (cb > amt) { setError("Cashback cannot exceed the expense amount."); return; }

    const expense: CardExpense = {
      id: initialValues?.id ?? generateId(),
      cardId,
      description: description.trim(),
      amount: amt,
      date,
      dueDate: dueDate || undefined,
      status: initialValues ? initialValues.status : status,
      cashback: cb,
      billId: initialValues?.billId,
      createdAt: initialValues?.createdAt ?? Date.now(),
    };

    if (isEdit && !initialValues?.billId) {
      expense.status = status;
    }

    onAdd(expense);
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <h3 className="form-title">{isEdit ? "Edit Expense" : "Add Expense"}</h3>
      {error && <p className="form-error">{error}</p>}
      {wouldExceedLimit && remainingLimit !== undefined && (
        <div className="expense-limit-warning expense-limit-exceeded">
          <span><Ban size={20} /></span>
          <div>
            <strong>Credit limit exceeded</strong>
            <span>
              You only have {formatAmount(remainingLimit, currency)} available out of your{" "}
              {formatAmount(creditLimit!, currency)} limit.
            </span>
          </div>
        </div>
      )}
      {showLimitWarning && (
        <div className="expense-limit-warning">
          <span><AlertTriangle size={20} /></span>
          <div>
            <strong>Near credit limit</strong>
            <span>This will use {utilizationPct.toFixed(0)}% of your {formatAmount(creditLimit!, currency)} limit.</span>
          </div>
        </div>
      )}

      <div className="form-group">
        <label>Description</label>
        <input
          type="text"
          placeholder="e.g. Groceries, Netflix, Fuel"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          autoFocus
        />
      </div>

      <div className="form-row">
        <div className="form-group flex-1">
          <label>Amount ({currency.code})</label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {amount && !isNaN(parseFloat(amount)) && (
            <span className="input-hint">{formatAmount(parseFloat(amount), currency)}</span>
          )}
        </div>
        <div className="form-group flex-1">
          <label>Cashback</label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={cashback}
            onChange={(e) => setCashback(e.target.value)}
          />
          {cashback && !isNaN(parseFloat(cashback)) && parseFloat(cashback) > 0 && (
            <span className="input-hint cashback-hint">+{formatAmount(parseFloat(cashback), currency)}</span>
          )}
        </div>
      </div>

      <div className="form-group">
          <label>Expense Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Due Date <span className="label-badge">Optional</span></label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>

      {(!isEdit || (isEdit && !initialValues?.billId)) && (
        <div className="form-group">
          <label>Status</label>
          <div className="type-tabs">
            <button
              type="button"
              className={`type-tab ${status === "unpaid" ? "active" : ""}`}
              onClick={() => setStatus("unpaid")}
            >
              ⏳ Unpaid
            </button>
            <button
              type="button"
              className={`type-tab ${status === "paid" ? "active" : ""}`}
              onClick={() => setStatus("paid")}
            >
              <CheckCircle size={20} /> Paid
            </button>
          </div>
        </div>
      )}

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={wouldExceedLimit}>{isEdit ? "Update" : "Add Expense"}</button>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
