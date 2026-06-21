import { CardTemplate, PopupAd, SessionRecord, AnalyticsEvent, AdminThemeSettings } from "./adminTypes";
import CryptoJS from "crypto-js";
import { generateId } from "../lib/utils";

const API_CONFIG = "/api/admin/config";

/** Push shared config sections to the server (fire-and-forget, fails silently). */
function pushToServer(payload: { cardTemplates?: CardTemplate[]; popupAds?: PopupAd[]; themeSettings?: AdminThemeSettings }): void {
  fetch(API_CONFIG, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => { /* offline or no API server — localStorage is the fallback */ });
}

/**
 * Pull shared config from the server and cache it in localStorage.
 * Call this once on app start. Returns true if server responded.
 */
export async function loadAdminConfigFromServer(): Promise<boolean> {
  try {
    const res = await fetch(API_CONFIG);
    if (!res.ok) return false;
    const data = await res.json() as { cardTemplates?: CardTemplate[]; popupAds?: PopupAd[]; themeSettings?: AdminThemeSettings | null };
    if (Array.isArray(data.cardTemplates)) {
      localStorage.setItem(ADMIN_CARDS_KEY, JSON.stringify(data.cardTemplates));
    }
    if (Array.isArray(data.popupAds)) {
      localStorage.setItem(ADMIN_ADS_KEY, JSON.stringify(data.popupAds));
    }
    if (data.themeSettings != null) {
      localStorage.setItem(ADMIN_THEME_KEY, JSON.stringify(data.themeSettings));
    }
    return true;
  } catch {
    return false;
  }
}

const ADMIN_PIN_KEY        = "admin_pin_hash";
const ADMIN_RESET_KEY_KEY  = "admin_reset_key_hash";
const ADMIN_RESET_KEY_ENC  = "admin_reset_key_enc";   // encrypted plain key for display
const ADMIN_CARDS_KEY      = "admin_card_templates";
const ADMIN_ADS_KEY        = "admin_popup_ads";
const ADMIN_SESSIONS_KEY   = "admin_analytics_sessions";
const ADMIN_EVENTS_KEY     = "admin_analytics_events";
const ADMIN_THEME_KEY      = "admin_theme_settings";
const ADMIN_ACTIVE_KEY     = "admin_active_heartbeat";

// ── Admin PIN ────────────────────────────────────────────────────
export function hashAdminPin(pin: string): string {
  return CryptoJS.SHA256("admin_salt_fv:" + pin).toString();
}

export function saveAdminPinHash(hash: string): void {
  localStorage.setItem(ADMIN_PIN_KEY, hash);
}

export function loadAdminPinHash(): string | null {
  return localStorage.getItem(ADMIN_PIN_KEY);
}

export function isAdminSetup(): boolean {
  return !!localStorage.getItem(ADMIN_PIN_KEY);
}

// ── Reset Key ────────────────────────────────────────────────────
/** Generate a random 8-char alphanumeric reset key. Shown ONCE to admin at setup. */
export function generateResetKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let key = "";
  for (let i = 0; i < 8; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}

export function saveResetKeyHash(key: string): void {
  localStorage.setItem(ADMIN_RESET_KEY_KEY, CryptoJS.SHA256("reset_salt_fv:" + key).toString());
  // Also store AES-encrypted plain key so it can be revealed on the security screen
  const pinHash = loadAdminPinHash() ?? "fallback";
  localStorage.setItem(ADMIN_RESET_KEY_ENC, CryptoJS.AES.encrypt(key, pinHash).toString());
}

/** Decrypt and return the plain recovery key. Requires the current PIN hash to decrypt. */
export function loadPlainResetKey(): string | null {
  try {
    const enc = localStorage.getItem(ADMIN_RESET_KEY_ENC);
    if (!enc) return null;
    const pinHash = loadAdminPinHash() ?? "fallback";
    const bytes = CryptoJS.AES.decrypt(enc, pinHash);
    const plain = bytes.toString(CryptoJS.enc.Utf8);
    return plain || null;
  } catch {
    return null;
  }
}

export function verifyResetKey(key: string): boolean {
  const stored = localStorage.getItem(ADMIN_RESET_KEY_KEY);
  if (!stored) return false;
  return CryptoJS.SHA256("reset_salt_fv:" + key).toString() === stored;
}

export function resetAdminPin(): void {
  localStorage.removeItem(ADMIN_PIN_KEY);
  localStorage.removeItem(ADMIN_RESET_KEY_KEY);
  localStorage.removeItem(ADMIN_RESET_KEY_ENC);
}

