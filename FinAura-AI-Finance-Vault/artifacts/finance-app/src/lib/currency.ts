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

export function getCurrency(code: string): Currency {
  return CURRENCIES.find((c) => c.code === code) ?? DEFAULT_CURRENCY;
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
