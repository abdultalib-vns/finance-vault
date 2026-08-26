import { NavTab } from "../types";

interface Props {
  active: NavTab;
  onChange: (tab: NavTab) => void;
}

export default function BottomNav({ active, onChange }: Props) {
  const tabs: { key: NavTab; label: string; icon: string }[] = [
    { key: "dashboard", label: "Dashboard", icon: "📊" },
    { key: "cards",     label: "Cards",     icon: "💳" },
    { key: "banks",     label: "Banks",     icon: "🏦" },
    { key: "cashback",  label: "Cashback",  icon: "🎁" },
    { key: "settings",  label: "Settings",  icon: "⚙️" },
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
