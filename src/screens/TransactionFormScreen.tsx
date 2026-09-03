import { Alert } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { listAccounts } from '@/api/accounts'
import { listCategories } from '@/api/categories'
import { createTransaction, deleteTransaction, updateTransaction } from '@/api/transactions'
import { Screen } from '@/components/Screen'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingBlock } from '@/components/ui/LoadingBlock'
import { useAsync } from '@/hooks/useAsync'
import { getErrorMessage } from '@/lib/errorMessage'
import type { RootStackParamList } from '@/navigation/types'

type Props = NativeStackScreenProps<RootStackParamList, 'TransactionForm'>

export function TransactionFormScreen({ navigation, route }: Props) {
  const editing = route.params?.editing ?? null

  const accountsState = useAsync(() => listAccounts(), [])
  const categoriesState = useAsync(() => listCategories(), [])

  const loading = accountsState.loading || categoriesState.loading
  const error = accountsState.error ?? categoriesState.error

  const handleSubmit = async (
    input: Parameters<typeof createTransaction>[0],
    recurring?: { frequency: string; endDate?: string }
  ) => {
    if (editing) {
      await updateTransaction(editing.id, input)
    } else {
      await createTransaction(input)
      if (recurring) {
        const { createRecurringTransaction } = await import('@/api/transactions')
        await createRecurringTransaction({ ...input, ...recurring })
      }
    }
    navigation.goBack()
  }

  const confirmDelete = () => {
    if (!editing) return
    Alert.alert('Hapus Transaksi', 'Transaksi ini akan dihapus permanen. Lanjutkan?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          deleteTransaction(editing.id)
            .then(() => navigation.goBack())
            .catch((err) => Alert.alert('Gagal Menghapus', getErrorMessage(err)))
        },
      },
    ])
  }

  if (error) {
    return <Screen><ErrorState message={getErrorMessage(error)} /></Screen>
  }

  return (
    <Screen>
      {loading ? (
        <LoadingBlock />
      ) : (
        <TransactionForm
          categories={categoriesState.data ?? []}
          accounts={accountsState.data ?? []}
          initial={editing}
          error={null}
          onCancel={() => navigation.goBack()}
          onSubmit={handleSubmit}
        />
      )}
      {editing ? (
        <Button variant="danger" onPress={confirmDelete}>
          Hapus Transaksi
        </Button>
      ) : null}
    </Screen>
  )
}