import { useEffect, useState } from "react";

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");

  useEffect(() => {
    // Enter animation lasts 800ms, then hold for 1200ms, then exit 600ms
    const enterTimer = setTimeout(() => setPhase("hold"), 800);
    const holdTimer = setTimeout(() => setPhase("exit"), 2000);
    const exitTimer = setTimeout(() => onFinish(), 2600);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
    };
  }, [onFinish]);

  return (
    <div className={`splash-screen splash-${phase}`}>
      {/* Animated background particles */}
      <div className="splash-particles">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="splash-particle" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>

      {/* Glow ring behind the icon */}
      <div className="splash-glow-ring" />

      {/* App Icon */}
      <div className="splash-icon-wrapper">
        <img src="/icon-512.png" alt="FinAura" className="splash-icon" />
      </div>

      {/* App Name */}
      <h1 className="splash-title">
        <span className="splash-title-fin">Fin</span>
        <span className="splash-title-aura">Aura</span>
      </h1>

      {/* Tagline */}
      <p className="splash-tagline">A Personal Finance Vault</p>

      {/* Loading bar */}
      <div className="splash-loader">
        <div className="splash-loader-bar" />
      </div>

      {/* Credit */}
      <div style={{ position: "absolute", bottom: "30px", left: "0", width: "100%", textAlign: "center", fontSize: "0.75rem", color: "var(--text3)", opacity: 0.8, lineHeight: 1.4 }}>
        Developed by Velo Launch <br /> A Company by <a href="https://smartvistaitsolutions.in" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>Smart Vista IT Solutions</a>
      </div>
    </div>
  );
}
