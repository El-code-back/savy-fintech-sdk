import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatKGS } from '@/lib/utils';
import { GlassCard } from '@/components/shared/UI';
import { ChevronRight, PlusCircle, Lock, Calendar, Eye, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function HomeScreen() {
  const { 
    runwayDays, 
    actualAvailable, 
    burnRate, 
    addIncome, 
    vaults, 
    emergencyUnlock, 
    isWaterfallActive, 
    setIsWaterfallActive 
  } = useApp();
  
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [incomeAmount, setIncomeAmount] = useState('');
  const [unlockAmount, setUnlockAmount] = useState('');
  const [selectedVaultId, setSelectedVaultId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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
          <h1 className="text-xl font-black tracking-tighter text-white">SAVY</h1>
        </div>
        <button className="text-[#B685FF]">
          <Eye size={24} />
        </button>
      </header>

      <section className="flex flex-col items-center mb-12">
        <p className="text-[10px] font-bold tracking-[0.2em] text-[#8F8A9B] mb-8 uppercase">Financial Runway</p>
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
              className="drop-shadow-[0_0_10px_rgba(182,133,255,0.5)]"
            />
          </svg>
          <div className="text-center">
            <motion.span 
              key={runwayDays}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-6xl font-black text-white"
            >
              {runwayDays}
            </motion.span>
            <p className="text-xs font-bold tracking-[0.3em] text-[#8F8A9B] mt-1 uppercase">Days</p>
          </div>
        </div>
      </section>

      <GlassCard className="mb-8">
        <div className="flex justify-between items-start mb-2">
          <p className="text-[10px] font-bold tracking-widest text-[#8F8A9B] uppercase">Actual Available</p>
          <Eye size={16} className="text-[#8F8A9B]" />
        </div>
        <p className="text-3xl font-black text-white">{formatKGS(actualAvailable)}</p>
      </GlassCard>

      <div className="space-y-3 mb-8">
        <ActionRow icon={PlusCircle} title="Add Income" onClick={() => setShowIncomeModal(true)} />
        <ActionRow icon={Lock} title="Emergency Unlock" color="#2BCB8A" onClick={() => setShowUnlockModal(true)} />
        <ActionRow icon={Calendar} title="Future Spend Plan" color="#B685FF" />
      </div>

      <GlassCard className="flex justify-between items-center">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-[#8F8A9B] mb-1 uppercase">Burn Rate</p>
          <p className="text-xl font-black text-white">
            {formatKGS(burnRate)} <span className="text-xs text-[#2BCB8A]">/ DAY</span>
          </p>
        </div>
        <div className="flex items-end gap-1 h-8">
          {[0.4, 0.6, 0.3, 0.8, 0.5, 1].map((h, i) => (
            <div key={i} className="w-1.5 rounded-full bg-[#2BCB8A]" style={{ height: `${h * 100}%`, opacity: i === 5 ? 1 : 0.4 }} />
          ))}
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
                  <h3 className="text-xl font-black text-white">Processing...</h3>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-white">Add Income</h3>
                    <button onClick={() => setShowIncomeModal(false)} className="text-[#8F8A9B]"><X size={24} /></button>
                  </div>
                  <div className="bg-[#110C1E] rounded-2xl p-4 mb-8 border border-[#302945]">
                    <input 
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoFocus
                      placeholder="Enter amount"
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
                    className="w-full py-4 bg-[#B685FF] text-[#110C1E] rounded-xl font-black tracking-widest shadow-[0_0_20px_rgba(182,133,255,0.3)]"
                  >
                    CONFIRM
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
                <h3 className="text-xl font-black text-white">Emergency Unlock</h3>
                <button onClick={() => setShowUnlockModal(false)} className="text-[#8F8A9B]"><X size={24} /></button>
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-[10px] font-bold tracking-widest text-[#8F8A9B] uppercase">Select Vault</p>
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
                  placeholder="Amount"
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
                className="w-full py-4 bg-red-500 text-white rounded-xl font-black tracking-widest disabled:opacity-50"
              >
                UNLOCK FUNDS
              </button>
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

