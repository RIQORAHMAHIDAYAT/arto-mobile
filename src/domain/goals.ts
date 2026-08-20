import { startOfDay } from '@/lib/date'

/**
 * Progress sebuah goal sebagai nilai 0..1.
 * Target wajib lebih dari 0; nominal terkumpul dikunci di target.
 */
export function goalProgress(current: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(1, current / target)
}

/** Sisa nominal yang dibutuhkan untuk mencapai target. */
export function goalRemaining(current: number, target: number): number {
  return Math.max(0, target - current)
}

/** Hari tersisa sebelum deadline (inklusif hari ini). 0 jika deadline sudah lewat. */
export function goalRemainingDays(deadline: string, today = new Date()): number {
  const todayStart = startOfDay(today)
  const end = startOfDay(parseISODateSafe(deadline))
  if (todayStart.getTime() > end.getTime()) return 0
  const diff = Math.round((end.getTime() - todayStart.getTime()) / 86_400_000)
  return Math.max(0, diff + 1)
}

/**
 * Estimasi nominal yang harus dikumpulkan per hari agar deadline tercapai.
 * null jika deadline tidak diset atau goal sudah tercapai.
 */
export function requiredDailySaving(
  current: number,
  target: number,
  deadline: string | null,
  today = new Date(),
): number | null {
  if (!deadline || current >= target) return null
  const days = goalRemainingDays(deadline, today)
  if (days <= 0) return null
  return Math.ceil((target - current) / days)
}

export function amountToCurrentGoal(current: number, target: number): number {
  return Math.max(0, Math.min(target, current))
}

export function goalStatus(current: number, target: number): 'ok' | 'warn' | 'done' {
  const progress = goalProgress(current, target)
  if (progress >= 1) return 'done'
  if (progress >= 0.7) return 'warn'
  return 'ok'
}

function parseISODateSafe(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return Number.isNaN(date.getTime()) ? new Date(0) : date
}