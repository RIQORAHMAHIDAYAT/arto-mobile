import { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { getDashboardSummary } from '@/api/dashboard'
import { listTransactions, createTransaction } from '@/api/transactions'
import { Screen } from '@/components/Screen'
import { TransactionRow } from '@/components/transactions/TransactionRow'
import { MobileQuickAdd } from '@/components/transactions/MobileQuickAdd'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingBlock } from '@/components/ui/LoadingBlock'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/context/AuthContext'
import { formatRupiah } from '@/lib/currency'
import { getErrorMessage } from '@/lib/errorMessage'
import type { MainTabParamList, RootStackParamList } from '@/navigation/types'
import { fontSizes, radii, spacing, useAppColors } from '@/theme'
import type { CompositeScreenProps } from '@react-navigation/native'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Dashboard'>,
  NativeStackScreenProps<RootStackParamList>
>

export function DashboardScreen({ navigation: _navigation }: Props) {
  const colors = useAppColors()
  const { user } = useAuth()
  
  const { data, loading, error, refetch } = useAsync(async () => {
    const [summary, txs] = await Promise.all([
      getDashboardSummary(),
      listTransactions({}, 1, 50)
    ])
    return { summary, transactions: txs.items }
  }, [])

  useFocusEffect(
    useCallback(() => {
      void refetch()
    }, [refetch]),
  )

  const firstName = user?.name?.split(' ')[0] ?? ''

  const handleAdd = async (type: 'income' | 'expense', amount: number, note: string) => {
    if (!data?.summary) return
    try {
      // Pick first default values just for quick-add
      const categoryId = '' // API will handle default or we assume one
      const accountId = '' 
      
      await createTransaction({
        type,
        amount,
        note,
        transactionDate: new Date().toISOString(),
        categoryId, // In a real app we'd map this properly
        accountId,
      })
      await refetch()
    } catch {
      alert('Gagal menambah transaksi')
    }
  }

  // Calculate running balances
  const txList = data?.transactions || []
  const reversed = [...txList].reverse()
  let currentBal = 0
  const balMap = new Map<string, number>()
  reversed.forEach(t => {
    currentBal += (t.type === 'income' ? t.amount : -t.amount)
    balMap.set(t.id, currentBal)
  })

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Screen
        title={`Halo, ${firstName || 'Sobat ARTO'} 👋`}
        subtitle="Buku Kas (Ledger)"
        refreshing={loading}
        onRefresh={() => void refetch()}
      >
        {error ? (
          <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
        ) : loading && !data ? (
          <View style={{ paddingTop: 40 }}>
             <LoadingBlock label="Memuat buku kas..." />
          </View>
        ) : (
          <>
            {/* Ringkasan Keuangan Gaya Excel */}
            <View style={[styles.summaryBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.summaryTitle, { color: colors.foreground }]}>RINGKASAN KEUANGAN</Text>
              
              <View style={styles.summaryRow}>
                <Text style={{ color: colors.foreground }}>Total Pemasukan</Text>
                <Text style={{ color: colors.success, fontWeight: '600' }}>
                  {data ? formatRupiah(data.summary.totalIncome) : '…'}
                </Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={{ color: colors.foreground }}>Total Pengeluaran</Text>
                <Text style={{ color: colors.danger, fontWeight: '600' }}>
                  {data ? formatRupiah(data.summary.totalExpense) : '…'}
                </Text>
              </View>
              
              <View style={[styles.summaryRow, styles.summaryHighlight, { backgroundColor: colors.success + '20' }]}>
                <Text style={[styles.summaryHighlightText, { color: colors.foreground }]}>SALDO SAAT INI</Text>
                <Text style={[styles.summaryHighlightText, { color: colors.foreground }]}>
                  {data ? formatRupiah(data.summary.totalBalance) : '…'}
                </Text>
              </View>
            </View>

            {/* Daftar Transaksi (Ledger Vertikal) */}
            <View style={[styles.ledgerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.ledgerTitle, { color: colors.foreground }]}>Riwayat & Saldo Berjalan</Text>
              
              {txList.length === 0 ? (
                <View style={styles.emptyStateContainer} accessible={true} accessibilityLabel="Belum ada transaksi. Gunakan form di bawah untuk mencatat transaksi pertamamu">
                  <Text style={[styles.emptyText, { color: colors.foreground }]}>Belum ada transaksi 🍃</Text>
                  <Text style={[styles.emptySubText, { color: colors.muted }]}>Mulai catat pemasukan atau pengeluaran pertamamu menggunakan form di bawah 👇</Text>
                </View>
              ) : (
                txList.map((tx, idx) => (
                  <View key={tx.id}>
                    {idx > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                    <TransactionRow transaction={tx} />
                    <Text style={[styles.runningBalance, { color: colors.mutedForeground }]}>
                      Saldo: {formatRupiah(balMap.get(tx.id) || 0)}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </Screen>
      
      {/* Quick Add selalu di bawah */}
      <MobileQuickAdd onAdd={handleAdd} />
    </View>
  )
}

const styles = StyleSheet.create({
  summaryBox: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  summaryTitle: {
    fontSize: fontSizes.md,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  summaryHighlight: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
  },
  summaryHighlightText: {
    fontWeight: '800',
    fontSize: fontSizes.md,
  },
  ledgerCard: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xl,
  },
  ledgerTitle: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  emptyStateContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: fontSizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  runningBalance: {
    fontSize: fontSizes.xs,
    textAlign: 'right',
    marginTop: -8,
    marginBottom: 8,
    fontWeight: '600'
  }
})