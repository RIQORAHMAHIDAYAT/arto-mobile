import { useCallback, useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import type { CompositeScreenProps } from '@react-navigation/native'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { listBudgetSummary, listBudgets } from '@/api/budgets'
import { BudgetCard } from '@/components/budgets/BudgetCard'
import { Screen } from '@/components/Screen'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingBlock } from '@/components/ui/LoadingBlock'
import { useAsync } from '@/hooks/useAsync'
import { getErrorMessage } from '@/lib/errorMessage'
import type { MainTabParamList, RootStackParamList } from '@/navigation/types'
import { fontSizes, spacing, useAppColors } from '@/theme'
import type { BudgetWithMeta } from '@/types'

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Budgets'>,
  NativeStackScreenProps<RootStackParamList>
>

export function BudgetsScreen({ navigation }: Props) {
  const colors = useAppColors()
  const budgetsState = useAsync(() => listBudgets(), [])
  const summaryState = useAsync(() => listBudgetSummary(), [])

  const refresh = async () => {
    await Promise.all([budgetsState.refetch(), summaryState.refetch()])
  }

  useFocusEffect(
    useCallback(() => {
      budgetsState.refetch()
      summaryState.refetch()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  )

  const merged: BudgetWithMeta[] = useMemo(() => {
    const budgets = budgetsState.data ?? []
    const summaryMap = new Map((summaryState.data ?? []).map((s) => [s.budgetId, s]))
    return budgets.map((b) => {
      const s = summaryMap.get(b.id)
      return {
        ...b,
        spent: s?.spent ?? 0,
        utilization: s?.utilization ?? 0,
        categoryName: s?.categoryName ?? 'Tanpa Kategori',
        categoryIcon: s?.categoryIcon ?? '🎯',
      }
    })
  }, [budgetsState.data, summaryState.data])

  const loading = budgetsState.loading || summaryState.loading
  const error = budgetsState.error ?? summaryState.error

  return (
    <Screen
      title="Budget"
      subtitle={`${merged.length} budget aktif`}
      action={
        <Button size="sm" onPress={() => navigation.navigate('BudgetForm', {})}>
          + Buat
        </Button>
      }
      refreshing={loading}
      onRefresh={refresh}
    >
      {error ? <ErrorState message={getErrorMessage(error)} onRetry={refresh} /> : null}
      {loading && merged.length === 0 ? <LoadingBlock /> : null}

      {!loading && !error && merged.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="Belum ada budget"
          description="Buat budget per kategori agar kesehatan finansialmu lebih terpantau."
          action={
            <Button onPress={() => navigation.navigate('BudgetForm', {})}>Buat Budget</Button>
          }
        />
      ) : (
        <View style={styles.list}>
          {merged.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} onPress={() => navigation.navigate('BudgetDetail', { id: budget.id })} />
          ))}
        </View>
      )}

      <Text style={[styles.note, { color: colors.mutedForeground }]}>
        Tip: batas pengeluaran harian dihitung dari sisa budget dibagi sisa hari.
      </Text>
    </Screen>
  )
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  note: {
    fontSize: fontSizes.xs,
    textAlign: 'center',
  },
})