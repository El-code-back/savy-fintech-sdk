import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';

export interface Vault {
  id: string;
  title: string;
  sub: string;
  current: number;
  target: number;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  icon: string;
  hasWarning?: boolean;
}

interface AppState {
  monthlyIncome: number;
  monthlyExpenses: number;
  actualAvailable: number;
  vaults: Vault[];
  isSetupComplete: boolean;
  isWaterfallActive: boolean;
  emergencyUnlockCount: number;
  internalDebt: number;
}

interface AppContextType extends AppState {
  runwayDays: number;
  creditLimit: number;
  burnRate: number;
  completeSetup: (income: number, expenses: number, selectedVaults: string[]) => void;
  addIncome: (amount: number) => void;
  emergencyUnlock: (vaultId: string, amount: number) => void;
  addVault: (vault: Omit<Vault, 'id' | 'current'>) => void;
  setIsWaterfallActive: (active: boolean) => void;
  releaseFunds: (vaultId: string) => number;
  accelerateGoal: (vaultId: string, amount: number) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const VAULT_PRESETS: Record<string, { sub: string; priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'; icon: string; percent: number }> = {
  'Rent': { sub: 'MONTHLY FIXED', priority: 'CRITICAL', icon: 'Home', percent: 0.3 },
  'Groceries': { sub: 'DAILY ESSENTIALS', priority: 'CRITICAL', icon: 'ShoppingBag', percent: 0.25 },
  'Credit': { sub: 'DEBT REPAYMENT', priority: 'HIGH', icon: 'CreditCard', percent: 0.15 },
  'Savings': { sub: 'SAFETY NET', priority: 'MEDIUM', icon: 'Shield', percent: 0.2 },
  'Toy/Holidays': { sub: 'SOCIAL EVENTS', priority: 'LOW', icon: 'Gift', percent: 0.1 },
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    monthlyIncome: 40000,
    monthlyExpenses: 35000,
    actualAvailable: 5000,
    vaults: [],
    isSetupComplete: false,
    isWaterfallActive: false,
    emergencyUnlockCount: 0,
    internalDebt: 0,
  });

  const burnRate = useMemo(() => state.monthlyExpenses / 30, [state.monthlyExpenses]);
  
  const runwayDays = useMemo(() => {
    if (burnRate === 0) return 365;
    return Math.floor(state.actualAvailable / burnRate);
  }, [state.actualAvailable, burnRate]);

  const creditLimit = useMemo(() => {
    let base = state.monthlyIncome * 2;
    if (runwayDays > 30) base *= 1.5;
    if (runwayDays < 7) base *= 0.5;
    // Credit limit decreases based on emergency unlocks and internal debt
    base -= state.emergencyUnlockCount * 5000;
    base -= state.internalDebt * 0.5; 
    return Math.max(0, base);
  }, [state.monthlyIncome, runwayDays, state.emergencyUnlockCount, state.internalDebt]);

  const completeSetup = (income: number, expenses: number, selectedVaults: string[]) => {
    // Calculate total percent of selected vaults to normalize
    const totalSelectedPercent = selectedVaults.reduce((sum, key) => sum + VAULT_PRESETS[key].percent, 0);
    
    const initialVaults: Vault[] = selectedVaults.map(key => {
      const preset = VAULT_PRESETS[key];
      // Normalize target so total targets = expenses
      const normalizedTarget = expenses * (preset.percent / totalSelectedPercent);
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        title: key,
        sub: preset.sub,
        current: normalizedTarget, // Start filled at 100%
        target: normalizedTarget,
        priority: preset.priority,
        icon: preset.icon,
      };
    });

    setState(prev => ({
      ...prev,
      monthlyIncome: income,
      monthlyExpenses: expenses,
      vaults: initialVaults,
      isSetupComplete: true,
      isWaterfallActive: true, // Trigger waterfall animation
      actualAvailable: income - expenses, // Main balance (Free money)
    }));

    // Auto-turn off waterfall after animation
    setTimeout(() => {
      setState(prev => ({ ...prev, isWaterfallActive: false }));
    }, 1500);
  };

  const addIncome = (amount: number) => {
    setState(prev => {
      let remaining = amount;
      const newVaults = prev.vaults.map(v => {
        const needed = v.target - v.current;
        if (needed > 0 && remaining > 0) {
          const toAdd = Math.min(needed, remaining);
          remaining -= toAdd;
          return { ...v, current: v.current + toAdd };
        }
        return v;
      });

      return {
        ...prev,
        vaults: newVaults,
        actualAvailable: prev.actualAvailable + remaining,
        isWaterfallActive: true,
      };
    });

    // Auto-turn off waterfall after animation
    setTimeout(() => {
      setState(prev => ({ ...prev, isWaterfallActive: false }));
    }, 1500);
  };

  const emergencyUnlock = (vaultId: string, amount: number) => {
    setState(prev => {
      const vault = prev.vaults.find(v => v.id === vaultId);
      if (!vault || vault.current < amount) return prev;

      const isCritical = vault.priority === 'CRITICAL' || vault.priority === 'HIGH';

      return {
        ...prev,
        emergencyUnlockCount: prev.emergencyUnlockCount + 1,
        internalDebt: prev.internalDebt + (isCritical ? amount : 0),
        actualAvailable: prev.actualAvailable + amount,
        vaults: prev.vaults.map(v => 
          v.id === vaultId 
            ? { ...v, current: v.current - amount, hasWarning: isCritical } 
            : v
        ),
      };
    });
  };

  const addVault = (vault: Omit<Vault, 'id' | 'current'>) => {
    setState(prev => ({
      ...prev,
      vaults: [...prev.vaults, { ...vault, id: Math.random().toString(36).substr(2, 9), current: 0 }],
    }));
  };

  const setIsWaterfallActive = (active: boolean) => {
    setState(prev => ({ ...prev, isWaterfallActive: active }));
  };

  // Release all funds from a vault to Main Balance, then zero out the vault.
  // Returns the released amount (0 if vault not found).
  const releaseFunds = (vaultId: string): number => {
    let released = 0;
    setState(prev => {
      const vault = prev.vaults.find(v => v.id === vaultId);
      if (!vault || vault.current <= 0) return prev;
      released = vault.current;
      return {
        ...prev,
        actualAvailable: prev.actualAvailable + released,
        vaults: prev.vaults.map(v =>
          v.id === vaultId ? { ...v, current: 0, hasWarning: false } : v
        ),
      };
    });
    return released;
  };

  // Move `amount` from Main Balance into a vault.
  // Returns true on success, false if insufficient balance.
  const accelerateGoal = (vaultId: string, amount: number): boolean => {
    let success = false;
    setState(prev => {
      const vault = prev.vaults.find(v => v.id === vaultId);
      if (!vault || prev.actualAvailable < amount || amount <= 0) return prev;
      // Don't overshoot the target
      const toAdd = Math.min(amount, vault.target - vault.current);
      if (toAdd <= 0) return prev;
      success = true;
      return {
        ...prev,
        actualAvailable: prev.actualAvailable - toAdd,
        vaults: prev.vaults.map(v =>
          v.id === vaultId ? { ...v, current: v.current + toAdd } : v
        ),
      };
    });
    return success;
  };

  return (
    <AppContext.Provider value={{ 
      ...state, 
      runwayDays, 
      creditLimit, 
      burnRate,
      completeSetup, 
      addIncome, 
      emergencyUnlock, 
      addVault, 
      setIsWaterfallActive,
      releaseFunds,
      accelerateGoal,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
