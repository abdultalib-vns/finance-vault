import { useState, useMemo } from "react";
import { 
  HelpCircle, 
  BookOpen, 
  ShieldCheck, 
  Key, 
  Bot, 
  Sparkles, 
  RefreshCw, 
  Gift, 
  Lock, 
  Smartphone, 
  CreditCard, 
  Building2, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  CheckCircle2, 
  Zap, 
  X, 
  Info, 
  ArrowRight,
  Database,
  QrCode,
  Shield,
  FileCheck
} from "lucide-react";

interface Props {
  onClose: () => void;
}

type GuideCategory = "all" | "getting-started" | "security" | "ai" | "sync" | "cashback" | "faq";

interface GuideItem {
  id: string;
  category: GuideCategory;
  title: string;
  badge?: string;
  icon: typeof HelpCircle;
  summary: string;
  steps?: string[];
  tips?: string[];
  callout?: string;
}

interface FAQItem {
  question: string;
  answer: string;
  category: GuideCategory;
}

export default function HelpGuideModal({ onClose }: Props) {
  const [activeCategory, setActiveCategory] = useState<GuideCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);

  const categories = [
    { id: "all", label: "All Topics", icon: BookOpen },
    { id: "getting-started", label: "Getting Started", icon: Zap },
    { id: "security", label: "Security & PIN", icon: ShieldCheck },
    { id: "ai", label: "AI Assistant", icon: Bot },
    { id: "sync", label: "QuickSync", icon: RefreshCw },
    { id: "cashback", label: "Cashback & Bills", icon: Gift },
    { id: "faq", label: "FAQs", icon: HelpCircle },
  ] as const;

  const guides: GuideItem[] = [
    {
      id: "quick-start",
      category: "getting-started",
      title: "FinAura Quick Start Guide",
      badge: "Core Basics",
      icon: Zap,
      summary: "FinAura is a 100% zero-knowledge, offline-first personal finance tracker. All your financial accounts, card numbers, and balances remain encrypted exclusively on your local device.",
      steps: [
        "1. Create your secure 4-6 digit Vault PIN upon first launch.",
        "2. Add your Bank Accounts, Credit Cards, FDs, RDs, or Mutual Funds with the '+' action button.",
        "3. Track your overall Net Worth, monthly dues, and closing bank balance in the live Dashboard.",
        "4. Log expenses, record cashback rewards, and set bill due date alerts."
      ],
      tips: [
        "Your Master Key is derived from your PIN using PBKDF2 with 100,000 hashing rounds.",
        "No account creation or cloud login is ever required."
      ]
    },
    {
      id: "accounts-and-cards",
      category: "getting-started",
      title: "Managing Accounts, Cards & Portfolios",
      badge: "Asset Management",
      icon: CreditCard,
      summary: "Add and organize diverse financial instruments into structured, categorized vault items.",
      steps: [
        "Go to the Cards tab to manage credit cards, credit limits, statements, and payment due dates.",
        "Go to the Investments tab to record Bank Savings, Fixed Deposits, Recurring Deposits, and Mutual Funds.",
        "Tap on any item to view detailed analytics, interest rates, maturity calculations, or log new transactions.",
        "Swipe left on any account to quickly edit details or remove it from your vault."
      ],
      tips: [
        "Card numbers and sensitive credentials can be hidden with the one-tap privacy toggle.",
        "Calculations for FD & RD maturity interest are updated in real-time."
      ]
    },
    {
      id: "zero-knowledge-security",
      category: "security",
      title: "Zero-Knowledge Encryption Architecture",
      badge: "AES-256 GCM",
      icon: ShieldCheck,
      summary: "How FinAura secures your financial information with military-grade client-side encryption.",
      steps: [
        "All data is encrypted with AES (Advanced Encryption Standard) via CryptoJS before touching local storage.",
        "Your PIN acts as the encryption key. Even if your device backup is inspected, raw secrets cannot be decrypted without your PIN.",
        "Auto-Lock timer automatically locks your vault when inactive (configurable from 1 to 30 minutes in Settings).",
        "Enable Biometrics (WebAuthn / Face ID / Fingerprint) in Settings for fast, frictionless unlocking."
      ],
      callout: "Important: Because FinAura is zero-knowledge, there is no server-side 'Forgot PIN' reset. Always remember your PIN or keep an encrypted backup file."
    },
    {
      id: "backup-and-restore",
      category: "security",
      title: "Encrypted Backup & Data Portability",
      badge: "Data Ownership",
      icon: Database,
      summary: "Safely export your entire financial history into an encrypted portable backup file.",
      steps: [
        "Open Settings > Backup & Restore.",
        "Tap 'Export Encrypted Backup' to download your JSON backup file.",
        "To restore on another phone, laptop, or browser, tap 'Import Backup File' and enter the PIN used when creating the backup.",
        "Your data is seamlessly restored with all accounts, histories, cashbacks, and settings intact."
      ]
    },
    {
      id: "ai-assistant-features",
      category: "ai",
      title: "AI Receipt Scanning & Natural Entry",
      badge: "Smart AI",
      icon: Bot,
      summary: "Leverage intelligent multimodal AI to scan receipts, parse statements, and chat with your vault.",
      steps: [
        "Open Settings > AI Assistant Settings and select your preferred provider (VeloAI, Google Gemini, OpenRouter, or Groq).",
        "Tap the floating AI Lotus button on your screen to open the Vault AI Assistant.",
        "Use Natural Language: type 'I paid $85 for dinner on Amex Gold' to automatically parse and log expenses.",
        "Use Smart Receipt Scan: upload a photo of a restaurant or shopping receipt to automatically extract merchant, date, amount, and items."
      ],
      tips: [
        "VeloAI includes free daily AI queries without requiring your own API key.",
        "Your API keys are stored encrypted locally in your browser."
      ]
    },
    {
      id: "quicksync-e2e",
      category: "sync",
      title: "QuickSync End-to-End Multi-Device Sync",
      badge: "P2P WebRTC",
      icon: RefreshCw,
      summary: "Transfer and synchronize your vault across your phone, tablet, and PC without any cloud storage.",
      steps: [
        "Open Settings > QuickSync or tap the Sync action.",
        "On Device 1, choose 'Generate Sync QR Code' or 'Create Sync Room'.",
        "On Device 2, scan the QR code or enter the 6-character room passphrase.",
        "Data is transmitted directly device-to-device through an end-to-end encrypted WebRTC channel."
      ]
    },
    {
      id: "cashback-rewards",
      category: "cashback",
      title: "Cashback Tracker & Due Date Alerts",
      badge: "Savings Tracker",
      icon: Gift,
      summary: "Maximize your credit card rewards, track cumulative rebates, and never miss a payment deadline.",
      steps: [
        "Go to the Cashback tab to see total earnings, active month yields, and best-performing cards.",
        "When logging an expense, enter the cashback amount earned (e.g. 5% on Amazon / 2% on Dining).",
        "FinAura tracks upcoming due dates and triggers the Notification Bell alert when a bill is due.",
        "Tap 'Pay Now' on any notification to directly open your preferred payment apps (GPay, PhonePe, Paytm, CRED, etc.)."
      ]
    }
  ];

  const faqs: FAQItem[] = [
    {
      question: "Is my financial data uploaded to any cloud server?",
      answer: "No. FinAura is 100% offline-first and zero-knowledge. All accounts, card numbers, transaction logs, and balances are encrypted on your local device with AES-256. No telemetry, tracking, or financial data is ever transmitted to any external server.",
      category: "security"
    },
    {
      question: "What happens if I forget my Vault PIN?",
      answer: "Because FinAura uses zero-knowledge encryption where your PIN is the decryption key, there is no master backdoor or server reset. We recommend creating an Encrypted Backup from Settings periodically and storing your PIN in a secure password manager.",
      category: "security"
    },
    {
      question: "Can I use FinAura on both my phone and my laptop/PC?",
      answer: "Yes! FinAura features a responsive investor-grade UI on wide desktop screens (PC & laptops) and a portrait mobile interface on phones. You can sync your data between devices anytime using QuickSync (QR Code / P2P) or by importing a backup JSON file.",
      category: "sync"
    },
    {
      question: "Which AI models are supported for Receipt Scanning?",
      answer: "FinAura supports VeloAI (built-in), Google Gemini (Gemini 2.5 Flash / 1.5 Pro), OpenRouter (Claude 3.7, GPT-4o, DeepSeek R1), and Groq (Llama 3.3 70B). You can configure your provider anytime in Settings > AI Assistant.",
      category: "ai"
    },
    {
      question: "Can I use FinAura without an internet connection?",
      answer: "Absolutely! FinAura is a Progressive Web App (PWA). All dashboard calculations, encryption, asset tracking, and reports operate completely offline without internet.",
      category: "getting-started"
    },
    {
      question: "How do bill due date reminders work?",
      answer: "When you add a credit card with a due date or record an unpaid bill, FinAura calculates the remaining days and alerts you in the Notification Bell. You can tap 'Pay Now' to launch your favorite payment app directly.",
      category: "cashback"
    }
  ];

  // Filter items based on active category and search query
  const filteredGuides = useMemo(() => {
    return guides.filter(guide => {
      const matchesCategory = activeCategory === "all" || guide.category === activeCategory;
      const matchesSearch = searchQuery === "" || 
        guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.steps?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        guide.tips?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const filteredFAQs = useMemo(() => {
    return faqs.filter(faq => {
      const matchesCategory = activeCategory === "all" || activeCategory === "faq" || faq.category === activeCategory;
      const matchesSearch = searchQuery === "" ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="modal-overlay help-modal-overlay" onClick={onClose}>
      <div className="modal-sheet help-modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="help-modal-header">
          <div className="help-header-left">
            <div className="help-icon-badge">
              <BookOpen size={22} className="help-badge-icon" />
            </div>
            <div>
              <h2 className="help-modal-title">Help &amp; User Guide</h2>
              <p className="help-modal-subtitle">Documentation, Tutorials &amp; FAQs for FinAura Vault</p>
            </div>
          </div>
          <button className="help-close-btn" onClick={onClose} aria-label="Close Help">
            <X size={20} />
          </button>
        </div>

        {/* Live Search Bar */}
        <div className="help-search-bar-wrap">
          <Search size={18} className="help-search-icon" />
          <input 
            type="text"
            className="help-search-input"
            placeholder="Search guides, PIN, backup, AI scanning, syncing..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="help-search-clear" onClick={() => setSearchQuery("")}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="help-category-chips">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                className={`help-category-chip ${activeCategory === cat.id ? "active" : ""}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <Icon size={14} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="help-modal-body">
          {/* Guides Section */}
          {filteredGuides.length > 0 && (
            <div className="help-section-group">
              <h3 className="help-group-title">
                <FileCheck size={18} /> Guides &amp; Walkthroughs ({filteredGuides.length})
              </h3>
              <div className="help-guides-grid">
                {filteredGuides.map((guide) => {
                  const GuideIcon = guide.icon;
                  return (
                    <div key={guide.id} className="help-guide-card">
                      <div className="help-guide-header">
                        <div className="help-guide-icon-wrap">
                          <GuideIcon size={20} />
                        </div>
                        <div className="help-guide-meta">
                          <h4 className="help-guide-title">{guide.title}</h4>
                          {guide.badge && <span className="help-guide-badge">{guide.badge}</span>}
                        </div>
                      </div>

                      <p className="help-guide-summary">{guide.summary}</p>

                      {guide.steps && (
                        <div className="help-guide-steps">
                          <h5 className="help-steps-heading">Step-by-Step Instructions:</h5>
                          <ul className="help-steps-list">
                            {guide.steps.map((step, idx) => (
                              <li key={idx} className="help-step-item">
                                <CheckCircle2 size={14} className="help-step-check" />
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {guide.tips && (
                        <div className="help-guide-tips">
                          {guide.tips.map((tip, idx) => (
                            <div key={idx} className="help-tip-row">
                              <Zap size={14} className="help-tip-icon" />
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {guide.callout && (
                        <div className="help-guide-callout">
                          <Shield size={14} />
                          <span>{guide.callout}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* FAQs Section */}
          {filteredFAQs.length > 0 && (
            <div className="help-section-group" style={{ marginTop: 24 }}>
              <h3 className="help-group-title">
                <HelpCircle size={18} /> Frequently Asked Questions ({filteredFAQs.length})
              </h3>
              <div className="help-faqs-accordion">
                {filteredFAQs.map((faq, idx) => {
                  const isOpen = openFAQIndex === idx;
                  return (
                    <div key={idx} className={`help-faq-item ${isOpen ? "open" : ""}`}>
                      <button 
                        type="button" 
                        className="help-faq-question-btn"
                        onClick={() => setOpenFAQIndex(isOpen ? null : idx)}
                      >
                        <span className="help-faq-q-text">{faq.question}</span>
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                      {isOpen && (
                        <div className="help-faq-answer">
                          <p>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* If No Results */}
          {filteredGuides.length === 0 && filteredFAQs.length === 0 && (
            <div className="help-empty-results">
              <Info size={40} className="help-empty-icon" />
              <h4>No matches found for "{searchQuery}"</h4>
              <p>Try searching for a different keyword like "PIN", "Backup", "AI", or select another category.</p>
              <button 
                className="btn-secondary" 
                style={{ marginTop: 12 }} 
                onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
              >
                Reset Search
              </button>
            </div>
          )}

          {/* Developer & Support Contact Footer */}
          <div className="help-support-card">
            <div className="help-support-info">
              <ShieldCheck size={24} className="help-support-icon" />
              <div>
                <h4 className="help-support-title">Need Additional Support?</h4>
                <p className="help-support-desc">
                  Developed by Velo Launch · Smart Vista IT Solutions. Built for privacy, zero telemetry, and maximum local security.
                </p>
              </div>
            </div>
            <div className="help-support-links">
              <a 
                href="https://smartvistaitsolutions.in" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="help-support-btn"
              >
                <span>Smart Vista IT Solutions</span>
                <ExternalLink size={14} />
              </a>
              <a 
                href="https://finaura-landingpage.vercel.app" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="help-support-btn"
              >
                <span>Landing Page &amp; Docs</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
