# FinanceVault — Personal Finance App

## Overview

Mobile-first personal finance web app built with React + Vite. All data is stored in localStorage with AES encryption via CryptoJS. No backend required.

## Stack

- **Monorepo**: pnpm workspaces
- **Frontend**: React + Vite (`artifacts/finance-app`)
- **Styling**: Custom CSS (no Tailwind utilities — all in `src/index.css`)
- **Encryption**: CryptoJS AES (master PIN encrypts sensitive fields)
- **Storage**: localStorage only (no server)
- **Import**: SheetJS (xlsx) for Excel template import
- **PWA**: vite-plugin-pwa (installable, offline-capable)

## Features

### Account Types (7 types)
| Type | Icon | Details |
|------|------|---------|
| `bank` | 🏦 | Encrypted account number, current balance |
| `card` | 💳 | Last 4 digits, credit limit, expense tracking |
| `fd` | 📈 | Principal, interest rate, start/maturity date, maturity estimate |
| `rd` | 📅 | Monthly installment, interest rate, month-by-month statement |
| `mf` | 📊 | Fund name, invested amount, current value |
| `paylater` | 🔄 | Like card — credit limit, expense tracking |
| `other` | 📋 | Encrypted notes/secret |

### Credit Card / Pay Later Expense Tracking
- Add expenses: description, amount, date, cashback, status (Paid/Unpaid)
- Four statuses: `paid`, `unpaid`, `bill_generated_unpaid`, `bill_generated`
- Generate Bill from all unpaid expenses → marks them `bill_generated_unpaid`
- Mark Bill Paid → marks all linked expenses `bill_generated`
- Filter by All / Unpaid / Paid / Billed

### RD Monthly Statement
- Auto-generates month list from start date to maturity date
- Mark each month as paid/unpaid (overdue highlighted in red)
- Progress bar showing % of tenure complete
- Maturity estimate using compound interest formula

### FD Detail View
- Simple interest maturity estimate
- Days left / maturity countdown with progress bar
- Maturity amount breakdown table

### Cashback Tracker (🎁 tab)
- Log cashback by source (card, app, offer)
- Total cashback summary + breakdown by source
- Full history with delete

### Dashboard
- Total Savings vs Outstanding Dues summary grid
- Breakdown chips: Bank / FD / RD / MF / card count

### Accounts Tab
- Organized by type sections
- Cards/PayLater: clickable → expense tracking; shows outstanding dues + cashback chips
- FD: clickable → FD detail with maturity info
- RD: clickable → monthly installment tracker

### Settings
- 20-currency selector (USD, INR, EUR, JPY, PHP, etc.)
- Change PIN, lock app, reset all data

## Key Files

```
artifacts/finance-app/src/
├── types.ts                    # All interfaces: FinanceItem, CardExpense, CardBill, CashbackEntry, RDInstallment
├── App.tsx                     # Top-level routing (4 tabs: home/cards/cashback/settings)
├── lib/
│   ├── storage.ts              # localStorage CRUD for all data types
│   ├── currency.ts             # 20 currencies + formatAmount
│   └── crypto.ts               # CryptoJS AES encrypt/decrypt
├── pages/
│   ├── AuthScreen.tsx          # PIN create/unlock
│   ├── Dashboard.tsx           # Home tab — add entries, summary
│   ├── Cards.tsx               # Accounts tab — all account type sections
│   ├── Cashback.tsx            # Cashback tracker tab
│   └── Settings.tsx            # Currency, PIN, reset
└── components/
    ├── AddItemForm.tsx          # Add any account type (7 types)
    ├── CardDetail.tsx           # Card expense tracking + bill management
    ├── ExpenseForm.tsx          # Add expense form
    ├── FDDetail.tsx             # FD maturity detail view
    ├── RDDetail.tsx             # RD monthly installment tracker
    ├── ItemCard.tsx             # Home list item card (all types)
    └── BottomNav.tsx            # 4-tab nav: Home / Accounts / Cashback / Settings
```

## localStorage Keys

| Key | Contents |
|-----|----------|
| `finance_items` | All FinanceItem entries |
| `finance_pin_hash` | Hashed PIN |
| `finance_currency` | Selected currency code |
| `finance_expenses` | All CardExpense entries |
| `finance_bills` | All CardBill entries |
| `finance_cashbacks` | All CashbackEntry entries |
| `finance_rd_installments` | All RDInstallment entries |
