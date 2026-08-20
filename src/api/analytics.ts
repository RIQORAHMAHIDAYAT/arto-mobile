import type { AnalyticsSummary, CategoryStat, TrendPoint } from '@/types'
import { queryString, request } from './client'

export interface AnalyticsRange {
  from?: string
  to?: string
}

export async function getAnalyticsSummary(range: AnalyticsRange = {}): Promise<AnalyticsSummary> {
  return request<AnalyticsSummary>(`/analytics/summary${queryString(range)}`)
}

export async function getExpenseByCategory(range: AnalyticsRange = {}): Promise<CategoryStat[]> {
  return request<CategoryStat[]>(`/analytics/categories${queryString(range)}`)
}

export async function getTrends(range: AnalyticsRange = {}, bucket: 'day' | 'week' = 'day'): Promise<TrendPoint[]> {
  return request<TrendPoint[]>(`/analytics/trends${queryString({ ...range, bucket })}`)
}