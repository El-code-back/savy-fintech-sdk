import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatKGS, cn } from '@/lib/utils';
import { GlassCard } from '@/components/shared/UI';
import { ChevronRight, PlusCircle, Lock, Calendar, X, AlertTriangle, ToggleLeft, ToggleRight, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function HomeScreen() {
  const { 
    runwayDays, 
    actualAvailable, 
    burnRate, 
    addIncome, 
    vaults, 
    emergencyUnlock, 
    isWaterfallActive, 
    setIsWaterfallActive,
    plannedSpends,
    addFutureSpend,
    toggleFutureSpend,
    monthlyIncome,
    monthlyExpenses
  } = useApp();
  
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [incomeAmount, setIncomeAmount] = useState('');
  const [unlockAmount, setUnlockAmount] = useState('');
  const [selectedVaultId, setSelectedVaultId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [showFspModal, setShowFspModal] = useState(false);
  const [pulseRunway, setPulseRunway] = useState(false);
  const [fspTitle, setFspTitle] = useState('');
  const [fspAmount, setFspAmount] = useState('');
  const [fspType, setFspType] = useState<'Fixed' | 'Flexible'>('Fixed');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const reserved = plannedSpends
      .filter(s => s.type === 'Fixed' && s.enabled)
      .reduce((sum, s) => sum + s.amount, 0);

  const handleToggleFsp = (id: string) => {
    toggleFutureSpend(id);
    setPulseRunway(true);
    setTimeout(() => setPulseRunway(false), 500);
  };

  const handleAddFsp = () => {
    if (!fspTitle || !fspAmount) return;
    addFutureSpend({
      title: fspTitle,
      amount: Number(fspAmount),
      date: selectedDate.toISOString(),
      type: fspType
    });
    setFspTitle('');
    setFspAmount('');
  };

  const handleAddIncome = () => {
    if (!incomeAmount) return;
    setIsProcessing(true);
    setTimeout(() => {
      addIncome(Number(incomeAmount));
      setIsProcessing(false);
      setShowIncomeModal(false);
      setIncomeAmount('');
    }, 1500);
  };

  const handleUnlock = () => {
    if (!unlockAmount || !selectedVaultId) return;
    emergencyUnlock(selectedVaultId, Number(unlockAmount));
    setShowUnlockModal(false);
    setUnlockAmount('');
  };

  const selectedVault = vaults.find(v => v.id === selectedVaultId);
  const runwayImpact = selectedVault ? Math.floor(Number(unlockAmount) / burnRate) : 0;

  return (
    <div className="pb-32 pt-10 px-6">
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 overflow-hidden border-2 border-[#B685FF]">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">SAVY</h1>
        </div>
      </header>

      <section className="flex flex-col items-center mb-12">
        <p className="text-[10px] font-bold tracking-[0.2em] text-[#8F8A9B] mb-8 uppercase">Финансовый Runway</p>
        <div className="relative w-56 h-56 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="112" cy="112" r="100"
              fill="none"
              stroke="#302945"
              strokeWidth="8"
            />
            <motion.circle
              cx="112" cy="112" r="100"
              fill="none"
              stroke="#B685FF"
              strokeWidth="8"
              strokeDasharray="628"
              initial={{ strokeDashoffset: 628 }}
              animate={{ strokeDashoffset: 628 - (628 * Math.min(1, runwayDays / 30)) }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
              className="drop-shadow-[0_0_10px_rgba(182,133,255,0.5)] transition-all duration-300"
              style={pulseRunway ? { filter: 'drop-shadow(0 0 20px rgba(182,133,255,0.9))' } : {}}
            />
          </svg>
          <motion.div 
            className="text-center"
            animate={pulseRunway ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.4 }}
          >
            <motion.span 
              key={runwayDays}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-6xl font-black text-white"
            >
              {runwayDays}
            </motion.span>
            <p className="text-xs font-bold tracking-[0.3em] text-[#8F8A9B] mt-1 uppercase">Дней</p>
          </motion.div>
        </div>
      </section>

      <GlassCard className="mb-8">
        <div className="flex justify-between items-start mb-2">
          <p className="text-[10px] font-bold tracking-widest text-[#8F8A9B] uppercase">Свободные средства</p>
        </div>
        <p className="text-3xl font-black text-white">{formatKGS(actualAvailable)}</p>
        {reserved > 0 && (
          <p className="text-[10px] font-bold text-[#B685FF] mt-1 tracking-wider uppercase">
            Забронировано на будущее: {formatKGS(reserved)}
          </p>
        )}
      </GlassCard>

      <div className="space-y-3 mb-8">
        <ActionRow icon={PlusCircle} title="Пополнить баланс" onClick={() => setShowIncomeModal(true)} />
        <ActionRow icon={Lock} title="Экстренный вывод" color="#2BCB8A" onClick={() => setShowUnlockModal(true)} />
        <ActionRow icon={Calendar} title="План будущих трат" color="#B685FF" onClick={() => setShowFspModal(true)} />
      </div>

      <GlassCard className="mb-8">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-[#B685FF] mb-1 uppercase">Интеллектуальный помощник</p>
            <p className="text-[11px] font-medium text-[#8F8A9B]">Чтобы сохранить твой темп, комфортно будет тратить... </p>
          </div>
          <button 
            onClick={() => setShowWhyModal(true)}
            className="px-2 py-1 rounded bg-[#B685FF]/10 text-[9px] font-black text-[#B685FF] uppercase tracking-tighter border border-[#B685FF]/20"
          >
            Почему?
          </button>
        </div>
        
        <div className="flex justify-between items-end mt-4">
          <div>
            <p className="text-2xl font-black text-white">
              {(() => {
                const targetDaily = burnRate;
                const capacityDaily = Math.max(0, (actualAvailable - reserved) / 30);
                const suggested = Math.min(targetDaily, capacityDaily);
                const floor = actualAvailable > 500 ? 500 : actualAvailable;
                const final = Math.max(floor, suggested);
                
                const min = Math.round((final * 0.8) / 100) * 100;
                const max = Math.round((final * 1.0) / 100) * 100;
                return `${formatKGS(min)} – ${formatKGS(max)}`;
              })()}
            </p>
            <p className="text-[9px] font-bold text-[#2BCB8A] uppercase tracking-wider mt-1">в день (экономный режим)</p>
          </div>
          <div className="flex items-end gap-1 h-8">
            {[0.4, 0.6, 0.3, 0.8, 0.5, 1].map((h, i) => (
              <div key={i} className="w-1.5 rounded-full bg-[#2BCB8A]" style={{ height: `${h * 100}%`, opacity: i === 5 ? 1 : 0.4 }} />
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Add Income Modal */}
      <AnimatePresence>
        {showIncomeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0F0B19]/80 backdrop-blur-sm"
              onClick={() => !isProcessing && setShowIncomeModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-[#1D172F] border border-[#302945] rounded-3xl p-8 shadow-2xl"
            >
              {isProcessing ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 border-4 border-[#B685FF] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                  <h3 className="text-xl font-black text-white">Обработка...</h3>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-white">Пополнить баланс</h3>
                    <button onClick={() => setShowIncomeModal(false)} className="text-[#8F8A9B]"><X size={24} /></button>
                  </div>
                  <div className="bg-[#110C1E] rounded-2xl p-4 mb-8 border border-[#302945]">
                    <input 
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoFocus
                      placeholder="Введите сумму"
                      value={incomeAmount === '0' ? '' : incomeAmount}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setIncomeAmount(val);
                      }}
                      className="w-full bg-transparent border-none text-3xl font-black text-white focus:outline-none"
                    />
                  </div>
                  <button 
                    onClick={handleAddIncome}
                    className="w-full py-4 bg-[#B685FF] text-[#110C1E] rounded-xl font-black tracking-widest shadow-[0_0_20px_rgba(182,133,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    ПОДТВЕРДИТЬ
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Emergency Unlock Modal */}
      <AnimatePresence>
        {showUnlockModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0F0B19]/80 backdrop-blur-sm"
              onClick={() => setShowUnlockModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-[#1D172F] border border-[#302945] rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-white">Экстренный вывод</h3>
                <button onClick={() => setShowUnlockModal(false)} className="text-[#8F8A9B]"><X size={24} /></button>
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-[10px] font-bold tracking-widest text-[#8F8A9B] uppercase">Выберите сейф</p>
                <div className="grid grid-cols-2 gap-2">
                  {vaults.map(v => (
                    <button 
                      key={v.id}
                      onClick={() => setSelectedVaultId(v.id)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        selectedVaultId === v.id ? 'bg-[#B685FF]/10 border-[#B685FF] text-white' : 'bg-[#110C1E] border-[#302945] text-[#8F8A9B]'
                      }`}
                    >
                      {v.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#110C1E] rounded-2xl p-4 mb-6 border border-[#302945]">
                <input 
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Сумма"
                  value={unlockAmount === '0' ? '' : unlockAmount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setUnlockAmount(val);
                  }}
                  className="w-full bg-transparent border-none text-2xl font-black text-white focus:outline-none"
                />
              </div>

              {Number(unlockAmount) > 0 && selectedVaultId && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-8 flex gap-3">
                  <AlertTriangle className="text-red-500 shrink-0" size={20} />
                  <p className="text-[10px] font-bold text-red-500 leading-relaxed">
                    Внимание: вывод этой суммы сократит ваш Runway на {runwayImpact} дней и может временно снизить ваш кредитный рейтинг.
                  </p>
                </div>
              )}

              <button 
                onClick={handleUnlock}
                disabled={!unlockAmount || !selectedVaultId}
                className="w-full py-4 bg-red-500 text-white rounded-xl font-black tracking-widest disabled:opacity-50 hover:bg-red-600 transition-colors"
              >
                ВЫВЕСТИ СРЕДСТВА
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Why Modal */}
      <AnimatePresence>
        {showWhyModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0F0B19]/80 backdrop-blur-sm"
              onClick={() => setShowWhyModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-[#1D172F] border border-[#302945] rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#B685FF] to-transparent" />
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-white uppercase italic">Математика Savy</h3>
                <button onClick={() => setShowWhyModal(false)} className="text-[#8F8A9B]"><X size={24} /></button>
              </div>

              <div className="space-y-4 mb-8 font-mono">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8F8A9B] uppercase font-bold tracking-tighter">Месячный доход</span>
                  <span className="text-white font-black">{formatKGS(monthlyIncome)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8F8A9B] uppercase font-bold tracking-tighter">Обязательные платежи</span>
                  <span className="text-[#E84855] font-black">-{formatKGS(monthlyExpenses)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8F8A9B] uppercase font-bold tracking-tighter">План будущих трат</span>
                  <span className="text-[#E84855] font-black">-{formatKGS(reserved)}</span>
                </div>
                <div className="h-px bg-[#302945] my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-white uppercase font-black tracking-widest">Итог на «жизнь»</span>
                  <span className="text-xl font-black text-white">{formatKGS(actualAvailable - reserved)}</span>
                </div>
                <p className="text-[10px] text-[#8F8A9B] leading-relaxed italic">
                  Результат делится на 30 дней до следующего пополнения.
                </p>
              </div>

              {actualAvailable - reserved < 10000 && (
                <div className="bg-[#2BCB8A]/10 border border-[#2BCB8A]/20 rounded-2xl p-4 flex gap-3">
                  <Info className="text-[#2BCB8A] shrink-0" size={20} />
                  <p className="text-[10px] font-bold text-[#2BCB8A] leading-relaxed">
                    В этом месяце поток чуть ниже обычного, поэтому мы немного скорректировали твой чек, чтобы ты не заходил в долги.
                  </p>
                </div>
              )}

              <button 
                onClick={() => setShowWhyModal(false)}
                className="w-full py-4 mt-8 bg-[#302945] text-white rounded-xl font-black tracking-widest hover:bg-[#3d335c] transition-colors uppercase text-xs"
              >
                Понятно
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Future Spend Plan Modal */}
      <AnimatePresence>
        {showFspModal && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0F0B19]/80 backdrop-blur-sm"
              onClick={() => setShowFspModal(false)}
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full h-[85vh] bg-[#1D172F] border-t border-[#302945] rounded-t-3xl p-6 shadow-2xl flex flex-col pt-8"
            >
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#302945] rounded-full" />
              
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-xl font-black text-white flex items-center gap-2 uppercase italic">
                  <Calendar size={24} className="text-[#B685FF]"/> 
                  План будущих трат
                </h3>
                <button onClick={() => setShowFspModal(false)} className="text-[#8F8A9B]"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pb-10 hide-scrollbar">
                {/* Calendar Integration */}
                <div className="bg-[#110C1E] border border-[#302945] rounded-2xl p-4">
                  <MiniCalendar 
                    selectedDate={selectedDate} 
                    onSelect={setSelectedDate} 
                    plannedSpends={plannedSpends}
                  />
                </div>

                {/* List Spends */}
                {plannedSpends.length === 0 ? (
                  <div className="py-10 flex flex-col items-center justify-center text-center opacity-50">
                    <Calendar size={48} className="text-[#8F8A9B] mb-4"/>
                    <p className="text-sm font-bold text-white mb-1">Нет запланированных трат</p>
                    <p className="text-xs text-[#8F8A9B]">Добавьте ожидаемые расходы, чтобы Savy учёл их в Runway.</p>
                  </div>
                ) : (
                  plannedSpends
                    .filter(s => isSameDay(new Date(s.date), selectedDate))
                    .length === 0 ? (
                      <div className="py-10 flex flex-col items-center justify-center text-center opacity-30">
                        <p className="text-[10px] font-black uppercase italic">Нет трат на эту дату</p>
                      </div>
                    ) : (
                      plannedSpends
                        .filter(s => isSameDay(new Date(s.date), selectedDate))
                        .map(spend => (
                          <div key={spend.id} className={`p-4 rounded-2xl border transition-all ${spend.enabled ? 'bg-[#110C1E] border-[#302945]' : 'bg-[#110C1E]/50 border-transparent opacity-60'}`}>
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-sm ${spend.type === 'Fixed' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                  {spend.type === 'Fixed' ? 'Обязательно' : 'Гибко'}
                                </span>
                                <span className="text-sm font-bold text-white">{spend.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={() => handleToggleFsp(spend.id)} className="text-[#B685FF]">
                                  {spend.enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} className="text-[#8F8A9B]" />}
                                </button>
                                <button 
                                  onClick={() => deleteFutureSpend(spend.id)}
                                  className="p-1 text-[#E84855] opacity-50 hover:opacity-100"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                            <div className="flex justify-between items-end">
                              <div className="space-y-1">
                                <p className="text-[10px] text-[#2BCB8A] font-bold uppercase tracking-widest">{format(new Date(spend.date), 'd MMMM', { locale: ru })}</p>
                                <p className="text-[8px] text-[#8F8A9B]">
                                  {spend.enabled 
                                    ? (spend.type === 'Fixed' ? 'Вычитается из Runway' : 'Учитывается как риск') 
                                    : 'Выключено (What-If)'}
                                </p>
                              </div>
                              <p className={`text-lg font-black ${spend.enabled ? 'text-white' : 'text-[#8F8A9B] line-through'}`}>
                                {formatKGS(spend.amount)}
                              </p>
                            </div>
                          </div>
                        ))
                    )
                )}

                {/* Add Form */}
                <div className="mt-8 bg-[#110C1E]/80 border border-[#302945] rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#B685FF]"></div>
                  <h4 className="text-sm font-bold text-white mb-4">Добавить трату</h4>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Название (напр. Аренда, Подарок)"
                      value={fspTitle}
                      onChange={e => setFspTitle(e.target.value)}
                      className="w-full bg-[#1D172F] border border-[#302945] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#8F8A9B] focus:outline-none focus:border-[#B685FF]"
                    />
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        inputMode="numeric"
                        placeholder="Сумма"
                        value={fspAmount}
                        onChange={e => setFspAmount(e.target.value.replace(/[^0-9]/g, ''))}
                        className="flex-1 bg-[#1D172F] border border-[#302945] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#8F8A9B] focus:outline-none focus:border-[#B685FF]"
                      />
                      <button 
                        onClick={() => setFspType(prev => prev === 'Fixed' ? 'Flexible' : 'Fixed')}
                        className={`px-4 py-3 rounded-xl border text-[10px] font-black uppercase transition-all whitespace-nowrap ${fspType === 'Fixed' ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-blue-500/10 border-blue-500/50 text-blue-500'}`}
                      >
                        {fspType}
                      </button>
                    </div>
                    <button 
                      onClick={handleAddFsp}
                      disabled={!fspTitle || !fspAmount}
                      className="w-full bg-[#B685FF] text-[#110C1E] py-3 rounded-xl font-black text-sm uppercase tracking-wider disabled:opacity-50 mt-2"
                    >
                      Добавить в план
                    </button>
                  </div>
                </div>

                <div className="bg-[#2BCB8A]/10 border border-[#2BCB8A]/20 rounded-xl p-3 flex gap-2 items-start mt-4">
                  <Info className="text-[#2BCB8A] shrink-0 mt-0.5" size={16} />
                  <p className="text-[10px] text-[#2BCB8A] leading-relaxed">
                    <strong>Smart-предсказание Savy Intelligence:</strong> В MVP версии AI не имеет истории транзакций для автоматических предложений о регулярных платежах 20-го числа. Занесите их вручную как Fixed (Обязательные), и они сразу учтутся в вашем Runway!
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ActionRow = ({ icon: Icon, title, color = "#8F8A9B", onClick }: { icon: any, title: string, color?: string, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-4 bg-[#1D172F]/60 border border-[#302945] rounded-xl p-4 transition-all active:scale-[0.98] hover:bg-[#1D172F]/80"
  >
    <Icon size={20} style={{ color }} />
    <span className="flex-1 text-left text-sm font-bold text-white">{title}</span>
    <ChevronRight size={20} className="text-[#8F8A9B]" />
  </button>
);

const MiniCalendar = ({ selectedDate, onSelect, plannedSpends }: { 
  selectedDate: Date, 
  onSelect: (d: Date) => void,
  plannedSpends: any[]
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = isExpanded 
    ? eachDayOfInterval({ 
        start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }), 
        end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }) 
      })
    : eachDayOfInterval({ 
        start: startOfWeek(new Date(), { weekStartsOn: 1 }), 
        end: endOfWeek(new Date(), { weekStartsOn: 1 }) 
      });

  const weekdayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 px-1">
        <h4 className="text-sm font-black text-white uppercase italic">
          {format(isExpanded ? currentMonth : selectedDate, 'LLLL yyyy', { locale: ru })}
        </h4>
        <div className="flex items-center gap-2">
          {isExpanded && (
            <div className="flex gap-2">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="text-[#8F8A9B] hover:text-white"><ChevronRight className="rotate-180" size={16}/></button>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="text-[#8F8A9B] hover:text-white"><ChevronRight size={16}/></button>
            </div>
          )}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-full bg-[#302945] text-[#B685FF]"
          >
            {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-7 gap-1 transition-all duration-300 ${isExpanded ? 'opacity-100' : ''}`}>
        {weekdayLabels.map(label => (
          <div key={label} className="text-[10px] font-black text-[#4F4765] text-center mb-2 uppercase">
            {label}
          </div>
        ))}
        {days.map(day => {
          const hasSpend = plannedSpends.some(s => s.enabled && isSameDay(new Date(s.date), day));
          const isSelected = isSameDay(day, selectedDate);
          const active = isToday(day);

          return (
            <button
              key={day.toString()}
              onClick={() => onSelect(day)}
              className={cn(
                "relative flex flex-col items-center justify-center p-2 rounded-xl transition-all aspect-square",
                isSelected ? "bg-[#B685FF] text-[#110C1E] shadow-[0_0_15px_rgba(182,133,255,0.4)]" : "hover:bg-[#302945] text-[#8F8A9B]",
                active && !isSelected && "text-white ring-1 ring-[#B685FF]/30"
              )}
            >
              <span className="text-[11px] font-black">{format(day, 'd')}</span>
              {hasSpend && (
                <div className={cn(
                  "absolute bottom-1 w-1 h-1 rounded-full",
                  isSelected ? "bg-[#110C1E]" : "bg-[#B685FF]"
                )} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};


