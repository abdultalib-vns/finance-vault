import { CardExpense, BankExpense } from "../types";
import { generateId } from "./utils";
import { loadAIOptions } from "./storage";
import { getAILanguageDetectionPrompt } from "./i18n";
import { getVeloKey, getVeloModel } from "./veloCredentials";

// ────────────────────────────────────────────────────────────────
// SMS Transaction Parser — On-device templates + AI fallback
// ────────────────────────────────────────────────────────────────

export interface SMSTransaction {
  id: string;
  type: "debit" | "credit";
  amount: number;
  description: string;
  date: string;
  bankName: string;
  accountLastFour?: string;
  cardLastFour?: string;
  balance?: number;
  reference?: string;
  rawSMS: string;
  confidence: "high" | "medium" | "low";
  source: "template" | "ai";
  templateId?: string;
}

export type SMSClassification = "transaction" | "otp" | "promotional" | "unknown";

// ── OTP Detection (HARD GATE — never parsed/stored/transmitted) ──
const OTP_PATTERNS = [
  /\bOTP\b/i,
  /\bone[\s-]?time[\s-]?pass(?:word|code)\b/i,
  /\bverification[\s-]?code\b/i,
  /\b[0-9]{4,8}\s+is\s+(?:your|the)\s+(?:OTP|code|password)\b/i,
  /\buse\s+[0-9]{4,8}\s+(?:to|for)\s+(?:verify|complete|authorize)\b/i,
  /\bDO\s+NOT\s+SHARE\b/i,
  /\bvalid\s+for\s+\d+\s+min/i,
  /\b(?:CVV|PIN|password)\b/i,
];

// ── Promotional / Marketing Filters ─────────────────────────────
const PROMO_PATTERNS = [
  /\b(?:offer|discount|cashback|reward|deal|sale|free|win|congratulations|lucky)\b/i,
  /\b(?:apply\s+now|click\s+here|visit|download|subscribe|upgrade)\b/i,
  /\b(?:limited\s+time|hurry|act\s+now|exclusive|special)\b/i,
  /\b(?:pre[\s-]?approved|eligible|qualify)\b/i,
  /\b(?:EMI|loan)\s+(?:offer|available|starting)\b/i,
];

// Transaction-positive indicators override promo classification
const TRANSACTION_INDICATORS = [
  /\b(?:debited|credited|spent|received|transferred|withdrawn|deposited|paid)\b/i,
  /\b(?:INR|Rs\.?|USD|\$|EUR|€|£|₹)\s*[\d,]+/i,
  /\b[\d,]+\.?\d*\s*(?:INR|Rs\.?|USD|\$|EUR|€|£|₹)/i,
  /\bA\/c\b|\bAcct?\b|\baccount\b/i,
  /\bAvl\.?\s*Bal\b|\bavailable\s+balance\b/i,
  /\bUPI\b|\bNEFT\b|\bIMPS\b|\bRTGS\b/i,
];

/** Classify SMS — OTP is a hard gate */
export function classifySMS(text: string): SMSClassification {
  for (const pat of OTP_PATTERNS) {
    if (pat.test(text)) return "otp";
  }
  const hasTxn = TRANSACTION_INDICATORS.some(p => p.test(text));
  const hasPromo = PROMO_PATTERNS.some(p => p.test(text));
  if (hasTxn) return "transaction";
  if (hasPromo) return "promotional";
  return "unknown";
}

// ── Helpers ─────────────────────────────────────────────────────

function parseAmount(s: string): number {
  return parseFloat(s.replace(/,/g, "")) || 0;
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

function extractDate(text: string): string {
  // DD-MM-YYYY or DD/MM/YYYY
  const m1 = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m1) {
    const d = m1[1].padStart(2, "0");
    const mo = m1[2].padStart(2, "0");
    let y = m1[3];
    if (y.length === 2) y = "20" + y;
    return `${y}-${mo}-${d}`;
  }
  // "DD Mon YYYY"
  const months: Record<string, string> = {
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
  };
  const m2 = text.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+(\d{2,4})/i);
  if (m2) {
    const d = m2[1].padStart(2, "0");
    const mo = months[m2[2].toLowerCase().slice(0, 3)] || "01";
    let y = m2[3];
    if (y.length === 2) y = "20" + y;
    return `${y}-${mo}-${d}`;
  }
  return todayISO();
}

