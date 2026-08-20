import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { createBudget, updateBudget } from '@/api/budgets'
import { listCategories } from '@/api/categories'
import { BudgetForm } from '@/components/budgets/BudgetForm'
import { Screen } from '@/components/Screen'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingBlock } from '@/components/ui/LoadingBlock'
import { useAsync } from '@/hooks/useAsync'
import { getErrorMessage } from '@/lib/errorMessage'
import type { RootStackParamList } from '@/navigation/types'

type Props = NativeStackScreenProps<RootStackParamList, 'BudgetForm'>

export function BudgetFormScreen({ navigation, route }: Props) {
  const editing = route.params?.editing ?? null
  const categoriesState = useAsync(() => listCategories(), [])

  const handleSubmit = async (input: Parameters<typeof createBudget>[0]) => {
    if (editing) {
      await updateBudget(editing.id, input)
    } else {
      await createBudget(input)
    }
    navigation.goBack()
  }

  if (categoriesState.error) {
    return (
      <Screen>
        <ErrorState message={getErrorMessage(categoriesState.error)} onRetry={() => categoriesState.refetch()} />
      </Screen>
    )
  }

  return (
    <Screen subtitle="Atur batas belanja per kategori per periode.">
      {categoriesState.loading && !categoriesState.data ? (
        <LoadingBlock />
      ) : (
        <BudgetForm
          categories={categoriesState.data ?? []}
          initial={editing}
          error={null}
          onCancel={() => navigation.goBack()}
          onSubmit={handleSubmit}
        />
      )}
    </Screen>
  )
}