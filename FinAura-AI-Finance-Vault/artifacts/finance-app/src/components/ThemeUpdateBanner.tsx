import { useEffect, useRef, useState } from "react";
import { loadAdminConfigFromServer, loadAdminTheme, applyAdminTheme } from "../admin/adminStorage";
import { AdminThemeSettings } from "../admin/adminTypes";

function themeFingerprint(t: AdminThemeSettings): string {
  return `${t.accentColor}|${t.accentColorDark}|${t.accentColorLight}`;
}

export default function ThemeUpdateBanner() {
  const [show, setShow] = useState(false);
  const [pending, setPending] = useState<AdminThemeSettings | null>(null);
  const currentRef = useRef(themeFingerprint(loadAdminTheme()));

  useEffect(() => {
    // Poll server every 15s for theme changes
    const interval = setInterval(async () => {
      const fetched = await loadAdminConfigFromServer();
      if (!fetched) return;
      const latest = loadAdminTheme();
      const fp = themeFingerprint(latest);
      if (fp !== currentRef.current) {
        setPending(latest);
        setShow(true);
      }
    }, 15_000);

    return () => clearInterval(interval);
  }, []);

  function handleApply() {
    if (pending) {
      applyAdminTheme(pending);
      currentRef.current = themeFingerprint(pending);
    }
    setShow(false);
    setPending(null);
  }

  function handleDismiss() {
    if (pending) currentRef.current = themeFingerprint(pending);
    setShow(false);
    setPending(null);
  }

  if (!show) return null;

  return (
    <div className="theme-update-banner">
      <div className="theme-update-content">
        <div className="theme-update-dot" style={{ background: pending?.accentColor ?? "var(--primary)" }} />
        <div className="theme-update-text">
          <span className="theme-update-title">New theme available</span>
          <span className="theme-update-sub">The app accent color has been updated.</span>
        </div>
      </div>
      <div className="theme-update-actions">
        <button className="theme-update-apply" onClick={handleApply}>Apply Now</button>
        <button className="theme-update-dismiss" onClick={handleDismiss}>Later</button>
      </div>
    </div>
  );
}
