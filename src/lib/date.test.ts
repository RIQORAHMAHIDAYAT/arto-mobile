import { describe, expect, it } from 'vitest'
import {
  addDays,
  daysBetween,
  endOfDay,
  endOfMonth,
  formatDateDayMonth,
  formatDateLong,
  formatDateShort,
  formatMonthYear,
  isSameDay,
  isValidDateOnly,
  monthKey,
  parseISODate,
  startOfDay,
  startOfMonth,
  toISODate,
} from './date'

describe('date utils', () => {
  it('parseISODate berfungsi pada zona waktu lokal', () => {
    const d = parseISODate('2026-08-20')
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(7)
    expect(d.getDate()).toBe(20)
  })

  it('toISODate membalik Date menjadi YYYY-MM-DD', () => {
    expect(toISODate(new Date(2026, 7, 20))).toBe('2026-08-20')
    expect(toISODate(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('addDays & daysBetween konsisten', () => {
    const start = parseISODate('2026-08-01')
    expect(toISODate(addDays(start, 17))).toBe('2026-08-18')
    expect(daysBetween(start, parseISODate('2026-08-18'))).toBe(17)
  })

  it('startOfDay/endOfDay & isSameDay', () => {
    const a = new Date(2026, 8, 14, 10, 30)
    const b = new Date(2026, 8, 14, 23, 59)
    expect(isSameDay(a, b)).toBe(true)
    expect(startOfDay(a).getHours()).toBe(0)
    expect(endOfDay(a).getHours()).toBe(23)
  })

  it('startOfMonth/endOfMonth', () => {
    expect(toISODate(startOfMonth(new Date(2026, 8, 14)))).toBe('2026-09-01')
    expect(toISODate(endOfMonth(new Date(2026, 8, 14)))).toBe('2026-09-30')
  })

  it('monthKey', () => {
    expect(monthKey(new Date(2026, 8, 14))).toBe('2026-09')
  })

  it('formatDateShort', () => {
    expect(formatDateShort('2026-08-20')).toBe('20 Agu 2026')
    expect(formatDateShort('2026-09-14')).toBe('14 Sep 2026')
  })

  it('formatDateLong menggunakan hari Indonesia', () => {
    expect(formatDateLong('2026-09-14')).toBe('Senin, 14 September 2026')
  })

  it('formatDateDayMonth', () => {
    expect(formatDateDayMonth('2026-01-02')).toBe('2 Jan')
  })

  it('formatMonthYear', () => {
    expect(formatMonthYear(new Date(2026, 0, 1))).toBe('Januari 2026')
  })

  it('isValidDateOnly', () => {
    expect(isValidDateOnly('2026-08-20')).toBe(true)
    expect(isValidDateOnly('08/20/2026')).toBe(false)
  })
})