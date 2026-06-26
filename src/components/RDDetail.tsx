import { LayoutDashboard, Check, ArrowLeft, ArrowRight, Calendar , AlertTriangle,  } from "lucide-react";
import { useState, useMemo } from "react";
import { FinanceItem, RDInstallment } from "../types";
import { Currency, formatAmount } from "../lib/currency";
import { loadRDInstallments, saveRDInstallments } from "../lib/storage";

interface Props {
  rd: FinanceItem;
  currency: Currency;
  onBack: () => void;
  onBalanceUpdate: (id: string, newBalance: number) => void;
}

function generateMonths(startDate: string, maturityDate: string): string[] {
  const months: string[] = [];
  const start = new Date(startDate + "-01");
  const end   = new Date(maturityDate + "-01");
  // normalize to first of month
  let cur = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cur <= last) {
    months.push(`${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}`);
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
}

function formatMonthLabel(m: string) {
  try {
    const [y, mo] = m.split("-");
    return new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString(undefined, { month: "short", year: "numeric" });
  } catch { return m; }
}

export default function RDDetail({ rd, currency, onBack, onBalanceUpdate }: Props) {
  const all = loadRDInstallments();
  const existing = all.filter((r) => r.rdId === rd.id);

  // Build month list from start<ArrowRight size={16} />maturity, or just show last 24 months if no dates
  const months = useMemo(() => {
    if (rd.startDate && rd.maturityDate) {
      const sm = rd.startDate.slice(0, 7);
      const mm = rd.maturityDate.slice(0, 7);
      return generateMonths(sm, mm);
    }
    // fallback: 24 months ending this month
    const result: string[] = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    return result;
  }, [rd.startDate, rd.maturityDate]);

  // Build installment map
  const [installments, setInstallments] = useState<RDInstallment[]>(() => {
    const map = new Map(existing.map((r) => [r.month, r]));
    return months.map((m) => map.get(m) ?? {
      id: `${rd.id}-${m}`,
      rdId: rd.id,
      month: m,
      amount: rd.monthlyAmount ?? 0,
      paid: false,
    });
  });

  const paidCount   = installments.filter((i) => i.paid).length;
  const paidTotal   = installments.filter((i) => i.paid).reduce((s, i) => s + i.amount, 0);
  const unpaidCount = installments.filter((i) => !i.paid).length;
  const totalMonths = installments.length;

  function toggle(month: string) {
    const updated = installments.map((inst) =>
      inst.month === month
        ? { ...inst, paid: !inst.paid, paidDate: !inst.paid ? new Date().toISOString().split("T")[0] : undefined }
        : inst
    );
    setInstallments(updated);
    const rest = all.filter((r) => r.rdId !== rd.id);
    saveRDInstallments([...rest, ...updated]);
    // update parent balance
    const newPaidTotal = updated.filter((i) => i.paid).reduce((s, i) => s + i.amount, 0);
    onBalanceUpdate(rd.id, newPaidTotal);
  }

  const today = new Date().toISOString().slice(0, 7);

  // Compute maturity amount estimate
  const monthlyRate = (rd.interestRate ?? 0) / 12 / 100;
  const n = totalMonths;
  const P = rd.monthlyAmount ?? 0;
  let maturityEstimate = 0;
  if (monthlyRate > 0 && P > 0) {
    maturityEstimate = P * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate) * (1 + monthlyRate);
  } else {
    maturityEstimate = P * n;
  }

  return (
    <div className="screen">
      <header className="detail-header">
        <button className="back-btn" onClick={onBack}><ArrowLeft size={16} /> Back</button>
        <div className="detail-header-info">
          <h2 className="detail-title">{rd.name}</h2>
          <span className="detail-subtitle">Recurring Deposit</span>
        </div>
      </header>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-value paid-val">{formatAmount(paidTotal, currency)}</span>
          <span className="stat-label">Deposited</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value outstanding">{unpaidCount}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value cashback-val">{formatAmount(maturityEstimate, currency)}</span>
          <span className="stat-label">At Maturity</span>
        </div>
      </div>

      <div className="content">
        {/* Info chips */}
        <div className="fd-info-row">
          {rd.monthlyAmount && <span className="fd-info-chip"><Calendar size={16} /> {formatAmount(rd.monthlyAmount, currency)}/mo</span>}
          {rd.interestRate  && <span className="fd-info-chip"><LayoutDashboard size={20} /> {rd.interestRate}% p.a.</span>}
          {rd.startDate     && <span className="fd-info-chip">Start: {fmtDate(rd.startDate)}</span>}
          {rd.maturityDate  && <span className="fd-info-chip">Matures: {fmtDate(rd.maturityDate)}</span>}
          <span className="fd-info-chip">{paidCount}/{totalMonths} months paid</span>
        </div>

        {/* Progress bar */}
        <div className="rd-progress-wrap">
          <div className="rd-progress-bar">
            <div className="rd-progress-fill" style={{ width: `${totalMonths > 0 ? (paidCount / totalMonths) * 100 : 0}%` }} />
          </div>
          <span className="rd-progress-label">{totalMonths > 0 ? Math.round((paidCount / totalMonths) * 100) : 0}% complete</span>
        </div>

        <h3 className="section-title" style={{ marginBottom: 8 }}>Monthly Statement</h3>
        <ul className="rd-month-list">
          {installments.map((inst) => {
            const isPast   = inst.month < today;
            const isCurrent = inst.month === today;
            return (
              <li key={inst.month} className={`rd-month-item ${inst.paid ? "paid" : isPast ? "overdue" : ""}`}>
                <div className="rd-month-left">
                  <span className="rd-month-label">
                    {formatMonthLabel(inst.month)}
                    {isCurrent && <span className="rd-current-badge"> (This Month)</span>}
                  </span>
                  <span className="rd-month-amount">{formatAmount(inst.amount, currency)}</span>
                </div>
                <button
                  className={`rd-toggle-btn ${inst.paid ? "paid" : "unpaid"}`}
                  onClick={() => toggle(inst.month)}
                >
                  {inst.paid ? "<Check size={16} /> Paid" : isPast ? <><AlertTriangle size={16} /> Overdue</> : "Mark Paid"}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function fmtDate(d: string) {
  try {
    return new Date(d + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  } catch { return d; }
}
