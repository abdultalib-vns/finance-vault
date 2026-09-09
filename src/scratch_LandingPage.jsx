import React, { useEffect, useRef, useState } from "react";
import {
  Shield, CreditCard, Building2, Bot, BarChart3, RefreshCw,
  Bell, Download, Moon, Fingerprint, Zap, Lock, Sparkles,
  ChevronRight, Star, ArrowRight, CheckCircle2
} from "lucide-react";

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
    color: "#ec4899",
    bg: "rgba(236,72,153,0.12)",
    title: "Smart Analytics",
    desc: "Visual charts and AI-driven insights to help you understand your spending patterns.",
  },
  {
    icon: RefreshCw,
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.12)",
    title: "QuickSync AI",
    desc: "Instantly paste unstructured bank SMS or emails and let AI categorize it automatically.",
  },
  {
    icon: Bell,
    color: "#f43f5e",
    bg: "rgba(244,63,94,0.12)",
    title: "Smart Notifications",
    desc: "Get reminded of upcoming bills and credit card due dates before you miss them.",
  },
  {
    icon: Download,
    color: "#6366f1",
    bg: "rgba(99,102,241,0.12)",
    title: "Offline Backup & Export",
    desc: "Export your entire vault as an encrypted JSON file for safekeeping.",
  },
  {
    icon: Moon,
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.12)",
    title: "Adaptive Dark Mode",
    desc: "Beautiful OLED-friendly dark mode for night-time finance tracking.",
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

export default function LandingPage() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  
  // Hardcode dark mode false for the standalone landing page initially, or detect system pref
  const isDark = false; 

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

  const active = FEATURES[activeFeature];
  const ActiveIcon = active.icon;

  const APP_URL = "https://finaura-velolaunch.vercel.app/";

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
              <img src="/finaura_logo.png" alt="FinAura" className="lp-logo" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
          </div>

          <h1 className="lp-hero-title">
            <span className="lp-title-fin">Fin</span><span className="lp-title-aura">Aura</span>
          </h1>
          <p className="lp-hero-tagline">Your Personal Finance Vault,<br />Secured &amp; Supercharged with AI</p>
          <p className="lp-hero-sub">
            Track cards, banks, cashback &amp; expenses — all encrypted on your device. No cloud, no subscriptions, no compromise.
          </p>

          <a href={APP_URL} className="lp-cta-btn">
            <span>Get Started — It's Free</span>
            <ArrowRight size={18} />
          </a>

          <p className="lp-hero-note">
            <CheckCircle2 size={13} /> No account needed &nbsp;·&nbsp; <CheckCircle2 size={13} /> Works offline &nbsp;·&nbsp; <CheckCircle2 size={13} /> Always private
          </p>
        </section>

        {/* ══ ANIMATED FEATURE SPOTLIGHT ══ */}
        <section className="lp-spotlight">
          <div className="lp-spotlight-card" style={{ "--spot-color": active.color, "--spot-bg": active.bg }}>
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
                aria-label={`Show feature ${i + 1}`}
              />
            ))}
          </div>
        </section>

        {/* ══ FEATURES GRID ══ */}
        <section className="lp-features">
          <div className="lp-section-header">
            <div className="lp-section-pill">Everything you need</div>
            <h2 className="lp-section-title">Powerful tools,<br />zero complexity.</h2>
            <p className="lp-section-sub">Take control of your finances without the clutter.</p>
          </div>

          <div className="lp-feature-grid">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="lp-feature-card">
                  <div className="lp-fc-icon" style={{ "--fc-bg": f.bg }}>
                    <Icon size={22} color={f.color} />
                  </div>
                  <h4 className="lp-fc-title">{f.title}</h4>
                  <p className="lp-fc-desc">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══ HOW IT WORKS (Steps) ══ */}
        <section className="lp-steps">
          <div className="lp-section-header">
            <div className="lp-section-pill">Simple Setup</div>
            <h2 className="lp-section-title">Get Started in Minutes</h2>
            <p className="lp-section-sub">Four easy steps to total financial clarity.</p>
          </div>

          <div className="lp-steps-list">
            <div className="lp-step-card" style={{ "--step-color": "#f59e0b", "--step-bg": "rgba(245,158,11,0.12)" }}>
              <div className="lp-step-num">1</div>
              <div className="lp-step-body">
                <h4 className="lp-step-title">Create Master PIN</h4>
                <p className="lp-step-desc">Your 4-6 digit key that encrypts everything locally on your device.</p>
              </div>
            </div>

            <div className="lp-step-card" style={{ "--step-color": "#10b981", "--step-bg": "rgba(16,185,129,0.12)" }}>
              <div className="lp-step-num">2</div>
              <div className="lp-step-body">
                <h4 className="lp-step-title">Add Accounts</h4>
                <p className="lp-step-desc">Log your cards and bank accounts. We never ask for real credentials.</p>
              </div>
            </div>

            <div className="lp-step-card" style={{ "--step-color": "#6366f1", "--step-bg": "rgba(99,102,241,0.12)" }}>
              <div className="lp-step-num">3</div>
              <div className="lp-step-body">
                <h4 className="lp-step-title">Track & Paste</h4>
                <p className="lp-step-desc">Manually add expenses or paste bank SMS into QuickSync AI for auto-entry.</p>
              </div>
            </div>

            <div className="lp-step-card" style={{ "--step-color": "#8b5cf6", "--step-bg": "rgba(139,92,246,0.12)" }}>
              <div className="lp-step-num">4</div>
              <div className="lp-step-body">
                <h4 className="lp-step-title">Ask AI</h4>
                <p className="lp-step-desc">Chat with FinAura AI to analyze your spending and get instant insights.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ══ TRUST BADGES ══ */}
        <section className="lp-trust">
          <h2 className="lp-trust-title">Built for Privacy</h2>
          <p className="lp-trust-sub">Your financial data is sensitive. We treat it that way.</p>
          <div className="lp-trust-grid">
            {TRUST_BADGES.map((b, i) => {
              const Icon = b.icon;
              return (
                <div key={i} className="lp-trust-card">
                  <div className="lp-trust-icon">
                    <Icon size={24} />
                  </div>
                  <strong>{b.label}</strong>
                  <span>{b.sub}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══ FINAL CTA ══ */}
        <section className="lp-final-cta">
          <div className="lp-final-card">
            <div className="lp-final-icons">
              <Shield size={32} color="#6366f1" />
              <Lock size={32} color="#8b5cf6" />
            </div>
            <h2>Ready to secure your finances?</h2>
            <p>Join thousands managing their money privately.</p>
            <a href={APP_URL} className="lp-cta-btn lp-cta-btn-final">
              <span>Create My Vault</span>
              <ArrowRight size={18} />
            </a>
          </div>
        </section>

        {/* ══ FOOTER ══ */}
        <footer className="lp-footer">
          <img src="/finaura_logo.png" alt="FinAura" className="lp-footer-icon" onError={(e) => { e.target.style.display = 'none'; }} />
          <div className="lp-footer-brand">FinAura Vault</div>
          <div className="lp-footer-credit">
            Powered by <a href="#" target="_blank" rel="noreferrer">VeloLaunch</a><br />
            &copy; 2024 Smart Vista IT Solutions
          </div>
        </footer>

      </div>
    </div>
  );
}
