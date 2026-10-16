import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { Category, Transaction } from '@/types'
import { formatDateDayMonth } from '@/lib/date'
import { formatRupiah, formatRupiahSigned } from '@/lib/currency'
import { fontSizes, radii, spacing, useAppColors, withAlpha } from '@/theme'

export interface TransactionRowProps {
  transaction: Transaction
  category?: Category
  accountName?: string
}

/**
 * Memoized agar FlatList tidak re-render seluruh baris setiap scroll
 * (penting untuk perangkat entry-level).
 */
export const TransactionRow = memo(function TransactionRow({
  transaction,
  category,
  accountName,
}: TransactionRowProps) {
  const colors = useAppColors()
  const isExpense = transaction.type === 'expense'
  const signed = isExpense ? -transaction.amount : transaction.amount

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.icon,
          {
            backgroundColor: isExpense ? withAlpha(colors.danger, 0.12) : withAlpha(colors.success, 0.12),
          },
        ]}
      >
        <Text style={styles.iconText}>{category?.icon ?? '📦'}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
          {category?.name ?? 'Tanpa Kategori'}
        </Text>
        <Text style={[styles.meta, { color: colors.muted }]} numberOfLines={1}>
          {formatDateDayMonth(transaction.transactionDate)}
          {accountName ? ` · ${accountName}` : ''}
        </Text>
        {transaction.note ? (
          <Text style={[styles.note, { color: colors.mutedForeground }]} numberOfLines={1}>
            {transaction.note}
          </Text>
        ) : null}
      </View>
      <Text
        accessibilityLabel={isExpense ? 'Pengeluaran' : 'Pemasukan'}
        style={[
          styles.amount,
          {
            color: isExpense ? colors.danger : colors.success,
          },
        ]}
      >
        {isExpense ? formatRupiah(-signed) : formatRupiahSigned(signed)}
      </Text>
    </View>
  )
})

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  meta: {
    fontSize: fontSizes.xs,
  },
  note: {
    fontSize: fontSizes.xs,
  },
  amount: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
  },
})