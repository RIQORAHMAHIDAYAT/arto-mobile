import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useColorScheme } from 'react-native'
import type { ThemePreference } from '@/types'

interface ThemeContextValue {
  theme: ThemePreference
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: ThemePreference) => void
}

const STORAGE_KEY = 'arto.theme'

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
}

async function readPreference(): Promise<ThemePreference> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    return isThemePreference(raw) ? raw : 'system'
  } catch {
    return 'system'
  }
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme()
  const [theme, setThemeState] = useState<ThemePreference>('system')

  useEffect(() => {
    let cancelled = false
    void readPreference().then((value) => {
      if (!cancelled) setThemeState(value)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const resolvedTheme: 'light' | 'dark' = theme === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : theme

  const setTheme = useCallback((next: ThemePreference) => {
    setThemeState(next)
    void AsyncStorage.setItem(STORAGE_KEY, next).catch(() => undefined)
  }, [])

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme harus dipakai di dalam ThemeProvider')
  return ctx
}