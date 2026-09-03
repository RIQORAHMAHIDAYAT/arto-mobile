import { useState, useCallback } from 'react'
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { listRecurringTransactions, deleteRecurringTransaction } from '@/api/transactions'
import { Screen } from '@/components/Screen'
import { Button } from '@/components/ui/Button'
import { LoadingBlock } from '@/components/ui/LoadingBlock'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatRupiah } from '@/lib/currency'
import { getErrorMessage } from '@/lib/errorMessage'
import { fontSizes, radii, spacing, useAppColors } from '@/theme'

export function RecurringTransactionsScreen() {
  const colors = useAppColors()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listRecurringTransactions()
      setData(res)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load])
  )

  const handleDelete = async (id: string) => {
    Alert.alert('Hentikan Transaksi Rutin', 'Apakah Anda yakin ingin menghentikan transaksi ini?', [
      { text: 'Batal', style: 'cancel' },
      { 
        text: 'Hentikan', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await deleteRecurringTransaction(id)
            await load()
          } catch (err) {
            Alert.alert('Gagal', getErrorMessage(err))
          }
        } 
      }
    ])
  }

  if (loading && data.length === 0) return <LoadingBlock label="Memuat..." />
  if (error && data.length === 0) return <ErrorState title="Gagal memuat" message={error} onRetry={load} />

  return (
    <Screen scrollable={false}>
      {data.length === 0 ? (
        <EmptyState title="Tidak ada transaksi rutin" description="Anda belum mengatur transaksi otomatis." />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: colors.foreground }]}>{item.note || (item.category?.name ?? 'Transaksi Rutin')}</Text>
                <Text style={[styles.subtitle, { color: colors.muted }]}>
                  {formatRupiah(item.amount)} • {item.frequency}
                </Text>
              </View>
              <Button size="sm" variant="secondary" onPress={() => handleDelete(item.id)}>Hentikan</Button>
            </View>
          )}
        />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: 'bold',
    fontSize: fontSizes.sm,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: fontSizes.xs,
  }
})
