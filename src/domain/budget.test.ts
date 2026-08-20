import { describe, expect, it } from 'vitest'
import { budgetRemaining, budgetStatus, budgetUtilization } from './budget'

describe('budgetUtilization', () => {
  it('menghitung utilasi 0..1', () => {
    expect(budgetUtilization(0, 100)).toBe(0)
    expect(budgetUtilization(50, 100)).toBe(0.5)
    expect(budgetUtilization(100, 100)).toBe(1)
  })

  it('melebihi budget menghasilkan > 1', () => {
    expect(budgetUtilization(120, 100)).toBe(1.2)
  })

  it('amount <= 0 mengembalikan 1 jika ada pengeluaran', () => {
    expect(budgetUtilization(10, 0)).toBe(1)
    expect(budgetUtilization(0, 0)).toBe(0)
  })
})

describe('budgetStatus', () => {
  it('di bawah 80% aman', () => {
    expect(budgetStatus(79, 100)).toBe('ok')
  })

  it('80% ke atas warning', () => {
    expect(budgetStatus(80, 100)).toBe('warn')
  })

  it('100% ke atas danger', () => {
    expect(budgetStatus(100, 100)).toBe('danger')
  })
})

describe('budgetRemaining', () => {
  it('menghitung sisa non-negatif', () => {
    expect(budgetRemaining(30, 100)).toBe(70)
    expect(budgetRemaining(150, 100)).toBe(0)
  })
})