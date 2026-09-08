import { Currency } from "../types";
export type { Currency };

export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$",  name: "US Dollar",          locale: "en-US" },
  { code: "EUR", symbol: "€",  name: "Euro",               locale: "de-DE" },
  { code: "GBP", symbol: "£",  name: "British Pound",      locale: "en-GB" },
  { code: "JPY", symbol: "¥",  name: "Japanese Yen",       locale: "ja-JP" },
  { code: "PHP", symbol: "₱",  name: "Philippine Peso",    locale: "fil-PH" },
  { code: "INR", symbol: "₹",  name: "Indian Rupee",       locale: "en-IN" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar",  locale: "en-AU" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar",    locale: "en-CA" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar",   locale: "en-SG" },
  { code: "HKD", symbol: "HK$",name: "Hong Kong Dollar",   locale: "zh-HK" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc",        locale: "de-CH" },
  { code: "CNY", symbol: "¥",  name: "Chinese Yuan",       locale: "zh-CN" },
  { code: "KRW", symbol: "₩",  name: "South Korean Won",  locale: "ko-KR" },
  { code: "MXN", symbol: "MX$",name: "Mexican Peso",       locale: "es-MX" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real",     locale: "pt-BR" },
  { code: "ZAR", symbol: "R",  name: "South African Rand", locale: "en-ZA" },
  { code: "AED", symbol: "د.إ",name: "UAE Dirham",         locale: "ar-AE" },
  { code: "SAR", symbol: "﷼",  name: "Saudi Riyal",        locale: "ar-SA" },
  { code: "THB", symbol: "฿",  name: "Thai Baht",          locale: "th-TH" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah",  locale: "id-ID" },
];

export const DEFAULT_CURRENCY = CURRENCIES[0];

export function getDynamicCurrencies(): Currency[] {
  try {
    const raw = localStorage.getItem("admin_custom_currencies");
    if (raw) {
      const custom = JSON.parse(raw) as any[];
      // Filter only active currencies and map to standard Currency object format
      // Note: we use "en-US" as a fallback locale for custom currencies since they only define code/symbol
      const activeCustom = custom.filter(c => c.active !== false);
      if (activeCustom.length > 0) {
        return activeCustom.map(c => ({
          code: c.code,
          symbol: c.symbol,
          name: c.name,
          locale: "en-US"
        }));
      }
    }
  } catch {}
  return CURRENCIES;
}

export function getCurrency(code: string): Currency {
  const list = getDynamicCurrencies();
  return list.find((c) => c.code === code) ?? DEFAULT_CURRENCY;
}

export function formatAmount(amount: number, currency: Currency | undefined | null): string {
  const c = currency ?? DEFAULT_CURRENCY;
  try {
    return new Intl.NumberFormat(c.locale, {
      style: "currency",
      currency: c.code,
      minimumFractionDigits: c.code === "JPY" || c.code === "KRW" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${c.symbol}${amount.toLocaleString()}`;
  }
}

export function formatCompactAmount(
  amount: number,
  currency: Currency | undefined | null,
  options?: { maximumFractionDigits?: number }
): string {
  const c = currency ?? DEFAULT_CURRENCY;
  if (!isFinite(amount) || isNaN(amount)) return `${c.symbol}0`;

  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  const maxDigits = options?.maximumFractionDigits ?? 2;

  const trimZeros = (val: number) => {
    return Number(val.toFixed(maxDigits)).toString();
  };

  if (c.code === "INR") {
    if (abs >= 10000000) { // >= 1 Crore (10,000,000)
      return `${sign}${c.symbol}${trimZeros(abs / 10000000)} Cr`;
    }
    if (abs >= 1000000) { // >= 10 Lakhs (1,000,000)
      return `${sign}${c.symbol}${trimZeros(abs / 100000)}L`;
    }
  } else {
    if (abs >= 1000000000) { // >= 1 Billion
      return `${sign}${c.symbol}${trimZeros(abs / 1000000000)}B`;
    }
    if (abs >= 1000000) { // >= 1 Million
      return `${sign}${c.symbol}${trimZeros(abs / 1000000)}M`;
    }
  }

  return formatAmount(amount, c);
}

export function getCompactDenominationHint(
  amount: number,
  currency: Currency | undefined | null
): string | null {
  const c = currency ?? DEFAULT_CURRENCY;
  if (!isFinite(amount) || amount < 1000000) return null;

  const trim = (val: number) => Number(val.toFixed(2)).toString();

  if (c.code === "INR") {
    if (amount >= 10000000) {
      const cr = trim(amount / 10000000);
      return `≈ ${c.symbol}${cr} Crore${Number(cr) > 1 ? "s" : ""} (${cr} Cr)`;
    }
    if (amount >= 1000000) {
      const l = trim(amount / 100000);
      return `≈ ${c.symbol}${l} Lakhs (${l}L)`;
    }
  } else {
    if (amount >= 1000000000) {
      const b = trim(amount / 1000000000);
      return `≈ ${c.symbol}${b} Billion (${b}B)`;
    }
    if (amount >= 1000000) {
      const m = trim(amount / 1000000);
      return `≈ ${c.symbol}${m} Million (${m}M)`;
    }
  }
  return null;
}

