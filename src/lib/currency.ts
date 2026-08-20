/**
 * Format/parse Rupiah. Murni (pure) agar mudah diuji di Vitest.
 * Menggunakan pengelompokan ribuan manual agar hasil konsisten
 * di seluruh platform (Hermes Android, browser, Node).
 */

export function formatNumber(amount: number): string {
  const rounded = Math.round(Math.abs(amount))
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/** Format Rupiah penuh, mis. "Rp1.500.000". */
export function formatRupiah(amount: number, options: { decimals?: boolean } = {}): string {
  const { decimals = false } = options
  const value = decimals ? amount.toFixed(2) : String(Math.round(amount))
  const [intPart, decPart] = value.split('.')
  const grouped = intPart.replace(/^-/, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const sign = amount < 0 ? '-' : ''
  const suffix = decimals && decPart !== undefined ? `,${decPart}` : ''
  return `Rp${sign}${grouped}${suffix}`
}

/** Format rupiah dengan tanda +/-, mis. "+Rp50.000" atau "-Rp20.000". */
export function formatRupiahSigned(amount: number): string {
  const formatted = formatRupiah(Math.abs(amount))
  if (amount < 0) return `-${formatted}`
  if (amount > 0) return `+${formatted}`
  return formatted
}

/** Format ringkas untuk nominal besar, mis. "Rp1,5 jt". */
export function formatRupiahCompact(amount: number): string {
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  if (abs >= 1_000_000_000) return `${sign}Rp${trimFraction(abs / 1_000_000_000)} M`
  if (abs >= 1_000_000) return `${sign}Rp${trimFraction(abs / 1_000_000)} jt`
  if (abs >= 1_000) return `${sign}Rp${trimFraction(abs / 1_000)} rb`
  return formatRupiah(amount)
}

function trimFraction(value: number): string {
  return (Math.round(value * 10) / 10).toString().replace('.', ',')
}

/** Parse teks angka menjadi integer positif. null jika tidak valid. */
export function parseAmountText(value: string): number | null {
  const cleaned = value.replace(/[^\d,.]/g, '').replace(/\./g, '').replace(',', '.')
  if (!cleaned) return null
  const num = Number(cleaned)
  if (!Number.isFinite(num) || num < 0) return null
  return Math.round(num)
}

export function sanitizeAmountInput(value: string): string {
  return value.replace(/[^\d.,]/g, '').replace(/,/g, '')
}