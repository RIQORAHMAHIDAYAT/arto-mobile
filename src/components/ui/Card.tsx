import type { ReactNode } from 'react'
import { StyleSheet, Text, View, type ViewStyle } from 'react-native'
import { fontSizes, radii, useAppColors } from '@/theme'

interface CardProps {
  title?: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  style?: ViewStyle
}

export function Card({ title, subtitle, action, children, style }: CardProps) {
  const colors = useAppColors()
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.cardShadow,
        },
        style,
      ]}
    >
      {(title || subtitle || action) && (
        <View style={styles.header}>
          <View style={styles.headerText}>
            {title ? <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text> : null}
            {subtitle ? <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text> : null}
          </View>
          {action}
        </View>
      )}
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 2,
    fontSize: fontSizes.sm,
    color: '#64748b',
  },
})