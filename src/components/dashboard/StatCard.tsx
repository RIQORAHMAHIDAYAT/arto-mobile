import { StyleSheet, Text, View } from 'react-native'
import { fontSizes, radii, spacing, useAppColors } from '@/theme'

interface StatCardProps {
  label: string
  value: string
  tone?: 'default' | 'success' | 'danger'
  hint?: string
}

export function StatCard({ label, value, tone = 'default', hint }: StatCardProps) {
  const colors = useAppColors()
  const color = tone === 'success' ? colors.success : tone === 'danger' ? colors.danger : colors.foreground

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.value, { color }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
        {value}
      </Text>
      {hint ? (
        <Text style={[styles.hint, { color: colors.mutedForeground }]} numberOfLines={1}>
          {hint}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: 2,
  },
  label: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
  value: {
    fontSize: fontSizes.lg,
    fontWeight: '800',
  },
  hint: {
    fontSize: fontSizes.xs,
  },
})