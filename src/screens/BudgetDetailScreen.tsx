import { useCallback } from 'react'
import { Alert, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { deleteBudget, getBudget, getDailyLimit, listBudgetSummary } from '@/api/budgets'
import { DailyLimitCard } from '@/components/budgets/DailyLimitCard'
import { Screen } from '@/components/Screen'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingBlock } from '@/components/ui/LoadingBlock'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useAsync } from '@/hooks/useAsync'
import { budgetRemaining, budgetStatus, budgetUtilization } from '@/domain/budget'
import { formatRupiah } from '@/lib/currency'
import { formatDateLong } from '@/lib/date'
import { getErrorMessage } from '@/lib/errorMessage'
import type { RootStackParamList } from '@/navigation/types'
import { fontSizes, radii, spacing, useAppColors } from '@/theme'

type Props = NativeStackScreenProps<RootStackParamList, 'BudgetDetail'>

export function BudgetDetailScreen({ navigation, route }: Props) {
  const colors = useAppColors()
  const { id } = route.params

  const budgetState = useAsync(() => getBudget(id), [id])
  const summaryState = useAsync(() => listBudgetSummary(), [])
  const limitState = useAsync(() => getDailyLimit(id), [id])

  const refresh = useCallback(() => {
    budgetState.refetch()
    summaryState.refetch()
    limitState.refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const summary = (summaryState.data ?? []).find((s) => s.budgetId === id)
  const budget = budgetState.data

  const loading = budgetState.loading && !budget
  const error = budgetState.error ?? summaryState.error ?? limitState.error

  const utilization = summary ? budgetUtilization(summary.spent, summary.amount) : 0
  const status = summary ? budgetStatus(summary.spent, summary.amount) : 'ok'
  const remaining = summary ? budgetRemaining(summary.spent, summary.amount) : (budget?.amount ?? 0)

  const confirmDelete = () => {
    if (!budget) return
    Alert.alert('Hapus Budget', 'Budget ini akan dihapus. Lanjutkan?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          deleteBudget(budget.id)
            .then(() => navigation.goBack())
            .catch((err) => Alert.alert('Gagal Menghapus', getErrorMessage(err)))
        },
      },
    ])
  }

  return (
    <Screen
      subtitle={budget ? `${formatDateLong(budget.periodStart)} – ${formatDateLong(budget.periodEnd)}` : undefined}
      action={
        budget ? (
          <Button size="sm" variant="ghost" onPress={() => navigation.navigate('BudgetForm', { editing: budget })}>
            Ubah
          </Button>
        ) : undefined
      }
      refreshing={loading}
      onRefresh={refresh}
    >
      {error && !budget ? <ErrorState message={getErrorMessage(error)} onRetry={refresh} /> : null}
      {loading ? <LoadingBlock /> : null}

      {budget ? (
        <>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.emoji, { fontSize: 40 }]}>{summary?.categoryIcon ?? '🎯'}</Text>
            <View style={styles.amountRow}>
              <Text style={[styles.spent, { color: status === 'danger' ? colors.danger : colors.foreground }]}>
                {formatRupiah(summary?.spent ?? 0)}
              </Text>
              <Text style={[styles.target, { color: colors.muted }]}>/ {formatRupiah(budget.amount)}</Text>
            </View>
            <ProgressBar
              value={utilization}
              tone={status === 'danger' ? 'danger' : status === 'warn' ? 'warning' : 'success'}
              showLabel
            />
            <Text style={[styles.remaining, { color: remaining > 0 ? colors.muted : colors.danger }]}>
              Sisa budget: {formatRupiah(remaining)}
            </Text>
          </View>

          {limitState.data ? <DailyLimitCard info={limitState.data} /> : null}
          {limitState.error && !limitState.data ? (
            <Text style={[styles.limitError, { color: colors.muted }]}>
              Batas harian tidak tersedia saat ini.
            </Text>
          ) : null}

          <Button variant="danger" onPress={confirmDelete}>
            Hapus Budget
          </Button>
        </>
      ) : null}
    </Screen>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  emoji: {},
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  spent: {
    fontSize: 28,
    fontWeight: '800',
  },
  target: {
    fontSize: fontSizes.md,
  },
  remaining: {
    fontSize: fontSizes.sm,
  },
  limitError: {
    fontSize: fontSizes.sm,
    textAlign: 'center',
  },
})