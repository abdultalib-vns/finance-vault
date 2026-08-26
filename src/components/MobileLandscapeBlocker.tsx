import { useEffect, useState } from "react";
import { Smartphone, RotateCcw } from "lucide-react";

export default function MobileLandscapeBlocker() {
  const [isMobileLandscape, setIsMobileLandscape] = useState(false);

  useEffect(() => {
    // Attempt to lock orientation to portrait on mobile PWA/browsers if supported
    if (typeof window !== "undefined" && window.screen && window.screen.orientation && typeof (window.screen.orientation as any).lock === "function") {
      const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent) || 
                       (window.innerWidth < 1024 && "ontouchstart" in window);
      if (isMobile) {
        try {
          (window.screen.orientation as any).lock("portrait").catch(() => {
            // Silently handle if browser restricts orientation lock without fullscreen
          });
        } catch {
          // Ignore
        }
      }
    }

    const checkOrientation = () => {
      if (typeof window === "undefined") return;
      const isLandscape = window.matchMedia("(orientation: landscape)").matches;
      const isCoarse = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
      const isMobileSize = window.innerHeight <= 600 && window.innerWidth < 1024;
      const isMobileUA = /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      // Only trigger if it is a mobile device in landscape mode (not laptop/desktop)
      if (isLandscape && (isMobileSize || (isCoarse && window.innerHeight < 650 && window.innerWidth < 1024) || isMobileUA)) {
        setIsMobileLandscape(true);
      } else {
        setIsMobileLandscape(false);
      }
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  return (
    <div className={`mobile-landscape-blocker ${isMobileLandscape ? "active" : ""}`} aria-hidden={!isMobileLandscape}>
      <div className="mobile-landscape-content">
        <div className="landscape-icon-wrapper">
          <Smartphone size={56} className="landscape-phone-icon" />
          <div className="landscape-rotate-badge">
            <RotateCcw size={18} />
          </div>
        </div>

        <h3 className="landscape-blocker-title">Rotate to Portrait</h3>
        <p className="landscape-blocker-text">
          FinAura is optimized for portrait mode on mobile devices for enhanced privacy, security, and financial tracking.
        </p>

        <div className="landscape-pill-hint">
          <span className="landscape-pulse-dot" />
          <span>Please turn your phone vertically</span>
        </div>
      </div>
    </div>
  );
}
