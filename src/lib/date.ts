/**
 * Utilitas tanggal murni (pure) — tidak bergantung pada Intl agar
 * hasilnya identik di semua platform. Default timezone lokal perangkat.
 */

const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
] as const

const MONTHS_SHORT_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
] as const

const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const

/** Tanggal lokal → string YYYY-MM-DD. */
export function toISODate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** string YYYY-MM-DD (atau dengan T) → Date lokal. */
export function parseISODate(value: string): Date {
  const datePart = value.split('T')[0]
  const [year, month, day] = datePart.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / 86_400_000)
}

export function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime()
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/** "20 Agu 2026" */
export function formatDateShort(value: string | Date): string {
  const date = typeof value === 'string' ? parseISODate(value) : value
  return `${date.getDate()} ${MONTHS_SHORT_ID[date.getMonth()] ?? ''} ${date.getFullYear()}`
}

/** "Kamis, 20 Agustus 2026" */
export function formatDateLong(value: string | Date): string {
  const date = typeof value === 'string' ? parseISODate(value) : value
  const dayName = DAYS_ID[date.getDay()] ?? ''
  const monthName = MONTHS_ID[date.getMonth()] ?? ''
  return `${dayName}, ${date.getDate()} ${monthName} ${date.getFullYear()}`
}

/** "20 Agu" */
export function formatDateDayMonth(value: string | Date): string {
  const date = typeof value === 'string' ? parseISODate(value) : value
  return `${date.getDate()} ${MONTHS_SHORT_ID[date.getMonth()] ?? ''}`
}

/** "Agustus 2026" */
export function formatMonthYear(value: Date): string {
  return `${MONTHS_ID[value.getMonth()] ?? ''} ${value.getFullYear()}`
}

export function isValidDateOnly(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}