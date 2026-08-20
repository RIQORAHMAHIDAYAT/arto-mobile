import type { DashboardSummary } from '@/types'
import { request } from './client'

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return request<DashboardSummary>('/dashboard/summary')
}