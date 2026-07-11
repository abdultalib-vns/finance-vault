import CryptoJS from "crypto-js";
import {
  loadItems, loadExpenses, loadBills, loadCashbacks,
  loadRDInstallments, loadBankExpenses,
  saveItems, saveExpenses, saveBills, saveCashbacks,
  saveRDInstallments, saveBankExpenses,
  loadPinHash, loadVeloAIUsage, saveVeloAIUsage,
} from "./storage";
import { hashPin } from "./crypto";

export interface SyncPayload {
  version: 1;
  syncedAt: number;
  items: any[];
  expenses: any[];
  bills: any[];
  cashbacks: any[];
  rdInstallments: any[];
  bankExpenses: any[];
  veloAIUsage?: { date: string; count: number };
}

// ── Verify PIN ──────────────────────────────────────────────────
export function verifySyncPin(pin: string): boolean {
  const hash = loadPinHash();
  if (!hash) return false;
  return hashPin(pin) === hash;
}

// ── Generate encrypted sync payload ─────────────────────────────
export function generateSyncPayload(pin: string): string {
  const payload: SyncPayload = {
    version: 1,
    syncedAt: Date.now(),
    items: loadItems(),
    expenses: loadExpenses(),
    bills: loadBills(),
    cashbacks: loadCashbacks(),
    rdInstallments: loadRDInstallments(),
    bankExpenses: loadBankExpenses(),
    veloAIUsage: loadVeloAIUsage(),
  };

  const json = JSON.stringify(payload);
  const encrypted = CryptoJS.AES.encrypt(json, pin).toString();
  return encrypted;
}

// ── Upload encrypted data to relay ──────────────────────────────
export async function uploadSyncData(encryptedData: string): Promise<string> {
  const res = await fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "upload", data: encryptedData }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Upload failed.");
  return json.code;
}

// ── Download encrypted data from relay ──────────────────────────
export async function downloadSyncData(code: string): Promise<string> {
  const res = await fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "download", code }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Download failed.");
  return json.data;
}

// ── Decrypt and import sync payload ─────────────────────────────
export function importSyncPayload(encryptedData: string, pin: string): SyncPayload {
  let decrypted: string;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, pin);
    decrypted = bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    throw new Error("Decryption failed. The PIN may be incorrect.");
  }

  if (!decrypted) {
    throw new Error("Decryption failed. The PIN you entered does not match the sender's PIN.");
  }

  let payload: SyncPayload;
  try {
    payload = JSON.parse(decrypted);
  } catch {
    throw new Error("Could not parse decrypted data. The file may be corrupted.");
  }

  if (!payload.items || !Array.isArray(payload.items)) {
    throw new Error("Invalid sync data — missing items.");
  }

  // Import everything
  saveItems(payload.items);
  if (Array.isArray(payload.expenses)) saveExpenses(payload.expenses);
  if (Array.isArray(payload.bills)) saveBills(payload.bills);
  if (Array.isArray(payload.cashbacks)) saveCashbacks(payload.cashbacks);
  if (Array.isArray(payload.rdInstallments)) saveRDInstallments(payload.rdInstallments);
  if (Array.isArray(payload.bankExpenses)) saveBankExpenses(payload.bankExpenses);
  if (payload.veloAIUsage) saveVeloAIUsage(payload.veloAIUsage);

  return payload;
}
