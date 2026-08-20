import type { FinancialHealthReport } from '@/types'
import { request } from './client'

export async function getFinancialHealth(): Promise<FinancialHealthReport> {
  return request<FinancialHealthReport>('/financial-health')
}