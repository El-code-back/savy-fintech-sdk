import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MessageCircle, Info, Rocket, Zap, ArrowRight, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { budgetSummary, loanScenario } from '@/lib/finance';
import { formatKGS } from '@/lib/utils';
import { GlassCard } from '@/components/shared/UI';

const CREDIT_TYPES = [
  { id: 'planned', title: 'Заполнение пробелов', icon: Rocket, description: 'Для разовой покупки с выплатами в течение года.', rate: 15, amount: 20000, months: 12, exampleMax: 100000 },
  { id: 'express', title: 'Экспресс-кредит', icon: Zap, description: 'Для небольшой срочной траты с коротким сроком возврата.', rate: 18, amount: 10000, months: 3, exampleMax: 50000 },
];

export default function CreditsScreen() {
  const app = useApp();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('20000');
  const [months, setMonths] = useState(12);
  const [annualRate, setAnnualRate] = useState('18');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const calculatorRef = useRef<HTMLDivElement>(null);
  const selected = CREDIT_TYPES.find(type => type.id === selectedType);
  function chooseType(type: typeof CREDIT_TYPES[number]) {
    setSelectedType(type.id);
    setAmount(String(type.amount));
    setMonths(type.months);
    setAnnualRate(String(type.rate));
    calculatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  const principal = Number(amount);
  const rate = Number(annualRate);
  const valid = amount.trim() !== '' && annualRate.trim() !== '' && Number.isFinite(principal) && principal >= 1000 && principal <= 10000000 && Number.isFinite(rate) && rate >= 0 && rate <= 100;
  const budget = budgetSummary(app);
  const scenario = valid ? loanScenario(principal, months, rate, app) : null;
  const warnings = scenario ? [
    ...(scenario.budgetDeficit ? ['Платёж превышает остаток месячного дохода после целей сейфов. Потребуется пересмотреть сумму или расходы.'] : []),
    ...(scenario.lowReserve ? ['Текущий запас денег меньше 14 дней или пока не рассчитан. Сначала оцените обязательные платежи и резерв.'] : []),
    ...(scenario.hasInternalDebt ? ['Из важных сейфов уже забирали деньги. Учтите их восстановление перед новым обязательством.'] : []),
  ] : [];
  return (
    <div className="pb-32 pt-10 px-5 max-w-xl mx-auto">
      <header className="mb-7"><p className="text-xs text-[#B685FF] mb-2">Savy · Кредиты</p><h1 className="text-2xl font-bold text-white">Как платёж впишется в бюджет?</h1><p className="text-sm text-[#8F8A9B] mt-3">Сравните условия и посмотрите, сколько останется на ваши цели.</p></header>
      <GlassCard className="mb-5">
        <div className="flex items-center gap-2 mb-4"><CreditCard size={20} className="text-[#B685FF]" /><h2 className="text-white font-bold">Ваши возможности</h2></div>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-3"><dt className="text-[#8F8A9B]">Доход в месяц</dt><dd className="text-white">{formatKGS(app.monthlyIncome)}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-[#8F8A9B]">Цели сейфов в месяц</dt><dd className="text-white">{formatKGS(budget.monthlyExpenses)}</dd></div>
          <div className="flex justify-between gap-3 border-t border-[#302945] pt-3"><dt className="text-[#8F8A9B]">Остаток до нового кредита</dt><dd className="text-[#B685FF] font-bold">{formatKGS(budget.monthlySurplus)}</dd></div>
        </dl>
        <p className="text-xs text-[#8F8A9B] mt-4">Расчёт учитывает введённые цели сейфов. Другие регулярные расходы и платежи нужно учесть отдельно.</p>
      </GlassCard>
      <section className="mb-5" aria-label="Персональные сценарии">
        <h2 className="font-bold text-white mb-3">Персонально для вас</h2>
        {budget.runwayDays !== null && budget.runwayDays >= 20 && app.internalDebt === 0 ? <GlassCard className="mb-3">
          <h3 className="text-white font-semibold">Укрепить накопления</h3><p className="text-sm text-[#8F8A9B] mt-2">Ваш запас — {budget.runwayDays} дней. Сравните цель накоплений с новым платежом, прежде чем брать кредит.</p><button onClick={() => navigate('/vaults')} className="text-sm text-[#B685FF] mt-3">К целям и сейфам →</button>
        </GlassCard> : <GlassCard className="mb-3">
          <h3 className="text-white font-semibold">Сначала проверить резерв</h3><p className="text-sm text-[#8F8A9B] mt-2">{app.internalDebt > 0 ? 'В важных сейфах есть сумма к восстановлению.' : 'Текущий запас денег пока невелик.'} Сравните новый платёж с обязательными расходами и возможностью обойтись без займа.</p><button onClick={() => navigate('/insights', { state: { question: 'Как восстановить резерв без нового кредита при моём бюджете?' } })} className="text-sm text-[#B685FF] mt-3">Обсудить план с помощником →</button>
        </GlassCard>}
      </section>
      <section className="mb-6" aria-label="Виды кредитования">
        <h2 className="font-bold text-white mb-1">Виды кредитования</h2>
        <p className="text-xs text-[#8F8A9B] mb-3">Примеры условий для сравнения. Выберите вариант, чтобы рассчитать платёж.</p>
        <div className="space-y-3">
          {CREDIT_TYPES.map(type => <button key={type.id} aria-pressed={selectedType === type.id} onClick={() => chooseType(type)} className={`w-full text-left rounded-2xl border p-4 transition-colors ${selectedType === type.id ? 'border-[#B685FF] bg-[#B685FF]/10' : 'border-[#302945] bg-[#1D172F]/60 hover:border-[#B685FF]/60'}`}>
            <span className="flex gap-3 items-center"><span className="p-2.5 rounded-xl bg-[#B685FF]/10"><type.icon size={21} className="text-[#B685FF]" /></span><span className="flex-1 min-w-0"><span className="block text-white text-sm font-bold">{type.title}</span><span className="block text-xs text-[#B685FF] mt-1">{type.rate}% годовых · пример до {formatKGS(type.exampleMax)}</span></span>{selectedType === type.id ? <Check size={18} className="text-[#B685FF] shrink-0" /> : <ArrowRight size={18} className="text-[#8F8A9B] shrink-0" />}</span>
            <span className="block text-xs text-[#8F8A9B] mt-3 leading-relaxed">{type.description}</span>
          </button>)}
        </div>
        <p className="text-[11px] text-[#8F8A9B] mt-3">Демонстрационные ставки и суммы. Доступность и условия определяет банк.</p>
      </section>
      <div ref={calculatorRef} className="scroll-mt-5">
      <GlassCard className="mb-5">
        <h2 className="text-lg text-white font-bold mb-1">Проверьте свой вариант</h2><p className="text-xs text-[#8F8A9B] mb-5">{selected ? `${selected.title}: ${formatKGS(selected.amount)} на ${selected.months} мес. Условия можно изменить ниже.` : 'Учебный расчёт. Введите ставку из условий банка.'}</p>
        <div className="space-y-4">
          <label className="block text-sm text-[#8F8A9B]">Сумма, сом<input type="number" min="1000" max="10000000" value={amount} onChange={e => { setAmount(e.target.value); setSelectedType(null); }} className="block w-full mt-2 p-3 rounded-xl bg-[#110C1E] border border-[#302945] text-white" /></label>
          <label className="block text-sm text-[#8F8A9B]">Срок<select value={months} onChange={e => { setMonths(Number(e.target.value)); setSelectedType(null); }} className="block w-full mt-2 p-3 rounded-xl bg-[#110C1E] border border-[#302945] text-white">{[3, 6, 12, 24, 36].map(m => <option key={m} value={m}>{m} мес.</option>)}</select></label>
          <label className="block text-sm text-[#8F8A9B]">Годовая ставка, %<input type="number" min="0" max="100" step="0.1" value={annualRate} onChange={e => { setAnnualRate(e.target.value); setSelectedType(null); }} className="block w-full mt-2 p-3 rounded-xl bg-[#110C1E] border border-[#302945] text-white" /></label>
        </div>
        {!valid && <p role="alert" className="text-sm text-[#EFA5AE] mt-4">Введите сумму от 1 000 до 10 000 000 сомов и ставку от 0 до 100%.</p>}
        {scenario && <div aria-live="polite" className="mt-6 border-t border-[#302945] pt-5">
          <p className="text-xs text-[#8F8A9B]">Примерный платёж в месяц</p><p className="text-3xl font-bold text-[#B685FF] mt-1">{formatKGS(scenario.payment)}</p>
          <dl className="space-y-3 text-sm mt-5">
            <div className="flex justify-between gap-3"><dt className="text-[#8F8A9B]">Всего выплатите</dt><dd className="text-white">{formatKGS(scenario.total)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-[#8F8A9B]">Переплата</dt><dd className="text-white">{formatKGS(scenario.overpayment)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-[#8F8A9B]">Останется в месяц</dt><dd className={scenario.budgetDeficit ? 'text-[#EFA5AE]' : 'text-white'}>{formatKGS(scenario.remainingPerMonth)}</dd></div>
          </dl>
          <div className="mt-5 space-y-3">{warnings.length ? warnings.map(warning => <p key={warning} className="text-sm leading-relaxed text-[#F1C27D] bg-[#F1C27D]/5 rounded-xl p-3">{warning}</p>) : <p className="text-sm text-[#8F8A9B]">По введённым данным платёж помещается в месячный остаток. Проверьте также остальные обязательства и нерегулярные траты.</p>}</div>
          <button onClick={() => navigate('/insights', { state: { question: `Помоги оценить учебный кредит: сумма ${principal} сомов, срок ${months} мес., ставка ${rate}% годовых. Платёж около ${Math.round(scenario.payment)} сомов в месяц, переплата около ${Math.round(scenario.overpayment)} сомов. После целей сейфов и платежа останется ${Math.round(scenario.remainingPerMonth)} сомов в месяц. Что учесть при моём текущем бюджете?` } })} className="w-full flex items-center justify-center gap-2 mt-5 p-3 rounded-xl bg-[#B685FF] text-[#110C1E] font-semibold text-sm"><MessageCircle size={18} />Обсудить с помощником</button>
        </div>}
      </GlassCard>
      </div>
      <p className="flex gap-2 text-xs text-[#8F8A9B] leading-relaxed"><Info size={16} className="shrink-0" />Равные ежемесячные платежи, без комиссий и страховок. Это оценка сценария, а не предложение банка или одобренный лимит.</p>
    </div>
  );
}
