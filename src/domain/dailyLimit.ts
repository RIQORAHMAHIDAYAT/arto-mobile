import { startOfDay } from '@/lib/date'

/**
 * Sisa budget yang tersedia untuk sebuah periode.
 * Menghindari nilai negatif: jika belanja melebihi budget, sisa dianggap 0.
 */
export function remainingBudget(budgetAmount: number, spent: number): number {
  return Math.max(0, budgetAmount - spent)
}

/**
 * Sisa hari dalam periode, termasuk hari ini.
 * Mengembalikan 0 jika periode sudah berakhir.
 */
export function remainingDays(today: Date, periodEnd: Date): number {
  const todayStart = startOfDay(today)
  const endStart = startOfDay(periodEnd)
  const diff = Math.round((endStart.getTime() - todayStart.getTime()) / 86_400_000)
  return Math.max(0, diff + 1)
}

/**
 * Kalkulasi dynamic daily spending limit.
 *
 * daily_limit = sisa_budget / sisa_hari
 *
 * Sesuai PRD: batas dihitung ulang setelah setiap transaksi tercatat.
 */
export function calculateDailyLimit(params: {
  budgetAmount: number
  spent: number
  today: Date
  periodEnd: Date
}): { remainingBudget: number; remainingDays: number; dailyLimit: number } {
  const budget = remainingBudget(params.budgetAmount, params.spent)
  const days = remainingDays(params.today, params.periodEnd)
  const limit = days <= 0 || budget <= 0 ? 0 : Math.floor(budget / days)
  return { remainingBudget: budget, remainingDays: days, dailyLimit: limit }
}

/** Status aman: pengeluaran hari ini tidak boleh melebihi batas harian. */
export function isWithinDailyLimit(spentToday: number, dailyLimit: number): boolean {
  return spentToday <= dailyLimit
}

export function remainingToday(spentToday: number, dailyLimit: number): number {
  return Math.max(0, dailyLimit - spentToday)
}