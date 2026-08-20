import type { FinancialGoalInput, GoalWithMeta } from '@/types'
import { request } from './client'

export async function listGoals(): Promise<GoalWithMeta[]> {
  return request<GoalWithMeta[]>('/goals')
}

export async function getGoal(id: string): Promise<GoalWithMeta> {
  return request<GoalWithMeta>(`/goals/${encodeURIComponent(id)}`)
}

export async function createGoal(input: FinancialGoalInput): Promise<GoalWithMeta> {
  return request<GoalWithMeta>('/goals', { method: 'POST', body: input })
}

export async function updateGoal(id: string, input: Partial<FinancialGoalInput>): Promise<GoalWithMeta> {
  return request<GoalWithMeta>(`/goals/${encodeURIComponent(id)}`, { method: 'PATCH', body: input })
}

export async function deleteGoal(id: string): Promise<void> {
  return request<void>(`/goals/${encodeURIComponent(id)}`, { method: 'DELETE' })
}