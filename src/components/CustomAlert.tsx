import React, { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

export const customAlert = (message: string, title?: string, type: "info" | "success" | "error" = "info") => {
  const event = new CustomEvent("show-custom-alert", { detail: { message, title, type } });
  window.dispatchEvent(event);
};

export const customConfirm = (message: string, title?: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const event = new CustomEvent("show-custom-confirm", { detail: { message, title, resolve } });
    window.dispatchEvent(event);
  });
};

export function AlertContainer() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [confirm, setConfirm] = useState<any | null>(null);

  useEffect(() => {
    const handleAlert = (e: any) => {
      setAlerts((prev) => [...prev, e.detail]);
    };
    const handleConfirm = (e: any) => {
      setConfirm(e.detail);
    };

    window.addEventListener("show-custom-alert", handleAlert);
    window.addEventListener("show-custom-confirm", handleConfirm);
    return () => {
      window.removeEventListener("show-custom-alert", handleAlert);
      window.removeEventListener("show-custom-confirm", handleConfirm);
    };
  }, []);

  if (alerts.length === 0 && !confirm) return null;

  return (
    <>
      {alerts.map((alert, i) => (
        <div key={i} className="modal-overlay" style={{ zIndex: 999999 + i }} onClick={() => setAlerts(prev => prev.filter((_, idx) => idx !== i))}>
          <div className="modal-sheet" style={{ paddingBottom: 24, maxHeight: 'none', top: 'auto', bottom: 0, transform: 'none' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {alert.type === "success" && <CheckCircle size={20} style={{ color: "var(--success)" }} />}
                {alert.type === "error" && <AlertTriangle size={20} style={{ color: "var(--danger)" }} />}
                {alert.type === "info" && <Info size={20} style={{ color: "var(--primary)" }} />}
                {alert.title || "Notice"}
              </h3>
            </div>
            <p style={{ margin: "16px 0", color: "var(--text)" }}>{alert.message}</p>
            <button className="btn-primary" style={{ width: "100%" }} onClick={() => setAlerts(prev => prev.filter((_, idx) => idx !== i))}>
              OK
            </button>
          </div>
        </div>
      ))}

      {confirm && (
        <div className="modal-overlay" style={{ zIndex: 999999 }} onClick={() => { confirm.resolve(false); setConfirm(null); }}>
          <div className="modal-sheet" style={{ paddingBottom: 24, maxHeight: 'none', top: 'auto', bottom: 0, transform: 'none' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={20} style={{ color: "var(--danger)" }} />
                {confirm.title || "Confirm"}
              </h3>
            </div>
            <p style={{ margin: "16px 0", color: "var(--text)" }}>{confirm.message}</p>
            <div className="form-actions" style={{ marginTop: 20 }}>
              <button className="btn-secondary" onClick={() => { confirm.resolve(false); setConfirm(null); }}>Cancel</button>
              <button className="btn-primary" onClick={() => { confirm.resolve(true); setConfirm(null); }}>Proceed</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
