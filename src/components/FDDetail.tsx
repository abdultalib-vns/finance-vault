import React from "react";
import { LayoutDashboard, ArrowLeft, Calendar } from "lucide-react";
import { FinanceItem } from "../types";
import { Currency, formatAmount } from "../lib/currency";

interface Props {
  fd: FinanceItem;
  currency: Currency;
  onBack: () => void;
}

export default function FDDetail({ fd, currency, onBack }: Props) {
  const now = new Date();
  const maturity = fd.maturityDate ? new Date(fd.maturityDate + "T00:00:00") : null;
  const start    = fd.startDate    ? new Date(fd.startDate + "T00:00:00")    : null;

  const daysLeft = maturity ? Math.ceil((maturity.getTime() - now.getTime()) / 86400000) : null;
  const isMatured = daysLeft !== null && daysLeft <= 0;

  const totalDays = (start && maturity)
    ? Math.ceil((maturity.getTime() - start.getTime()) / 86400000)
    : null;
  const elapsedDays = start
    ? Math.ceil((now.getTime() - start.getTime()) / 86400000)
    : null;
  const progressPct = (totalDays && elapsedDays)
    ? Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100))
    : null;

  // Simple interest maturity estimate
  const P = fd.balance;
  const r = fd.interestRate ?? 0;
  let years = 0;
  if (start && maturity) {
    years = (maturity.getTime() - start.getTime()) / (365.25 * 86400000);
  }
  const simpleInterest = (P * r * years) / 100;
  const maturityAmount = P + simpleInterest;

  return (
    <div className="screen">
      <header className="detail-header">
        <button className="back-btn" onClick={onBack}><ArrowLeft size={16} /> Back</button>
        <div className="detail-header-info">
          <h2 className="detail-title">{fd.name}</h2>
          <span className="detail-subtitle">Fixed Deposit</span>
        </div>
      </header>

      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-value paid-val">{formatAmount(P, currency)}</span>
          <span className="stat-label">Principal</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value cashback-val">{formatAmount(simpleInterest, currency)}</span>
          <span className="stat-label">Est. Interest</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value" style={{ color: "#f59e0b" }}>{formatAmount(maturityAmount, currency)}</span>
          <span className="stat-label">At Maturity</span>
        </div>
      </div>

      <div className="content">
        {/* Detail chips */}
        <div className="fd-info-row">
          {r > 0 && <span className="fd-info-chip"><LayoutDashboard size={20} /> {r}% p.a. (Simple Interest)</span>}
          {fd.startDate    && <span className="fd-info-chip"><Calendar size={16} /> Started: {fmtDate(fd.startDate)}</span>}
          {fd.maturityDate && <span className="fd-info-chip">🏁 Matures: {fmtDate(fd.maturityDate)}</span>}
        </div>

        {/* Progress / countdown */}
        {progressPct !== null && (
          <div className="fd-card">
            <div className="fd-card-row">
              <span>{isMatured ? "🎉 Matured!" : `${daysLeft} days to maturity`}</span>
              <span>{Math.round(progressPct)}% elapsed</span>
            </div>
            <div className="rd-progress-bar" style={{ marginTop: 8 }}>
              <div className="rd-progress-fill"
                style={{ width: `${progressPct}%`, background: isMatured ? "#10b981" : "#f59e0b" }} />
            </div>
            {isMatured && (
              <p className="fd-matured-note">This FD has matured. Consider renewing or withdrawing.</p>
            )}
          </div>
        )}

        {/* Breakdown table */}
        <div className="fd-card">
          <h3 className="fd-section-title">Deposit Details</h3>
          <table className="fd-table">
            <tbody>
              <tr><td>Principal</td><td>{formatAmount(P, currency)}</td></tr>
              {r > 0 && <tr><td>Interest Rate</td><td>{r}% p.a.</td></tr>}
              {years > 0 && <tr><td>Tenure</td><td>{years.toFixed(2)} years</td></tr>}
              {simpleInterest > 0 && <tr><td>Est. Interest Earned</td><td>{formatAmount(simpleInterest, currency)}</td></tr>}
              <tr className="fd-table-total"><td>Maturity Amount</td><td>{formatAmount(maturityAmount, currency)}</td></tr>
            </tbody>
          </table>
          <p className="fd-disclaimer">* Estimate based on simple interest. Actual may vary.</p>
        </div>
      </div>
    </div>
  );
}

function fmtDate(d: string) {
  try {
    return new Date(d + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  } catch { return d; }
}
