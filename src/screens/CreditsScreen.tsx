import React from 'react';
import { useApp } from '@/context/AppContext';
import { formatKGS, cn } from '@/lib/utils';
import { GlassCard } from '@/components/shared/UI';
import { ShieldCheck, Rocket, Zap, ArrowRight, Plus, Bell, TrendingUp } from 'lucide-react';

export default function CreditsScreen() {
  const { creditLimit, runwayDays } = useApp();

  return (
    <div className="pb-32 pt-10 px-6">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 overflow-hidden border-2 border-[#B685FF]">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-white">Savy</h1>
        </div>
        <button className="text-white">
          <Bell size={24} />
        </button>
      </header>

      <GlassCard className="mb-6">
        <p className="text-[10px] font-bold tracking-widest text-[#8F8A9B] mb-2">CREDIT LIMIT</p>
        <p className="text-4xl font-black text-[#B685FF] mb-6">{formatKGS(creditLimit)}</p>
        <div className="bg-[#110C1E] rounded-xl p-4 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#2BCB8A] shadow-[0_0_8px_#2BCB8A]" />
          <p className="text-xs font-medium text-[#8F8A9B]">
            Calculated based on your <span className="text-white">{runwayDays}-day</span> Financial Runway
          </p>
        </div>
      </GlassCard>

      <GlassCard className="flex items-center gap-4 mb-10 py-4">
        <div className="p-2.5 bg-[#2BCB8A]/10 rounded-xl">
          <ShieldCheck className="text-[#2BCB8A]" size={20} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-white">Runway Protected</h4>
          <p className="text-[10px] text-[#8F8A9B]">Your limit is set to keep your runway above 14 days</p>
        </div>
        <button className="text-[#8F8A9B]">
          <ArrowRight size={16} />
        </button>
      </GlassCard>

      <h2 className="text-xs font-bold tracking-[0.2em] text-white mb-6 uppercase">Offers for You</h2>
      
      <div className="mb-10 space-y-4">
        {runwayDays > 20 ? (
          <GlassCard className="border-[#2BCB8A]/30 bg-[#2BCB8A]/5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#2BCB8A] flex items-center justify-center shadow-[0_0_15px_rgba(43,203,138,0.4)]">
                <TrendingUp className="text-[#110C1E]" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Investment Deposit</h3>
                <p className="text-[10px] font-bold text-[#2BCB8A] uppercase">High Runway Bonus</p>
              </div>
            </div>
            <p className="text-xs text-[#8F8A9B] mb-6 leading-relaxed">
              Ваш Runway превышает 20 дней! Откройте депозит под <span className="text-white font-bold">14% годовых</span> и заставьте ваши свободные средства работать.
            </p>
            <button className="w-full py-3 bg-[#2BCB8A] text-[#110C1E] rounded-xl font-bold text-xs tracking-widest">
              OPEN DEPOSIT
            </button>
          </GlassCard>
        ) : runwayDays < 7 ? (
          <GlassCard className="border-[#E84855]/30 bg-[#E84855]/5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E84855] flex items-center justify-center shadow-[0_0_15px_rgba(232,72,85,0.4)]">
                <Zap className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Runway Refill</h3>
                <p className="text-[10px] font-bold text-[#E84855] uppercase">Critical Support</p>
              </div>
            </div>
            <p className="text-xs text-[#8F8A9B] mb-6 leading-relaxed">
              Ваш Runway критически мал (менее 7 дней). Получите микрокредит на пополнение под <span className="text-white font-bold">0.1% в день</span> для стабилизации.
            </p>
            <button className="w-full py-3 bg-[#E84855] text-white rounded-xl font-bold text-xs tracking-widest">
              REFILL RUNWAY
            </button>
          </GlassCard>
        ) : (
          <p className="text-center py-8 text-[10px] font-bold text-[#4F4765] tracking-widest uppercase border border-dashed border-[#302945] rounded-2xl">
            Maintain high runway for investment offers
          </p>
        )}
      </div>

      <h2 className="text-xs font-bold tracking-[0.2em] text-white mb-6 uppercase">Available Credits</h2>

      <div className="space-y-4">
        <CreditItem
          icon={Rocket}
          title="Gap-fill Credit"
          apr="15% APR"
          limit={100000}
          tag="Instant Disbursement"
          actionIcon={Plus}
          actionColor="#B685FF"
        />
        <CreditItem
          icon={Zap}
          title="Express Credit"
          apr="18% APR"
          limit={50000}
          tag="Critical Priority"
          actionIcon={ArrowRight}
          isCritical
        />
      </div>
    </div>
  );
}

const CreditItem = ({ icon: Icon, title, apr, limit, tag, actionIcon: ActionIcon, actionColor, isCritical }: any) => (
  <GlassCard>
    <div className="flex items-center gap-4 mb-6">
      <div className="w-12 h-12 rounded-2xl bg-[#302945] flex items-center justify-center">
        <Icon className={isCritical ? "text-[#E84855]" : "text-[#B685FF]"} size={24} />
      </div>
      <div className="flex-1">
        <h4 className="text-lg font-bold text-white">{title}</h4>
        <span className={cn(
          "inline-block px-2 py-0.5 rounded-md text-[8px] font-bold mt-1",
          isCritical ? "bg-[#E84855]/10 text-[#E84855]" : "bg-[#2BCB8A]/10 text-[#2BCB8A]"
        )}>
          {apr}
        </span>
      </div>
      <button className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90",
        ActionIcon === Plus ? "bg-[#B685FF] text-[#110C1E]" : "border border-[#302945] text-white"
      )}>
        <ActionIcon size={20} />
      </button>
    </div>

    {isCritical && (
      <p className="text-[10px] text-[#8F8A9B] leading-relaxed mb-6">
        Designed for emergencies. No paperwork required for amounts under 20,000 KGS.
      </p>
    )}

    <div className="flex justify-between items-end">
      <div>
        <p className="text-[10px] font-bold tracking-widest text-[#8F8A9B] mb-1 uppercase">
          {isCritical ? "Available up to" : "Max Limit"}
        </p>
        <p className="text-xl font-black text-white">{formatKGS(limit)}</p>
      </div>
      <p className={cn("text-[10px] font-bold", isCritical ? "text-[#E84855]" : "text-[#8F8A9B]")}>
        {tag}
      </p>
    </div>
  </GlassCard>
);
