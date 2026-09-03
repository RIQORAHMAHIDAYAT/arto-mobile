import type { Paginated, Transaction, TransactionFilters, TransactionInput } from '@/types'
import { queryString, request } from './client'

export async function listTransactions(
  filters: TransactionFilters = {},
  page = 1,
  limit = 20,
): Promise<Paginated<Transaction>> {
  const params = {
    page,
    limit,
    type: filters.type,
    categoryId: filters.categoryId,
    accountId: filters.accountId,
    from: filters.from,
    to: filters.to,
    query: filters.query,
  }
  return request<Paginated<Transaction>>(`/transactions${queryString(params)}`)
}

export async function getTransaction(id: string): Promise<Transaction> {
  return request<Transaction>(`/transactions/${encodeURIComponent(id)}`)
}

export async function createTransaction(input: TransactionInput): Promise<Transaction> {
  return request<Transaction>('/transactions', { method: 'POST', body: input })
}

export async function updateTransaction(id: string, input: Partial<TransactionInput>): Promise<Transaction> {
  return request<Transaction>(`/transactions/${encodeURIComponent(id)}`, { method: 'PATCH', body: input })
}

export async function deleteTransaction(id: string): Promise<void> {
  return request<void>(`/transactions/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function createRecurringTransaction(input: TransactionInput & { frequency: string; endDate?: string }): Promise<void> {
  const { transactionDate, ...rest } = input;
  return request<void>('/recurring-transactions', {
    method: 'POST',
    body: {
      ...rest,
      startDate: transactionDate
    },
  })
}

export async function listRecurringTransactions(): Promise<any[]> {
  return request<any[]>('/recurring-transactions')
}

export async function deleteRecurringTransaction(id: string): Promise<void> {
  return request<void>(`/recurring-transactions/${encodeURIComponent(id)}`, { method: 'DELETE' })
}