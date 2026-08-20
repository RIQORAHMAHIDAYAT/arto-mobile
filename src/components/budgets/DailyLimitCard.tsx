import { StyleSheet, Text, View } from 'react-native'
import type { DailyLimitInfo } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { isWithinDailyLimit } from '@/domain/dailyLimit'
import { formatRupiah } from '@/lib/currency'
import { fontSizes, radii, spacing, useAppColors } from '@/theme'

interface DailyLimitCardProps {
  info: DailyLimitInfo
}

export function DailyLimitCard({ info }: DailyLimitCardProps) {
  const colors = useAppColors()
  const within = isWithinDailyLimit(info.spentToday, info.dailyLimit)

  const progress = info.dailyLimit > 0 ? Math.min(1, info.spentToday / info.dailyLimit) : 1

  return (
    <View style={[styles.card, { backgroundColor: colors.primary }]}>
      <View style={styles.headerRow}>
        <Text style={styles.overline}>BATAS PENGELUARAN HARIAN</Text>
        <Badge tone={within ? 'success' : 'danger'}>{within ? 'Aman' : 'Melebihi'}</Badge>
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.amount}>{formatRupiah(info.dailyLimit)}</Text>
        <Text style={styles.perDay}>/ hari</Text>
      </View>

      <View style={styles.spentRow}>
        <Text style={styles.spentText}>Hari ini: {formatRupiah(info.spentToday)}</Text>
        {info.remainingToday > 0 ? (
          <Text style={styles.spentText}>Sisa: {formatRupiah(info.remainingToday)}</Text>
        ) : (
          <Text style={styles.spentText}>Sisa: Rp0</Text>
        )}
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>

      <Text style={styles.footerText}>
        Berdasarkan budget {info.categoryName} — sisa {formatRupiah(info.remainingBudget)} untuk{' '}
        {info.remainingDays} hari.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overline: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: fontSizes.xs,
    fontWeight: '800',
    letterSpacing: 1,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  amount: {
    color: '#ffffff',
    fontSize: fontSizes['3xl'],
    fontWeight: '800',
  },
  perDay: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontSizes.md,
  },
  spentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  spentText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: fontSizes.sm,
  },
  progressTrack: {
    height: 6,
    borderRadius: radii.round,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.round,
    backgroundColor: '#ffffff',
  },
  footerText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: fontSizes.xs,
    marginTop: spacing.xs,
  },
})