import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

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
      {/* Premium ambient animated gradients */}
      <div className="splash-premium-glow-1" />
      <div className="splash-premium-glow-2" />

      {/* Floating glassmorphic container */}
      <div className="splash-premium-card">
        {/* App Icon */}
        <div className="splash-icon-wrapper">
          <div className="splash-icon-halo">
            <img src="/icon-512.png" alt="FinAura" className="splash-icon" />
          </div>
        </div>

        {/* App Name */}
        <h1 className="splash-title">
          <span className="splash-title-fin">Fin</span>
          <span className="splash-title-aura">Aura</span>
        </h1>

        {/* Tagline */}
        <p className="splash-tagline">AI-Powered Personal Finance Vault</p>

        {/* Elegant Loader */}
        <div className="splash-premium-loader">
          <Loader2 size={24} className="splash-spinner" />
          <span className="splash-loader-text">Securing your vault...</span>
        </div>
      </div>

      {/* Credit */}
      <div className="splash-premium-footer">
        <p>Developed by Velo Launch</p>
        <p className="splash-company">
          A Company by <a href="https://smartvistaitsolutions.in" target="_blank" rel="noopener noreferrer">Smart Vista IT Solutions</a>
        </p>
        <div className="splash-version">
          {import.meta.env.VITE_BUILD_VERSION || "Dev Build"}
        </div>
      </div>
    </div>
  );
}
