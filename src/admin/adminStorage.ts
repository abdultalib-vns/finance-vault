import { customAlert, customConfirm } from "../components/CustomAlert";
import { CardTemplate, PopupAd, SessionRecord, AnalyticsEvent, AdminThemeSettings, GlobalAppConfig, CustomCurrency } from "./adminTypes";
import CryptoJS from "crypto-js";
import { generateId } from "../lib/utils";

const API_CONFIG = "/api/admin/config";

const ADMIN_GLOBAL_CONFIG_KEY = "admin_global_config";

/** Push shared config sections to the server. Alerts if Vercel KV fails. */
function pushToServer(payload: { cardTemplates?: CardTemplate[]; popupAds?: PopupAd[]; themeSettings?: AdminThemeSettings; globalConfig?: GlobalAppConfig; customCurrencies?: CustomCurrency[] }, skipVersionBump: boolean = false): void {
  const globalConf = loadGlobalConfig();
  
  if (!skipVersionBump) {
    globalConf.configVersion = (globalConf.configVersion || 1) + 1;
    localStorage.setItem(ADMIN_GLOBAL_CONFIG_KEY, JSON.stringify(globalConf));
  }
  
  if (!payload.globalConfig) {
    payload.globalConfig = globalConf;
  } else if (!skipVersionBump) {
    payload.globalConfig.configVersion = globalConf.configVersion;
  }

  fetch(API_CONFIG, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then(async (res) => {
      if (!res.ok) {
        const err = await res.text();
        customAlert("Failed to sync globally. Did you create the Vercel KV database? Error: " + err);
      }
    })
    .catch((e) => {
      console.error("Failed to connect to API:", e);
    });
}

/**
 * Pull shared config from the server and cache it in localStorage.
 * Call this once on app start. Returns true if server responded.
 */
export async function loadAdminConfigFromServer(): Promise<boolean> {
  try {
    const cacheBuster = `?t=${Date.now()}`;
    const res = await fetch(API_CONFIG + cacheBuster, { cache: "no-store" });
    if (!res.ok) return false;
    const data = await res.json() as { 
      cardTemplates?: CardTemplate[]; 
      popupAds?: PopupAd[]; 
      themeSettings?: AdminThemeSettings | null;
      globalConfig?: GlobalAppConfig | null;
      customCurrencies?: CustomCurrency[] | null;
    };
    
    if (Array.isArray(data.cardTemplates)) {
      localStorage.setItem(ADMIN_CARDS_KEY, JSON.stringify(data.cardTemplates));
    }
    if (Array.isArray(data.popupAds)) {
      localStorage.setItem(ADMIN_ADS_KEY, JSON.stringify(data.popupAds));
    }
    if (data.themeSettings != null) {
      localStorage.setItem(ADMIN_THEME_KEY, JSON.stringify(data.themeSettings));
    }
    if (data.globalConfig != null) {
      localStorage.setItem(ADMIN_GLOBAL_CONFIG_KEY, JSON.stringify(data.globalConfig));
    }
    if (Array.isArray(data.customCurrencies)) {
      localStorage.setItem(ADMIN_CURRENCIES_KEY, JSON.stringify(data.customCurrencies));
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
const ADMIN_CURRENCIES_KEY = "admin_custom_currencies";

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
const DEFAULT_CARD_TEMPLATES: CardTemplate[] = [];

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
  pushToServer({ cardTemplates: templates }, true);
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
  const payload = { type, details, timestamp: Date.now() };
  const events = loadEvents();
  events.push(payload);
  saveEvents(events);
  
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'event', payload })
  }).catch(() => {});
}

export function startSession(): string {
  const id = generateId();
  const payload = {
    id,
    date: new Date().toISOString().split("T")[0],
    startTime: Date.now(),
    tabVisits: {},
  };
  const sessions = loadSessions();
  sessions.push(payload);
  saveSessions(sessions);
  // Heartbeat for realtime active users
  localStorage.setItem(ADMIN_ACTIVE_KEY, Date.now().toString());

  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'start_session', payload })
  }).catch(() => {});

  // Global heartbeat every 30s
  const interval = setInterval(() => {
    if (!localStorage.getItem(ADMIN_ACTIVE_KEY)) {
      clearInterval(interval);
      return;
    }
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'heartbeat', payload: { id } })
    }).catch(() => {});
  }, 30000);

  return id;
}

export function endSession(sessionId: string): void {
  const endTime = Date.now();
  const sessions = loadSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (session) {
    session.endTime = endTime;
    saveSessions(sessions);
  }
  localStorage.removeItem(ADMIN_ACTIVE_KEY);

  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'end_session', payload: { id: sessionId, endTime } })
  }).catch(() => {});
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

  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'track_tab', payload: { id: sessionId, tab } })
  }).catch(() => {});
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

// -- Global Config ------------------------------------------------
export function loadGlobalConfig(): GlobalAppConfig {
  try {
    const raw = localStorage.getItem(ADMIN_GLOBAL_CONFIG_KEY);
    if (raw) return JSON.parse(raw) as GlobalAppConfig;
  } catch {}
  return {
    maintenanceMode: false,
    maintenanceMessage: "FinAura is currently down for maintenance. Please check back later.",
    showGlobalBanner: false,
    globalBannerText: "Welcome to FinAura!",
    minAppVersion: "1.0.0",
    configVersion: 1,
  };
}

export function saveGlobalConfig(config: GlobalAppConfig): void {
  localStorage.setItem(ADMIN_GLOBAL_CONFIG_KEY, JSON.stringify(config));
  pushToServer({ globalConfig: config });
}

// -- Custom Currencies --------------------------------------------
export function loadCustomCurrencies(): CustomCurrency[] {
  try {
    const raw = localStorage.getItem(ADMIN_CURRENCIES_KEY);
    if (raw) return JSON.parse(raw) as CustomCurrency[];
  } catch {}
  return [];
}

export function saveCustomCurrencies(currencies: CustomCurrency[]): void {
  localStorage.setItem(ADMIN_CURRENCIES_KEY, JSON.stringify(currencies));
  pushToServer({ customCurrencies: currencies });
}
