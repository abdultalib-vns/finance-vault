import { useEffect, useState } from "react";

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Detect theme: check if dark-mode class is on <html>, or fallback to system preference
    const htmlEl = document.documentElement;
    const hasDarkClass = htmlEl.classList.contains("dark-mode");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(hasDarkClass || (!hasDarkClass && systemDark));
  }, []);

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase("hold"), 800);
    const holdTimer = setTimeout(() => setPhase("exit"), 2000);
    const exitTimer = setTimeout(() => onFinish(), 2600);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
    };
  }, [onFinish]);

  const bgImage = isDark
    ? "/Background_Image_(DarkMode).png"
    : "/Background_Image_(LightMode).png";

  const version = (import.meta.env.VITE_APP_VERSION as string) || "1.0.0";

  return (
    <div className={`splash-screen splash-${phase}`}>
      {/* Theme-aware background image */}
      <img
        src={bgImage}
        alt=""
        className="splash-bg-image"
        aria-hidden="true"
      />

      {/* Central content card */}
      <div className="splash-premium-card">
        {/* Version badge - top left */}
        <div className="splash-version-badge">Version {version}</div>

        {/* App Icon */}
        <div className="splash-icon-wrapper">
          <div className="splash-icon-halo">
            <img src="/icon-512.png" alt="FinAura" className="splash-icon" />
          </div>
        </div>

        {/* App Name - "Aura" uses admin accent color via var(--primary) */}
        <h1 className="splash-title">
          <span className="splash-title-fin">Fin</span>
          <span className="splash-title-aura">Aura</span>
        </h1>

        {/* Tagline - single line */}
        <p className="splash-tagline">AI-Powered Personal Finance Vault</p>

        {/* Progress bar + text */}
        <div className="splash-premium-loader">
          <div className="splash-progress-track">
            <div className="splash-progress-bar" />
          </div>
          <span className="splash-loader-text">Securing your vault...</span>
        </div>
      </div>

      {/* Footer */}
      <div className="splash-premium-footer">
        {/* Safety Badges */}
        <img
          src="/SafetyBadges.png"
          alt="Safe and Secured • 100% Local • 100% Offline"
          className="splash-safety-badges"
        />

        <div className="splash-attribution-block">
          <p className="splash-footer-line">
            Engineered by{" "}
            <a
              href="https://velolaunch-aistudio.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="splash-velolaunch-link"
            >
              VeloLaunch
            </a>
          </p>
          <p className="splash-footer-line">
            A Company by{" "}
            <a
              href="https://www.smartvistaitsolutions.in"
              target="_blank"
              rel="noopener noreferrer"
              className="splash-smartvista-link"
            >
              Smart Vista IT Solutions
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
