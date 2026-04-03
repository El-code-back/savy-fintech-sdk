import React, { useState } from 'react';
import { useApp, Vault } from '@/context/AppContext';
import { formatKGS, cn } from '@/lib/utils';
import { GlassCard, ActionButton, PriorityBadge } from '@/components/shared/UI';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Home, ShoppingBag, CreditCard, Shield, Gift, Car, Plane, CheckCircle, Zap } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Home, ShoppingBag, CreditCard, Shield, Gift, Car, Plane
};

const ACCELERATE_PRESETS = [500, 1000, 5000];

export default function VaultsScreen() {
  const { vaults, runwayDays, actualAvailable, burnRate, addVault, releaseFunds, accelerateGoal } = useApp();

  const [showAddModal, setShowAddModal]           = useState(false);
  const [accelerateVaultId, setAccelerateVaultId] = useState<string | null>(null);
  const [customAmount, setCustomAmount]           = useState('');
  const [toast, setToast]                         = useState<string | null>(null);

  const [newVault, setNewVault] = useState({
    title: '',
    target: '',
    priority: 'MEDIUM' as Vault['priority'],
    icon: 'Shield',
  });

  const vaultsTotal = vaults.reduce((acc, v) => acc + v.current, 0);

  // ── Helpers ──────────────────────────────────────────────

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleRelease = (vaultId: string) => {
    const released = releaseFunds(vaultId);
    if (released > 0) {
      const runwayGain = Math.round(released / burnRate);
      showToast(`+${formatKGS(released)} на баланс! Runway вырос на ~${runwayGain} дн. 🚀`);
    }
  };

  const handleAccelerate = (vaultId: string, amount: number) => {
    if (amount <= 0) return;
    const vault = vaults.find(v => v.id === vaultId);
    if (!vault) return;

    const daysCloser = Math.round(amount / burnRate);
    const ok = accelerateGoal(vaultId, amount);

    if (ok) {
      showToast(`Цель стала ближе на ~${daysCloser} дн.! 🎯`);
      setAccelerateVaultId(null);
      setCustomAmount('');
    } else {
      showToast('Недостаточно средств на балансе ⚠️');
    }
  };

  const handleAddVault = () => {
    if (!newVault.title || !newVault.target) return;
    addVault({
      title: newVault.title,
      sub: 'CUSTOM GOAL',
      target: Number(newVault.target),
      priority: newVault.priority,
      icon: newVault.icon,
    });
    setShowAddModal(false);
    setNewVault({ title: '', target: '', priority: 'MEDIUM', icon: 'Shield' });
  };

  const accelerateVault = vaults.find(v => v.id === accelerateVaultId);

  return (
    <div className="pb-32 pt-10 px-6">
      {/* ── Header ── */}
      <header className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 flex-1">
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#8F8A9B] uppercase">Vault Overview</p>
            <div className="h-px flex-1 bg-[#302945]" />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="ml-4 w-8 h-8 rounded-full bg-[#B685FF] flex items-center justify-center text-[#110C1E] shadow-[0_0_15px_rgba(182,133,255,0.4)]"
          >
            <Plus size={20} />
          </button>
        </div>
        <h1 className="text-4xl font-black text-white leading-tight mb-2">
          Total in Vaults:<br />
          {formatKGS(vaultsTotal)}
        </h1>
        <div className="flex justify-between items-center">
          <p className="text-[10px] font-bold tracking-widest text-[#8F8A9B] uppercase">
            {vaults.length} Active Goals Tracking in Real-Time
          </p>
          {useApp().internalDebt > 0 && (
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-[#E84855]/10 px-2 py-1 rounded border border-[#E84855]/30"
            >
              <p className="text-[8px] font-black text-[#E84855] uppercase tracking-widest">
                Internal Debt: {formatKGS(useApp().internalDebt)}
              </p>
            </motion.div>
          )}
        </div>
      </header>

      {/* ── Vault Cards ── */}
      <div className="space-y-6">
        {vaults.map((vault, idx) => {
          const Icon = ICON_MAP[vault.icon] || Shield;
          const progress = Math.min(100, (vault.current / vault.target) * 100);
          const isComplete = progress >= 100;

          return (
            <GlassCard
              key={vault.id}
              className={cn(
                'relative overflow-hidden transition-colors duration-500',
                vault.hasWarning && 'border-[#E84855] shadow-[0_0_20px_rgba(232,72,85,0.2)]'
              )}
            >
              {vault.hasWarning && (
                <motion.div
                  animate={{ opacity: [0, 0.1, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 bg-[#E84855]"
                />
              )}

              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#302945] flex items-center justify-center">
                    <Icon className="text-[#B685FF]" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">{vault.title}</h3>
                    <p className="text-[10px] font-bold tracking-widest text-[#8F8A9B] mt-1 uppercase">{vault.sub}</p>
                  </div>
                </div>
                <PriorityBadge level={vault.priority} />
              </div>

              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-[#8F8A9B] mb-1 uppercase">Current</p>
                  <p className={cn('text-xl font-black', isComplete ? 'text-[#2BCB8A]' : 'text-white')}>
                    {formatKGS(vault.current)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold tracking-widest text-[#8F8A9B] mb-1 uppercase">Target</p>
                  <p className="text-sm font-bold text-[#8F8A9B]">{formatKGS(vault.target)}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full bg-[#302945] rounded-full mb-3 overflow-hidden">
                <motion.div
                  className={cn(
                    'h-full rounded-full',
                    isComplete
                      ? 'bg-[#2BCB8A]'
                      : vault.priority === 'CRITICAL'
                      ? 'bg-[#E84855]'
                      : vault.priority === 'HIGH'
                      ? 'bg-[#E58A32]'
                      : 'bg-[#B685FF]'
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, delay: idx * 0.1 }}
                />
              </div>
              <p className="text-[9px] font-bold text-[#8F8A9B] text-right mb-4">
                {Math.round(progress)}%
              </p>

              {/* Action buttons */}
              {isComplete ? (
                <ActionButton
                  title="RELEASE FUNDS"
                  variant="outline"
                  className="border-[#2BCB8A]/40 text-[#2BCB8A] hover:bg-[#2BCB8A]/10"
                  onPress={() => handleRelease(vault.id)}
                />
              ) : (
                <button
                  onClick={() => setAccelerateVaultId(vault.id)}
                  className="w-full py-3 rounded-xl bg-[#B685FF] text-[#110C1E] font-black text-sm tracking-widest
                             shadow-[0_0_20px_rgba(182,133,255,0.3)] hover:bg-[#C99AFF] transition-all active:scale-95
                             flex items-center justify-center gap-2"
                >
                  <Zap size={15} />
                  ACCELERATE GOAL
                </button>
              )}

              <p className="text-[8px] font-bold tracking-widest text-[#8F8A9B] text-center mt-4 uppercase">
                Available based on your {runwayDays}-day runway
              </p>
            </GlassCard>
          );
        })}
      </div>

      {/* ── Toast notification ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[200]
                       bg-[#1D172F] border border-[#B685FF]/40 rounded-2xl px-5 py-3
                       shadow-[0_0_30px_rgba(182,133,255,0.25)] flex items-center gap-2 max-w-[90vw]"
          >
            <CheckCircle size={16} className="text-[#2BCB8A] shrink-0" />
            <p className="text-sm font-bold text-white">{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Accelerate Goal Modal ── */}
      <AnimatePresence>
        {accelerateVaultId && accelerateVault && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0F0B19]/80 backdrop-blur-sm"
              onClick={() => { setAccelerateVaultId(null); setCustomAmount(''); }}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-[#1D172F] border border-[#302945] rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-black text-white">Accelerate Goal</h3>
                <button
                  onClick={() => { setAccelerateVaultId(null); setCustomAmount(''); }}
                  className="text-[#8F8A9B]"
                >
                  <X size={24} />
                </button>
              </div>
              <p className="text-[10px] font-bold tracking-widest text-[#8F8A9B] mb-6 uppercase">
                {accelerateVault.title} · Баланс: {formatKGS(actualAvailable)}
              </p>

              {/* Presets */}
              <p className="text-[10px] font-bold tracking-widest text-[#8F8A9B] mb-3 uppercase">Быстрый выбор</p>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {ACCELERATE_PRESETS.map(amt => (
                  <button
                    key={amt}
                    onClick={() => setCustomAmount(String(amt))}
                    className={cn(
                      'py-3 rounded-xl border text-sm font-black transition-all',
                      customAmount === String(amt)
                        ? 'bg-[#B685FF]/10 border-[#B685FF] text-white'
                        : 'bg-[#110C1E] border-[#302945] text-[#8F8A9B]'
                    )}
                  >
                    +{amt.toLocaleString('en-US').replace(/,/g, ' ')}с
                  </button>
                ))}
              </div>

              {/* Custom input */}
              <p className="text-[10px] font-bold tracking-widest text-[#8F8A9B] mb-2 uppercase">Своя сумма</p>
              <div className="bg-[#110C1E] rounded-2xl p-4 mb-6 border border-[#302945] focus-within:border-[#B685FF] transition-colors">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Введи сумму"
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-transparent border-none text-3xl font-black text-white focus:outline-none"
                />
              </div>

              <button
                onClick={() => handleAccelerate(accelerateVaultId, Number(customAmount))}
                disabled={!customAmount || Number(customAmount) <= 0}
                className="w-full py-4 bg-[#B685FF] text-[#110C1E] rounded-xl font-black tracking-widest
                           shadow-[0_0_20px_rgba(182,133,255,0.3)] disabled:opacity-40 disabled:shadow-none
                           hover:bg-[#C99AFF] transition-all active:scale-95"
              >
                ПОДТВЕРДИТЬ
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Add Vault Modal ── */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0F0B19]/80 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-[#1D172F] border border-[#302945] rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-white">New Vault</h3>
                <button onClick={() => setShowAddModal(false)} className="text-[#8F8A9B]">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-[#8F8A9B] mb-2 uppercase">Title</p>
                  <input
                    type="text"
                    placeholder="e.g. New Car"
                    value={newVault.title}
                    onChange={e => setNewVault({ ...newVault, title: e.target.value })}
                    className="w-full bg-[#110C1E] border border-[#302945] rounded-xl p-4 text-white font-bold focus:outline-none focus:border-[#B685FF]"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-[#8F8A9B] mb-2 uppercase">Monthly Target</p>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={newVault.target}
                    onChange={e => setNewVault({ ...newVault, target: e.target.value })}
                    className="w-full bg-[#110C1E] border border-[#302945] rounded-xl p-4 text-white font-bold focus:outline-none focus:border-[#B685FF]"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-[#8F8A9B] mb-2 uppercase">Priority</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as Vault['priority'][]).map(p => (
                      <button
                        key={p}
                        onClick={() => setNewVault({ ...newVault, priority: p })}
                        className={cn(
                          'p-3 rounded-xl border text-[10px] font-bold transition-all',
                          newVault.priority === p
                            ? 'bg-[#B685FF]/10 border-[#B685FF] text-white'
                            : 'bg-[#110C1E] border-[#302945] text-[#8F8A9B]'
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddVault}
                className="w-full py-4 bg-[#B685FF] text-[#110C1E] rounded-xl font-black tracking-widest shadow-[0_0_20px_rgba(182,133,255,0.3)]"
              >
                CREATE VAULT
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
