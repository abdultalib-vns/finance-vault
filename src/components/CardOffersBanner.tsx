import { Gift, ArrowRight, X , Star,  } from "lucide-react";
import { useEffect, useState } from "react";
import { loadCardTemplates, loadAdminConfigFromServer } from "../admin/adminStorage";
import { CardTemplate } from "../admin/adminTypes";
import { trackEvent } from "../admin/adminStorage";

export default function CardOffersBanner() {
  const [templates, setTemplates] = useState<CardTemplate[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    loadAdminConfigFromServer().finally(() => {
      const active = loadCardTemplates().filter((t) => t.active);
      setTemplates(active);
    });
  }, []);

  if (dismissed || templates.length === 0) return null;

  const featured = templates.filter((t) => t.featured);
  const displayList = featured.length > 0 ? featured : templates.slice(0, 3);

  function handleApply(t: CardTemplate) {
    trackEvent("card_apply_click", t.id);
    if (t.applyUrl) window.open(t.applyUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="card-offers-section">
      <div className="card-offers-header">
        <h3 className="card-offers-title"><Gift size={20} /> Cards You Can Apply For</h3>
        <button className="card-offers-dismiss" onClick={() => setDismissed(true)}><X size={16} /></button>
      </div>
      <div className="card-offers-scroll">
        {displayList.map((t) => (
          <div key={t.id} className="card-offer-chip" style={{ "--chip-color": t.color } as React.CSSProperties}>
            <div className="card-offer-chip-header" style={{ background: t.color }}>
              {t.featured && <span className="card-offer-star"><Star size={12} fill="currentColor" /></span>}
              <span className="card-offer-bank">{t.bank}</span>
              <span className="card-offer-name">{t.name}</span>
            </div>
            <div className="card-offer-body">
              <span className="card-offer-fee">{t.annualFee === "Free" ? "Free" : `Fee: ${t.annualFee}`}</span>
              <p className="card-offer-benefits">{t.benefits.slice(0, 60)}{t.benefits.length > 60 ? "…" : ""}</p>
              <button
                className="card-offer-apply-btn"
                style={{ color: t.color, borderColor: t.color }}
                onClick={() => handleApply(t)}
              >
                Apply Now <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
