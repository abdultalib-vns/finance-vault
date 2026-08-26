import { FinanceItem, CardExpense, CardBill, CashbackEntry, RDInstallment, BankExpense } from "../types";

const ITEMS_KEY         = "finance_items";
const PIN_HASH_KEY      = "finance_pin_hash";
const CURRENCY_KEY      = "finance_currency";
const EXPENSES_KEY      = "finance_expenses";
const BILLS_KEY         = "finance_bills";
const CASHBACKS_KEY     = "finance_cashbacks";
const RD_INSTALL_KEY    = "finance_rd_installments";
const BANK_EXPENSES_KEY = "finance_bank_expenses";
const IDLE_TIMEOUT_KEY  = "finance_idle_timeout_min";
const THEME_KEY         = "finance_theme";
const SECURITY_Q_KEY    = "finance_security_q_idx";
const SECURITY_A_KEY    = "finance_security_a_hash";

// ── Finance Items ────────────────────────────────────────────────
export function saveItems(items: FinanceItem[]): void {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}
export function loadItems(): FinanceItem[] {
  try { return JSON.parse(localStorage.getItem(ITEMS_KEY) ?? "[]") as FinanceItem[]; }
  catch { return []; }
}

// ── PIN ──────────────────────────────────────────────────────────
export function savePinHash(hash: string): void {
  localStorage.setItem(PIN_HASH_KEY, hash);
}
export function loadPinHash(): string | null {
  return localStorage.getItem(PIN_HASH_KEY);
}

// ── Currency ─────────────────────────────────────────────────────
export function saveCurrency(code: string): void {
  localStorage.setItem(CURRENCY_KEY, code);
}
export function loadCurrency(): string {
  return localStorage.getItem(CURRENCY_KEY) ?? "USD";
}

// ── Card Expenses ─────────────────────────────────────────────────
export function saveExpenses(expenses: CardExpense[]): void {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
}
export function loadExpenses(): CardExpense[] {
  try { return JSON.parse(localStorage.getItem(EXPENSES_KEY) ?? "[]") as CardExpense[]; }
  catch { return []; }
}
export function getExpensesForCard(cardId: string): CardExpense[] {
  return loadExpenses().filter((e) => e.cardId === cardId);
}

// ── Card Bills ────────────────────────────────────────────────────
export function saveBills(bills: CardBill[]): void {
  localStorage.setItem(BILLS_KEY, JSON.stringify(bills));
}
export function loadBills(): CardBill[] {
  try { return JSON.parse(localStorage.getItem(BILLS_KEY) ?? "[]") as CardBill[]; }
  catch { return []; }
}

// ── Cashbacks ─────────────────────────────────────────────────────
export function saveCashbacks(entries: CashbackEntry[]): void {
  localStorage.setItem(CASHBACKS_KEY, JSON.stringify(entries));
}
export function loadCashbacks(): CashbackEntry[] {
  try { return JSON.parse(localStorage.getItem(CASHBACKS_KEY) ?? "[]") as CashbackEntry[]; }
  catch { return []; }
}

// ── RD Installments ───────────────────────────────────────────────
export function saveRDInstallments(list: RDInstallment[]): void {
  localStorage.setItem(RD_INSTALL_KEY, JSON.stringify(list));
}
export function loadRDInstallments(): RDInstallment[] {
  try { return JSON.parse(localStorage.getItem(RD_INSTALL_KEY) ?? "[]") as RDInstallment[]; }
  catch { return []; }
}
export function getRDInstallmentsForRD(rdId: string): RDInstallment[] {
  return loadRDInstallments().filter((r) => r.rdId === rdId);
}

// ── Bank Expenses ─────────────────────────────────────────────────
export function saveBankExpenses(expenses: BankExpense[]): void {
  localStorage.setItem(BANK_EXPENSES_KEY, JSON.stringify(expenses));
}
export function loadBankExpenses(): BankExpense[] {
  try { return JSON.parse(localStorage.getItem(BANK_EXPENSES_KEY) ?? "[]") as BankExpense[]; }
  catch { return []; }
}

// ── Idle Timeout (minutes; 0 = never) ─────────────────────────────
export function loadIdleTimeout(): number {
  const v = localStorage.getItem(IDLE_TIMEOUT_KEY);
  if (v === null) return 2;            // default: 2 minutes
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : 2;
}
export function saveIdleTimeout(minutes: number): void {
  localStorage.setItem(IDLE_TIMEOUT_KEY, String(minutes));
}

// ── Theme (light / dark) ───────────────────────────────────────────
export function loadTheme(): "light" | "dark" {
  const v = localStorage.getItem(THEME_KEY);
  if (v === "dark" || v === "light") return v;
  return "light";  // default: light mode
}
export function saveTheme(theme: "light" | "dark"): void {
  localStorage.setItem(THEME_KEY, theme);
}

// ── Security Question ──────────────────────────────────────────────
export function saveSecurityQuestion(idx: number): void {
  localStorage.setItem(SECURITY_Q_KEY, String(idx));
}
export function loadSecurityQuestion(): number | null {
  const v = localStorage.getItem(SECURITY_Q_KEY);
  if (v === null) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}
export function saveSecurityAnswerHash(hash: string): void {
  localStorage.setItem(SECURITY_A_KEY, hash);
}
export function loadSecurityAnswerHash(): string | null {
  return localStorage.getItem(SECURITY_A_KEY);
}
export function hasSecurityQuestion(): boolean {
  return localStorage.getItem(SECURITY_Q_KEY) !== null &&
         localStorage.getItem(SECURITY_A_KEY) !== null;
}

// ── Clear All ─────────────────────────────────────────────────────
export function clearAll(): void {
  [ITEMS_KEY, PIN_HASH_KEY, CURRENCY_KEY, EXPENSES_KEY, BILLS_KEY,
   CASHBACKS_KEY, RD_INSTALL_KEY, BANK_EXPENSES_KEY,
   "finance_bio_cred_id", "finance_bio_enc_pin", "finance_bio_prf_salt",
   IDLE_TIMEOUT_KEY, THEME_KEY, SECURITY_Q_KEY, SECURITY_A_KEY]
    .forEach((k) => localStorage.removeItem(k));
}
