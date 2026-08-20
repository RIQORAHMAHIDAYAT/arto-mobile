import { StyleSheet, Text, View } from 'react-native'
import { fontSizes, radii, useAppColors } from '@/theme'

export type ProgressTone = 'success' | 'danger' | 'warning' | 'info' | 'secondary'

interface ProgressBarProps {
  /** Nilai 0..1 */
  value: number
  tone?: ProgressTone
  showLabel?: boolean
  trackColor?: string
}

export function ProgressBar({ value, tone = 'secondary', showLabel = false, trackColor }: ProgressBarProps) {
  const colors = useAppColors()
  const percent = Math.max(0, Math.min(100, value * 100))
  const fill = ((): string => {
    switch (tone) {
      case 'success': return colors.success
      case 'danger': return colors.danger
      case 'warning': return colors.warning
      case 'info': return colors.info
      case 'secondary': return colors.secondary
    }
  })()

  return (
    <View style={styles.row}>
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(percent) }}
        style={[styles.track, { backgroundColor: trackColor ?? withAlpha(colors.muted, 0.2) }]}
      >
        <View style={[styles.fill, { backgroundColor: fill, width: `${percent}%` }]} />
      </View>
      {showLabel && <Text style={[styles.label, { color: colors.muted }]}>{Math.round(percent)}%</Text>}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  track: {
    height: 8,
    flex: 1,
    borderRadius: radii.round,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.round,
  },
  label: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
})