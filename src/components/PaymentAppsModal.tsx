import { Coins, X } from "lucide-react";
import { PaymentApp } from "../types";

export const PAYMENT_APPS: PaymentApp[] = [
  { name: "CRED", icon: "https://www.pngall.com/wp-content/uploads/16/Cred-Logo-PNG-Picture-thumb.png", url: "https://cred.club" },
  { name: "Google Pay", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyVO9LUWF81Ov6LZR50eDNu5rNFCpkn0LwYQ&s", url: "https://pay.google.com" },
  { name: "PhonePe", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo4x8kSTmPUq4PFzl4HNT0gObFuEhivHOFYg&s", url: "https://www.phonepe.com" },
  { name: "Paytm", icon: "https://images.icon-icons.com/730/PNG/512/paytm_icon-icons.com_62778.png", url: "https://paytm.com" },
  { name: "Amazon Pay", icon: "https://static.vecteezy.com/system/resources/thumbnails/073/494/118/small_2x/amazon-pay-logo-modern-circular-icon-with-transparent-background-free-png.png", url: "https://www.amazon.com/pay" },
  { name: "Navi", icon: "https://play-lh.googleusercontent.com/odLHWIoUXt-09eYccaFf_zmF8yiLR3iPqRjzwUWc_xUAJrcHFao_23CcuqrOJBaSCZRU=s96-rw", url: "https://navi.com" },
  { name: "Mobikwik", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEt03XLHujIry51KoZxt0DLJDqQMz9k5IqUA&s", url: "https://www.mobikwik.com" },
  { name: "FreeCharge", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWd7gE_EU9okxdsbO0WMiR2Xt3I2qbMlb7Ng&s", url: "https://www.freecharge.in" },
];

export default function PaymentAppsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10005 }}>
      <div className="modal-sheet payment-apps-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="form-title"><Coins size={20} /> Pay Your Bills</h3>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <p className="modal-subtitle">Quick links to popular bill payment apps</p>
        <div className="payment-apps-grid">
          {PAYMENT_APPS.map((app) => (
            <a
              key={app.name}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="payment-app-card"
            >
            <span className="payment-app-icon">
                {app.icon.startsWith("http") ? (
                  <img src={app.icon} alt={app.name} className="payment-app-img" />
                ) : (
                  app.icon
                )}
              </span>
              <span className="payment-app-name">{app.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
