import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, View, Alert, FlatList, RefreshControl } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import type { CompositeScreenProps } from '@react-navigation/native'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { listCategories } from '@/api/categories'
import { listTransactions } from '@/api/transactions'
import { getApiUrl, downloadWithAuth } from '@/api/client'
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
import { fontSizes, radii, spacing, useAppColors, withAlpha } from '@/theme'
import type { Transaction, TransactionType } from '@/types'

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Transactions'>,
  NativeStackScreenProps<RootStackParamList>
>

type Filter = 'all' | TransactionType

const SEARCH_DEBOUNCE_MS = 400
const PAGE_SIZE = 15

export function TransactionsScreen({ navigation }: Props) {
  const colors = useAppColors()
  const [filter, setFilter] = useState<Filter>('all')
  /** Nilai yang diketik user (langsung tampil di Input). */
  const [queryInput, setQueryInput] = useState('')
  /** Nilai yang sudah melewati debounce; satu-satunya sumber untuk request. */
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [items, setItems] = useState<Transaction[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadingInitial, setLoadingInitial] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { data: categories } = useAsync(() => listCategories(), [])

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const categoryMap = useMemo(() => {
    const map = new Map<string, { name: string; icon: string }>()
    for (const c of categories ?? []) map.set(c.id, { name: c.name, icon: c.icon })
    return map
  }, [categories])

  const load = useCallback(
    async (nextPage: number, append: boolean, currentQuery: string, currentFilter: Filter) => {
      const result = await listTransactions(
        {
          type: currentFilter === 'all' ? undefined : currentFilter,
          query: currentQuery.trim() || undefined,
        },
        nextPage,
        PAGE_SIZE,
      )
      setPage(nextPage)
      setTotalPages(result.totalPages)
      setTotalCount(result.total)
      setItems((prev) => (append ? [...prev, ...result.items] : result.items))
      return result.items.length
    },
    [],
  )

  const fetchData = useCallback(
    async (isInitial = true) => {
      if (isInitial) setLoadingInitial(true)
      setError(null)
      try {
        await load(1, false, debouncedQuery, filter)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Terjadi kesalahan tak terduga.'))
      } finally {
        if (isInitial) setLoadingInitial(false)
      }
    },
    [load, debouncedQuery, filter],
  )

  // Refetch saat screen regain focus, saat filter berubah, dan setelah debounce.
  useFocusEffect(
    useCallback(() => {
      void fetchData(true)
    }, [fetchData]),
  )

  const handleSearch = useCallback((text: string) => {
    setQueryInput(text)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setDebouncedQuery(text)
    }, SEARCH_DEBOUNCE_MS)
  }, [])

  // Jangan setState setelah unmount / timer menggantung di memory.
  useEffect(
    () => () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current)
    },
    [],
  )

  const handleFilterChange = useCallback((next: Filter) => {
    setFilter(next)
    setPage(1)
  }, [])

  const handleLoadMore = useCallback(async () => {
    if (page >= totalPages || loadingMore) return
    setLoadingMore(true)
    try {
      const added = await load(page + 1, true, debouncedQuery, filter)
      if (added === 0) setTotalPages(page)
    } catch {
      setError(new Error('Gagal memuat transaksi berikutnya. Tarik untuk mencoba lagi.'))
    } finally {
      setLoadingMore(false)
    }
  }, [page, totalPages, loadingMore, load, debouncedQuery, filter])

  const exportUrl = useCallback((format: 'csv' | 'pdf') => {
    const params = new URLSearchParams()
    if (filter !== 'all') params.set('type', filter)
    if (debouncedQuery.trim()) params.set('query', debouncedQuery.trim())
    const queryString = params.toString()
    return `${getApiUrl()}/transactions/export/${format}${queryString ? `?${queryString}` : ''}`
  }, [filter, debouncedQuery])

  const handleExport = useCallback(
    async (format: 'csv' | 'pdf') => {
      try {
        const { uri } = await downloadWithAuth(exportUrl(format), `transactions.${format}`)

        const mimeType = format === 'csv' ? 'text/csv' : 'application/pdf'
        const uti = format === 'csv' ? 'public.comma-separated-values-text' : 'com.adobe.pdf'
        await Sharing.shareAsync(uri, { UTI: uti, mimeType })
      } catch (err) {
        Alert.alert('Gagal mengekspor', getErrorMessage(err))
      }
    },
    [exportUrl],
  )

  const renderItem = useCallback(
    ({ item: tx, index }: { item: Transaction; index: number }) => {
      const cat = categoryMap.get(tx.categoryId)
      const category = cat
        ? { id: tx.categoryId, userId: null, name: cat.name, type: tx.type, icon: cat.icon, createdAt: '' }
        : undefined
      return (
        <Pressable
          onPress={() => navigation.navigate('TransactionForm', { editing: tx })}
          accessibilityRole="button"
        >
          {index > 0 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
          <TransactionRow transaction={tx} category={category} />
        </Pressable>
      )
    },
    [categoryMap, colors.border, navigation],
  )

  const listEmpty = useMemo(
    () =>
      loadingInitial ? null : (
        <EmptyState
          icon="📦"
          title="Belum ada transaksi"
          description="Catat pemasukan atau pengeluaran pertamamu."
          action={<Button onPress={() => navigation.navigate('TransactionForm', {})}>Tambah Transaksi</Button>}
        />
      ),
    [loadingInitial, navigation],
  )

  return (
    <Screen
      title="Transaksi"
      subtitle={`${totalCount} transaksi`}
      scrollable={false}
      action={
        <View style={styles.headerActions}>
          <Button size="sm" variant="ghost" onPress={() => void handleExport('csv')}>
            ↓ CSV
          </Button>
          <Button size="sm" variant="ghost" onPress={() => void handleExport('pdf')}>
            ↓ PDF
          </Button>
          <Button size="sm" onPress={() => navigation.navigate('TransactionForm', {})}>
            + Tambah
          </Button>
        </View>
      }
    >
      <Input
        placeholder="Cari transaksi…"
        value={queryInput}
        onChangeText={handleSearch}
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
              onPress={() => handleFilterChange(f)}
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

      <FlatList
        style={styles.list}
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onEndReached={() => void handleLoadMore()}
        onEndReachedThreshold={0.5}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={loadingInitial}
            onRefresh={() => void fetchData(true)}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={listEmpty}
        ListFooterComponent={loadingMore ? <LoadingBlock /> : null}
        contentContainerStyle={[
          styles.listContent,
          items.length === 0 ? styles.listContentEmpty : null,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      />

      {error ? <ErrorState message={getErrorMessage(error)} onRetry={() => void fetchData(true)} /> : null}
    </Screen>
  )
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
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
  list: {
    flex: 1,
  },
  listContent: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
})