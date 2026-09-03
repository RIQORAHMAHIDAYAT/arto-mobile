import type { Credentials, Session, TokenPair, User } from '@/types'
import { ApiError, clearTokens, getAccessToken, getRefreshToken, request, setTokens } from './client'

interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

async function toSession(data: AuthResponse): Promise<Session> {
  await setTokens(data.accessToken, data.refreshToken)
  return { accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user }
}

export async function register(credentials: Credentials): Promise<Session> {
  const data = await request<AuthResponse>('/auth/register', { method: 'POST', body: credentials, auth: false })
  return toSession(data)
}

export async function login(credentials: Credentials): Promise<Session> {
  const data = await request<AuthResponse>('/auth/login', { method: 'POST', body: credentials, auth: false })
  return toSession(data)
}

export async function getSession(): Promise<Session | null> {
  const accessToken = await getAccessToken()
  if (!accessToken) return null
  try {
    const user = await request<User>('/users/me')
    return { accessToken: (await getAccessToken()) ?? '', refreshToken: (await getRefreshToken()) ?? '', user }
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      await clearTokens()
    }
    return null
  }
}

export async function logout(): Promise<void> {
  const refreshToken = await getRefreshToken()
  if (refreshToken) {
    try {
      await request<void>('/auth/logout', { method: 'POST', body: { refreshToken }, auth: false })
    } catch {
      // tetap bersihkan token lokal meskipun server logout gagal
    }
  }
  
  try {
    const { getExpoPushTokenAsync } = await import('expo-notifications');
    const tokenData = await getExpoPushTokenAsync({ projectId: 'arto-project' });
    if (tokenData && tokenData.data) {
      const { unregisterDeviceToken } = await import('./notifications');
      await unregisterDeviceToken(tokenData.data);
    }
  } catch {
    // ignore
  }

  await clearTokens()
}

export async function updateProfile(input: Partial<Pick<User, 'name' | 'theme'>>): Promise<User> {
  return request<User>('/users/me', { method: 'PATCH', body: input })
}

export async function refreshSession(): Promise<TokenPair> {
  const refreshToken = await getRefreshToken()
  if (!refreshToken) throw new ApiError('Sesi tidak valid.', 401)
  return request<TokenPair>('/auth/refresh', { method: 'POST', body: { refreshToken }, auth: false })
}

export async function changePassword(input: { currentPassword: string; newPassword: string }): Promise<void> {
  return request<void>('/auth/change-password', { method: 'POST', body: input })
}