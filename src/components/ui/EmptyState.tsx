import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { fontSizes, radii, spacing, useAppColors } from '@/theme'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon = '🗂️', title, description, action }: EmptyStateProps) {
  const colors = useAppColors()
  return (
    <View style={[styles.wrapper, { borderColor: colors.border }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {description ? <Text style={[styles.description, { color: colors.muted }]}>{description}</Text> : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    paddingVertical: 40,
    paddingHorizontal: 24,
    gap: spacing.sm,
  },
  icon: {
    fontSize: 36,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    fontSize: fontSizes.sm,
    textAlign: 'center',
    maxWidth: 320,
  },
  action: {
    marginTop: spacing.md,
  },
})