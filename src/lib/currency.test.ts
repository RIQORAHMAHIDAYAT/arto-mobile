import { describe, expect, it } from 'vitest'
import {
  formatNumber,
  formatRupiah,
  formatRupiahSigned,
  formatRupiahCompact,
  parseAmountText,
  sanitizeAmountInput,
} from './currency'

describe('formatNumber', () => {
  it('mengelompokkan ribuan dengan titik', () => {
    expect(formatNumber(1500000)).toBe('1.500.000')
    expect(formatNumber(999)).toBe('999')
    expect(formatNumber(10000)).toBe('10.000')
  })
})

describe('formatRupiah', () => {
  it('memformat nominal positif dan negatif', () => {
    expect(formatRupiah(1500000)).toBe('Rp1.500.000')
    expect(formatRupiah(0)).toBe('Rp0')
    expect(formatRupiah(-50000)).toBe('Rp-50.000')
  })

  it('mendukung desimal saat diminta', () => {
    expect(formatRupiah(1000.5)).toBe('Rp1.001')
    expect(formatRupiah(1000.5, { decimals: true })).toBe('Rp1.000,50')
  })
})

describe('formatRupiahSigned', () => {
  it('menambah tanda plus/minus', () => {
    expect(formatRupiahSigned(50000)).toBe('+Rp50.000')
    expect(formatRupiahSigned(-20000)).toBe('-Rp20.000')
    expect(formatRupiahSigned(0)).toBe('Rp0')
  })
})

describe('formatRupiahCompact', () => {
  it('meringkas nominal besar', () => {
    expect(formatRupiahCompact(1500000)).toBe('Rp1,5 jt')
    expect(formatRupiahCompact(2_500_000_000)).toBe('Rp2,5 M')
    expect(formatRupiahCompact(5000)).toBe('Rp5 rb')
    expect(formatRupiahCompact(500)).toBe('Rp500')
  })
})

describe('parseAmountText', () => {
  it('mengurai nominal tanpa pemisah', () => {
    expect(parseAmountText('50000')).toBe(50000)
    expect(parseAmountText('50.000')).toBe(50000)
    expect(parseAmountText('12,5')).toBe(13)
  })

  it('mengembalikan null untuk input tidak valid', () => {
    expect(parseAmountText('abc')).toBeNull()
    expect(parseAmountText('')).toBeNull()
  })
})

describe('sanitizeAmountInput', () => {
  it('membuang karakter non-numerik dan koma', () => {
    expect(sanitizeAmountInput('abc')).toBe('')
    expect(sanitizeAmountInput('Rp 50.000')).toBe('50.000')
  })
})