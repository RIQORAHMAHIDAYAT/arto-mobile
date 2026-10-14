import { StyleSheet, Text, View } from 'react-native'
import { fontSizes, radii, spacing, useAppColors, withAlpha } from '@/theme'
import { Button } from './Button'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({ title = 'Terjadi kesalahan', message, onRetry }: ErrorStateProps) {
  const colors = useAppColors()
  return (
    <View accessibilityRole="alert" style={[styles.wrapper, { borderColor: withAlpha(colors.danger, 0.3), backgroundColor: withAlpha(colors.danger, 0.05) }]}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={[styles.title, { color: colors.danger }]}>{title}</Text>
      {message ? <Text style={[styles.message, { color: colors.muted }]}>{message}</Text> : null}
      {onRetry && <Button variant="ghost" size="sm" onPress={onRetry}>Coba lagi</Button>}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: spacing.md,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: fontSizes.sm,
    textAlign: 'center',
    maxWidth: 320,
  },
})