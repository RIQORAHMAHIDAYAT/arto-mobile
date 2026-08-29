import { useCallback, useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import type { CompositeScreenProps } from '@react-navigation/native'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { listCategories } from '@/api/categories'
import { listTransactions } from '@/api/transactions'
import { getAccessToken, getApiUrl } from '@/api/client'
import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import { Screen } from '@/components/Screen'
import { TransactionRow } from '@/components/transactions/TransactionRow'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { LoadingBlock } from '@/components/ui/LoadingBlock'
import { useAsync } from '@/hooks/useAsync'
import { getErrorMessage } from '@/lib/errorMessage'
import type { MainTabParamList, RootStackParamList } from '@/navigation/types'
import { fontSizes, radii, spacing, useAppColors } from '@/theme'
import type { Transaction, TransactionType } from '@/types'

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Transactions'>,
  NativeStackScreenProps<RootStackParamList>
>

type Filter = 'all' | TransactionType

export function TransactionsScreen({ navigation }: Props) {
  const colors = useAppColors()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<Transaction[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const { data: categories } = useAsync(() => listCategories(), [])

  const categoryMap = useMemo(() => {
    const map = new Map<string, { name: string; icon: string }>()
    for (const c of categories ?? []) map.set(c.id, { name: c.name, icon: c.icon })
    return map
  }, [categories])

  const load = useCallback(async (nextPage: number, append = false) => {
    const result = await listTransactions(
      {
        type: filter === 'all' ? undefined : filter,
        query: query.trim() || undefined,
      },
      nextPage,
      15,
    )
    setPage(nextPage)
    setTotalPages(result.totalPages)
    setTotalCount(result.total)
    setItems((prev) => (append ? [...prev, ...result.items] : result.items))
    return result.items.length
  }, [filter, query])

  const { loading, error, refetch } = useAsync(
    useCallback(() => load(1, false), [load]),
    [load],
  )

  useFocusEffect(
    useCallback(() => {
      void refetch()
    }, [refetch]),
  )

  const handleLoadMore = async () => {
    if (page >= totalPages || loadingMore) return
    setLoadingMore(true)
    try {
      await load(page + 1, true)
    } catch {
      // tetap berhenti loading-more; user bisa menggeser untuk retry
    } finally {
      setLoadingMore(false)
    }
  }

  const handleExport = async () => {
    try {
      const url = `${getApiUrl()}/transactions/export/csv${filter !== 'all' ? `?type=${filter}` : ''}${query ? (filter !== 'all' ? `&query=${query}` : `?query=${query}`) : ''}`
      const token = await getAccessToken()
      const fileUri = `${FileSystem.documentDirectory}transactions.csv`

      const { uri, status } = await FileSystem.downloadAsync(url, fileUri, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (status !== 200) throw new Error('Gagal mengunduh file CSV')
      
      await Sharing.shareAsync(uri, { UTI: 'public.comma-separated-values-text', mimeType: 'text/csv' })
    } catch (err) {
      alert(getErrorMessage(err))
    }
  }

  return (
    <Screen
      title="Transaksi"
      subtitle={`${totalCount} transaksi`}
      action={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button size="sm" variant="ghost" onPress={() => void handleExport()}>
            📥
          </Button>
          <Button size="sm" onPress={() => navigation.navigate('TransactionForm', {})}>
            + Tambah
          </Button>
        </View>
      }
      refreshing={loading}
      onRefresh={() => void refetch()}
    >
      <Input
        placeholder="Cari transaksi…"
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
        returnKeyType="search"
      />

      <View style={styles.filterRow}>
        {(['all', 'expense', 'income'] as const).map((f) => {
          const active = filter === f
          const label = f === 'all' ? 'Semua' : f === 'expense' ? 'Pengeluaran' : 'Pemasukan'
          const activeColor = f === 'expense' ? colors.danger : f === 'income' ? colors.success : colors.primary
          return (
            <Pressable
              key={f}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => {
                setFilter(f)
                setPage(1)
              }}
              style={[
                styles.filterChip,
                {
                  borderColor: active ? activeColor : colors.border,
                  backgroundColor: active ? withAlpha(activeColor, 0.1) : 'transparent',
                },
              ]}
            >
              <Text style={[styles.filterText, { color: active ? activeColor : colors.muted }]}>{label}</Text>
            </Pressable>
          )
        })}
      </View>

      {error ? <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} /> : null}
      {loading && items.length === 0 ? <LoadingBlock /> : null}
      {!loading && !error && items.length === 0 ? (
        <EmptyState
          icon="🧾"
          title="Belum ada transaksi"
          description="Catat pemasukan atau pengeluaran pertamamu."
          action={
            <Button onPress={() => navigation.navigate('TransactionForm', {})}>Tambah Transaksi</Button>
          }
        />
      ) : (
        <View style={[styles.listCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {items.map((tx, index) => {
            const cat = categoryMap.get(tx.categoryId)
            const category = cat
              ? { id: tx.categoryId, userId: null, name: cat.name, type: tx.type, icon: cat.icon, createdAt: '' }
              : undefined
            return (
              <View key={tx.id}>
                {index > 0 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
                <Pressable
                  onPress={() => navigation.navigate('TransactionForm', { editing: tx })}
                  accessibilityRole="button"
                >
                  <TransactionRow transaction={tx} category={category} />
                </Pressable>
              </View>
            )
          })}
        </View>
      )}

      {page < totalPages ? (
        <Button variant="ghost" loading={loadingMore} onPress={() => void handleLoadMore()}>
          Muat lebih banyak
        </Button>
      ) : (
        items.length > 0 && <Text style={[styles.endText, { color: colors.mutedForeground }]}>Semua sudah dimuat</Text>
      )}
    </Screen>
  )
}

function withAlpha(hexColor: string, alpha: number): string {
  if (hexColor.startsWith('#') && hexColor.length === 7) {
    const r = Number.parseInt(hexColor.slice(1, 3), 16)
    const g = Number.parseInt(hexColor.slice(3, 5), 16)
    const b = Number.parseInt(hexColor.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  return hexColor
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterChip: {
    flex: 1,
    height: 36,
    borderRadius: radii.round,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
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
  endText: {
    textAlign: 'center',
    fontSize: fontSizes.sm,
  },
})