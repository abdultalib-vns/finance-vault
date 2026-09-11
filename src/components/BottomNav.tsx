import { NavTab } from "../types";
import { LayoutDashboard, CreditCard, Building2, Settings, ShieldCheck, HelpCircle, Lock } from "lucide-react";
import React from "react";

interface Props {
  active: NavTab;
  onChange: (tab: NavTab) => void;
  onLock?: () => void;
  onOpenHelp?: () => void;
}

const LoansIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
    <path d="M6 14h.01" />
    <path d="M10 14h4" />
    <path d="M12 2v4" />
    <path d="M8 2l4 4 4-4" />
  </svg>
);

export default function BottomNav({ active, onChange, onLock, onOpenHelp }: Props) {
  const tabs: { key: NavTab; label: string; icon: React.ReactNode }[] = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { key: "cards",     label: "Cards",     icon: <CreditCard size={20} /> },
    { key: "banks",     label: "Banks",     icon: <Building2 size={20} /> },
    { key: "loans",     label: "Loans & EMIs", icon: <LoansIcon /> },
    { key: "settings",  label: "Settings",  icon: <Settings size={20} /> },
  ];

  return (
    <nav className="bottom-nav">
      {/* Desktop-only Sidebar Brand Header */}
      <div className="desktop-sidebar-brand">
        <div className="sidebar-brand-icon">
          <img src="/icon-512.png" alt="FinAura" className="sidebar-brand-img" />
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-title">FinAura</span>
          <span className="sidebar-brand-badge">Premium Tier</span>
        </div>
      </div>

      {/* Nav Items */}
      <div className="sidebar-nav-list">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`nav-btn ${active === tab.key ? "active" : ""}`}
            onClick={() => onChange(tab.key)}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Desktop-only Sidebar Footer */}
      <div className="desktop-sidebar-footer">
        <button
          type="button"
          className="sidebar-footer-btn"
          onClick={() => {
            if (onOpenHelp) onOpenHelp();
            else onChange("settings");
          }}
        >
          <HelpCircle size={18} />
          <span>Help &amp; Guide</span>
        </button>
        {onLock && (
          <button
            type="button"
            className="sidebar-footer-btn logout"
            onClick={onLock}
          >
            <Lock size={18} />
            <span>Lock Vault</span>
          </button>
        )}
      </div>
    </nav>
  );
}

