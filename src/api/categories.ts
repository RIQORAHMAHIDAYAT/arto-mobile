import type { Category, CategoryInput, TransactionType } from '@/types'
import { queryString, request } from './client'

export async function listCategories(type?: TransactionType): Promise<Category[]> {
  return request<Category[]>(`/categories${queryString({ type })}`)
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  return request<Category>('/categories', { method: 'POST', body: input })
}

export async function updateCategory(id: string, input: Partial<CategoryInput>): Promise<Category> {
  return request<Category>(`/categories/${encodeURIComponent(id)}`, { method: 'PATCH', body: input })
}

export async function deleteCategory(id: string): Promise<void> {
  return request<void>(`/categories/${encodeURIComponent(id)}`, { method: 'DELETE' })
}