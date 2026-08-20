import { useMemo } from 'react'
import { useTheme } from '@/context/ThemeContext'

export interface AppColors {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  surfaceHover: string
  border: string
  foreground: string
  muted: string
  mutedForeground: string
  success: string
  danger: string
  warning: string
  info: string
  cardShadow: string
}

export const lightColors: AppColors = {
  primary: '#16a34a',
  secondary: '#2563eb',
  accent: '#22c55e',
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceHover: '#f1f5f9',
  border: '#e2e8f0',
  foreground: '#0f172a',
  muted: '#64748b',
  mutedForeground: '#94a3b8',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  cardShadow: 'rgba(15, 23, 42, 0.08)',
}

export const darkColors: AppColors = {
  primary: '#22c55e',
  secondary: '#3b82f6',
  accent: '#4ade80',
  background: '#09090b',
  surface: '#18181b',
  surfaceHover: '#27272a',
  border: '#27272a',
  foreground: '#f8fafc',
  muted: '#a1a1aa',
  mutedForeground: '#71717a',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  cardShadow: 'rgba(0, 0, 0, 0.35)',
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
} as const

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 999,
} as const

export const fontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 26,
  '3xl': 34,
} as const

export function useAppColors(): AppColors {
  const { resolvedTheme } = useTheme()
  return useMemo(() => (resolvedTheme === 'dark' ? darkColors : lightColors), [resolvedTheme])
}

export const donutColors = ['#16A34A', '#2563EB', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#84CC16'] as const