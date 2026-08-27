/**
 * Formats a numeric amount to Indian Rupee representation.
 * e.g. 5000 -> ₹5,000, 24892.9 -> ₹24,892.90
 */
export function formatINR(amount: number, options?: { showDecimals?: boolean; sign?: boolean }): string {
  const showDecimals = options?.showDecimals ?? false;
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(absAmount);

  const prefix = options?.sign ? (isNegative ? '-₹' : '+₹') : (isNegative ? '-₹' : '₹');
  return `${prefix}${formatted}`;
}

export function formatCompactINR(amount: number): string {
  if (Math.abs(amount) >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (Math.abs(amount) >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (Math.abs(amount) >= 1000) {
    return `₹${Math.round(amount / 1000)}K`;
  }
  return `₹${amount}`;
}
