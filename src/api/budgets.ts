import type { Budget, BudgetInput, BudgetSummaryItem, DailyLimitInfo } from '@/types'
import { queryString, request } from './client'

export async function listBudgets(): Promise<Budget[]> {
  return request<Budget[]>('/budgets')
}

export async function getBudget(id: string): Promise<Budget> {
  return request<Budget>(`/budgets/${encodeURIComponent(id)}`)
}

export async function createBudget(input: BudgetInput): Promise<Budget> {
  return request<Budget>('/budgets', { method: 'POST', body: input })
}

export async function updateBudget(id: string, input: Partial<BudgetInput>): Promise<Budget> {
  return request<Budget>(`/budgets/${encodeURIComponent(id)}`, { method: 'PATCH', body: input })
}

export async function deleteBudget(id: string): Promise<void> {
  return request<void>(`/budgets/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function getDailyLimit(budgetId: string, date = new Date()): Promise<DailyLimitInfo> {
  return request<DailyLimitInfo>(`/budgets/${encodeURIComponent(budgetId)}/daily-limit${queryString({ date: toISODateLocal(date) })}`)
}

export async function listBudgetSummary(): Promise<BudgetSummaryItem[]> {
  return request<BudgetSummaryItem[]>('/budgets/summary')
}

function toISODateLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}