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

export default function NotificationBell() {
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

  if (!ad || dismissed) return null;

  const isPermanentlyDismissed = !!localStorage.getItem(AD_PERMANENT_KEY + ad.id);
  const color = TYPE_COLORS[ad.type] ?? "#2563eb";

  function handleBellClick() {
    if (!open) trackEvent("notification_bell_open", ad!.id);
    setOpen((o) => !o);
  }

  function handleCta() {
    trackEvent("notification_bell_cta_click", ad!.id);
    if (ad!.ctaUrl) window.open(ad!.ctaUrl, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  function handleDismissPermanent() {
    localStorage.setItem(AD_PERMANENT_KEY + ad!.id, "1");
    trackEvent("notification_bell_dismissed", ad!.id);
    setDismissed(true);
    setOpen(false);
  }

  return (
    <div className="notif-bell-wrap" ref={dropdownRef}>
      <button
        className={`notif-bell-btn ${open ? "active" : ""}`}
        onClick={handleBellClick}
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell size={20} />
        {/* Red dot — show if not permanently dismissed */}
        {!isPermanentlyDismissed && (
          <span className="notif-bell-dot" style={{ background: color }} />
        )}
      </button>

      {open && (
        <div className="notif-dropdown" style={{ "--notif-color": color } as React.CSSProperties}>
          <div className="notif-dropdown-header">
            <span className="notif-dropdown-label">Notification</span>
            <button className="notif-dropdown-x" onClick={() => setOpen(false)}><X size={16} /></button>
          </div>

          <div className="notif-dropdown-body">
            <div className="notif-dropdown-icon-row">
              <span className="notif-dropdown-icon-wrap" style={{ background: color + "1a", color }}>
                {TYPE_ICONS[ad.type]}
              </span>
              <div>
                <div className="notif-dropdown-type" style={{ color }}>
                  {ad.type.charAt(0).toUpperCase() + ad.type.slice(1)}
                </div>
                <div className="notif-dropdown-title">{ad.title}</div>
              </div>
            </div>
            <p className="notif-dropdown-message">{ad.message}</p>
          </div>

          {(ad.ctaText || ad.ctaUrl) && (
            <div className="notif-dropdown-footer">
              <button
                className="notif-dropdown-cta"
                style={{ background: color }}
                onClick={handleCta}
              >
                {ad.ctaText || "Learn More"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
