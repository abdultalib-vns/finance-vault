import { useEffect, useRef, useState } from "react";
import {
  Shield, CreditCard, Building2, Bot, BarChart3, RefreshCw,
  Bell, Download, Moon, Fingerprint, Zap, Lock, Sparkles,
  ChevronRight, Star, ArrowRight, Wallet, PiggyBank, Receipt,
  TrendingUp, CheckCircle2
} from "lucide-react";

const LANDING_SEEN_KEY = "finaura_landing_seen";

export function isLandingSeen(): boolean {
  return localStorage.getItem(LANDING_SEEN_KEY) === "1";
}
export function markLandingSeen(): void {
  localStorage.setItem(LANDING_SEEN_KEY, "1");
}

interface Props {
  onGetStarted: () => void;
}

const FEATURES = [
  {
    icon: Shield,
    color: "#6366f1",
    bg: "rgba(99,102,241,0.12)",
    title: "Military-Grade Security",
    desc: "AES-256 encrypted PIN vault with optional biometric (Face ID / Fingerprint) for instant access.",
  },
  {
    icon: CreditCard,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    title: "Credit Card Manager",
    desc: "Track all your cards, due dates, limits, and cashback offers in one place.",
  },
  {
    icon: Building2,
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    title: "Bank Account Tracker",
    desc: "Monitor balances across multiple bank accounts and view expense history at a glance.",
  },
  {
    icon: Bot,
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.12)",
    title: "AI Financial Assistant",
    desc: "Ask FinAura AI anything about your finances — powered by Groq, OpenRouter, or Gemini.",
  },
  {
    icon: BarChart3,
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    title: "Expense Analytics",
    desc: "Beautiful donut, bar, and trend charts to visualise where your money goes every month.",
  },
  {
    icon: PiggyBank,
    color: "#f97316",
    bg: "rgba(249,115,22,0.12)",
    title: "Cashback Optimizer",
    desc: "Compare cashback rates across your cards and always pay with the most rewarding one.",
  },
  {
    icon: Receipt,
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.12)",
    title: "Bill Payment Tracker",
    desc: "Log bill payments with PIN-verified records and get smart reminders before due dates.",
  },
  {
    icon: RefreshCw,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    title: "QuickSync",
    desc: "Securely sync your encrypted vault to another device via QR code — fully offline.",
  },
  {
    icon: Bell,
    color: "#ec4899",
    bg: "rgba(236,72,153,0.12)",
    title: "Smart Notifications",
    desc: "Push notifications for upcoming dues, daily backup reminders, and payment verifications.",
  },
  {
    icon: Download,
    color: "#14b8a6",
    bg: "rgba(20,184,166,0.12)",
    title: "Encrypted Backup",
    desc: "Export / import your entire vault as an AES-encrypted file — no cloud required.",
  },
  {
    icon: Moon,
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.12)",
    title: "Dark & Light Mode",
    desc: "Beautifully crafted dark and light themes, with admin-configurable accent colors.",
  },
  {
    icon: Fingerprint,
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    title: "Biometric Login",
    desc: "Enable Face ID or fingerprint once and unlock your vault in under a second.",
  },
];

const TRUST_BADGES = [
  { icon: Lock, label: "100% Local", sub: "No servers, no cloud" },
  { icon: Zap, label: "Offline First", sub: "Works without internet" },
  { icon: Shield, label: "Zero Tracking", sub: "Your data stays yours" },
  { icon: Star, label: "Free Forever", sub: "No subscriptions" },
];

