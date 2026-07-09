import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface AppInfo {
  id: string;
  name: string;
  icon: string;
  url: string;
}

// Mock data for other VeloLaunch apps
const OTHER_APPS: AppInfo[] = [
  { id: "1", name: "TaskMaster", icon: "📋", url: "https://velolaunch.lovable.app" },
  { id: "2", name: "FitTrack", icon: "🏃", url: "https://velolaunch.lovable.app" },
  { id: "3", name: "RecipeHub", icon: "🍳", url: "https://velolaunch.lovable.app" },
  { id: "4", name: "CodeVault", icon: "💻", url: "https://velolaunch.lovable.app" },
  { id: "5", name: "MindNote", icon: "🧠", url: "https://velolaunch.lovable.app" },
  { id: "6", name: "TravelMate", icon: "✈️", url: "https://velolaunch.lovable.app" },
  { id: "7", name: "WeatherNow", icon: "☁️", url: "https://velolaunch.lovable.app" },
  { id: "8", name: "StudySync", icon: "📚", url: "https://velolaunch.lovable.app" },
  { id: "9", name: "ArtConnect", icon: "🎨", url: "https://velolaunch.lovable.app" },
  { id: "10", name: "MusicPro", icon: "🎵", url: "https://velolaunch.lovable.app" },
  { id: "11", name: "PhotoGen", icon: "📸", url: "https://velolaunch.lovable.app" },
  { id: "12", name: "VideoEdit", icon: "🎬", url: "https://velolaunch.lovable.app" },
];

export default function VeloAppsModal({ onClose }: { onClose: () => void }) {
  const [page, setPage] = useState(0);
  const itemsPerPage = 9;
  const totalPages = Math.ceil(OTHER_APPS.length / itemsPerPage);

  const startIdx = page * itemsPerPage;
  const visibleApps = OTHER_APPS.slice(startIdx, startIdx + itemsPerPage);

  let touchStartX = 0;
  let touchEndX = 0;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const minSwipeDistance = 50;
    if (touchEndX < touchStartX - minSwipeDistance) {
      // Swiped left, go next
      setPage(p => Math.min(totalPages - 1, p + 1));
    }
    if (touchEndX > touchStartX + minSwipeDistance) {
      // Swiped right, go prev
      setPage(p => Math.max(0, p - 1));
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 99999 }} onClick={onClose}>
      <div 
        className="modal-sheet" 
        style={{ padding: 24, maxWidth: 360 }} 
        onClick={e => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: "1.1rem" }}>More by VeloLaunch</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(3, 1fr)", 
          gap: "16px",
          minHeight: "260px"
        }}>
          {visibleApps.map(app => (
            <a 
              key={app.id} 
              href={app.url} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
                color: "var(--text)"
              }}
            >
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "var(--surface2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.8rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
              }}>
                {app.icon}
              </div>
              <span style={{ fontSize: "0.75rem", textAlign: "center", fontWeight: 500 }}>{app.name}</span>
            </a>
          ))}
        </div>

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 24 }}>
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{
                background: "var(--surface2)",
                border: "none",
                borderRadius: "50%",
                width: 32, height: 32,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: page === 0 ? "var(--text3)" : "var(--text)",
                cursor: page === 0 ? "default" : "pointer"
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <div style={{ display: "flex", gap: 6 }}>
              {Array.from({ length: totalPages }).map((_, i) => (
                <div 
                  key={i} 
                  style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: i === page ? "var(--primary)" : "var(--surface2)",
                    transition: "background 0.2s"
                  }}
                />
              ))}
            </div>
            <button 
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              style={{
                background: "var(--surface2)",
                border: "none",
                borderRadius: "50%",
                width: 32, height: 32,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: page === totalPages - 1 ? "var(--text3)" : "var(--text)",
                cursor: page === totalPages - 1 ? "default" : "pointer"
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
