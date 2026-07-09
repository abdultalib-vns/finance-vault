import { 
  FinanceItem, CardExpense, BankExpense, CashbackEntry, ExpenseStatus 
} from "../types";
import { 
  loadItems, saveItems, 
  loadExpenses, saveExpenses, 
  loadBankExpenses, saveBankExpenses,
  loadCashbacks, saveCashbacks
} from "./storage";

export const AI_TOOLS_SCHEMA = [
  {
    name: "add_card_expense",
    description: "Record a new expense on a Credit Card or PayLater account.",
    parameters: {
      type: "object",
      properties: {
        cardId: { type: "string", description: "The ID of the credit card or paylater account." },
        description: { type: "string", description: "What the expense was for (merchant/item)." },
        amount: { type: "number", description: "The numeric amount of the expense." },
        date: { type: "string", description: "Date of the transaction in YYYY-MM-DD format." },
        cashback: { type: "number", description: "Any cashback earned (default 0)." }
      },
      required: ["cardId", "description", "amount", "date"]
    }
  },
  {
    name: "add_bank_transaction",
    description: "Record a new transaction (income/credit or expense/debit) in a Bank Account.",
    parameters: {
      type: "object",
      properties: {
        bankId: { type: "string", description: "The ID of the bank account." },
        description: { type: "string", description: "What the transaction was for." },
        amount: { type: "number", description: "The numeric amount." },
        type: { type: "string", enum: ["debit", "credit"], description: "debit for expenses/outflows, credit for income/inflows." },
        date: { type: "string", description: "Date of the transaction in YYYY-MM-DD format." }
      },
      required: ["bankId", "description", "amount", "type", "date"]
    }
  },
  {
    name: "add_cashback",
    description: "Record a cashback or reward received.",
    parameters: {
      type: "object",
      properties: {
        source: { type: "string", description: "Source of the cashback (e.g., 'Chase Card')." },
        amount: { type: "number", description: "Amount of cashback." },
        date: { type: "string", description: "Date in YYYY-MM-DD format." },
        note: { type: "string", description: "Optional note." }
      },
      required: ["source", "amount", "date"]
    }
  },
  {
    name: "create_account",
    description: "Create a new financial account or asset (Bank, Credit Card, Cash, etc.)",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Name of the account (e.g., 'Chase Checking')." },
        type: { type: "string", enum: ["bank", "card", "fd", "rd", "mf", "paylater", "other"], description: "Type of account." },
        balance: { type: "number", description: "Initial balance (or credit limit for cards). Default 0." },
        lastFour: { type: "string", description: "Optional last 4 digits of the account/card." }
      },
      required: ["name", "type"]
    }
  }
];

export async function executeAITool(toolName: string, args: any): Promise<string> {
  try {
    switch (toolName) {
      case "add_card_expense": {
        const { cardId, description, amount, date, cashback = 0 } = args;
        const items = loadItems();
        const card = items.find(i => i.id === cardId);
        if (!card) return `Error: Card/Account with ID '${cardId}' not found.`;
        
        const newExpense: CardExpense = {
          id: Date.now().toString(),
          cardId,
          description,
          amount,
          date,
          status: "unpaid" as ExpenseStatus,
          cashback,
          createdAt: Date.now()
        };
        
        const expenses = loadExpenses();
        saveExpenses([newExpense, ...expenses]);

        if (cashback > 0) {
          const cashbacks = loadCashbacks();
          cashbacks.push({
            id: `cb-${newExpense.id}`,
            source: card.name,
            amount: cashback,
            date,
            note: description,
            createdAt: Date.now()
          });
          saveCashbacks(cashbacks);
        }

        return `Success: Added expense '${description}' for $${amount} to ${card.name}.`;
      }

      case "add_bank_transaction": {
        const { bankId, description, amount, type, date } = args;
        const items = loadItems();
        const bank = items.find(i => i.id === bankId);
        if (!bank) return `Error: Bank/Account with ID '${bankId}' not found.`;

        const newTx: BankExpense = {
          id: Date.now().toString(),
          bankId,
          description,
          amount,
          type,
          date,
          createdAt: Date.now()
        };

        const txs = loadBankExpenses();
        saveBankExpenses([newTx, ...txs]);

        const newBalance = type === "credit" ? bank.balance + amount : bank.balance - amount;
        const updatedItems = items.map(i => i.id === bankId ? { ...i, balance: newBalance } : i);
        saveItems(updatedItems);

        return `Success: Added ${type} of $${amount} for '${description}'. New balance of ${bank.name} is $${newBalance}.`;
      }

      case "add_cashback": {
        const { source, amount, date, note } = args;
        const cb: CashbackEntry = {
          id: Date.now().toString(),
          source,
          amount,
          date,
          note: note || "",
          createdAt: Date.now()
        };
        const cashbacks = loadCashbacks();
        saveCashbacks([cb, ...cashbacks]);
        return `Success: Added $${amount} cashback from ${source}.`;
      }

      case "create_account": {
        const { name, type, balance = 0, lastFour = "" } = args;
        const items = loadItems();
        
        const newItem: FinanceItem = {
          id: Date.now().toString(),
          name,
          type: type as any,
          balance: type === "card" || type === "paylater" ? 0 : balance,
          creditLimit: type === "card" || type === "paylater" ? balance : undefined,
          encryptedSecret: "",
          lastFour,
          createdAt: Date.now()
        };

        saveItems([...items, newItem]);
        return `Success: Created new ${type} account '${name}' with balance/limit $${balance}.`;
      }

      default:
        return `Error: Unknown tool '${toolName}'.`;
    }
  } catch (err: any) {
    return `Error executing tool '${toolName}': ${err.message}`;
  }
}
