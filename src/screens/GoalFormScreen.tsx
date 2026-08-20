import { Alert } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { createGoal, deleteGoal, updateGoal } from '@/api/goals'
import { GoalForm } from '@/components/goals/GoalForm'
import { Screen } from '@/components/Screen'
import { Button } from '@/components/ui/Button'
import { getErrorMessage } from '@/lib/errorMessage'
import type { RootStackParamList } from '@/navigation/types'

type Props = NativeStackScreenProps<RootStackParamList, 'GoalForm'>

export function GoalFormScreen({ navigation, route }: Props) {
  const editing = route.params?.editing ?? null

  const handleSubmit = async (input: Parameters<typeof createGoal>[0]) => {
    if (editing) {
      await updateGoal(editing.id, input)
    } else {
      await createGoal(input)
    }
    navigation.goBack()
  }

  const confirmDelete = () => {
    if (!editing) return
    Alert.alert('Hapus Goal', 'Goal ini akan dihapus. Lanjutkan?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          deleteGoal(editing.id)
            .then(() => navigation.goBack())
            .catch((err) => Alert.alert('Gagal Menghapus', getErrorMessage(err)))
        },
      },
    ])
  }

  return (
    <Screen subtitle="Tentukan target tabungan dan tenggat waktunya.">
      <GoalForm
        initial={editing}
        error={null}
        onCancel={() => navigation.goBack()}
        onSubmit={handleSubmit}
      />
      {editing ? (
        <Button variant="danger" onPress={confirmDelete}>
          Hapus Goal
        </Button>
      ) : null}
    </Screen>
  )
}