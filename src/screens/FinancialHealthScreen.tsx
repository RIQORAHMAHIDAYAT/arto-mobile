import { StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { getFinancialHealth } from '@/api/financialHealth'
import { DonutChart } from '@/components/charts/DonutChart'
import { Screen } from '@/components/Screen'
import { Badge, type Tone } from '@/components/ui/Badge'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingBlock } from '@/components/ui/LoadingBlock'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useAsync } from '@/hooks/useAsync'
import { getErrorMessage } from '@/lib/errorMessage'
import type { FinancialHealthFactor } from '@/types'
import type { RootStackParamList } from '@/navigation/types'
import { fontSizes, radii, spacing, useAppColors } from '@/theme'

type Props = NativeStackScreenProps<RootStackParamList, 'FinancialHealth'>

const LEVEL_TONE: Record<string, Tone> = {
  baik: 'success',
  cukup: 'warning',
  'perlu-pemantauan': 'danger',
}

const LEVEL_LABEL: Record<string, string> = {
  baik: 'Baik',
  cukup: 'Cukup',
  'perlu-pemantauan': 'Perlu Pemantauan',
}

export function FinancialHealthScreen(_props: Props) {
  const colors = useAppColors()
  const { data, loading, error, refetch } = useAsync(() => getFinancialHealth(), [])

  if (error) {
    return (
      <Screen>
        <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
      </Screen>
    )
  }

  return (
    <Screen
      subtitle="Skor berdasarkan kebiasaan keuanganmu"
      refreshing={loading}
      onRefresh={() => refetch()}
    >
      {loading && !data ? <LoadingBlock /> : null}

      {data ? (
        <>
          <View style={[styles.scoreCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <DonutChart
              segments={[{ key: 'score', value: data.score, color: scoreColor(data.score, colors.success, colors.warning, colors.danger) }]}
              centerLabel="Skor"
              centerValue={data.score}
              size={180}
              thickness={22}
            />
            <Badge tone={LEVEL_TONE[data.level] ?? 'neutral'}>{LEVEL_LABEL[data.level] ?? data.level}</Badge>
            <Text style={[styles.summary, { color: colors.muted }]}>{data.summary}</Text>
          </View>

          <View style={styles.factorList}>
            {data.factors.map((factor: FinancialHealthFactor) => (
              <View key={factor.key} style={[styles.factorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.factorHeader}>
                  <Text style={[styles.factorLabel, { color: colors.foreground }]}>{factor.label}</Text>
                  <Text style={[styles.factorScore, { color: colors.foreground }]}>{factor.score}/100</Text>
                </View>
                <ProgressBar value={factor.score / 100} tone={factorScoreTone(factor.score)} />
                <Text style={[styles.factorDetail, { color: colors.muted }]}>{factor.detail}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}
    </Screen>
  )
}

function scoreColor(score: number, good: string, mid: string, bad: string): string {
  if (score >= 70) return good
  if (score >= 40) return mid
  return bad
}

function factorScoreTone(score: number): 'success' | 'warning' | 'danger' {
  if (score >= 70) return 'success'
  if (score >= 40) return 'warning'
  return 'danger'
}

const styles = StyleSheet.create({
  scoreCard: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  summary: {
    fontSize: fontSizes.sm,
    textAlign: 'center',
  },
  factorList: {
    gap: spacing.md,
  },
  factorCard: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  factorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  factorLabel: {
    fontSize: fontSizes.md,
    fontWeight: '700',
  },
  factorScore: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
  },
  factorDetail: {
    fontSize: fontSizes.sm,
  },
})