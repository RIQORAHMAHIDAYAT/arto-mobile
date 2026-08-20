import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { GoalWithMeta } from '@/types'
import { Badge, type Tone } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { formatDateShort } from '@/lib/date'
import { formatRupiah, formatRupiahCompact } from '@/lib/currency'
import { fontSizes, radii, spacing, useAppColors } from '@/theme'

interface GoalCardProps {
  goal: GoalWithMeta
  onPress: () => void
}

/**
 * Status tampilan: done jika progress 100%,
 * warn jika sisa hari mepet dibanding sisa nominal yang harus dikumpulkan,
 * selain itu info (berjalan normal).
 */
function goalTone(goal: GoalWithMeta): Tone {
  if (goal.progress >= 1) return 'success'
  if (goal.remainingDays !== null && goal.requiredDaily !== null && goal.remainingDays < goal.remaining / goal.requiredDaily) {
    return 'warning'
  }
  return 'info'
}

function goalLabel(goal: GoalWithMeta): string {
  if (goal.progress >= 1) return 'Tercapai 🎉'
  if (goal.remainingDays !== null && goal.requiredDaily !== null && goal.remainingDays < goal.remaining / goal.requiredDaily) {
    return 'Mepet deadline'
  }
  return 'Berjalan'
}

export function GoalCard({ goal, onPress }: GoalCardProps) {
  const colors = useAppColors()
  const isDone = goal.progress >= 1
  const tone = goalTone(goal)

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
        <View style={styles.nameBlock}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {goal.name}
          </Text>
          <Text style={[styles.meta, { color: colors.muted }]} numberOfLines={1}>
            {goal.deadline ? `Deadline ${formatDateShort(goal.deadline)}` : 'Tanpa deadline'}
          </Text>
        </View>
        <Badge tone={tone}>{goalLabel(goal)}</Badge>
      </View>

      <View style={styles.amountRow}>
        <Text style={[styles.amount, { color: colors.foreground }]}>{formatRupiah(goal.currentAmount)}</Text>
        <Text style={[styles.target, { color: colors.muted }]}>/ {formatRupiah(goal.targetAmount)}</Text>
      </View>

      <ProgressBar value={goal.progress} tone={isDone ? 'success' : 'secondary'} showLabel />

      <View style={styles.footerRow}>
        <Text style={[styles.footerText, { color: colors.muted }]}>
          {isDone
            ? 'Selamat, goal tercapai!'
            : `Sisa ${formatRupiahCompact(goal.remaining)}${goal.requiredDaily !== null ? ` · target ${formatRupiahCompact(goal.requiredDaily)}/hari` : ''}`}
        </Text>
      </View>
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
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  nameBlock: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: fontSizes.md,
    fontWeight: '700',
  },
  meta: {
    fontSize: fontSizes.xs,
    marginTop: 2,
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
  footerRow: {
    flexDirection: 'row',
  },
  footerText: {
    fontSize: fontSizes.sm,
  },
})