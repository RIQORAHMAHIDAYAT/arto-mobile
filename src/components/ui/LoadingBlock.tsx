import { StyleSheet, Text, View } from 'react-native'
import { fontSizes, spacing, useAppColors } from '@/theme'
import { Spinner } from './Spinner'

export function LoadingBlock({ label = 'Memuat…' }: { label?: string }) {
  const colors = useAppColors()
  return (
    <View accessibilityRole="progressbar" style={styles.wrapper}>
      <Spinner />
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: spacing.md,
  },
  label: {
    fontSize: fontSizes.sm,
  },
})