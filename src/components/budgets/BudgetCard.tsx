import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { BudgetWithMeta } from '@/types'
import { Badge, type Tone } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { budgetStatus } from '@/domain/budget'
import { formatRupiah } from '@/lib/currency'
import { fontSizes, radii, spacing, useAppColors } from '@/theme'

interface BudgetCardProps {
  budget: BudgetWithMeta
  onPress: () => void
}

export function BudgetCard({ budget, onPress }: BudgetCardProps) {
  const colors = useAppColors()
  const utilization = Math.max(0, Math.min(1, budget.utilization))
  const status = budgetStatus(budget.spent, budget.amount)
  const remaining = Math.max(0, budget.amount - budget.spent)

  const tone: Tone =
    status === 'danger' ? 'danger' : status === 'warn' ? 'warning' : 'success'
  const statusLabel = ((): string => {
    if (status === 'danger') return 'Over budget'
    if (status === 'warn') return 'Hampir habis'
    return 'Aman'
  })()

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.emoji, { fontSize: 22 }]}>{budget.categoryIcon}</Text>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
          {budget.categoryName}
        </Text>
        <Badge tone={tone}>{statusLabel}</Badge>
      </View>

      <View style={styles.amountRow}>
        <Text style={[styles.amount, { color: status === 'danger' ? colors.danger : colors.foreground }]}>
          {formatRupiah(budget.spent)}
        </Text>
        <Text style={[styles.target, { color: colors.muted }]}>/ {formatRupiah(budget.amount)}</Text>
      </View>

      <ProgressBar value={utilization} tone={status === 'danger' ? 'danger' : status === 'warn' ? 'warning' : 'success'} showLabel />

      <Text style={[styles.remaining, { color: remaining > 0 ? colors.muted : colors.danger }]}>
        Sisa: {formatRupiah(remaining)}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: spacing.md,
    shadowOpacity: 0.4,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emoji: {},
  name: {
    flex: 1,
    fontSize: fontSizes.md,
    fontWeight: '700',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  amount: {
    fontSize: fontSizes.xl,
    fontWeight: '800',
  },
  target: {
    fontSize: fontSizes.sm,
  },
  remaining: {
    fontSize: fontSizes.sm,
  },
})