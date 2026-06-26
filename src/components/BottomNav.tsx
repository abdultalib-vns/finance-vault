import { NavTab } from "../types";
import { LayoutDashboard, CreditCard, Building2, Gift, Settings } from "lucide-react";
import React from "react";

interface Props {
  active: NavTab;
  onChange: (tab: NavTab) => void;
}

export default function BottomNav({ active, onChange }: Props) {
  const tabs: { key: NavTab; label: string; icon: React.ReactNode }[] = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { key: "cards",     label: "Cards",     icon: <CreditCard size={20} /> },
    { key: "banks",     label: "Banks",     icon: <Building2 size={20} /> },
    { key: "cashback",  label: "Cashback",  icon: <Gift size={20} /> },
    { key: "settings",  label: "Settings",  icon: <Settings size={20} /> },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`nav-btn ${active === tab.key ? "active" : ""}`}
          onClick={() => onChange(tab.key)}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