// ── Card Templates ───────────────────────────────────────────────
const ADMIN_CARDS_SEEDED_KEY = "admin_cards_seeded";

/** Default card offers — seeded once so they can be edited in the admin panel. */
const DEFAULT_CARD_TEMPLATES: CardTemplate[] = [
  { id: "seed-hdfc-moneyback", name: "HDFC MoneyBack+", bank: "HDFC", cardType: "credit", annualFee: "Free", benefits: "2% cashback on online spends, 1% on others", applyUrl: "https://www.hdfcbank.com/personal/pay/cards/credit-cards", color: "#2563eb", featured: false, active: true, createdAt: 1 },
  { id: "seed-sbi-simplyclick", name: "SBI SimplyCLICK", bank: "SBI", cardType: "credit", annualFee: "Free", benefits: "10X rewards on partner brands, Amazon vouchers", applyUrl: "https://www.sbicard.com/en/personal/credit-cards.page", color: "#1e40af", featured: false, active: true, createdAt: 2 },
  { id: "seed-icici-amazon", name: "ICICI Amazon Pay", bank: "ICICI", cardType: "credit", annualFee: "Free", benefits: "5% on Amazon, 2% on bills, 1% on others", applyUrl: "https://www.icicibank.com/card/credit-cards", color: "#d97706", featured: false, active: true, createdAt: 3 },
  { id: "seed-axis-ace", name: "Axis ACE", bank: "Axis", cardType: "credit", annualFee: "Free", benefits: "5% on bills & utilities via Google Pay, 2% on others", applyUrl: "https://www.axisbank.com/retail/cards/credit-card", color: "#7c3aed", featured: false, active: true, createdAt: 4 },
  { id: "seed-onecard", name: "OneCard", bank: "OneCard", cardType: "credit", annualFee: "Free", benefits: "5X rewards on top spends, metal card, no fees", applyUrl: "https://www.getonecard.app", color: "#1e293b", featured: false, active: true, createdAt: 5 },
  { id: "seed-hdfc-infinia", name: "HDFC Infinia", bank: "HDFC", cardType: "credit", annualFee: "₹12,500", benefits: "5% on travel, 3.3% on all spends, lounge access", applyUrl: "https://www.hdfcbank.com/personal/pay/cards/credit-cards", color: "#dc2626", featured: true, active: true, createdAt: 6 },
  { id: "seed-amex-platinum", name: "Amex Platinum", bank: "American Express", cardType: "credit", annualFee: "₹60,000", benefits: "Premium lounge, travel insurance, concierge", applyUrl: "https://www.americanexpress.com/in/", color: "#0891b2", featured: true, active: true, createdAt: 7 },
  { id: "seed-sbi-elite", name: "SBI Elite", bank: "SBI", cardType: "credit", annualFee: "₹4,999", benefits: "5X rewards on dining, grocery, movies", applyUrl: "https://www.sbicard.com/en/personal/credit-cards.page", color: "#059669", featured: false, active: true, createdAt: 8 },
];

/** Seed default cards on first run (only if never seeded before). */
export function seedDefaultCardTemplates(): void {
  if (localStorage.getItem(ADMIN_CARDS_SEEDED_KEY)) return;
  const existing = loadCardTemplates();
  if (existing.length === 0) {
    saveCardTemplates(DEFAULT_CARD_TEMPLATES);
  }
  localStorage.setItem(ADMIN_CARDS_SEEDED_KEY, "1");
}

export function saveCardTemplates(templates: CardTemplate[]): void {
  localStorage.setItem(ADMIN_CARDS_KEY, JSON.stringify(templates));
  pushToServer({ cardTemplates: templates });
}

export function loadCardTemplates(): CardTemplate[] {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_CARDS_KEY) ?? "[]") as CardTemplate[];
  } catch {
    return [];
  }
}

// ── Popup Ads ────────────────────────────────────────────────────
export function savePopupAds(ads: PopupAd[]): void {
  localStorage.setItem(ADMIN_ADS_KEY, JSON.stringify(ads));
  pushToServer({ popupAds: ads });
}

export function loadPopupAds(): PopupAd[] {
  try {
    const raw = JSON.parse(localStorage.getItem(ADMIN_ADS_KEY) ?? "[]") as PopupAd[];
    // Backfill allowDoNotShow for ads created before this field was added
    return raw.map((ad) => ({
      ...ad,
      allowDoNotShow: ad.allowDoNotShow ?? true,
    }));
  } catch {
    return [];
  }
}

