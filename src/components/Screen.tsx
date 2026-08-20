import type { ReactNode } from 'react'
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { fontSizes, spacing, useAppColors } from '@/theme'

interface ScreenProps {
  title?: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  scrollable?: boolean
  refreshing?: boolean
  onRefresh?: () => void
  contentContainerStyle?: object
}

/**
 * Layout dasar layar: safe area + header + konten (bisa scroll dengan pull-to-refresh).
 */
export function Screen({
  title,
  subtitle,
  action,
  children,
  scrollable = true,
  refreshing = false,
  onRefresh,
  contentContainerStyle,
}: ScreenProps) {
  const colors = useAppColors()

  const header = (title || subtitle || action) ? (
    <View style={styles.header}>
      <View style={styles.headerText}>
        {title ? <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text> : null}
        {subtitle ? <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  ) : null

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safe, { backgroundColor: colors.background }]}>
      {scrollable ? (
        <ScrollView
          contentContainerStyle={[styles.content, contentContainerStyle]}
          refreshControl={
            onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} /> : undefined
          }
          keyboardShouldPersistTaps="handled"
        >
          {header}
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.flexFill, contentContainerStyle]}>
          {header}
          {children}
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
    gap: spacing.lg,
  },
  flexFill: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: fontSizes['2xl'],
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 2,
    fontSize: fontSizes.sm,
  },
})