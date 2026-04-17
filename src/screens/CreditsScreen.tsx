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
          <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">Savy</h1>
        </div>
        <button className="text-white">
          <Bell size={24} />
        </button>
      </header>

      <GlassCard className="mb-6">
        <p className="text-[10px] font-bold tracking-widest text-[#8F8A9B] mb-2 uppercase">Кредитный лимит</p>
        <p className="text-4xl font-black text-[#B685FF] mb-6">{formatKGS(creditLimit)}</p>
        <div className="bg-[#110C1E] rounded-xl p-4 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#2BCB8A] shadow-[0_0_8px_#2BCB8A]" />
          <p className="text-xs font-medium text-[#8F8A9B]">
            Рассчитано на основе вашего <span className="text-white">Runway ({runwayDays} дн.)</span>
          </p>
        </div>
      </GlassCard>

      <GlassCard className="flex items-center gap-4 mb-10 py-4">
        <div className="p-2.5 bg-[#2BCB8A]/10 rounded-xl">
          <ShieldCheck className="text-[#2BCB8A]" size={20} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-white">Runway под защитой</h4>
          <p className="text-[10px] text-[#8F8A9B]">Ваш лимит настроен так, чтобы Runway не падал ниже 14 дней</p>
        </div>
        <button className="text-[#8F8A9B]">
          <ArrowRight size={16} />
        </button>
      </GlassCard>

      <h2 className="text-xs font-bold tracking-[0.2em] text-white mb-6 uppercase italic">Преложения для вас</h2>
      
      <div className="mb-10 space-y-4">
        {runwayDays > 20 ? (
          <GlassCard className="border-[#2BCB8A]/30 bg-[#2BCB8A]/5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#2BCB8A] flex items-center justify-center shadow-[0_0_15px_rgba(43,203,138,0.4)]">
                <TrendingUp className="text-[#110C1E]" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white italic uppercase">Инвест-копилка</h3>
                <p className="text-[10px] font-bold text-[#2BCB8A] uppercase">Бонус за высокий Runway</p>
              </div>
            </div>
            <p className="text-xs text-[#8F8A9B] mb-6 leading-relaxed">
              Ваш Runway превышает 20 дней! Откройте депозит под <span className="text-white font-bold">14% годовых</span> и заставьте ваши свободные средства работать.
            </p>
            <button className="w-full py-3 bg-[#2BCB8A] text-[#110C1E] rounded-xl font-bold text-xs tracking-widest uppercase italic">
              Открыть депозит
            </button>
          </GlassCard>
        ) : runwayDays < 7 ? (
          <GlassCard className="border-[#E84855]/30 bg-[#E84855]/5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E84855] flex items-center justify-center shadow-[0_0_15px_rgba(232,72,85,0.4)]">
                <Zap className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white italic uppercase">Подпитка Runway</h3>
                <p className="text-[10px] font-bold text-[#E84855] uppercase">Критическая поддержка</p>
              </div>
            </div>
            <p className="text-xs text-[#8F8A9B] mb-6 leading-relaxed">
              Ваш Runway критически мал (менее 7 дней). Получите микрокредит на пополнение под <span className="text-white font-bold">0.1% в день</span> для стабилизации.
            </p>
            <button className="w-full py-3 bg-[#E84855] text-white rounded-xl font-bold text-xs tracking-widest uppercase italic">
              Пополнить Runway
            </button>
          </GlassCard>
        ) : (
          <p className="text-center py-8 text-[10px] font-bold text-[#4F4765] tracking-widest uppercase border border-dashed border-[#302945] rounded-2xl">
            Поддерживайте высокий Runway для предложений
          </p>
        )}
      </div>

      <h2 className="text-xs font-bold tracking-[0.2em] text-white mb-6 uppercase italic">Доступные кредиты</h2>

      <div className="space-y-4">
        <CreditItem
          icon={Rocket}
          title="Заполнение пробелов"
          apr="15% в год"
          limit={100000}
          tag="Мгновенная выплата"
          actionIcon={Plus}
          actionColor="#B685FF"
        />
        <CreditItem
          icon={Zap}
          title="Экспресс-кредит"
          apr="18% в год"
          limit={50000}
          tag="Критический приоритет"
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
      <p className="text-[10px] text-[#8F8A9B] leading-relaxed mb-6 italic">
        Создано для экстренных ситуаций. Без бумажной волокиты при сумме до 20 000 KGS.
      </p>
    )}

    <div className="flex justify-between items-end">
      <div>
        <p className="text-[10px] font-bold tracking-widest text-[#8F8A9B] mb-1 uppercase">
          {isCritical ? "Доступно до" : "Макс. лимит"}
        </p>
        <p className="text-xl font-black text-white">{formatKGS(limit)}</p>
      </div>
      <p className={cn("text-[10px] font-bold uppercase tracking-tight", isCritical ? "text-[#E84855]" : "text-[#8F8A9B]")}>
        {tag}
      </p>
    </div>
  </GlassCard>
);
