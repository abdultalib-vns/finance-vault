import { Gift, Info, AlertTriangle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { loadActivePopupAd, trackEvent, loadAdminConfigFromServer } from "../admin/adminStorage";
import { PopupAd } from "../admin/adminTypes";

const AD_SESSION_KEY   = "popup_ad_dismissed_";   // sessionStorage — dismissed this session
const AD_PERMANENT_KEY = "popup_ad_never_show_";  // localStorage  — "do not show again"

const TYPE_COLORS: Record<string, string> = {
  info: "#0ea5e9",
  promo: "#7c3aed",
  warning: "#d97706",
};
const TYPE_ICONS: Record<PopupAd["type"], React.ReactNode> = {
  info: <Info size={20} />,
  promo: <Gift size={20} />,
  warning: <AlertTriangle size={20} />,
};

export default function PopupAdBanner() {
  const [ad, setAd] = useState<PopupAd | null>(null);
  const [visible, setVisible] = useState(false);
  const [doNotShow, setDoNotShow] = useState(false);

  useEffect(() => {
    // Always fetch latest config from server first so other devices see updates
    loadAdminConfigFromServer().finally(() => {
      const activeAd = loadActivePopupAd();
      if (!activeAd) return;

      // Permanently hidden by user
      if (localStorage.getItem(AD_PERMANENT_KEY + activeAd.id)) return;
      // Already dismissed this session
      if (sessionStorage.getItem(AD_SESSION_KEY + activeAd.id)) return;

      const timer = setTimeout(() => {
        setAd(activeAd);
        setVisible(true);
        trackEvent("popup_ad_shown", activeAd.id);
      }, 1500);
      // store timer id — cleanup returned below needs it via closure
      return timer;
    });
  }, []);

  function dismiss() {
    if (ad) {
      if (doNotShow) {
        // Persist permanently so it never shows again for this ad
        localStorage.setItem(AD_PERMANENT_KEY + ad.id, "1");
        trackEvent("popup_ad_do_not_show", ad.id);
      } else {
        sessionStorage.setItem(AD_SESSION_KEY + ad.id, "1");
      }
    }
    setVisible(false);
    setTimeout(() => setAd(null), 300);
  }

  function handleCta() {
    if (ad) {
      trackEvent("popup_ad_cta_click", ad.id);
      if (ad.ctaUrl) window.open(ad.ctaUrl, "_blank", "noopener,noreferrer");
      dismiss();
    }
  }

  if (!ad) return null;

  const color = TYPE_COLORS[ad.type] ?? "#2563eb";
  const typeLabel = ad.type.charAt(0).toUpperCase() + ad.type.slice(1);

  return (
    <div
      className={`popup-ad-overlay ${visible ? "visible" : ""}`}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
      role="dialog"
      aria-modal="true"
      aria-label={ad.title}
    >
      <div className="popup-ad" style={{ "--ad-color": color } as React.CSSProperties}>
        <div className="popup-ad-header">
          <div className="popup-ad-icon-wrap">
            <span>{TYPE_ICONS[ad.type]}</span>
          </div>
          <div className="popup-ad-title-wrap">
            <div className="popup-ad-type-label">{typeLabel}</div>
            <div className="popup-ad-title">{ad.title}</div>
          </div>
          <button className="popup-ad-close" onClick={dismiss} aria-label="Close"><X size={16} /></button>
        </div>
        <p className="popup-ad-message">{ad.message}</p>
        <label className="popup-ad-donotshow-row">
          <input
            type="checkbox"
            className="popup-ad-donotshow-checkbox"
            checked={doNotShow}
            onChange={(e) => setDoNotShow(e.target.checked)}
          />
          <span className="popup-ad-donotshow-label">Don't show this again</span>
        </label>
        <div className="popup-ad-footer">
          {(ad.ctaText || ad.ctaUrl) && (
            <button className="popup-ad-cta" style={{ background: color }} onClick={handleCta}>
              {ad.ctaText || "Learn More"}
            </button>
          )}
          <button className="popup-ad-dismiss" onClick={dismiss}>Dismiss</button>
        </div>
      </div>
    </div>
  );
}
