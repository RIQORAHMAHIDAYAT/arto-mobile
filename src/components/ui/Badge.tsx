import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { fontSizes, radii, useAppColors } from '@/theme'

export type Tone = 'success' | 'danger' | 'warning' | 'info' | 'neutral'

interface BadgeProps {
  tone?: Tone
  children: ReactNode
}

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  const colors = useAppColors()
  const color = ((): string => {
    switch (tone) {
      case 'success': return colors.success
      case 'danger': return colors.danger
      case 'warning': return colors.warning
      case 'info': return colors.info
      case 'neutral': return colors.muted
    }
  })()

  return (
    <View style={[styles.badge, { backgroundColor: withAlpha(color, 0.15) }]}>
      <Text style={[styles.text, { color }]}>{children}</Text>
    </View>
  )
}

function withAlpha(hexColor: string, alpha: number): string {
  if (hexColor.startsWith('#') && hexColor.length === 7) {
    const r = Number.parseInt(hexColor.slice(1, 3), 16)
    const g = Number.parseInt(hexColor.slice(3, 5), 16)
    const b = Number.parseInt(hexColor.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  return hexColor
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radii.round,
  },
  text: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
  },
})