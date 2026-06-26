export interface CardTemplate {
  id: string;
  name: string;
  bank: string;
  cardType: "credit" | "debit" | "prepaid" | "paylater";
  annualFee: string;
  benefits: string;
  minSalary?: string;
  applyUrl?: string;
  imageUrl?: string;
  color: string;
  shortDescription?: string;
  tags?: string;
  awesomeFeatures?: string;
  eligibilityCriteria?: string;
  feesAndCharges?: string;
  importantInformation?: string;
  documentsNeeded?: string;
  stepsToApply?: string;
  featured: boolean;
  active: boolean;
  createdAt: number;
}

export interface GlobalAppConfig {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  showGlobalBanner: boolean;
  globalBannerText: string;
  minAppVersion: string;
  configVersion?: number;
}

export interface CustomCurrency {
  code: string;
  symbol: string;
  name: string;
  active: boolean;
}

export interface PopupAd {
  id: string;
  title: string;
  message: string;
  ctaText: string;
  ctaUrl?: string;
  type: "info" | "promo" | "warning";
  active: boolean;
  allowDoNotShow: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: number;
}

export interface SessionRecord {
  id: string;
  date: string;
  startTime: number;
  endTime?: number;
  tabVisits: Record<string, number>;
}

export interface AnalyticsEvent {
  type: string;
  details?: string;
  timestamp: number;
}

export interface AdminThemeSettings {
  defaultTheme: "light" | "dark";
  accentColor: string;
  accentColorDark: string;
  accentColorLight: string;
}

export type AdminTab = "config" | "currencies" | "cards" | "analytics" | "theme" | "ads" | "feedbacks" | "security";
