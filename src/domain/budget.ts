/**
 * Utilisasi budget sebagai nilai 0..1 (atau di atas 1 jika over budget).
 */
export function budgetUtilization(spent: number, amount: number): number {
  if (amount <= 0) return spent > 0 ? 1 : 0
  return spent / amount
}

export function budgetStatus(spent: number, amount: number): 'ok' | 'warn' | 'danger' {
  const utilization = budgetUtilization(spent, amount)
  if (utilization >= 1) return 'danger'
  if (utilization >= 0.8) return 'warn'
  return 'ok'
}

export function budgetRemaining(spent: number, amount: number): number {
  return Math.max(0, amount - spent)
}