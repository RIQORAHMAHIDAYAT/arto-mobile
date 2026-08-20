import { useCallback, useEffect, useMemo, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { getAnalyticsSummary, getExpenseByCategory, getTrends } from '@/api/analytics'
import { BarChart } from '@/components/charts/BarChart'
import { DonutChart } from '@/components/charts/DonutChart'
import { StatCard } from '@/components/dashboard/StatCard'
import { Screen } from '@/components/Screen'
import { Select } from '@/components/ui/Select'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingBlock } from '@/components/ui/LoadingBlock'
import { useAsync } from '@/hooks/useAsync'
import { formatRupiah } from '@/lib/currency'
import { endOfMonth, formatMonthYear, monthKey, parseISODate, startOfMonth, toISODate } from '@/lib/date'
import { getErrorMessage } from '@/lib/errorMessage'
import type { RootStackParamList } from '@/navigation/types'
import { donutColors, fontSizes, radii, spacing, useAppColors } from '@/theme'

type Props = NativeStackScreenProps<RootStackParamList, 'Analytics'>

const MONTH_OPTIONS = Array.from({ length: 6 }, (_, i) => {
  const date = new Date()
  date.setMonth(date.getMonth() - i)
  return { value: monthKey(date), label: formatMonthYear(date) }
})

export function AnalyticsScreen(_props: Props) {
  const colors = useAppColors()
  const today = new Date()
  const [month, setMonth] = useState(monthKey(today))

  const range = useMemo(() => {
    const parsed = parseISODate(`${month}-01`)
    return { from: toISODate(startOfMonth(parsed)), to: toISODate(endOfMonth(parsed)) }
  }, [month])

  const summaryState = useAsync(() => getAnalyticsSummary(range), [range])
  const categoriesState = useAsync(() => getExpenseByCategory(range), [range])
  const trendsState = useAsync(() => getTrends(range, 'day'), [range])

  // refetch bersifat stabil (useCallback []), aman dijadikan dependency tanpa loop.
  const summaryRefetch = summaryState.refetch
  const categoriesRefetch = categoriesState.refetch
  const trendsRefetch = trendsState.refetch

  useEffect(() => {
    summaryRefetch()
    categoriesRefetch()
    trendsRefetch()
  }, [range, summaryRefetch, categoriesRefetch, trendsRefetch])

  const loading = summaryState.loading || categoriesState.loading || trendsState.loading
  const error = summaryState.error ?? categoriesState.error ?? trendsState.error

  const categoryStats = categoriesState.data ?? []
  const donutSegments = categoryStats.map((stat, index) => ({
    key: stat.categoryId,
    value: stat.amount,
    color: donutColors[index % donutColors.length] ?? colors.secondary,
  }))

  const chartData = useMemo(() => {
    const points = trendsState.data ?? []
    return points.map((p) => ({
      label: p.label,
      values: [
        { key: `expense-${p.label}`, value: p.expense, color: colors.danger },
        { key: `income-${p.label}`, value: p.income, color: colors.success },
      ],
    }))
  }, [trendsState.data, colors])

  const refresh = useCallback(() => {
    summaryRefetch()
    categoriesRefetch()
    trendsRefetch()
  }, [summaryRefetch, categoriesRefetch, trendsRefetch])

  return (
    <Screen
      subtitle="Pola pemasukan & pengeluaran"
      refreshing={loading}
      onRefresh={refresh}
    >
      <Select
        label="Periode"
        value={month}
        onChange={setMonth}
        options={MONTH_OPTIONS}
      />

      {error ? <ErrorState message={getErrorMessage(error)} onRetry={refresh} /> : null}
      {loading && !summaryState.data ? <LoadingBlock /> : null}

      {summaryState.data ? (
        <View style={styles.statRow}>
          <StatCard label="Pemasukan" value={formatRupiah(summaryState.data.income)} tone="success" />
          <StatCard label="Pengeluaran" value={formatRupiah(summaryState.data.expense)} tone="danger" />
        </View>
      ) : null}

      {summaryState.data ? (
        <View style={styles.statRow}>
          <StatCard label="Selisih" value={formatRupiah(summaryState.data.net)} tone={summaryState.data.net >= 0 ? 'success' : 'danger'} />
          <StatCard label="Rata-rata/bln" value={formatRupiah(Math.round(summaryState.data.averageSpending))} />
        </View>
      ) : null}

      {chartData.length > 0 ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Tren Harian</Text>
          <View style={[styles.chartBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <BarChart data={chartData} height={150} />
          </View>
        </View>
      ) : null}

      {categoryStats.length > 0 ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Pengeluaran per Kategori</Text>
          <View style={[styles.donutCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <DonutChart
              segments={donutSegments}
              centerLabel="Total"
              centerValue={categoryStats.reduce((sum, s) => sum + s.amount, 0)}
            />
            <View style={styles.legend}>
              {categoryStats.map((stat, index) => (
                <View key={stat.categoryId} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: donutColors[index % donutColors.length] ?? colors.secondary }]} />
                  <Text style={[styles.legendText, { color: colors.foreground }]} numberOfLines={1}>
                    {stat.categoryIcon} {stat.categoryName}
                  </Text>
                  <Text style={[styles.legendValue, { color: colors.muted }]}>{formatRupiah(stat.amount)}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      ) : null}
    </Screen>
  )
}

const styles = StyleSheet.create({
  statRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '800',
  },
  chartBox: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.lg,
    paddingLeft: spacing.lg,
  },
  donutCard: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.lg,
  },
  legend: {
    alignSelf: 'stretch',
    gap: spacing.sm,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: radii.round,
  },
  legendText: {
    flex: 1,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  legendValue: {
    fontSize: fontSizes.sm,
  },
})