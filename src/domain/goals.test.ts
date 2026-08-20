import { describe, expect, it } from 'vitest'
import {
  amountToCurrentGoal,
  goalProgress,
  goalRemaining,
  goalRemainingDays,
  goalStatus,
  requiredDailySaving,
} from './goals'

describe('goalProgress', () => {
  it('menghitung progress 0..1', () => {
    expect(goalProgress(5_000_000, 10_000_000)).toBe(0.5)
    expect(goalProgress(10_000_000, 10_000_000)).toBe(1)
  })

  it('target <= 0 mengembalikan 0', () => {
    expect(goalProgress(100, 0)).toBe(0)
  })
})

describe('goalRemaining', () => {
  it('menghitung sisa non-negatif', () => {
    expect(goalRemaining(3_000_000, 10_000_000)).toBe(7_000_000)
    expect(goalRemaining(12_000_000, 10_000_000)).toBe(0)
  })
})

describe('goalRemainingDays', () => {
  it('inklusif hari ini', () => {
    expect(goalRemainingDays('2026-01-10', new Date(2026, 0, 10))).toBe(1)
    expect(goalRemainingDays('2026-01-20', new Date(2026, 0, 10))).toBe(11)
  })

  it('0 jika deadline sudah lewat', () => {
    expect(goalRemainingDays('2026-01-05', new Date(2026, 0, 10))).toBe(0)
  })
})

describe('requiredDailySaving', () => {
  it('memperkirakan tabungan harian', () => {
    // 3.000.000 tersisa untuk 22 hari (10–31 Jan inklusif) → ceil(136.363,6) = 136.364
    expect(requiredDailySaving(7_000_000, 10_000_000, '2026-01-31', new Date(2026, 0, 10))).toBe(136_364)
  })

  it('null tanpa deadline atau sudah tercapai', () => {
    expect(requiredDailySaving(12_000_000, 10_000_000, '2026-01-31', new Date(2026, 0, 10))).toBeNull()
    expect(requiredDailySaving(5_000_000, 10_000_000, null, new Date(2026, 0, 10))).toBeNull()
  })
})

describe('amountToCurrentGoal & goalStatus', () => {
  it('mengunci current di target', () => {
    expect(amountToCurrentGoal(20_000_000, 10_000_000)).toBe(10_000_000)
    expect(amountToCurrentGoal(-5, 10_000_000)).toBe(0)
  })

  it('status goal', () => {
    expect(goalStatus(10_000_000, 10_000_000)).toBe('done')
    expect(goalStatus(8_000_000, 10_000_000)).toBe('warn')
    expect(goalStatus(5_000_000, 10_000_000)).toBe('ok')
  })
})