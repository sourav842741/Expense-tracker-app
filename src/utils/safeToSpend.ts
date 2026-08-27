export interface SafeToSpendBreakdown {
  monthlyIncome: number;
  requiredPayments: number;
  plannedExpenses: number;
  savingsTarget: number;
  safeToSpend: number;
  percentageRemaining: number;
}

export function calculateSafeToSpend(
  income: number,
  upcomingPayments: number,
  plannedExpenses: number,
  savingsTarget: number
): SafeToSpendBreakdown {
  const safe = income - upcomingPayments - plannedExpenses - savingsTarget;
  const safeToSpend = Math.max(0, safe);
  const percentageRemaining = income > 0 ? Math.round((safeToSpend / income) * 100) : 0;

  return {
    monthlyIncome: income,
    requiredPayments: upcomingPayments,
    plannedExpenses,
    savingsTarget,
    safeToSpend,
    percentageRemaining,
  };
}