export default function LandingPage({ onGetStarted }: Props) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const featuresRef = useRef<HTMLDivElement>(null);
  const isDark = document.documentElement.classList.contains("dark-mode");

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Auto-rotate feature spotlight
  useEffect(() => {
    const id = setInterval(() => {
      setActiveFeature((p) => (p + 1) % FEATURES.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  function handleGetStarted() {
    setExiting(true);
    markLandingSeen();
    setTimeout(() => onGetStarted(), 480);
  }

  const active = FEATURES[activeFeature];
  const ActiveIcon = active.icon;

  return (
    <div className={`lp-root ${visible ? "lp-visible" : ""} ${exiting ? "lp-exiting" : ""} ${isDark ? "lp-dark" : ""}`}>

      {/* ── Ambient background orbs ── */}
      <div className="lp-orb lp-orb1" />
      <div className="lp-orb lp-orb2" />
      <div className="lp-orb lp-orb3" />

      {/* ── Scrollable content ── */}
      <div className="lp-scroll">

        {/* ══ HERO ══ */}
        <section className="lp-hero">
          <div className="lp-hero-badge">
            <Sparkles size={13} />
            <span>AI-Powered · Offline · Encrypted</span>
          </div>

          <div className="lp-logo-wrap">
            <div className="lp-logo-halo">
              <img src="/icon-512.png" alt="FinAura" className="lp-logo" />
            </div>
          </div>

          <h1 className="lp-hero-title">
            <span className="lp-title-fin">Fin</span><span className="lp-title-aura">Aura</span>
          </h1>
          <p className="lp-hero-tagline">Your Personal Finance Vault,<br />Secured &amp; Supercharged with AI</p>
          <p className="lp-hero-sub">
            Track cards, banks, cashback &amp; expenses — all encrypted on your device. No cloud, no subscriptions, no compromise.
          </p>

          <button className="lp-cta-btn" onClick={handleGetStarted}>
            <span>Get Started — It's Free</span>
            <ArrowRight size={18} />
          </button>

          <p className="lp-hero-note">
            <CheckCircle2 size={13} /> No account needed &nbsp;·&nbsp; <CheckCircle2 size={13} /> Works offline &nbsp;·&nbsp; <CheckCircle2 size={13} /> Always private
          </p>
        </section>

        {/* ══ ANIMATED FEATURE SPOTLIGHT ══ */}
        <section className="lp-spotlight">
          <div className="lp-spotlight-card" style={{ "--spot-color": active.color, "--spot-bg": active.bg } as React.CSSProperties}>
            <div className="lp-spotlight-icon-wrap">
              <ActiveIcon size={36} color={active.color} />
            </div>
            <div className="lp-spotlight-text">
              <h3>{active.title}</h3>
              <p>{active.desc}</p>
            </div>
          </div>
          <div className="lp-spotlight-dots">
            {FEATURES.map((_, i) => (
              <button
                key={i}
                className={`lp-spot-dot ${i === activeFeature ? "active" : ""}`}
                onClick={() => setActiveFeature(i)}
                aria-label={`Feature ${i + 1}`}
              />
            ))}
          </div>
        </section>

        {/* ══ ALL FEATURES GRID ══ */}
        <section className="lp-features" ref={featuresRef}>
          <div className="lp-section-header">
            <span className="lp-section-pill"><TrendingUp size={13} /> Everything you need</span>
            <h2 className="lp-section-title">Built for serious<br />personal finance</h2>
            <p className="lp-section-sub">12 powerful features, zero subscriptions.</p>
          </div>

          <div className="lp-feature-grid">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="lp-feature-card"
                  style={{ "--fc-color": f.color, "--fc-bg": f.bg } as React.CSSProperties}
                >
                  <div className="lp-fc-icon">
                    <Icon size={22} color={f.color} />
                  </div>
                  <h4 className="lp-fc-title">{f.title}</h4>
                  <p className="lp-fc-desc">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══ TRUST BADGES ══ */}
        <section className="lp-trust">
          <h2 className="lp-trust-title">Privacy by design</h2>
          <p className="lp-trust-sub">Every byte of your data stays on your device — always.</p>
          <div className="lp-trust-grid">
            {TRUST_BADGES.map((b, i) => {
              const Icon = b.icon;
              return (
                <div key={i} className="lp-trust-card">
                  <div className="lp-trust-icon"><Icon size={22} /></div>
                  <strong>{b.label}</strong>
                  <span>{b.sub}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══ GET STARTED IN MINUTES ══ */}
        <section className="lp-steps">
          <div className="lp-section-header">
            <span className="lp-section-pill"><Sparkles size={13} /> Quick setup</span>
            <h2 className="lp-section-title">Get Started in Minutes</h2>
            <p className="lp-section-sub">From zero to fully secured in 4 easy steps.</p>
          </div>

          <div className="lp-steps-list">
            {[
              {
                num: "01",
                color: "#6366f1",
                bg: "rgba(99,102,241,0.12)",
                title: "Create Your PIN",
                desc: "Set a secure 4–6 digit PIN to encrypt your vault. Your data never leaves your device.",
              },
              {
                num: "02",
                color: "#f59e0b",
                bg: "rgba(245,158,11,0.12)",
                title: "Add Cards & Banks",
                desc: "Add your credit cards and bank accounts in seconds — all stored locally.",
              },
              {
                num: "03",
                color: "#10b981",
                bg: "rgba(16,185,129,0.12)",
                title: "Track & Analyse",
                desc: "Log expenses, monitor due dates, and view beautiful analytics on your spending.",
              },
              {
                num: "04",
                color: "#8b5cf6",
                bg: "rgba(139,92,246,0.12)",
                title: "Ask Your AI",
                desc: "Connect an AI provider and ask FinAura anything about your finances instantly.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="lp-step-card"
                style={{ "--step-color": step.color, "--step-bg": step.bg } as React.CSSProperties}
              >
                <div className="lp-step-num">{step.num}</div>
                <div className="lp-step-body">
                  <h4 className="lp-step-title">{step.title}</h4>
                  <p className="lp-step-desc">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ FINAL CTA ══ */}
        <section className="lp-final-cta">
          <div className="lp-final-card">
            <div className="lp-final-icons">
              <Wallet size={28} color="#6366f1" />
              <Bot size={28} color="#8b5cf6" />
              <Shield size={28} color="#10b981" />
            </div>
            <h2>Ready to take control?</h2>
            <p>Set up your encrypted vault in under 60 seconds.</p>
            <button className="lp-cta-btn lp-cta-btn-final" onClick={handleGetStarted}>
              <span>Create My Vault</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </section>


        {/* ══ FOOTER ══ */}
        <footer className="lp-footer">
          <img src="/icon-512.png" alt="FinAura" className="lp-footer-icon" />
          <p className="lp-footer-brand"><span className="lp-title-fin">Fin</span><span className="lp-title-aura">Aura</span></p>
          <p className="lp-footer-credit">
            Engineered by{" "}
            <a href="https://velolaunch-aistudio.vercel.app" target="_blank" rel="noopener noreferrer">VeloLaunch</a>
            {" "}· A company by{" "}
            <a href="https://www.smartvistaitsolutions.in" target="_blank" rel="noopener noreferrer">Smart Vista IT Solutions</a>
          </p>
        </footer>
      </div>
    </div>
  );
}
