import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, Smartphone, EyeOff, Fingerprint, CloudOff, Box,
  Banknote, CreditCard, LineChart, Home, PiggyBank, MoreHorizontal,
  Globe, Bell, Moon, FileText, ChevronDown, Star, CheckCircle,
  Github, Twitter, Linkedin, ArrowRight, Sparkles, Lock,
  ChevronRight, Settings, TrendingUp, Zap, Target, BarChart3,
  Wallet, DollarSign, Users, Award, Play, Menu, X, Check,
  Instagram, Layers, Compass, ArrowUpRight, Cpu, HelpCircle, User
} from 'lucide-react';

/* ════════════════════════════════════════════
   Counter Hook — animated number counting
   ════════════════════════════════════════════ */
function useCountUp(end, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!startOnView) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !hasStarted) setHasStarted(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted, startOnView]);

  useEffect(() => {
    if (!hasStarted) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [hasStarted, end, duration]);

  return { count, ref };
}

/* ════════════════════════════════════════════
   Scroll Reveal Hook
   ════════════════════════════════════════════ */
function useScrollReveal() {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [activeShowcase, setActiveShowcase] = useState(0);
  const [chatPrompt, setChatPrompt] = useState(0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Stats counter hooks
  const stat1 = useCountUp(2.8, 2000);
  const stat2 = useCountUp(99.99, 2000);
  const stat3 = useCountUp(4.9, 2000);
  const stat4 = useCountUp(250, 2000);

  // Scroll reveal hooks
  const heroReveal = useScrollReveal();
  const statsReveal = useScrollReveal();
  const quoteReveal = useScrollReveal();
  const whyReveal = useScrollReveal();
  const featuresReveal = useScrollReveal();
  const showcaseReveal = useScrollReveal();
  const securityReveal = useScrollReveal();
  const aiReveal = useScrollReveal();
  const pricingReveal = useScrollReveal();

  const faqs = [
    { q: 'What types of accounts can I track in FinAura?', a: 'FinAura supports 7 distinct account types: Bank Accounts, Credit Cards, Fixed Deposits (FD), Recurring Deposits (RD), Mutual Funds, Pay Later accounts, and custom Categories. Each account template is engineered with specific features, such as compound interest models for deposits, payment due counters for cards, and localized currency settings.' },
    { q: 'How does the offline encryption system work?', a: 'All records are saved directly onto your device inside a local database encrypted using AES-256 keys. We implement a zero-knowledge structure: your security key never leaves your browser, meaning no external servers can decrypt your files. You log in using a secure PIN + biometric authentication (FaceID/TouchID).' },
    { q: 'Can I import and export my financial vault?', a: 'Yes. FinAura allows you to download your entire vault at any time as an encrypted `.fvbackup` file. This lets you move your data between devices securely, perform personal backups, or restore your configuration in seconds without cloud accounts.' },
    { q: 'Does it support multi-currency formatting?', a: 'Absolutely. FinAura natively formats financial tracking across 150+ currencies. You can set individual account currencies, configure a base currency for your Net Worth summary, and switch formats dynamically within the app settings.' },
    { q: 'How does card cashback and bill tracking work?', a: 'For Credit Cards and Pay Later accounts, FinAura aggregates a dedicated ledger of expenses. You can toggle payment statuses (Paid, Unpaid, or Billed) to track monthly statement periods. Each transaction can be linked with flat or percentage cashback entries, automatically updating your global rewards tracker.' }
  ];

  const chatDialogs = [
    {
      q: 'Show my portfolio growth overview.',
      a: 'Analyzing 4 investment profiles. Mutual Funds are up 14.2% (₹72,400 gain). SBI FD is yielding a steady 7.10% compounded annually. Your total assets tracked have reached ₹12,48,500.'
    },
    {
      q: 'What is my credit card cashback breakdown?',
      a: 'You earned ₹1,820 cashback this month. ICICI Card led with ₹950 (2% grocery promo), followed by HDFC Card at ₹870. You have ₹1,200 pending in statement credits.'
    },
    {
      q: 'Do I have any bills or recurring deposits due?',
      a: 'Yes. Your HDFC Card bill is due on July 5th (₹12,500). Your SBI RD monthly installment of ₹10,000 is scheduled for July 10th. Auto-alert checks completed locally.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] overflow-x-hidden" style={{ fontFamily: "var(--font-sans)" }}>

      {/* ══════════════════════════════════════════
          1. NAVIGATION (FLOATING / TRANSLUCENT)
          ══════════════════════════════════════════ */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#0A0A0A]/80 border-b border-white/5 py-4 backdrop-blur-md' 
          : 'bg-transparent py-6'
      }`}>
        <div className="container-main flex justify-between items-center">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 flex items-center justify-center group-hover:scale-105 transition-transform rounded-xl overflow-hidden bg-white/5 border border-white/10">
              <img src="/icon-512.png" alt="FinAura Logo" className="w-8 h-8 object-cover filter brightness-90 grayscale contrast-125" />
            </div>
            <span className="text-[1.4rem] font-bold tracking-tight text-white">FinAura</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10">
            <a href="#features" className="text-[0.9rem] font-medium text-[#A8A8A8] hover:text-white transition-colors">Features</a>
            <a href="#showcase" className="text-[0.9rem] font-medium text-[#A8A8A8] hover:text-white transition-colors">Interface</a>
            <a href="#security" className="text-[0.9rem] font-medium text-[#A8A8A8] hover:text-white transition-colors">Security</a>
            <a href="#pricing" className="text-[0.9rem] font-medium text-[#A8A8A8] hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="text-[0.9rem] font-medium text-[#A8A8A8] hover:text-white transition-colors">FAQ</a>
          </div>

          {/* Right CTA */}
          <div className="hidden lg:flex items-center gap-6">
            <a href="#" className="button-matte text-[0.9rem] py-2.5 px-6">Get Started</a>
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-[#A8A8A8] hover:text-white">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-[#0A0A0A] border-b border-white/5 shadow-2xl py-6 px-8 flex flex-col gap-5">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-[#A8A8A8] hover:text-white py-2">Features</a>
            <a href="#showcase" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-[#A8A8A8] hover:text-white py-2">Interface</a>
            <a href="#security" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-[#A8A8A8] hover:text-white py-2">Security</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-[#A8A8A8] hover:text-white py-2">Pricing</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-[#A8A8A8] hover:text-white py-2">FAQ</a>
            <hr className="border-white/5 my-2" />
            <a href="#" className="button-matte text-center w-full">Get Started</a>
          </div>
        )}
      </nav>

      {/* ══════════════════════════════════════════
          2. HERO SECTION (SPLIT PREMIUM DESIGN)
          ══════════════════════════════════════════ */}
      <section className="relative pt-36 pb-24 lg:pt-48 lg:pb-36 overflow-hidden">
        {/* Ambient Subtle Reflection */}
        <div className="absolute top-[-20%] left-[30%] w-[60%] h-[50%] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />

        <div className="container-main relative z-10">
          <div
            ref={heroReveal.ref}
            className={`flex flex-col lg:flex-row items-center gap-16 transition-all duration-1000 ${
              heroReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Left Copy */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="heading-display text-white text-[3.25rem] md:text-[4rem] lg:text-[4.75rem] mb-6 tracking-tight">
                Own Your <br />
                <span className="text-metallic-silver">Financial Future.</span>
              </h1>
              <p className="text-[#A8A8A8] text-base md:text-lg lg:text-xl mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                An AI-powered personal finance platform that helps you track spending, automate budgeting, optimize investments, eliminate unnecessary expenses, and build lasting wealth—all in one beautifully engineered experience.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
                <a href="#" className="button-matte py-3 px-8 text-base font-medium">
                  Get Started
                </a>
                <a href="#showcase" className="button-outline py-3 px-8 text-base font-medium">
                  Watch Demo
                  <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </div>
              <p className="text-[#7B7B7B] text-[0.8rem] font-medium tracking-wide uppercase">
                100% Offline Vault • AES-256 Local Encryption • Zero Cloud Tracking
              </p>
            </div>

            {/* Right: Futuristic Finance Dashboard Preview */}
            <div className="flex-1 flex justify-center lg:justify-end relative mockup-glow">
              <div className="animate-subtle-float w-full max-w-lg">
                {/* Main Dashboard Frame */}
                <div className="bg-[#111111] rounded-[24px] border border-white/5 p-6 shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
                  
                  {/* Top Bar Mockup */}
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                      <span className="text-[10px] font-semibold text-[#7B7B7B] uppercase tracking-wider">Vault Dashboard</span>
                    </div>
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-white/20" />
                      <div className="w-2 h-2 rounded-full bg-white/10" />
                      <div className="w-2 h-2 rounded-full bg-white/5" />
                    </div>
                  </div>

                  {/* Main Grid inside Mockup */}
                  <div className="grid grid-cols-5 gap-5">
                    {/* Left Sidebar Mockup */}
                    <div className="col-span-2 space-y-4">
                      {/* Navigation menu list */}
                      <div className="space-y-1.5">
                        {['Overview', 'Cards', 'Investments', 'Cashback', 'Settings'].map((item, idx) => (
                          <div key={idx} className={`text-[10px] font-medium py-1.5 px-2.5 rounded-lg flex items-center gap-2 ${
                            idx === 0 ? 'bg-white/5 text-white font-semibold' : 'text-[#7B7B7B]'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-white' : 'bg-transparent'}`} />
                            {item}
                          </div>
                        ))}
                      </div>

                      {/* Mini Donut Segment */}
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col items-center">
                        <span className="text-[8px] font-semibold text-[#7B7B7B] uppercase tracking-wider mb-2">Assets</span>
                        <div className="relative w-12 h-12 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="3" />
                            <circle cx="18" cy="18" r="16" fill="none" stroke="#C9CCD1" strokeWidth="3" strokeDasharray="60 100" />
                            <circle cx="18" cy="18" r="16" fill="none" stroke="#7B7B7B" strokeWidth="3" strokeDasharray="25 100" strokeDashoffset="-60" />
                          </svg>
                          <span className="absolute text-[8px] font-bold text-white">72%</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Main Panel Mockup */}
                    <div className="col-span-3 space-y-4">
                      {/* Balance Display */}
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-[8px] font-medium text-[#7B7B7B] uppercase tracking-widest block mb-1">Total Net Worth</span>
                        <span className="text-xl font-bold text-white tracking-tight">₹12,48,500<span className="text-white/40">.00</span></span>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-[8px] font-medium px-1.5 py-0.5 rounded bg-white/5 text-[#A8A8A8]">Base INR</span>
                          <span className="text-[8px] font-medium text-emerald-400">Online Sync Offline</span>
                        </div>
                      </div>

                      {/* Mini Ledger */}
                      <div className="space-y-1.5">
                        {[
                          { name: 'HDFC Savings', tag: 'Bank', bal: '₹3,45,000' },
                          { name: 'ICICI Rubyx', tag: 'Card', bal: '₹12,500' },
                          { name: 'SBI FD Growth', tag: 'FD', bal: '₹5,00,000' }
                        ].map((acc, i) => (
                          <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-white/[0.01] border border-white/5">
                            <div>
                              <p className="text-[9px] font-bold text-white">{acc.name}</p>
                              <span className="text-[7px] text-[#7B7B7B]">{acc.tag}</span>
                            </div>
                            <span className="text-[9px] font-semibold text-[#A8A8A8]">{acc.bal}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendation Alert */}
                  <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-white/80 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-[9px] font-bold text-white">AI Suggestion</h4>
                      <p className="text-[8px] text-[#A8A8A8] leading-normal">"ICICI Card statement of ₹12,500 is due. Pay using local shortcuts to earn up to ₹250 flat cashback."</p>
                    </div>
                  </div>
                </div>

                {/* Layered Floating Card: Portfolio NAV */}
                <div className="absolute top-[-25px] right-[-20px] bg-[#171717] rounded-xl border border-white/10 p-3 shadow-2xl flex items-center gap-3 backdrop-blur-md">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <LineChart className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-[8px] text-[#7B7B7B] uppercase block">Mutual Fund NAV</span>
                    <span className="text-xs font-bold text-white">₹3,91,000 <span className="text-emerald-400 font-normal">+14.2%</span></span>
                  </div>
                </div>

                {/* Layered Floating Card: Local Security Status */}
                <div className="absolute bottom-[-15px] left-[-20px] bg-[#171717] rounded-xl border border-white/10 p-3 shadow-2xl flex items-center gap-3 backdrop-blur-md">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[8px] text-[#7B7B7B] uppercase block">Vault Security</span>
                    <span className="text-xs font-bold text-white">AES-256 Encrypted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3. SOCIAL PROOF / BRAND MARQUEE (MONOCHROME)
          ══════════════════════════════════════════ */}
      <section className="py-14 border-y border-white/5 bg-[#0B0B0B]">
        <div className="container-main mb-6 text-center">
          <span className="text-[0.75rem] font-semibold text-[#7B7B7B] uppercase tracking-[0.2em]">Partner Integrations & Features</span>
        </div>
        <div className="marquee-container relative">
          {/* Fades */}
          <div className="absolute top-0 left-0 bottom-0 w-24 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-l from-[#0A0A0A] to-transparent z-10 pointer-events-none" />

          <div className="marquee-track animate-marquee-slow">
            {[...Array(2)].map((_, setIdx) => (
              <React.Fragment key={setIdx}>
                {[
                  { name: '7 Account Configurations' },
                  { name: 'CRED Payment Link' },
                  { name: 'Google Pay' },
                  { name: '150+ Currencies Supported' },
                  { name: 'Local PIN Access' },
                  { name: 'Biometric FaceID' },
                  { name: 'PhonePe Shortcut' },
                  { name: 'Encrypted backups (.fvbackup)' }
                ].map((item, i) => (
                  <div key={`${setIdx}-${i}`} className="flex items-center gap-3 mx-12">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#A8A8A8]" />
                    <span className="text-[0.95rem] font-medium tracking-tight text-[#7B7B7B] whitespace-nowrap">{item.name}</span>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4. STATS SECTION (LARGE TYPOGRAPHY)
          ══════════════════════════════════════════ */}
      <section className="section-padding bg-[#0A0A0A] relative">
        <div className="container-main">
          <div
            ref={statsReveal.ref}
            className={`flex flex-col lg:flex-row gap-16 items-center transition-all duration-1000 ${
              statsReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Left Copy */}
            <div className="flex-1 lg:max-w-lg text-center lg:text-left">
              <h2 className="heading-section text-[2.25rem] md:text-[2.75rem] mb-6 text-white tracking-tight">
                One Vault. <br />
                <span className="text-metallic-silver">Infinite Clarity.</span>
              </h2>
              <p className="text-[#A8A8A8] text-base mb-8 leading-relaxed font-light">
                FinAura centralizes your entire portfolio locally. Say goodbye to separate apps for bank statements, investments, credit cards, and cashback tallies.
              </p>
              <a href="#features" className="button-outline text-sm">
                Explore Core System
              </a>
            </div>

            {/* Right: Stats Grid */}
            <div className="flex-1 grid grid-cols-2 gap-6 w-full max-w-lg">
              {[
                { ref: stat1.ref, count: stat1.count, suffix: 'B', label: 'In Assets Monitored' },
                { ref: stat2.ref, count: stat2.count, suffix: '%', label: 'Local Platform Uptime' },
                { ref: stat3.ref, count: stat3.count, suffix: '★', label: 'Average User Rating' },
                { ref: stat4.ref, count: stat4.count, suffix: 'K+', label: 'Active Vault Keys' }
              ].map((s, i) => (
                <div key={i} ref={s.ref} className="bg-[#111111] border border-white/5 rounded-2xl p-6 text-center hover:border-white/10 transition-all duration-300">
                  <div className="text-[2.5rem] font-extrabold text-white tracking-tight mb-1">{s.count}{s.suffix}</div>
                  <p className="text-xs text-[#7B7B7B] uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          5. TESTIMONIAL QUOTE (MINIMAL DESIGN)
          ══════════════════════════════════════════ */}
      <section className="py-24 bg-[#111111]/40 border-y border-white/5 relative">
        <div
          ref={quoteReveal.ref}
          className={`container-main max-w-3xl text-center transition-all duration-1000 ${
            quoteReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-[#A8A8A8]/20 mb-6">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
            </svg>
          </div>
          <blockquote className="text-xl md:text-2xl font-normal text-[#F5F5F5] leading-relaxed mb-8">
            "I track my HDFC savings, three credit cards, two FDs, and a mutual fund—all in one place. The cashback tracker alone saved me from forgetting <span className="text-white font-semibold">₹8,000 in statement rewards</span> last year."
          </blockquote>
          <div>
            <p className="font-bold text-white text-base">Arjun Mehta</p>
            <p className="text-[#7B7B7B] text-sm">Lead Engineer, Bangalore</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          6. WHY FINAURA WORKS (TWO-COLUMN DETAILS)
          ══════════════════════════════════════════ */}
      <section className="section-padding bg-[#0A0A0A] relative">
        <div className="container-main">
          <div
            ref={whyReveal.ref}
            className={`flex flex-col lg:flex-row gap-16 items-start transition-all duration-1000 ${
              whyReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Left sticky column */}
            <div className="flex-1 lg:sticky lg:top-32">
              <h2 className="heading-section text-[2.25rem] md:text-[2.75rem] mb-6 text-white tracking-tight">
                Designed for <br />
                <span className="text-metallic-silver">Total Autonomy.</span>
              </h2>
              <p className="text-[#A8A8A8] text-base mb-8 leading-relaxed font-light max-w-sm">
                FinAura runs entirely on your device with high-performance local structures, bypassing cloud databases to protect your personal balances.
              </p>
              <a href="#" className="button-matte">
                Open Secure Vault
              </a>
            </div>

            {/* Right: Feature columns */}
            <div className="flex-1 space-y-12">
              {[
                {
                  icon: <Layers className="w-6 h-6 text-white" />,
                  title: '7 Specific Account Templates',
                  desc: 'Manage Bank Accounts, Credit Cards, RDs, FDs, Mutual Funds, Pay Later accounts, and custom entries. Each template includes automatic calculators, maturity alerts, and payment trackers built for that account style.'
                },
                {
                  icon: <CreditCard className="w-6 h-6 text-white" />,
                  title: 'Cashback & Transaction Ledgers',
                  desc: 'Log individual card purchases with targeted cashback percentages. Compile statements, classify paid/unpaid cycles, and execute quick payment actions via native links to GPay, PhonePe, Paytm, or CRED.'
                },
                {
                  icon: <Lock className="w-6 h-6 text-white" />,
                  title: 'Device-Bound AES-256 Vault',
                  desc: 'Protect data with hardware-level security. Features PIN authorization, FaceID/TouchID configurations, and recovery setup. Back up your financial profiles instantly using encrypted `.fvbackup` exports.'
                }
              ].map((step, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-[#A8A8A8] text-sm leading-relaxed font-light">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          7. FEATURE GRID (SIX METALLIC CARDS)
          ══════════════════════════════════════════ */}
      <section id="features" className="section-padding bg-[#111111]/40 border-y border-white/5 relative">
        <div className="container-main">
          <div
            ref={featuresReveal.ref}
            className={`text-center mb-16 max-w-2xl mx-auto transition-all duration-1000 ${
              featuresReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="heading-section text-[2.25rem] md:text-[2.75rem] mb-4 text-white">Everything Your Vault Can Do</h2>
            <p className="text-[#A8A8A8] text-base font-light">From bank accounts to mutual funds, expense logs to cashback tracking—FinAura handles it all.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Layers className="w-6 h-6" />, title: '7 Account Types', desc: 'Track Bank Accounts, Credit Cards, Fixed Deposits, Recurring Deposits, Mutual Funds, Pay Later services, and custom categories—each with tailored features.' },
              { icon: <CreditCard className="w-6 h-6" />, title: 'Expense & Bill Tracking', desc: 'Log card expenses with cashback, generate monthly bills, filter by paid/unpaid/billed status, and pay via CRED, GPay, PhonePe, Paytm & more.' },
              { icon: <BarChart3 className="w-6 h-6" />, title: 'Interactive Charts', desc: 'Visualize your finances with donut charts, bar charts, and horizontal bar charts. See asset allocation and spending breakdowns at a glance.' },
              { icon: <DollarSign className="w-6 h-6" />, title: 'Cashback Tracker', desc: 'A dedicated section to log cashback from any source, view per-source breakdowns, and track your total rewards earned across all cards.' },
              { icon: <Globe className="w-6 h-6" />, title: '150+ Currencies', desc: 'Choose from over 150 fiat currencies with smart locale formatting. Change your preferred currency anytime from Settings.' },
              { icon: <Shield className="w-6 h-6" />, title: 'Military-Grade Security', desc: 'PIN + biometric auth (FaceID/TouchID), security question recovery, configurable auto-lock timeout, AES-256 encryption, and encrypted vault export/import.' }
            ].map((f, i) => (
              <div key={i} className="metal-card p-8 flex flex-col items-start">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-white">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{f.title}</h3>
                <p className="text-[#A8A8A8] text-sm leading-relaxed font-light">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          8. PRODUCT SHOWCASE (INTERACTIVE/CUSTOM PANELS)
          ══════════════════════════════════════════ */}
      <section id="showcase" className="section-padding bg-[#0A0A0A] relative">
        <div className="container-main">
          <div
            ref={showcaseReveal.ref}
            className={`text-center mb-16 max-w-2xl mx-auto transition-all duration-1000 ${
              showcaseReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="text-[0.75rem] font-semibold text-[#7B7B7B] uppercase tracking-[0.2em] mb-3 block">Product Showcase</span>
            <h2 className="heading-section text-[2.25rem] md:text-[2.75rem] mb-4 text-white">Interactive Capabilities</h2>
            <p className="text-[#A8A8A8] text-base font-light">Explore a curated preview of FinAura's core tracking tools, designed for efficiency.</p>
            
            {/* Tab controls */}
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {['Smart Budgeting', 'Expense Analytics', 'Investment Portfolio', 'Cashback Ledger'].map((tab, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveShowcase(idx)}
                  className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all ${
                    activeShowcase === idx
                      ? 'bg-white text-[#0A0A0A] border-white'
                      : 'bg-transparent text-[#A8A8A8] border-white/5 hover:border-white/20'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Showcase Display Area */}
          <div className="bg-[#111111] border border-white/5 rounded-[24px] p-8 md:p-12 shadow-2xl relative overflow-hidden mockup-glow">
            
            {activeShowcase === 0 && (
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="flex-1 space-y-5">
                  <span className="text-xs font-bold text-white bg-white/5 py-1 px-3 rounded-full border border-white/10">Dynamic Budgets</span>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Control Category Balances</h3>
                  <p className="text-[#A8A8A8] text-sm leading-relaxed font-light">
                    Establish custom spending limitations per account. Unlike other platforms, FinAura doesn't force automated assumptions. You designate every amount to configure a clean, readable envelope budget.
                  </p>
                  <ul className="space-y-2 text-xs text-[#7B7B7B]">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-white" /> Configured 100% locally
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-white" /> No bank scraper required
                    </li>
                  </ul>
                </div>
                <div className="flex-1 w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4">
                  <span className="text-[10px] font-semibold text-[#7B7B7B] uppercase tracking-widest block">Budget Envelope Allocations</span>
                  {[
                    { cat: 'Utilities & Bills', spent: '₹4,500', limit: '₹10,000', pct: 45, color: '#C9CCD1' },
                    { cat: 'Groceries & Foods', spent: '₹8,200', limit: '₹12,000', pct: 68, color: '#FFFFFF' },
                    { cat: 'Leisure & Subscriptions', spent: '₹2,100', limit: '₹5,000', pct: 42, color: '#7B7B7B' }
                  ].map((b, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-white">{b.cat}</span>
                        <span className="text-[#A8A8A8]">{b.spent} / {b.limit}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${b.pct}%`, background: b.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeShowcase === 1 && (
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="flex-1 space-y-5">
                  <span className="text-xs font-bold text-white bg-white/5 py-1 px-3 rounded-full border border-white/10">Instant Analytics</span>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Structured Asset Ratios</h3>
                  <p className="text-[#A8A8A8] text-sm leading-relaxed font-light">
                    Track allocations via 3 distinct chart systems: Donut charts for asset configuration, Bar charts for monthly trends, and Horizontal lists to identify outliers. Filter accounts in real-time.
                  </p>
                </div>
                <div className="flex-1 w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                  <span className="text-[10px] font-semibold text-[#7B7B7B] uppercase tracking-widest block mb-4">Asset Breakdown (Horizontal)</span>
                  <div className="space-y-4">
                    {[
                      { type: 'Fixed Deposits (SBI)', val: '₹5,00,000', pct: 40 },
                      { type: 'Bank Balances (HDFC)', val: '₹3,45,000', pct: 28 },
                      { type: 'Mutual Funds (NAV)', val: '₹3,91,000', pct: 31 },
                      { type: 'Credit Cards (Debt)', val: '-₹12,500', pct: 1 }
                    ].map((a, i) => (
                      <div key={i} className="flex items-center gap-4 text-xs">
                        <span className="w-32 truncate font-semibold text-[#A8A8A8]">{a.type}</span>
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-white/55 rounded-full" style={{ width: `${a.pct}%` }} />
                        </div>
                        <span className="w-20 text-right font-bold text-white">{a.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeShowcase === 2 && (
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="flex-1 space-y-5">
                  <span className="text-xs font-bold text-white bg-white/5 py-1 px-3 rounded-full border border-white/10">Deposits & Funds</span>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Compound Interest Engines</h3>
                  <p className="text-[#A8A8A8] text-sm leading-relaxed font-light">
                    Log Fixed Deposits and Recurring Deposits. FinAura computes your interest yields, tracks maturity milestones, and marks monthly RD transactions automatically based on customized durations.
                  </p>
                </div>
                <div className="flex-1 w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-3">
                  <span className="text-[10px] font-semibold text-[#7B7B7B] uppercase tracking-widest block mb-1">Maturity Ledger</span>
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">SBI FD #1</p>
                      <span className="text-[10px] text-[#7B7B7B]">Matures: Jan 15, 2027 • Yield: 7.10%</span>
                    </div>
                    <span className="font-bold text-white">₹5,00,000</span>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">HDFC RD #2</p>
                      <span className="text-[10px] text-[#7B7B7B]">Installment Due: July 10th</span>
                    </div>
                    <span className="font-bold text-[#A8A8A8]">₹10,000 / mo</span>
                  </div>
                </div>
              </div>
            )}

            {activeShowcase === 3 && (
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="flex-1 space-y-5">
                  <span className="text-xs font-bold text-white bg-white/5 py-1 px-3 rounded-full border border-white/10">Statement Rewards</span>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Cashback Accounting</h3>
                  <p className="text-[#A8A8A8] text-sm leading-relaxed font-light">
                    Log and optimize cashback percentages. Monitor statement credits, tag transactions, and calculate accumulated totals across HDFC, ICICI, or SBI cards.
                  </p>
                </div>
                <div className="flex-1 w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-[10px] font-semibold text-[#7B7B7B] uppercase tracking-widest">Active Card Cashback</span>
                    <span className="text-xs font-bold text-emerald-400">Total: ₹8,420</span>
                  </div>
                  {[
                    { source: 'Amazon Pay (ICICI)', details: '5% Flat on Shopping', rewards: '₹4,500' },
                    { source: 'Tata Neu (HDFC)', details: '5% NeuCoins reward', rewards: '₹2,100' },
                    { source: 'Flipkart VIP (Axis)', details: '1.5% Unlimited', rewards: '₹1,820' }
                  ].map((cb, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs py-1">
                      <div>
                        <p className="font-semibold text-white">{cb.source}</p>
                        <span className="text-[10px] text-[#7B7B7B]">{cb.details}</span>
                      </div>
                      <span className="font-bold text-white">{cb.rewards}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          9. SECURITY SECTION (HARDWARE STYLED PANELS)
          ══════════════════════════════════════════ */}
      <section id="security" className="section-padding bg-[#111111]/40 border-y border-white/5 relative">
        <div className="container-main">
          <div
            ref={securityReveal.ref}
            className={`flex flex-col lg:flex-row items-center gap-16 transition-all duration-1000 ${
              securityReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
                <Lock className="w-3.5 h-3.5 text-white" />
                <span className="text-xs font-semibold text-[#A8A8A8]">Zero-Cloud Architecture</span>
              </div>
              <h2 className="heading-section text-[2.5rem] md:text-[3rem] mb-6 text-white tracking-tight">
                No Cloud Accounts.<br />
                <span className="text-metallic-silver">Your Device is the Vault.</span>
              </h2>
              <p className="text-[#A8A8A8] text-base mb-10 leading-relaxed font-light">
                We take financial privacy as seriously as you do. Every record is stored locally, protected by biometric authentication, and locked behind offline AES-256 configurations.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { icon: <Shield className="w-4 h-4 text-white" />, title: 'AES-256 Storage' },
                  { icon: <Fingerprint className="w-4 h-4 text-white" />, title: 'PIN + Biometrics' },
                  { icon: <Moon className="w-4 h-4 text-white" />, title: 'Auto-Lock Timers' },
                  { icon: <FileText className="w-4 h-4 text-white" />, title: 'Encrypted Backups' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="font-semibold text-white text-sm">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 flex justify-center">
              <div className="w-72 h-72 md:w-80 md:h-80 rounded-full bg-white/[0.01] border border-white/5 flex items-center justify-center relative">
                <div className="w-52 h-52 md:w-56 md:h-56 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center">
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <Lock className="w-10 h-10 text-white" strokeWidth={1.5} />
                  </div>
                </div>
                {/* Orbiting indicators */}
                <div className="absolute top-4 right-8 w-2 h-2 rounded-full bg-[#A8A8A8]" />
                <div className="absolute bottom-8 left-4 w-1.5 h-1.5 rounded-full bg-white/30" />
                <div className="absolute top-1/2 right-0 w-2.5 h-2.5 rounded-full bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          10. AI ASSISTANT CHAT INTERFACE SHOWCASE
          ══════════════════════════════════════════ */}
      <section className="section-padding bg-[#0A0A0A] relative">
        <div className="container-main">
          <div
            ref={aiReveal.ref}
            className={`flex flex-col lg:flex-row items-center gap-16 transition-all duration-1000 ${
              aiReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Left Copy */}
            <div className="flex-1 space-y-6">
              <span className="text-xs font-bold text-white bg-white/5 py-1 px-3 rounded-full border border-white/10 inline-block">AI Assistant</span>
              <h2 className="heading-section text-[2.25rem] md:text-[2.75rem] text-white tracking-tight">
                Get Answers <br />
                <span className="text-metallic-silver">From Your Data.</span>
              </h2>
              <p className="text-[#A8A8A8] text-base leading-relaxed font-light">
                Ask questions regarding portfolios, cashback ratios, statement deadlines, or deposits. FinAura computes summaries locally using privacy-focused intelligence on your device.
              </p>
              
              <div className="flex flex-col gap-2">
                {chatDialogs.map((dialog, idx) => (
                  <button
                    key={idx}
                    onClick={() => setChatPrompt(idx)}
                    className={`text-left p-3 rounded-xl border text-xs font-semibold transition-all ${
                      chatPrompt === idx
                        ? 'bg-white/5 border-white text-white'
                        : 'bg-transparent border-white/5 text-[#A8A8A8] hover:border-white/10'
                    }`}
                  >
                    "{dialog.q}"
                  </button>
                ))}
              </div>
            </div>

            {/* Right Chat UI Mockup */}
            <div className="flex-1 w-full max-w-lg bg-[#111111] border border-white/5 rounded-[24px] p-6 shadow-2xl space-y-4 relative">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">AI Local Assistant</span>
                </div>
                <Cpu className="w-3.5 h-3.5 text-[#7B7B7B]" />
              </div>

              {/* Chat thread */}
              <div className="space-y-4 min-h-[160px] flex flex-col justify-end">
                {/* User Prompt */}
                <div className="flex justify-end">
                  <div className="bg-[#171717] border border-white/5 p-3 rounded-2xl max-w-[80%]">
                    <p className="text-xs text-white">"{chatDialogs[chatPrompt].q}"</p>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex justify-start items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-white">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl max-w-[80%]">
                    <p className="text-xs text-[#A8A8A8] leading-relaxed">
                      {chatDialogs[chatPrompt].a}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          11. PRICING SECTION (MATTE METAL CARDS)
          ══════════════════════════════════════════ */}
      <section id="pricing" className="section-padding bg-[#111111]/40 border-y border-white/5 relative">
        <div className="container-main">
          <div
            ref={pricingReveal.ref}
            className={`text-center mb-16 max-w-2xl mx-auto transition-all duration-1000 ${
              pricingReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="heading-section text-[2.25rem] md:text-[2.75rem] mb-4 text-white">Simple, Transparent Pricing</h2>
            <p className="text-[#A8A8A8] text-base font-light">Start free. Upgrade when you are ready. No hidden contracts.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-[1000px] mx-auto items-stretch">
            {[
              {
                name: 'Free',
                price: '$0',
                period: '/forever',
                desc: 'Full-featured. No limits. No catch.',
                features: ['All 7 account templates', 'Unlimited transactions', 'Card cashback ledgers', 'Donut, Bar & Horizontal charts', '150+ Currencies', 'Encrypted `.fvbackup` exports', 'PIN + biometric protection', 'PWA standalone install'],
                btn: 'Get Started Free',
                featured: false
              },
              {
                name: 'Pro',
                price: '$4.99',
                period: '/month',
                desc: 'Premium features coming soon.',
                features: ['Everything in Free', 'Encrypted cloud-sync', 'Multi-device operations', 'Targeted category rules', 'Advanced spending summaries', 'Priority query tickets'],
                btn: 'Join Waitlist',
                featured: true
              },
              {
                name: 'Family',
                price: '$9.99',
                period: '/month',
                desc: 'Shared finances, private vaults.',
                features: ['Everything in Pro', 'Up to 5 accounts', 'Shared household allocations', 'Private individual sub-vaults', 'Split balance ledger'],
                btn: 'Join Waitlist',
                featured: false
              }
            ].map((plan, i) => (
              <div key={i} className={`flex flex-col justify-between p-8 rounded-2xl border transition-all ${
                plan.featured 
                  ? 'bg-[#171717] border-white/20 shadow-2xl scale-[1.03]' 
                  : 'bg-[#111111]/30 border-white/5'
              }`}>
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    {plan.featured && <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-white border border-white/10">Recommended</span>}
                  </div>
                  <div className="mb-4">
                    <span className="text-[2.5rem] font-extrabold text-white tracking-tight">{plan.price}</span>
                    <span className="text-xs text-[#7B7B7B]">{plan.period}</span>
                  </div>
                  <p className="text-xs text-[#A8A8A8] mb-6">{plan.desc}</p>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2.5 text-xs text-[#A8A8A8]">
                        <Check className="w-3.5 h-3.5 text-white flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button className={`w-full py-2.5 rounded-full text-xs font-semibold transition-all ${
                  plan.featured 
                    ? 'bg-white text-[#0A0A0A] hover:bg-[#E3E5E8]' 
                    : 'bg-transparent border border-white/10 text-white hover:bg-white/5'
                }`}>
                  {plan.btn}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          12. FAQ (ACCORDION STYLE)
          ══════════════════════════════════════════ */}
      <section id="faq" className="section-padding bg-[#0A0A0A]">
        <div className="container-main max-w-3xl">
          <h2 className="heading-section text-[2.25rem] md:text-[2.75rem] mb-4 text-center text-white">Frequently Asked Questions</h2>
          <p className="text-[#A8A8A8] text-base font-light text-center mb-14">Everything you need to know about FinAura's design & security architecture.</p>

          <div className="border-t border-white/5">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="faq-item"
                open={openFaq === i}
                onToggle={(e) => setOpenFaq(e.target.open ? i : null)}
              >
                <summary>
                  <span className="text-sm font-semibold tracking-tight">{faq.q}</span>
                  <ChevronDown className="w-4 h-4 text-[#7B7B7B] chevron-icon" />
                </summary>
                <div className="faq-answer text-sm leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          13. FINAL CTA
          ══════════════════════════════════════════ */}
      <section className="section-padding bg-[#111111]/30 border-t border-white/5 text-center relative overflow-hidden">
        <div className="container-main relative z-10">
          <h2 className="heading-display text-[2.5rem] md:text-[3.25rem] text-white mb-6 max-w-3xl mx-auto tracking-tight">
            Start Building Better <br />
            <span className="text-metallic-silver">Financial Habits Today.</span>
          </h2>
          <p className="text-[#A8A8A8] text-base mb-10 max-w-xl mx-auto leading-relaxed font-light">
            Download your personal database, configure account entries, and monitor balances securely. FinAura is completely free to install.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#" className="button-matte py-3 px-10 text-sm font-semibold">
              Open Your Vault — Free
            </a>
            <a href="#features" className="button-outline py-3 px-8 text-sm font-semibold">
              Explore Capabilities
            </a>
          </div>
          <p className="text-[#7B7B7B] text-xs mt-6">PWA Installer • Offline • No Credit Card</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          14. FOOTER
          ══════════════════════════════════════════ */}
      <footer className="bg-[#0A0A0A] border-t border-white/5 text-[#7B7B7B] pt-20 pb-12">
        <div className="container-main">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
            
            {/* Brand Block */}
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <img src="/icon-512.png" alt="FinAura Logo" className="w-6 h-6 object-cover filter grayscale contrast-125" />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">FinAura</span>
              </div>
              <p className="text-xs text-[#A8A8A8] leading-relaxed max-w-xs mb-6 font-light">
                A premium, privacy-first personal finance operating system. Secure, offline, and beautifully engineered.
              </p>
              <div className="flex gap-4">
                {[Twitter, Github, Linkedin, Instagram].map((Icon, i) => (
                  <a key={i} href="#" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#7B7B7B] hover:text-white hover:border-white/20 transition-all">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            {[
              { title: 'Product', links: ['Dashboard', 'Cards Ledger', 'Investments Tracker', 'Cashback Registry', 'Settings'] },
              { title: 'Features', links: ['7 Account Styles', 'Compound Interest', 'Statements Management', 'Offline Recovery', 'Backups System'] },
              { title: 'Security', links: ['AES-256 Standard', 'Biometric Lock', 'PIN Cryptography', 'Zero-Cloud Policy', 'Safety Keys'] }
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-semibold text-xs text-white uppercase tracking-wider mb-5">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link, li) => (
                    <li key={li}>
                      <a href="#" className="text-xs hover:text-white transition-colors font-light">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[0.7rem] text-[#7B7B7B] font-light">
              Developed by Velo Launch <br /> A Company by Smart Vista IT Solutions
            </p>
            <div className="flex gap-6 text-[0.7rem] text-[#7B7B7B] font-light">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
