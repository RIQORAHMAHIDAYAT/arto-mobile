import { useCallback, useMemo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { getDashboardSummary } from '@/api/dashboard'
import { BudgetCard } from '@/components/budgets/BudgetCard'
import { DailyLimitCard } from '@/components/budgets/DailyLimitCard'
import { BarChart } from '@/components/charts/BarChart'
import { StatCard } from '@/components/dashboard/StatCard'
import { Screen } from '@/components/Screen'
import { TransactionRow } from '@/components/transactions/TransactionRow'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingBlock } from '@/components/ui/LoadingBlock'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/context/AuthContext'
import { formatRupiah, formatRupiahCompact } from '@/lib/currency'
import { formatDateDayMonth } from '@/lib/date'
import { getErrorMessage } from '@/lib/errorMessage'
import type { MainTabParamList, RootStackParamList } from '@/navigation/types'
import { fontSizes, radii, spacing, useAppColors } from '@/theme'
import type { CompositeScreenProps } from '@react-navigation/native'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Dashboard'>,
  NativeStackScreenProps<RootStackParamList>
>

export function DashboardScreen({ navigation }: Props) {
  const colors = useAppColors()
  const { user } = useAuth()
  const { data, loading, error, refetch } = useAsync(() => getDashboardSummary(), [])

  useFocusEffect(
    useCallback(() => {
      void refetch()
    }, [refetch]),
  )

  const firstName = user?.name?.split(' ')[0] ?? ''

  const chartData = useMemo(() => {
    const points = data?.spendingChart ?? []
    const recent = points.slice(-14)
    return recent.map((p) => ({
      label: formatDateDayMonth(p.date),
      values: [
        { key: 'expense', value: p.expense, color: colors.danger },
        { key: 'income', value: p.income, color: colors.success },
      ],
    }))
  }, [data, colors])

  const budgetSummaries = data?.budgetSummary ?? []
  const recentTransactions = data?.recentTransactions ?? []

  const handleBudgetPress = (budgetId: string) => {
    navigation.navigate('BudgetDetail', { id: budgetId })
  }

  const quickActions: Array<{ key: string; label: string; hint: string; onPress: () => void }> = [
    {
      key: 'analytics',
      label: '📊 Analisis',
      hint: 'Lihat pola pengeluaran',
      onPress: () => navigation.navigate('Analytics'),
    },
    {
      key: 'health',
      label: '🩺 Kesehatan Finansial',
      hint: 'Skor & faktor kesehatan',
      onPress: () => navigation.navigate('FinancialHealth'),
    },
    {
      key: 'accounts',
      label: '👛 Akun',
      hint: 'Saldo dompet, bank, e-wallet',
      onPress: () => navigation.navigate('Accounts'),
    },
  ]

  return (
    <Screen
      title={`Halo, ${firstName || 'Sobat ARTO'} 👋`}
      subtitle="Ringkasan keuanganmu hari ini"
      refreshing={loading}
      onRefresh={() => void refetch()}
    >
      {error ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : (
        <>
          {/* Saldo total */}
          <View style={[styles.balanceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.balanceLabel, { color: colors.muted }]}>TOTAL SALDO</Text>
            <Text style={[styles.balanceValue, { color: colors.foreground }]}>
              {data ? formatRupiah(data.totalBalance) : '…'}
            </Text>
            {data ? <Text style={[styles.balanceHint, { color: colors.muted }]}>{data.periodLabel}</Text> : null}
          </View>

          {/* Daily limit */}
          {data?.dailyLimit ? <DailyLimitCard info={data.dailyLimit} /> : null}

          {/* Pemasukan & pengeluaran */}
          <View style={styles.statRow}>
            <StatCard label="Pemasukan" value={data ? formatRupiahCompact(data.totalIncome) : '…'} tone="success" />
            <StatCard label="Pengeluaran" value={data ? formatRupiahCompact(data.totalExpense) : '…'} tone="danger" />
          </View>

          {/* Quick actions */}
          <View style={styles.quickRow}>
            {quickActions.map((action) => (
              <Pressable
                key={action.key}
                accessibilityRole="button"
                onPress={action.onPress}
                style={({ pressed }) => [
                  styles.quickAction,
                  { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Text style={styles.quickIcon}>{action.label.split(' ')[0]}</Text>
                <Text style={[styles.quickLabel, { color: colors.foreground }]} numberOfLines={2}>
                  {action.label.replace(/^\S+\s/, '')}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Chart */}
          {data && chartData.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Tren 14 Hari Terakhir</Text>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
                <Text style={[styles.legendText, { color: colors.muted }]}>Pengeluaran</Text>
                <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.legendText, { color: colors.muted }]}>Pemasukan</Text>
              </View>
              <View style={[styles.chartBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <BarChart data={chartData} height={150} />
              </View>
            </View>
          ) : null}

          {/* Budget ringkas */}
          {budgetSummaries.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Budget Bulan Ini</Text>
                <Text
                  style={[styles.sectionLink, { color: colors.secondary }]}
                  onPress={() => navigation.navigate('Main', { screen: 'Budgets' })}
                >
                  Semua ›
                </Text>
              </View>
              {budgetSummaries.slice(0, 3).map((summary) => (
                <BudgetCard
                  key={summary.budgetId}
                  budget={{
                    id: summary.budgetId,
                    userId: '',
                    categoryId: summary.categoryId,
                    categoryName: summary.categoryName,
                    categoryIcon: summary.categoryIcon,
                    amount: summary.amount,
                    spent: summary.spent,
                    utilization: summary.utilization,
                    periodStart: '',
                    periodEnd: '',
                    createdAt: '',
                    updatedAt: '',
                  }}
                  onPress={() => handleBudgetPress(summary.budgetId)}
                />
              ))}
            </View>
          ) : null}

          {/* Transaksi terakhir */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Transaksi Terakhir</Text>
              <Text
                style={[styles.sectionLink, { color: colors.secondary }]}
                onPress={() => navigation.navigate('Main', { screen: 'Transactions' })}
              >
                Semua ›
              </Text>
            </View>
            {recentTransactions.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.muted }]}>Belum ada transaksi.</Text>
            ) : (
              <View style={[styles.listCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {recentTransactions.slice(0, 5).map((tx, index) => (
                  <View key={tx.id}>
                    {index > 0 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
                    <TransactionRow transaction={tx} />
                  </View>
                ))}
              </View>
            )}
          </View>
        </>
      )}

      {loading && !data ? <LoadingBlock /> : null}

      {!data && !error && !loading ? <LoadingBlock /> : null}
    </Screen>
  )
}

const styles = StyleSheet.create({
  balanceCard: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: 4,
  },
  balanceLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '800',
    letterSpacing: 1,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  balanceHint: {
    fontSize: fontSizes.sm,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickAction: {
    flex: 1,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  quickIcon: {
    fontSize: 20,
  },
  quickLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '800',
  },
  sectionLink: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: radii.round,
  },
  legendText: {
    fontSize: fontSizes.xs,
    marginRight: spacing.md,
  },
  chartBox: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.lg,
    paddingLeft: spacing.lg,
  },
  listCard: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  emptyText: {
    fontSize: fontSizes.sm,
  },
})