function extractDescription(text: string): string {
  const pats = [
    /(?:at|to|from|towards|for)\s+([A-Z][A-Za-z0-9\s&.'\-]{2,30}?)(?:\s+on|\s+ref|\s+UPI|\s+via|\.|$)/i,
    /Info:\s*(.{3,40})(?:\.|$)/i,
    /Merchant:\s*(.{3,40})(?:\.|$)/i,
    /txn\s+(?:at|to)\s+(.{3,30})/i,
  ];
  for (const p of pats) {
    const m = text.match(p);
    if (m) return m[1].trim();
  }
  return "SMS Transaction";
}

function extractBalance(text: string): number | undefined {
  const m = text.match(/(?:Avl\.?\s*Bal|Available\s+Balance|Bal|Balance)[:\s]*(?:Rs\.?|INR|₹|USD|\$|EUR|€|£)?\s*([\d,]+\.?\d*)/i);
  return m ? parseAmount(m[1]) : undefined;
}

function extractReference(text: string): string | undefined {
  const m = text.match(/(?:Ref(?:erence)?|Txn|Transaction)\s*(?:No\.?|#|ID)?[:\s]*([A-Za-z0-9]{6,20})/i);
  return m ? m[1] : undefined;
}

function extractBankName(text: string): string {
  const banks: [RegExp, string][] = [
    [/\bHDFC\b/i, "HDFC Bank"], [/\bICICI\b/i, "ICICI Bank"], [/\bSBI\b|State\s+Bank/i, "SBI"],
    [/\bAxis\b/i, "Axis Bank"], [/\bKotak\b/i, "Kotak Bank"], [/\bPNB\b|Punjab\s+National/i, "PNB"],
    [/\bIndusInd\b/i, "IndusInd Bank"], [/\bYes\s+Bank\b/i, "Yes Bank"], [/\bCanara\b/i, "Canara Bank"],
    [/\bFederal\b/i, "Federal Bank"], [/\bIDBI\b/i, "IDBI Bank"], [/\bRBL\b/i, "RBL Bank"],
    [/\bCiti\b/i, "Citibank"], [/\bAmex\b|American\s+Express/i, "Amex"],
    [/\bChase\b/i, "Chase"], [/\bWells\s+Fargo\b/i, "Wells Fargo"],
    [/\bBank\s+of\s+America\b|BofA/i, "Bank of America"], [/\bHSBC\b/i, "HSBC"],
    [/\bStandard\s+Chartered\b|SCB/i, "Standard Chartered"],
    [/\bPaytm\b/i, "Paytm"], [/\bGPay\b|Google\s+Pay/i, "Google Pay"], [/\bPhonePe\b/i, "PhonePe"],
  ];
  for (const [pat, name] of banks) {
    if (pat.test(text)) return name;
  }
  return "Unknown Bank";
}

// ── Template Matching (on-device, works offline) ────────────────

interface SMSTemplate {
  id: string;
  patterns: RegExp[];
  extract: (m: RegExpMatchArray, raw: string) => Partial<SMSTransaction>;
}

const TEMPLATES: SMSTemplate[] = [
  {
    id: "generic_debit",
    patterns: [
      /(?:Rs\.?|INR|₹)\s*([\d,]+\.?\d*)\s*(?:has been |was )?debited/i,
      /debited\s*(?:by\s+)?(?:Rs\.?|INR|₹)\s*([\d,]+\.?\d*)/i,
      /(?:Rs\.?|INR|₹)\s*([\d,]+\.?\d*)\s*spent\s+(?:on|at|using)\b/i,
    ],
    extract: (m, raw) => ({ type: "debit", amount: parseAmount(m[1]), date: extractDate(raw) }),
  },
  {
    id: "generic_credit",
    patterns: [
      /(?:Rs\.?|INR|₹)\s*([\d,]+\.?\d*)\s*(?:has been |was )?credited/i,
      /credited\s*(?:with\s+)?(?:Rs\.?|INR|₹)\s*([\d,]+\.?\d*)/i,
      /(?:received|deposited)\s+(?:Rs\.?|INR|₹)\s*([\d,]+\.?\d*)/i,
    ],
    extract: (m, raw) => ({ type: "credit", amount: parseAmount(m[1]), date: extractDate(raw) }),
  },
  {
    id: "card_txn",
    patterns: [
      /(?:Rs\.?|INR|₹)\s*([\d,]+\.?\d*)\s*(?:spent|charged|debited)\s+(?:on|at|from|using)\s+(?:your\s+)?(?:.*?)card/i,
      /transaction\s+of\s+(?:Rs\.?|INR|₹)\s*([\d,]+\.?\d*)\s+(?:on|at)/i,
    ],
    extract: (m, raw) => ({ type: "debit", amount: parseAmount(m[1]), date: extractDate(raw) }),
  },
  {
    id: "upi_txn",
    patterns: [
      /(?:Rs\.?|INR|₹)\s*([\d,]+\.?\d*)\s*(?:sent|paid|transferred)\s+(?:to|via)\s+(?:UPI|VPA)/i,
      /UPI[\s\-:]+(?:Rs\.?|INR|₹)\s*([\d,]+\.?\d*)\s*(?:debited|sent|paid)/i,
    ],
    extract: (m, raw) => ({ type: "debit", amount: parseAmount(m[1]), date: extractDate(raw) }),
  },
  {
    id: "intl_debit",
    patterns: [
      /\$\s*([\d,]+\.?\d*)\s*(?:has been |was )?(?:debited|charged|spent|withdrawn)/i,
      /(?:debited|charged|spent|withdrawn)\s*\$\s*([\d,]+\.?\d*)/i,
      /EUR\s*([\d,]+\.?\d*)\s*(?:debited|charged|spent)/i,
      /£\s*([\d,]+\.?\d*)\s*(?:debited|charged|spent)/i,
    ],
    extract: (m, raw) => ({ type: "debit", amount: parseAmount(m[1]), date: extractDate(raw) }),
  },
  {
    id: "intl_credit",
    patterns: [
      /\$\s*([\d,]+\.?\d*)\s*(?:has been |was )?(?:credited|deposited|received)/i,
      /(?:credited|deposited|received)\s*\$\s*([\d,]+\.?\d*)/i,
    ],
    extract: (m, raw) => ({ type: "credit", amount: parseAmount(m[1]), date: extractDate(raw) }),
  },
];

/** On-device template match. Returns null if no template matches. */
export function parseWithTemplate(smsText: string): SMSTransaction | null {
  for (const tpl of TEMPLATES) {
    for (const pattern of tpl.patterns) {
      const m = smsText.match(pattern);
      if (m) {
        const ext = tpl.extract(m, smsText);
        if (ext.amount && ext.amount > 0) {
          return {
            id: generateId(),
            type: ext.type || "debit",
            amount: ext.amount,
            description: extractDescription(smsText),
            date: ext.date || todayISO(),
            bankName: extractBankName(smsText),
            balance: extractBalance(smsText),
            reference: extractReference(smsText),
            rawSMS: smsText,
            confidence: "high",
            source: "template",
            templateId: tpl.id,
          };
        }
      }
    }
  }
  return null;
}

// ── AI Fallback (only for unrecognized formats, requires network) ─

export async function parseWithAI(smsText: string): Promise<SMSTransaction | null> {
  const opts = loadAIOptions();
  if (opts.provider === "none") return null;

  const sysPrompt = `You are a financial SMS parser. Extract transaction details from this bank/card SMS notification.
${getAILanguageDetectionPrompt()}
Respond with ONLY a valid JSON object (no markdown, no explanation). Fields:
- type: "debit" or "credit"
- amount: number (the transaction amount, NOT the balance)
- description: string (merchant name or transaction purpose)
- date: string (YYYY-MM-DD, use ${todayISO()} if not found)
- bankName: string
- accountLastFour: string or null
- cardLastFour: string or null
- balance: number or null (available balance after txn)
- reference: string or null
If NOT a financial transaction: {"error":"not_transaction"}`;

  try {
    let resultText = "";
    if (opts.provider === "gemini") {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const model = new GoogleGenerativeAI(opts.geminiKey).getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: sysPrompt,
      });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: smsText }] }],
      });
      resultText = (await result.response).text();
    } else if (opts.provider === "openrouter" || opts.provider === "veloai") {
      const key = opts.provider === "veloai"
        ? getVeloKey()
        : opts.openRouterKey;
      const model = opts.provider === "veloai" ? getVeloModel() : opts.openRouterModel;
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [{ role: "system", content: sysPrompt }, { role: "user", content: smsText }],
        }),
      });
      const data = await res.json();
      resultText = data.choices?.[0]?.message?.content || "";
    } else if (opts.provider === "groq") {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${opts.groqKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: opts.groqModel,
          messages: [{ role: "system", content: sysPrompt }, { role: "user", content: smsText }],
        }),
      });
      const data = await res.json();
      resultText = data.choices?.[0]?.message?.content || "";
    }

    const clean = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
    const d = JSON.parse(clean);
    if (d.error || !d.amount || d.amount <= 0) return null;

    return {
      id: generateId(),
      type: d.type || "debit",
      amount: d.amount,
      description: d.description || "Transaction",
      date: d.date || todayISO(),
      bankName: d.bankName || "Unknown",
      accountLastFour: d.accountLastFour || undefined,
      cardLastFour: d.cardLastFour || undefined,
      balance: d.balance || undefined,
      reference: d.reference || undefined,
      rawSMS: smsText,
      confidence: "low",
      source: "ai",
    };
  } catch {
    return null;
  }
}

