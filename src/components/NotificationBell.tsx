import { useEffect, useRef, useState } from "react";
import { loadActivePopupAd, loadAdminConfigFromServer, trackEvent } from "../admin/adminStorage";
import { PopupAd } from "../admin/adminTypes";
import { Bell, Info, Gift, AlertTriangle, X } from "lucide-react";

const AD_PERMANENT_KEY = "popup_ad_never_show_";

const TYPE_COLORS: Record<string, string> = {
  info: "#0ea5e9",
  promo: "#7c3aed",
  warning: "#d97706",
};
const TYPE_ICONS: Record<string, React.ReactNode> = {
  info: <Info size={16} />,
  promo: <Gift size={16} />,
  warning: <AlertTriangle size={16} />,
};

export interface CustomNotif {
  id: string;
  type: "info" | "warning" | "promo";
  title: string;
  message: string;
  ctaText?: string;
  ctaAction?: () => void;
}

export default function NotificationBell({ customNotifs = [] }: { customNotifs?: CustomNotif[] }) {
  const [ad, setAd] = useState<PopupAd | null>(null);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAdminConfigFromServer().finally(() => {
      setAd(loadActivePopupAd());
    });
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const allNotifs: CustomNotif[] = [];
  
  if (ad && !dismissed) {
    const isPermanentlyDismissed = !!localStorage.getItem(AD_PERMANENT_KEY + ad.id);
    if (!isPermanentlyDismissed) {
      allNotifs.push({
        id: ad.id,
        type: ad.type as any,
        title: ad.title,
        message: ad.message,
        ctaText: ad.ctaText,
        ctaAction: () => {
          trackEvent("notification_bell_cta_click", ad.id);
          if (ad.ctaUrl) window.open(ad.ctaUrl, "_blank", "noopener,noreferrer");
          setOpen(false);
        }
      });
    }
  }

  allNotifs.push(...customNotifs);

  if (allNotifs.length === 0) return null;

  function handleBellClick() {
    if (!open && ad) trackEvent("notification_bell_open", ad.id);
    setOpen((o) => !o);
  }

  const hasWarning = allNotifs.some(n => n.type === "warning");
  const bellColor = hasWarning ? TYPE_COLORS["warning"] : TYPE_COLORS[allNotifs[0].type] ?? "#2563eb";

  return (
    <div className="notif-bell-wrap" ref={dropdownRef}>
      <button
        className={`notif-bell-btn ${open ? "active" : ""}`}
        onClick={handleBellClick}
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell size={20} />
        <span className="notif-bell-dot" style={{ background: bellColor }} />
      </button>

      {open && (
        <div className="notif-dropdown" style={{ "--notif-color": bellColor, padding: 0 } as React.CSSProperties}>
          <div className="notif-dropdown-header" style={{ padding: "12px 16px" }}>
            <span className="notif-dropdown-label">Notifications ({allNotifs.length})</span>
            <button className="notif-dropdown-x" onClick={() => setOpen(false)}><X size={16} /></button>
          </div>

          <div className="notif-dropdown-list" style={{ maxHeight: "400px", overflowY: "auto" }}>
            {allNotifs.map((n, i) => {
              const color = TYPE_COLORS[n.type] ?? "#2563eb";
              return (
                <div key={n.id} style={{ borderBottom: i < allNotifs.length - 1 ? "1px solid var(--border)" : "none", padding: "16px" }}>
                  <div className="notif-dropdown-icon-row" style={{ marginBottom: "8px" }}>
                    <span className="notif-dropdown-icon-wrap" style={{ background: color + "1a", color }}>
                      {TYPE_ICONS[n.type]}
                    </span>
                    <div>
                      <div className="notif-dropdown-type" style={{ color }}>
                        {n.type.charAt(0).toUpperCase() + n.type.slice(1)}
                      </div>
                      <div className="notif-dropdown-title" style={{ fontSize: "0.95rem" }}>{n.title}</div>
                    </div>
                  </div>
                  <p className="notif-dropdown-message" style={{ marginBottom: n.ctaText ? "12px" : 0 }}>{n.message}</p>
                  
                  {n.ctaText && (
                    <button
                      className="notif-dropdown-cta"
                      style={{ background: color, width: "100%", padding: "8px", borderRadius: "8px", color: "white", fontSize: "0.85rem", fontWeight: 600, border: "none", cursor: "pointer" }}
                      onClick={n.ctaAction}
                    >
                      {n.ctaText}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
