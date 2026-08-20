import { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import type { CompositeScreenProps } from '@react-navigation/native'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { listGoals } from '@/api/goals'
import { GoalCard } from '@/components/goals/GoalCard'
import { Screen } from '@/components/Screen'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingBlock } from '@/components/ui/LoadingBlock'
import { useAsync } from '@/hooks/useAsync'
import { getErrorMessage } from '@/lib/errorMessage'
import type { MainTabParamList, RootStackParamList } from '@/navigation/types'
import { spacing } from '@/theme'

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Goals'>,
  NativeStackScreenProps<RootStackParamList>
>

export function GoalsScreen({ navigation }: Props) {
  const { data, loading, error, refetch } = useAsync(() => listGoals(), [])

  useFocusEffect(
    useCallback(() => {
      refetch()
    }, [refetch]),
  )

  const goals = data ?? []

  return (
    <Screen
      title="Goal Keuangan"
      subtitle={`${goals.length} goal aktif`}
      action={
        <Button size="sm" onPress={() => navigation.navigate('GoalForm', {})}>
          + Tambah
        </Button>
      }
      refreshing={loading}
      onRefresh={() => refetch()}
    >
      {error ? <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} /> : null}
      {loading && goals.length === 0 ? <LoadingBlock /> : null}

      {!loading && !error && goals.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="Belum ada goal"
          description="Tentukan target keuanganmu, misalnya dana darurat atau liburan."
          action={
            <Button onPress={() => navigation.navigate('GoalForm', {})}>Buat Goal</Button>
          }
        />
      ) : (
        <View style={styles.list}>
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onPress={() => navigation.navigate('GoalForm', { editing: goal })} />
          ))}
        </View>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
})