import { describe, expect, it } from 'vitest'
import {
  calculateDailyLimit,
  isWithinDailyLimit,
  remainingBudget,
  remainingDays,
  remainingToday,
} from './dailyLimit'

/** Tanggal lokal (bukan UTC) agar lintas zona waktu deterministik. */
function localDate(year: number, monthIndex: number, day: number): Date {
  return new Date(year, monthIndex, day)
}

describe('remainingBudget', () => {
  it('mengembalikan sisa budget', () => {
    expect(remainingBudget(1_000_000, 200_000)).toBe(800_000)
  })

  it('tidak pernah negatif', () => {
    expect(remainingBudget(100_000, 200_000)).toBe(0)
  })
})

describe('remainingDays', () => {
  it('menghitung sisa hari (inklusif hari ini)', () => {
    expect(remainingDays(localDate(2026, 0, 10), localDate(2026, 0, 10))).toBe(1)
  })

  it('menghitung sisa beberapa hari', () => {
    expect(remainingDays(localDate(2026, 0, 10), localDate(2026, 0, 20))).toBe(11)
  })

  it('mengembalikan 0 jika periode sudah lewat', () => {
    expect(remainingDays(localDate(2026, 0, 20), localDate(2026, 0, 10))).toBe(0)
  })
})

describe('calculateDailyLimit', () => {
  it('daily limit = sisa budget / sisa hari (floor)', () => {
    const result = calculateDailyLimit({
      budgetAmount: 1_000_000,
      spent: 200_000,
      today: localDate(2026, 0, 10),
      periodEnd: localDate(2026, 0, 20),
    })
    expect(result.remainingBudget).toBe(800_000)
    expect(result.remainingDays).toBe(11)
    expect(result.dailyLimit).toBe(72_727)
  })

  it('batas 0 jika budget habis', () => {
    const result = calculateDailyLimit({
      budgetAmount: 100_000,
      spent: 120_000,
      today: localDate(2026, 0, 10),
      periodEnd: localDate(2026, 0, 20),
    })
    expect(result.dailyLimit).toBe(0)
  })

  it('batas 0 jika periode sudah berakhir', () => {
    const result = calculateDailyLimit({
      budgetAmount: 100_000,
      spent: 0,
      today: localDate(2026, 0, 21),
      periodEnd: localDate(2026, 0, 20),
    })
    expect(result.dailyLimit).toBe(0)
  })
})

describe('isWithinDailyLimit & remainingToday', () => {
  it('aman jika spent <= limit', () => {
    expect(isWithinDailyLimit(20_000, 30_000)).toBe(true)
    expect(remainingToday(20_000, 30_000)).toBe(10_000)
  })

  it('melebihi jika spent > limit', () => {
    expect(isWithinDailyLimit(40_000, 30_000)).toBe(false)
    expect(remainingToday(40_000, 30_000)).toBe(0)
  })
})