// ── Full Pipeline ───────────────────────────────────────────────

export interface SMSParseResult {
  classification: SMSClassification;
  transaction: SMSTransaction | null;
  error?: string;
}

/** Full pipeline: classify → filter OTP/promo → template match → AI fallback */
export async function parseSMS(smsText: string): Promise<SMSParseResult> {
  const trimmed = smsText.trim();
  if (!trimmed) return { classification: "unknown", transaction: null, error: "Empty SMS" };

  const cls = classifySMS(trimmed);
  if (cls === "otp") return { classification: "otp", transaction: null, error: "OTP messages are never processed" };
  if (cls === "promotional") return { classification: "promotional", transaction: null, error: "Promotional message filtered" };

  const tplResult = parseWithTemplate(trimmed);
  if (tplResult) return { classification: "transaction", transaction: tplResult };

  try {
    const aiResult = await parseWithAI(trimmed);
    if (aiResult) return { classification: "transaction", transaction: aiResult };
  } catch {
    // offline — fall through
  }

  return { classification: "unknown", transaction: null, error: "Could not extract transaction details" };
}

// ── Deduplication ───────────────────────────────────────────────

export function isDuplicate(
  txn: SMSTransaction,
  cardExpenses: CardExpense[],
  bankExpenses: BankExpense[]
): boolean {
  for (const e of cardExpenses) {
    if (Math.abs(e.amount - txn.amount) < 0.01 && e.date === txn.date && e.description === txn.description) return true;
  }
  for (const e of bankExpenses) {
    if (Math.abs(e.amount - txn.amount) < 0.01 && e.date === txn.date && e.description === txn.description) return true;
  }
  return false;
}

// ── Validated Templates ─────────────────────────────────────────

const VALIDATED_KEY = "finance_sms_validated_templates";

export function loadValidatedTemplates(): string[] {
  try { return JSON.parse(localStorage.getItem(VALIDATED_KEY) ?? "[]"); }
  catch { return []; }
}

export function addValidatedTemplate(templateId: string): void {
  const list = loadValidatedTemplates();
  if (!list.includes(templateId)) {
    list.push(templateId);
    localStorage.setItem(VALIDATED_KEY, JSON.stringify(list));
  }
}

export function isTemplateValidated(templateId: string): boolean {
  return loadValidatedTemplates().includes(templateId);
}

// ── SMS Reader Toggle ───────────────────────────────────────────

const SMS_ENABLED_KEY = "finance_sms_reader_enabled";

export function isSMSReaderEnabled(): boolean {
  return localStorage.getItem(SMS_ENABLED_KEY) === "true";
}

export function setSMSReaderEnabled(v: boolean): void {
  localStorage.setItem(SMS_ENABLED_KEY, v ? "true" : "false");
}
