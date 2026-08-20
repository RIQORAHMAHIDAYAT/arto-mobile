import type { Account, AccountInput } from '@/types'
import { request } from './client'

export type AccountWithBalance = Account & { balance: number }

export async function listAccounts(): Promise<AccountWithBalance[]> {
  return request<AccountWithBalance[]>('/accounts')
}

export async function getAccount(id: string): Promise<AccountWithBalance> {
  return request<AccountWithBalance>(`/accounts/${encodeURIComponent(id)}`)
}

export async function createAccount(input: AccountInput): Promise<AccountWithBalance> {
  return request<AccountWithBalance>('/accounts', { method: 'POST', body: input })
}

export async function updateAccount(id: string, input: Partial<AccountInput>): Promise<AccountWithBalance> {
  return request<AccountWithBalance>(`/accounts/${encodeURIComponent(id)}`, { method: 'PATCH', body: input })
}

export async function deleteAccount(id: string): Promise<void> {
  return request<void>(`/accounts/${encodeURIComponent(id)}`, { method: 'DELETE' })
}