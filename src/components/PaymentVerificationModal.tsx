import { CheckCircle2, XCircle, ShieldCheck, Clock, CreditCard, Building2, RefreshCw, ArrowUpRight } from "lucide-react";
import { PaymentIntent } from "../types";
import { 
  loadPaymentIntents, savePaymentIntents, 
  loadExpenses, saveExpenses, 
  loadBankExpenses, saveBankExpenses,
  loadItems, saveItems, loadCurrency 
} from "../lib/storage";
import { getCurrency, formatAmount } from "../lib/currency";
import { customAlert } from "./CustomAlert";

export default function PaymentVerificationModal({ 
  intent, 
  onClose 
}: { 
  intent: PaymentIntent; 
  onClose: () => void; 
}) {
  const currency = getCurrency(loadCurrency());
  const account = loadItems().find(i => i.id === intent.sourceAccountId);

  const handleVerify = (success: boolean) => {
    if (success) {
      const amount = Number(intent.amount);
      const now = Date.now();
      const dateStr = new Date().toISOString().split("T")[0];
      
      if (intent.sourceType === "card" || intent.sourceType === "paylater") {
        const newExpense = {
          id: crypto.randomUUID(),
          cardId: intent.sourceAccountId,
          description: intent.description,
          amount: amount,
          date: dateStr,
          status: "unpaid" as const,
          cashback: 0,
          createdAt: now
        };
        const exps = loadExpenses();
        saveExpenses([...exps, newExpense]);

        // Update card balance (outstanding increases)
        const items = loadItems();
        const updated = items.map(i => {
          if (i.id === intent.sourceAccountId) {
            return { ...i, balance: i.balance + amount };
          }
          return i;
        });
        saveItems(updated);

      } else {
        const newBankExpense = {
          id: crypto.randomUUID(),
          bankId: intent.sourceAccountId,
          description: intent.description,
          amount: amount,
          date: dateStr,
          type: "debit" as const,
          createdAt: now
        };
        const exps = loadBankExpenses();
        saveBankExpenses([...exps, newBankExpense]);

        // Update bank balance (balance decreases)
        const items = loadItems();
        const updated = items.map(i => {
          if (i.id === intent.sourceAccountId) {
            return { ...i, balance: Math.max(0, i.balance - amount) };
          }
          return i;
        });
        saveItems(updated);
      }

      customAlert(
        `Recorded payment of ${formatAmount(amount, currency)} for "${intent.description}".`,
        "Payment Recorded",
        "success"
      );
    }

    // Mark intent as resolved
    const intents = loadPaymentIntents();
    const updatedIntents = intents.map(i => {
      if (i.id === intent.id) {
        return { ...i, status: success ? ("completed" as const) : ("cancelled" as const) };
      }
      return i;
    });
    savePaymentIntents(updatedIntents);
    
    onClose();
  };

  const getAccountIcon = () => {
    if (intent.sourceType === "card") return <CreditCard size={16} />;
    if (intent.sourceType === "bank") return <Building2 size={16} />;
    return <RefreshCw size={16} />;
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 10005 }}>
      <div className="modal-sheet pay-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
        
        {/* Header */}
        <div className="pay-sheet-header">
          <div className="pay-brand-badge">
            <div className="pay-badge-icon" style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)" }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="pay-badge-title">Verify Transaction</h3>
              <p className="pay-badge-sub">Auto-Record to FinAura Ledger</p>
            </div>
          </div>
        </div>

        {/* Verification Card */}
        <div className="pay-verify-card">
          <div className="pay-verify-badge-pulse">
            <ArrowUpRight size={26} />
          </div>
          
          <div className="pay-verify-amount">
            {formatAmount(intent.amount, currency)}
          </div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: "rgba(245, 158, 11, 0.12)", color: "#F59E0B", fontSize: "0.75rem", fontWeight: 600, marginBottom: 16 }}>
            <Clock size={13} />
            <span>Awaiting UPI Confirmation</span>
          </div>

          <div className="pay-verify-rows">
            <div className="pay-verify-row">
              <span className="pay-verify-row-label">Purpose</span>
              <span className="pay-verify-row-value">{intent.description}</span>
            </div>
            <div className="pay-verify-row">
              <span className="pay-verify-row-label">Funding Account</span>
              <span className="pay-verify-row-value" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                {getAccountIcon()}
                {account?.name || "Selected Account"} {account?.lastFour ? `(••${account.lastFour})` : ""}
              </span>
            </div>
            <div className="pay-verify-row">
              <span className="pay-verify-row-label">Initiated</span>
              <span className="pay-verify-row-value">
                {new Date(intent.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <button 
            type="button" 
            className="pay-success-action-btn" 
            onClick={() => handleVerify(true)}
          >
            <CheckCircle2 size={18} />
            <span>Yes, Payment Successful</span>
          </button>

          <button 
            type="button" 
            className="pay-cancel-action-btn" 
            onClick={() => handleVerify(false)}
          >
            <XCircle size={17} />
            <span>No, Payment Failed or Cancelled</span>
          </button>
        </div>

      </div>
    </div>
  );
}
