import { useState } from "react";
import { FinanceItem } from "../types";
import { Currency, formatAmount } from "../lib/currency";
import { loadExpenses, saveItems, saveExpenses, saveBankExpenses } from "../lib/storage";
import AddItemForm from "../components/AddItemForm";

interface Props {
  masterKey: string;
  currency: Currency;
  items: FinanceItem[];
  onItemsChange: (items: FinanceItem[]) => void;
  onLock: () => void;
}

export default function Dashboard({ masterKey, currency, items, onItemsChange, onLock }: Props) {
  const [showAddForm, setShowAddForm] = useState(false);

  // Data calculations
  const bankTotal = items.filter(i => i.type === "bank").reduce((s, i) => s + i.balance, 0);
  const fdTotal = items.filter(i => i.type === "fd").reduce((s, i) => s + i.balance, 0);
  const rdTotal = items.filter(i => i.type === "rd").reduce((s, i) => s + i.balance, 0);
  const mfTotal = items.filter(i => i.type === "mf").reduce((s, i) => s + i.balance, 0);
  const savingsTotal = fdTotal + rdTotal + mfTotal;
  
  const expenses = loadExpenses();
  const unpaidTotal = expenses.filter(e => e.status === "unpaid" || e.status === "bill_generated_unpaid").reduce((s, e) => s + e.amount, 0);

  function handleAdd(item: FinanceItem) {
    const updated = [item, ...items];
    saveItems(updated);
    onItemsChange(updated);
    setShowAddForm(false);
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-24 overflow-x-hidden">
      {/* Top Navigation */}
      <div className="flex justify-between items-center px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Money</h1>
        <div className="relative cursor-pointer" onClick={onLock}>
          <div className="w-10 h-10 bg-[#1c1c1e] rounded-full flex items-center justify-center border border-white/10 hover:bg-[#2c2c2e] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          {/* Notification Badge */}
          <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-[#050505] text-[8px] font-bold flex items-center justify-center">
            {items.length > 0 ? "1" : ""}
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        
        {/* Main Cash Balance Card */}
        <div className="bg-[#1c1c1e] rounded-3xl p-6 relative overflow-hidden border border-white/[0.05]">
          <div className="flex justify-between items-start mb-2">
            <span className="text-zinc-400 font-medium text-sm">Cash Balance</span>
            <button className="text-zinc-500 text-xs font-medium flex items-center gap-1 hover:text-zinc-300">
              Account & Routing 
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
          <div className="text-[2.75rem] font-bold tracking-tight mb-8">
            {formatAmount(bankTotal, currency)}
          </div>
          
          <div className="flex gap-3">
            <button 
              className="flex-1 bg-[#2c2c2e] hover:bg-[#3c3c3e] transition-colors py-3.5 rounded-full font-semibold text-sm"
              onClick={() => setShowAddForm(true)}
            >
              Add Cash
            </button>
            <button className="flex-1 bg-[#2c2c2e] hover:bg-[#3c3c3e] transition-colors py-3.5 rounded-full font-semibold text-sm">
              Cash Out
            </button>
          </div>
        </div>

        {/* 2x2 Bento Grid */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Savings */}
          <div className="bg-[#1c1c1e] rounded-3xl p-5 border border-white/[0.05] flex flex-col justify-between aspect-square">
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-white">Savings</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
            
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center my-4 shadow-[0_0_15px_rgba(74,222,128,0.3)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#050505" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="8"></circle>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
              </svg>
            </div>
            
            <div>
              <div className="font-bold text-xl">{formatAmount(savingsTotal, currency)}</div>
              <div className="text-zinc-500 text-[11px] mt-0.5">Save now, for later</div>
            </div>
          </div>

          {/* Dues / Tax Filing style card */}
          <div className="bg-[#1c1c1e] rounded-3xl p-5 border border-white/[0.05] flex flex-col justify-between aspect-square relative overflow-hidden group">
            <div className="flex justify-between items-start z-10 relative">
              <span className="text-sm font-medium text-white w-2/3 leading-tight">Outstanding Dues</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
            
            {/* Abstract Graphic */}
            <div className="absolute bottom-0 right-0 w-32 h-24 opacity-80 translate-y-4 group-hover:translate-y-2 transition-transform duration-500">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg" fill="none">
                <rect x="20" y="40" width="60" height="40" rx="4" fill="#EAB308" transform="rotate(-15 50 60)" />
                <rect x="30" y="30" width="60" height="40" rx="4" fill="#FDE047" transform="rotate(-5 50 60)" />
                <line x1="40" y1="45" x2="80" y2="45" stroke="#CA8A04" strokeWidth="2" transform="rotate(-5 50 60)" />
                <line x1="40" y1="55" x2="70" y2="55" stroke="#CA8A04" strokeWidth="2" transform="rotate(-5 50 60)" />
              </svg>
            </div>
            
            <div className="z-10 relative mt-auto">
              <div className="font-bold text-xl text-yellow-400">{formatAmount(unpaidTotal, currency)}</div>
              <div className="text-zinc-500 text-[11px] mt-0.5">Bills to clear</div>
            </div>
          </div>

          {/* Bitcoin Card */}
          <div className="bg-[#1c1c1e] rounded-3xl p-5 border border-white/[0.05] flex flex-col justify-between aspect-square">
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-white">Bitcoin</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
            
            {/* Sparkline Chart */}
            <div className="w-full h-12 my-2 flex items-center">
              <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <path d="M0,20 Q10,15 20,25 T40,10 T60,30 T80,15 T100,25" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            
            <div>
              <div className="font-bold text-xl">$1.19</div>
              <div className="text-zinc-500 text-[11px] mt-0.5 flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                2.48% today
              </div>
            </div>
          </div>

          {/* Stocks Card */}
          <div className="bg-[#1c1c1e] rounded-3xl p-5 border border-white/[0.05] flex flex-col justify-between aspect-square">
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-white">Stocks</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
            
            {/* Sparkline Chart */}
            <div className="w-full h-12 my-2 flex items-center">
              <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <path d="M0,15 Q15,5 25,20 T45,10 T65,35 T85,25 T100,30" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            
            <div>
              <div className="font-bold text-xl">$543.83</div>
              <div className="text-zinc-500 text-[11px] mt-0.5 flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                1.43% today
              </div>
            </div>
          </div>

        </div>

        {/* More ways to add money */}
        <div className="pt-4 pb-2">
          <h3 className="text-sm font-semibold text-zinc-300 mb-3 px-2">More ways to add money</h3>
          
          <div className="bg-[#1c1c1e] rounded-3xl p-4 flex items-center gap-4 hover:bg-[#2c2c2e] transition-colors cursor-pointer border border-white/[0.05]">
            <div className="w-12 h-12 rounded-2xl bg-[#050505] border border-[#2c2c2e] flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-[15px] mb-0.5">Direct Deposit</div>
              <div className="text-zinc-400 text-xs">Get paid up to 2 days faster</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        </div>

      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1c1c1e] rounded-3xl shadow-2xl overflow-hidden border border-white/10" onClick={(e) => e.stopPropagation()}>
            <AddItemForm
              masterKey={masterKey}
              currency={currency}
              onAdd={handleAdd}
              startOpen
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
