import * as SecureStore from 'expo-secure-store'

/**
 * HTTP client ARTO — mirror dari arto-web/src/data/api/client.ts.
 * Perbedaan kunci untuk mobile:
 * - Token disimpan di expo-secure-store (bukan localStorage).
 * - Semua akses token bersifat async.
 * - Base URL dari env EXPO_PUBLIC_API_URL.
 */

const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000/api').replace(/\/+$/, '')

const ACCESS_KEY = 'arto.accessToken'
const REFRESH_KEY = 'arto.refreshToken'

export function getApiUrl(): string {
  return API_URL
}

export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ACCESS_KEY)
  } catch {
    return null
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_KEY)
  } catch {
    return null
  }
}

export async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_KEY, accessToken)
  await SecureStore.setItemAsync(REFRESH_KEY, refreshToken)
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_KEY).catch(() => undefined),
    SecureStore.deleteItemAsync(REFRESH_KEY).catch(() => undefined),
  ])
}

export class ApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status = 400, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  /** Default true. Set false untuk endpoint publik (auth/refresh/login/register). */
  auth?: boolean
}

interface ErrorBody {
  message?: string | string[]
  code?: string
}

function safeJson(text: string): unknown {
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}

let refreshPromise: Promise<boolean> | null = null

async function refreshSession(): Promise<boolean> {
  if (refreshPromise) return refreshPromise
  refreshPromise = (async () => {
    const refreshToken = await getRefreshToken()
    if (!refreshToken) return false
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      if (!response.ok) {
        await clearTokens()
        return false
      }
      const data = safeJson(await response.text()) as { accessToken?: string; refreshToken?: string } | null
      if (!data?.accessToken || !data?.refreshToken) {
        await clearTokens()
        return false
      }
      await setTokens(data.accessToken, data.refreshToken)
      return true
    } catch {
      return false
    } finally {
      setTimeout(() => {
        refreshPromise = null
      }, 0)
    }
  })()
  return refreshPromise
}

async function rawRequest<T>(path: string, options: RequestOptions): Promise<T> {
  const headers: Record<string, string> = {}
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (options.auth !== false) {
    const token = await getAccessToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  const text = await response.text()
  const body = safeJson(text)

  if (!response.ok) {
    const errBody = body as ErrorBody | null
    const message = Array.isArray(errBody?.message)
      ? errBody!.message[0]
      : ((errBody?.message as string | undefined) ?? 'Terjadi kesalahan. Coba lagi.')
    throw new ApiError(message, response.status, errBody?.code)
  }
  return body as T
}

/** Request dengan refresh-on-401 otomatis (satu kali percobaan). */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  try {
    return await rawRequest<T>(path, options)
  } catch (err) {
    const hasRefreshToken = (await getRefreshToken()) !== null
    const needsRefresh =
      options.auth !== false && err instanceof ApiError && err.status === 401 && hasRefreshToken
    if (!needsRefresh) throw err

    const refreshed = await refreshSession()
    if (!refreshed) throw err
    return rawRequest<T>(path, options)
  }
}

export function queryString(params: object): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  }
  const raw = search.toString()
  return raw ? `?${raw}` : ''
}