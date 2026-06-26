import { Plus } from "lucide-react";
import { useState } from "react";
import { BankExpense, FinanceItem } from "../types";
import { Currency, formatAmount } from "../lib/currency";
import { generateId } from "../lib/utils";

interface Props {
  banks: FinanceItem[];
  currency: Currency;
  initialBankId?: string;
  onAdd: (expense: BankExpense) => void;
  onCancel: () => void;
}

export default function BankExpenseForm({ banks, currency, initialBankId, onAdd, onCancel }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [bankId, setBankId]     = useState(initialBankId ?? banks[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [amount, setAmount]     = useState("");
  const [date, setDate]         = useState(today);
  const [type, setType]         = useState<"debit" | "credit">("debit");
  const [category, setCategory] = useState("");
  const [error, setError]       = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!bankId) { setError("Select a bank account."); return; }
    if (!description.trim()) { setError("Description is required."); return; }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { setError("Enter a valid amount."); return; }

    const expense: BankExpense = {
      id: generateId(),
      bankId,
      description: description.trim(),
      amount: amt,
      date,
      type,
      category: category.trim() || undefined,
      createdAt: Date.now(),
    };
    onAdd(expense);
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <h3 className="form-title">Add Bank Transaction</h3>
      {error && <p className="form-error">{error}</p>}

      <div className="form-group">
        <label>Account</label>
        <select className="select-input" value={bankId} onChange={(e) => setBankId(e.target.value)}>
          {banks.length === 0 && <option value="">No accounts available</option>}
          {banks.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Type</label>
        <div className="type-tabs">
          <button type="button"
            className={`type-tab ${type === "debit" ? "active" : ""}`}
            onClick={() => setType("debit")}>
            ➖ Debit (Out)
          </button>
          <button type="button"
            className={`type-tab ${type === "credit" ? "active" : ""}`}
            onClick={() => setType("credit")}>
            <Plus size={16} /> Credit (In)
          </button>
        </div>
      </div>

      <div className="form-group">
        <label>Description</label>
        <input type="text" placeholder="e.g. Salary, Rent, Grocery" autoFocus
          value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="form-row">
        <div className="form-group flex-1">
          <label>Amount ({currency.code})</label>
          <input type="number" step="0.01" min="0" placeholder="0.00"
            value={amount} onChange={(e) => setAmount(e.target.value)} />
          {amount && !isNaN(parseFloat(amount)) && (
            <span className="input-hint">{type === "credit" ? "+" : "−"}{formatAmount(parseFloat(amount), currency)}</span>
          )}
        </div>
        <div className="form-group flex-1">
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <div className="form-group">
        <label>Category <span className="label-badge">Optional</span></label>
        <input type="text" placeholder="e.g. Food, Bills, Transport"
          value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary">Save</button>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
