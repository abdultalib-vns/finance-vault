import { Ban, CheckCircle, AlertTriangle, Camera, Sparkles, Send, Image } from "lucide-react";
import { useState, useRef } from "react";
import { CardExpense } from "../types";
import { Currency, formatAmount } from "../lib/currency";
import { generateId } from "../lib/utils";
import { loadAIOptions } from "../lib/storage";
import { scanReceipt, parseNaturalExpense } from "../lib/ai";

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
  const [isScanning, setIsScanning] = useState(false);
  const [naturalText, setNaturalText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const aiOpts = loadAIOptions();

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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsScanning(true);
    setError("");
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const res = await scanReceipt(aiOpts, base64, []);
        if (res.success && res.data) {
          if (res.data.description) setDescription(res.data.description);
          if (res.data.amount) setAmount(String(res.data.amount));
          if (res.data.date) setDate(res.data.date);
          if (res.data.cashback) setCashback(String(res.data.cashback));
        } else {
          setError(res.error || "Failed to parse receipt.");
        }
        setIsScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || "Failed to read image.");
      setIsScanning(false);
    }
  }

  async function handleNaturalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!naturalText.trim()) return;
    setIsParsing(true);
    setError("");
    const res = await parseNaturalExpense(aiOpts, naturalText, []);
    if (res.success && res.data) {
      if (res.data.description) setDescription(res.data.description);
      if (res.data.amount) setAmount(String(res.data.amount));
      if (res.data.date) setDate(res.data.date);
      setNaturalText("");
    } else {
      setError(res.error || "Failed to parse text.");
    }
    setIsParsing(false);
  }

  return (
    <div className="expense-form-wrapper">
      {!isEdit && aiOpts.provider !== "none" && (
        <form className="ai-natural-entry" onSubmit={handleNaturalSubmit} style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
          <input 
            type="text" 
            placeholder="AI Quick Entry: e.g. Spent 500 on dinner..." 
            value={naturalText}
            onChange={(e) => setNaturalText(e.target.value)}
            className="settings-input"
            style={{ flex: 1, padding: '8px 12px' }}
            disabled={isParsing}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0 12px' }} disabled={isParsing || !naturalText.trim()}>
            {isParsing ? "..." : <Send size={16} />}
          </button>
        </form>
      )}
    <form className="expense-form" onSubmit={handleSubmit}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 className="form-title" style={{ margin: 0 }}>{isEdit ? "Edit Expense" : "Add Expense"}</h3>
        {!isEdit && aiOpts.provider !== "none" && (
          <div style={{ display: 'flex', gap: 6 }}>
            <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileChange} />
            <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} ref={cameraInputRef} onChange={handleFileChange} />
            <button 
              type="button" 
              className="btn-outline" 
              style={{ padding: '4px 8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }} 
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning}
              title="Upload Receipt"
            >
              {isScanning ? "..." : <><Image size={14} style={{ marginRight: 4 }} /> Upload</>}
            </button>
            <button 
              type="button" 
              className="btn-outline" 
              style={{ padding: '4px 8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }} 
              onClick={() => cameraInputRef.current?.click()}
              disabled={isScanning}
              title="Scan Receipt with Camera"
            >
              {isScanning ? "Scanning..." : <><Camera size={14} style={{ marginRight: 4 }} /> Scan</>}
            </button>
          </div>
        )}
      </div>
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
    </div>
  );
}
