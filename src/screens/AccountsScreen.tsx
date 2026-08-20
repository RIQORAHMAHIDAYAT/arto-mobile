import { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { listAccounts, type AccountWithBalance } from '@/api/accounts'
import { AccountCard } from '@/components/accounts/AccountCard'
import { Screen } from '@/components/Screen'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingBlock } from '@/components/ui/LoadingBlock'
import { useAsync } from '@/hooks/useAsync'
import { formatRupiah } from '@/lib/currency'
import { getErrorMessage } from '@/lib/errorMessage'
import type { RootStackParamList } from '@/navigation/types'
import { fontSizes, spacing, useAppColors } from '@/theme'

type Props = NativeStackScreenProps<RootStackParamList, 'Accounts'>

export function AccountsScreen({ navigation }: Props) {
  const colors = useAppColors()
  const { data, loading, error, refetch } = useAsync(() => listAccounts(), [])

  useFocusEffect(
    useCallback(() => {
      refetch()
    }, [refetch]),
  )

  const accounts: AccountWithBalance[] = data ?? []
  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance ?? a.initialBalance ?? 0), 0)

  return (
    <Screen
      subtitle={`Total saldo ${formatRupiah(totalBalance || 0)}`}
      action={
        <Button size="sm" onPress={() => navigation.navigate('AccountForm', {})}>
          + Tambah
        </Button>
      }
      refreshing={loading}
      onRefresh={() => refetch()}
    >
      {error ? <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} /> : null}
      {loading && accounts.length === 0 ? <LoadingBlock /> : null}

      {!loading && !error && accounts.length === 0 ? (
        <EmptyState
          icon="👛"
          title="Belum ada akun"
          description="Tambahkan dompet, rekening bank, atau e-wallet untuk mulai mencatat."
          action={
            <Button onPress={() => navigation.navigate('AccountForm', {})}>Tambah Akun</Button>
          }
        />
      ) : (
        <View style={styles.list}>
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onPress={() => navigation.navigate('AccountForm', { editing: account })}
            />
          ))}
        </View>
      )}

      <View style={[styles.hintBox, { backgroundColor: colors.surfaceHover }]}>
        <Text style={[styles.hint, { color: colors.muted }]}>
          Saldo akun bertambah otomatis saat transaksi dicatat. Sesuaikan saldo hanya untuk koreksi awal.
        </Text>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  hintBox: {
    borderRadius: 12,
    padding: spacing.md,
  },
  hint: {
    fontSize: fontSizes.xs,
    textAlign: 'center',
  },
})