export function loadActivePopupAd(): PopupAd | null {
  const ads = loadPopupAds();
  const now = new Date().toISOString().split("T")[0];
  return (
    ads.find((ad) => {
      if (!ad.active) return false;
      if (ad.startDate && ad.startDate > now) return false;
      if (ad.endDate && ad.endDate < now) return false;
      return true;
    }) ?? null
  );
}

// ── Analytics ────────────────────────────────────────────────────
export function saveSessions(sessions: SessionRecord[]): void {
  // Keep only last 90 days
  const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const trimmed = sessions.filter((s) => s.startTime >= cutoff);
  localStorage.setItem(ADMIN_SESSIONS_KEY, JSON.stringify(trimmed));
}

export function loadSessions(): SessionRecord[] {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_SESSIONS_KEY) ?? "[]") as SessionRecord[];
  } catch {
    return [];
  }
}

export function saveEvents(events: AnalyticsEvent[]): void {
  // Keep only last 1000 events
  const trimmed = events.slice(-1000);
  localStorage.setItem(ADMIN_EVENTS_KEY, JSON.stringify(trimmed));
}

export function loadEvents(): AnalyticsEvent[] {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_EVENTS_KEY) ?? "[]") as AnalyticsEvent[];
  } catch {
    return [];
  }
}

export function trackEvent(type: string, details?: string): void {
  const events = loadEvents();
  events.push({ type, details, timestamp: Date.now() });
  saveEvents(events);
}

export function startSession(): string {
  const id = generateId();
  const sessions = loadSessions();
  sessions.push({
    id,
    date: new Date().toISOString().split("T")[0],
    startTime: Date.now(),
    tabVisits: {},
  });
  saveSessions(sessions);
  // Heartbeat for realtime active users
  localStorage.setItem(ADMIN_ACTIVE_KEY, Date.now().toString());
  return id;
}

export function endSession(sessionId: string): void {
  const sessions = loadSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (session) {
    session.endTime = Date.now();
    saveSessions(sessions);
  }
  localStorage.removeItem(ADMIN_ACTIVE_KEY);
}

export function trackTabVisit(sessionId: string, tab: string): void {
  const sessions = loadSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (session) {
    session.tabVisits[tab] = (session.tabVisits[tab] ?? 0) + 1;
    saveSessions(sessions);
  }
  // Update heartbeat
  localStorage.setItem(ADMIN_ACTIVE_KEY, Date.now().toString());
}

export function getActiveUserCount(): number {
  // Count browser tabs that have updated heartbeat in last 30s
  const heartbeat = localStorage.getItem(ADMIN_ACTIVE_KEY);
  if (!heartbeat) return 0;
  const age = Date.now() - parseInt(heartbeat, 10);
  return age < 30_000 ? 1 : 0;
}

// ── Theme Settings ───────────────────────────────────────────────
const DEFAULT_THEME: AdminThemeSettings = {
  defaultTheme: "light",
  accentColor: "#2563eb",
  accentColorDark: "#3b82f6",
  accentColorLight: "#dbeafe",
};

export function saveAdminTheme(settings: AdminThemeSettings): void {
  localStorage.setItem(ADMIN_THEME_KEY, JSON.stringify(settings));
  pushToServer({ themeSettings: settings });
}

export function loadAdminTheme(): AdminThemeSettings {
  try {
    const raw = localStorage.getItem(ADMIN_THEME_KEY);
    return raw ? (JSON.parse(raw) as AdminThemeSettings) : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function applyAdminTheme(settings: AdminThemeSettings): void {
  const root = document.documentElement;
  root.style.setProperty("--primary", settings.accentColor);
  root.style.setProperty("--primary-dark", settings.accentColorDark);
  root.style.setProperty("--primary-light", settings.accentColorLight);
  // Also apply directly to admin shell (if open) so scoped dark mode doesn't override
  const adminShell = document.querySelector(".admin-shell") as HTMLElement | null;
  if (adminShell) {
    adminShell.style.setProperty("--primary", settings.accentColor);
    adminShell.style.setProperty("--primary-dark", settings.accentColorDark);
    adminShell.style.setProperty("--primary-light", settings.accentColorLight);
  }
}

export function clearAdminData(): void {
  localStorage.removeItem(ADMIN_CARDS_KEY);
  localStorage.removeItem(ADMIN_ADS_KEY);
  localStorage.removeItem(ADMIN_SESSIONS_KEY);
  localStorage.removeItem(ADMIN_EVENTS_KEY);
  localStorage.removeItem(ADMIN_THEME_KEY);
}
