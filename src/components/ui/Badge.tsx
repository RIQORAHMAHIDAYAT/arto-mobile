import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { fontSizes, radii, useAppColors, withAlpha } from '@/theme'

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