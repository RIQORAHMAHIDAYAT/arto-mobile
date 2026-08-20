import { Alert } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { createAccount, deleteAccount, updateAccount } from '@/api/accounts'
import { AccountForm } from '@/components/accounts/AccountForm'
import { Screen } from '@/components/Screen'
import { Button } from '@/components/ui/Button'
import { getErrorMessage } from '@/lib/errorMessage'
import type { RootStackParamList } from '@/navigation/types'

type Props = NativeStackScreenProps<RootStackParamList, 'AccountForm'>

export function AccountFormScreen({ navigation, route }: Props) {
  const editing = route.params?.editing ?? null

  const handleSubmit = async (input: Parameters<typeof createAccount>[0]) => {
    if (editing) {
      await updateAccount(editing.id, input)
    } else {
      await createAccount(input)
    }
    navigation.goBack()
  }

  const confirmDelete = () => {
    if (!editing) return
    Alert.alert('Hapus Akun', 'Akun ini akan dihapus. Transaksi terkait ikut terhapus. Lanjutkan?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          deleteAccount(editing.id)
            .then(() => navigation.goBack())
            .catch((err) => Alert.alert('Gagal Menghapus', getErrorMessage(err)))
        },
      },
    ])
  }

  return (
    <Screen subtitle="Kelola sumber dana yang kamu gunakan.">
      <AccountForm
        initial={editing}
        error={null}
        onCancel={() => navigation.goBack()}
        onSubmit={handleSubmit}
      />
      {editing ? (
        <Button variant="danger" onPress={confirmDelete}>
          Hapus Akun
        </Button>
      ) : null}
    </Screen>
  )
}