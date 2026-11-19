export interface BudgetInput {
  monthlyIncome: number;
  actualAvailable: number;
  internalDebt: number;
  vaults: { title: string; current: number; target: number; priority: string }[];
  plannedSpends: { title: string; amount: number; date: string; type: string; enabled: boolean }[];
}

export function budgetSummary(input: BudgetInput) {
  const monthlyExpenses = input.vaults.reduce((sum, vault) => sum + vault.target, 0);
  const reserved = input.plannedSpends.filter(s => s.enabled && s.type === 'Fixed')
    .reduce((sum, spend) => sum + spend.amount, 0);
  const spendable = Math.max(0, input.actualAvailable - reserved);
  const dailyExpenses = monthlyExpenses / 30;
  return {
    monthlyExpenses, reserved, spendable, dailyExpenses,
    dailyBudget: Math.floor(spendable / 30),
    runwayDays: dailyExpenses > 0 ? Math.floor(spendable / dailyExpenses) : null,
    monthlySurplus: input.monthlyIncome - monthlyExpenses,
  };
}

export function loanScenario(amount: number, months: number, annualRate: number, budget: BudgetInput) {
  const summary = budgetSummary(budget);
  const rate = annualRate / 1200;
  const payment = rate === 0 ? amount / months : amount * rate / (1 - Math.pow(1 + rate, -months));
  const total = payment * months;
  return {
    payment, total, overpayment: total - amount,
    remainingPerMonth: summary.monthlySurplus - payment,
    lowReserve: summary.runwayDays === null || summary.runwayDays < 14,
    budgetDeficit: summary.monthlySurplus < payment,
    hasInternalDebt: budget.internalDebt > 0,
  };
}
