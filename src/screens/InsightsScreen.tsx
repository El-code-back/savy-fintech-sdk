import React from 'react';
import { useApp } from '@/context/AppContext';
import { formatKGS, cn } from '@/lib/utils';
import { GlassCard, ActionButton } from '@/components/shared/UI';
import { Sparkles, ShoppingBag, Utensils, CreditCard, Eye, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';

export default function InsightsScreen() {
  const { monthlyExpenses } = useApp();

  const categories = [
    { icon: ShoppingBag, title: "Shopping", transactions: 42, amount: monthlyExpenses * 0.3, change: "+12%", color: "#2BCB8A" },
    { icon: Utensils, title: "Food", transactions: 28, amount: monthlyExpenses * 0.4, change: "-4%", color: "#E84855" },
    { icon: CreditCard, title: "Subscriptions", transactions: 12, amount: monthlyExpenses * 0.1, change: "Stable", color: "#8F8A9B" },
  ];

  return (
    <div className="pb-32 pt-10 px-6">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 overflow-hidden border-2 border-[#B685FF]">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-white">SAVY</h1>
        </div>
        <button className="text-[#B685FF]">
          <Eye size={24} />
        </button>
      </header>

      <p className="text-[10px] font-bold tracking-[0.2em] text-[#2BCB8A] mb-2 uppercase">Financial Identity</p>
      <h1 className="text-4xl font-black text-white mb-8">Spending DNA</h1>

      <GlassCard className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-[#8F8A9B] mb-1 uppercase">Total Monthly Expenses</p>
            <p className="text-3xl font-black text-white">{formatKGS(monthlyExpenses)}</p>
          </div>
          <div className="flex items-center gap-1 bg-[#2BCB8A]/10 px-2 py-1 rounded-lg">
            <TrendingDown size={14} className="text-[#2BCB8A]" />
            <span className="text-[10px] font-bold text-[#2BCB8A]">8.2%</span>
          </div>
        </div>
        
        <div className="h-24 w-full flex items-end gap-1 px-2">
          {Array.from({ length: 20 }).map((_, i) => {
            const isPeak = i === 15 && useApp().internalDebt > 0;
            return (
              <motion.div 
                key={i} 
                initial={{ height: 0 }}
                animate={{ height: isPeak ? '100%' : `${Math.sin(i * 0.5) * 30 + 50}%` }}
                className={cn(
                  "flex-1 rounded-t-sm transition-colors",
                  isPeak ? "bg-[#E84855] shadow-[0_0_15px_rgba(232,72,85,0.5)]" : "bg-gradient-to-t from-[#B685FF]/20 to-[#B685FF]"
                )}
                style={{ opacity: isPeak ? 1 : 0.3 + (i / 20) * 0.7 }}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-4 px-2">
          {['MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT'].map(m => (
            <span key={m} className={cn("text-[8px] font-bold", m === 'AUG' ? "text-white" : "text-[#4F4765]")}>{m}</span>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="border-[#B685FF] shadow-[0_0_30px_rgba(182,133,255,0.15)] mb-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#B685FF] flex items-center justify-center shadow-[0_0_15px_rgba(182,133,255,0.4)]">
            <Sparkles className="text-white" size={24} />
          </div>
          <h3 className="text-xl font-black text-white">Savy Advice</h3>
        </div>
        <p className="text-sm text-white leading-relaxed mb-6">
          Transfer <span className="font-bold text-[#B685FF]">2,000 сом</span> to Rent Vault to fund it <span className="font-bold text-[#2BCB8A]">1 week early</span>.
        </p>
        <ActionButton title="EXECUTE TRANSFER" glow />
        <p className="text-[8px] italic text-[#8F8A9B] text-center mt-4">
          AI analyzed your spending categories (no access to PII) to provide this tip
        </p>
      </GlassCard>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-black text-white">Top Categories</h2>
        <button className="text-[10px] font-bold tracking-widest text-[#8F8A9B]">SEE ALL</button>
      </div>

      <div className="space-y-3">
        {categories.map((cat, idx) => (
          <div key={idx} className="flex items-center gap-4 bg-[#1D172F]/60 border border-[#302945] rounded-2xl p-4">
            <div className="w-10 h-10 rounded-full border-2 border-[#B685FF] flex items-center justify-center">
              <cat.icon size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white">{cat.title}</h4>
              <p className="text-[8px] font-bold text-[#8F8A9B] tracking-widest uppercase">{cat.transactions} TRANSACTIONS</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-white">{formatKGS(cat.amount)}</p>
              <p className="text-[10px] font-bold" style={{ color: cat.color }}>{cat.change}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
