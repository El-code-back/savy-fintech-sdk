import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { motion } from 'motion/react';
import { GlassCard, ActionButton } from '@/components/shared/UI';
import { Check, Wallet, TrendingUp, Shield, Home, ShoppingBag, CreditCard, Gift } from 'lucide-react';

const PRESETS = [
  { id: 'economy', title: 'Экономный', expenses: 20000, desc: 'Минимальные траты' },
  { id: 'average', title: 'Средний', expenses: 35000, desc: 'Комфортный баланс' },
  { id: 'active', title: 'Активный', expenses: 55000, desc: 'Максимум возможностей' },
];

const VAULT_OPTIONS = [
  { id: 'Rent', label: 'Аренда', icon: Home },
  { id: 'Groceries', label: 'Продукты', icon: ShoppingBag },
  { id: 'Credit', label: 'Кредит', icon: CreditCard },
  { id: 'Savings', label: 'Накопления', icon: Shield },
  { id: 'Toy/Holidays', label: 'Той/Праздники', icon: Gift },
];

export default function OnboardingScreen() {
  const { completeSetup } = useApp();
  const [step, setStep] = useState(1);
  const [income, setIncome] = useState(40000);
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[1]);
  const [selectedVaults, setSelectedVaults] = useState<string[]>(['Rent', 'Groceries', 'Savings']);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else completeSetup(income, selectedPreset.expenses, selectedVaults);
  };

  const toggleVault = (id: string) => {
    setSelectedVaults(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#110C1E] text-white px-6 py-12 flex flex-col">
      <header className="mb-12 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-[#B685FF] to-[#2F72E4] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(182,133,255,0.3)]">
          <TrendingUp size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-black tracking-tight">Настройка SAVY</h1>
        <p className="text-[#8F8A9B] text-sm mt-2 font-medium">Шаг {step} из 3</p>
      </header>

      <main className="flex-1">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-xl font-bold mb-6">Ваш ежемесячный доход?</h2>
            <GlassCard className="mb-8">
              <div className="flex items-center gap-4">
                <Wallet className="text-[#B685FF]" size={24} />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={income === 0 ? '' : income.toString()}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setIncome(val === '' ? 0 : Number(val));
                  }}
                  className="bg-transparent border-none text-3xl font-black text-white w-full focus:outline-none"
                  placeholder="0"
                />
                <span className="text-xl font-bold text-[#8F8A9B]">с</span>
              </div>
            </GlassCard>
            <p className="text-xs text-[#8F8A9B] leading-relaxed">
              Средний доход по Кыргызстану составляет около 40,000 сом. Мы используем это для базовых расчетов.
            </p>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-xl font-bold mb-6">Профиль ваших трат</h2>
            <div className="space-y-4">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPreset(p)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all ${
                    selectedPreset.id === p.id
                      ? 'bg-[#B685FF]/10 border-[#B685FF] shadow-[0_0_20px_rgba(182,133,255,0.1)]'
                      : 'bg-[#1D172F]/60 border-[#302945]'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-lg">{p.title}</span>
                    {selectedPreset.id === p.id && <Check size={20} className="text-[#B685FF]" />}
                  </div>
                  <p className="text-xs text-[#8F8A9B] mb-2">{p.desc}</p>
                  <p className="text-sm font-black text-[#B685FF]">~{p.expenses.toLocaleString()} сом / мес</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-xl font-bold mb-6">Выберите ваши Сейфы</h2>
            <div className="grid grid-cols-1 gap-3">
              {VAULT_OPTIONS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => toggleVault(v.id)}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    selectedVaults.includes(v.id)
                      ? 'bg-[#B685FF]/10 border-[#B685FF]'
                      : 'bg-[#1D172F]/60 border-[#302945]'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedVaults.includes(v.id) ? 'bg-[#B685FF] text-[#110C1E]' : 'bg-[#302945] text-[#8F8A9B]'
                  }`}>
                    <v.icon size={20} />
                  </div>
                  <span className="flex-1 text-left font-bold">{v.label}</span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedVaults.includes(v.id) ? 'border-[#B685FF] bg-[#B685FF]' : 'border-[#302945]'
                  }`}>
                    {selectedVaults.includes(v.id) && <Check size={14} className="text-[#110C1E]" />}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      <footer className="mt-12">
        <ActionButton
          title={step === 3 ? 'ЗАВЕРШИТЬ' : 'ПРОДОЛЖИТЬ'}
          onPress={handleNext}
          glow
        />
      </footer>
    </div>
  );
}
