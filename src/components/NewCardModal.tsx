import React, { useState, useEffect } from "react";
import { loadCardTemplates } from "../admin/adminStorage";
import { CardTemplate } from "../admin/adminTypes";

interface NewCardModalProps {
  onShowMore: (cardId: string) => void;
}

const SEEN_CARDS_KEY = "seen_new_cards";

export default function NewCardModal({ onShowMore }: NewCardModalProps) {
  const [newCards, setNewCards] = useState<CardTemplate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Only fetch active templates
    const templates = loadCardTemplates().filter(t => t.active);
    
    // Load seen cards from local storage
    let seen: string[] = [];
    try {
      seen = JSON.parse(localStorage.getItem(SEEN_CARDS_KEY) || "[]");
    } catch {
      seen = [];
    }

    // Filter to only new unseen cards
    const unseen = templates.filter(t => !seen.includes(t.id));
    
    if (unseen.length > 0) {
      setNewCards(unseen);
    }
  }, []);

  if (newCards.length === 0) return null;

  const currentCard = newCards[currentIndex];

  function dismiss() {
    // Mark ALL currently loaded new cards as seen so we don't show them again
    let seen: string[] = [];
    try {
      seen = JSON.parse(localStorage.getItem(SEEN_CARDS_KEY) || "[]");
    } catch {
      seen = [];
    }
    const updatedSeen = [...new Set([...seen, ...newCards.map(c => c.id)])];
    localStorage.setItem(SEEN_CARDS_KEY, JSON.stringify(updatedSeen));
    setNewCards([]); // unmounts modal
  }

  function handleShowMore() {
    dismiss(); // Dismiss the modal and save to local storage
    onShowMore(currentCard.id); // Navigate to details
  }

  return (
    <div className="modal-overlay" onClick={dismiss} style={{ zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: "350px", 
          width: "90%", 
          background: "var(--surface)", 
          borderRadius: "16px", 
          border: "1px solid var(--border)", 
          overflow: "hidden", 
          position: "relative",
          textAlign: "center"
        }}
      >
        <button 
          onClick={dismiss} 
          style={{ 
            position: "absolute", top: "12px", right: "12px", 
            background: "rgba(0,0,0,0.5)", color: "white", 
            border: "none", borderRadius: "50%", width: "28px", height: "28px", 
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 
          }}
        >
          ✕
        </button>

        {currentCard.imageUrl ? (
          <div style={{ width: "100%", height: "200px", background: currentCard.color || "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img 
              src={currentCard.imageUrl} 
              alt={currentCard.name} 
              style={{ maxWidth: "80%", maxHeight: "80%", objectFit: "contain", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))" }} 
            />
          </div>
        ) : (
          <div style={{ width: "100%", height: "160px", background: currentCard.color || "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "3rem" }}>💳</span>
          </div>
        )}

        <div style={{ padding: "24px 20px" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", margin: "0 0 8px 0" }}>New Card Added!</h3>
          <p style={{ fontSize: "1.1rem", margin: "0 0 16px 0", color: "var(--text2)" }}>{currentCard.bank} {currentCard.name}</p>

          <button 
            onClick={handleShowMore} 
            style={{ 
              width: "100%", padding: "12px", 
              background: currentCard.color || "var(--primary)", color: "#fff", 
              border: "none", borderRadius: "8px", 
              fontWeight: "bold", cursor: "pointer",
              marginBottom: newCards.length > 1 ? "16px" : "0"
            }}
          >
            Show More
          </button>

          {newCards.length > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button 
                onClick={() => setCurrentIndex(prev => (prev === 0 ? newCards.length - 1 : prev - 1))}
                style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: "50%", width: "36px", height: "36px", cursor: "pointer", color: "var(--text)" }}
              >
                ◀
              </button>
              <div style={{ display: "flex", gap: "6px", overflowX: "auto" }}>
                {newCards.map((_, i) => (
                  <div key={i} style={{ width: "8px", height: "8px", flexShrink: 0, borderRadius: "50%", background: i === currentIndex ? "var(--primary)" : "var(--border)" }} />
                ))}
              </div>
              <button 
                onClick={() => setCurrentIndex(prev => (prev === newCards.length - 1 ? 0 : prev + 1))}
                style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: "50%", width: "36px", height: "36px", cursor: "pointer", color: "var(--text)" }}
              >
                ▶
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
