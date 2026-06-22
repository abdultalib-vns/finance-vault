import type { FinanceItem, CardExpense, CardBill, CashbackEntry, RDInstallment, BankExpense } from "../types";
import {
  loadItems, loadExpenses, loadBills, loadCashbacks, loadRDInstallments, loadBankExpenses,
  saveItems, saveExpenses, saveBills, saveCashbacks, saveRDInstallments, saveBankExpenses,
  loadPinHash,
} from "./storage";
import { hashPin } from "./crypto";

export interface VaultBackup {
  version: 1;
  exportedAt: number;
  items: FinanceItem[];
  expenses: CardExpense[];
  bills: CardBill[];
  cashbacks: CashbackEntry[];
  rdInstallments: RDInstallment[];
  bankExpenses: BankExpense[];
}

export function verifyPin(pin: string): boolean {
  const hash = loadPinHash();
  if (!hash) return false;
  return hashPin(pin) === hash;
}

export function exportVault(pin: string): void {
  if (!verifyPin(pin)) throw new Error("Incorrect PIN.");
  const backup: VaultBackup = {
    version: 1,
    exportedAt: Date.now(),
    items: loadItems(),
    expenses: loadExpenses(),
    bills: loadBills(),
    cashbacks: loadCashbacks(),
    rdInstallments: loadRDInstallments(),
    bankExpenses: loadBankExpenses(),
  };
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const date = new Date().toISOString().slice(0, 10);
  a.download = `FinAura-backup-${date}.fvbackup`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importVault(file: File, pin: string): Promise<VaultBackup> {
  if (!verifyPin(pin)) throw new Error("Incorrect PIN.");
  const text = await file.text();
  let data: VaultBackup;
  try {
    data = JSON.parse(text) as VaultBackup;
  } catch {
    throw new Error("Invalid backup file — could not parse JSON.");
  }
  if (!data.items || !Array.isArray(data.items)) {
    throw new Error("Backup file is missing items data.");
  }
  saveItems(data.items);
  if (Array.isArray(data.expenses)) saveExpenses(data.expenses);
  if (Array.isArray(data.bills)) saveBills(data.bills);
  if (Array.isArray(data.cashbacks)) saveCashbacks(data.cashbacks);
  if (Array.isArray(data.rdInstallments)) saveRDInstallments(data.rdInstallments);
  if (Array.isArray(data.bankExpenses)) saveBankExpenses(data.bankExpenses);
  return data;
}
