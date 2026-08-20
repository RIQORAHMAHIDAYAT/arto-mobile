import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Credentials, Session, ThemePreference, User } from '@/types'
import * as authApi from '@/api/auth'

interface AuthContextValue {
  user: User | null
  initializing: boolean
  login: (credentials: Credentials) => Promise<void>
  register: (credentials: Credentials) => Promise<void>
  logout: () => Promise<void>
  updateTheme: (theme: ThemePreference) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    let cancelled = false
    authApi
      .getSession()
      .then((value) => {
        if (!cancelled) setSession(value)
      })
      .finally(() => {
        if (!cancelled) setInitializing(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (credentials: Credentials) => {
    const result = await authApi.login(credentials)
    setSession(result)
  }, [])

  const register = useCallback(async (credentials: Credentials) => {
    const result = await authApi.register(credentials)
    setSession(result)
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setSession(null)
  }, [])

  const updateTheme = useCallback(async (theme: ThemePreference) => {
    await authApi.updateProfile({ theme })
    setSession((prev) => (prev ? { ...prev, user: { ...prev.user, theme } } : prev))
  }, [])

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      initializing,
      login,
      register,
      logout,
      updateTheme,
    }),
    [session, initializing, login, register, logout, updateTheme],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return ctx
}