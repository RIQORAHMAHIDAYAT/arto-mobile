import type { NavigatorScreenParams } from '@react-navigation/native'
import type { Account, Budget, FinancialGoal, Transaction } from '@/types'

export type MainTabParamList = {
  Dashboard: undefined
  Transactions: undefined
  Budgets: undefined
  Goals: undefined
  Settings: undefined
}

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList> | undefined
  Login: undefined
  Register: undefined
  TransactionForm: { editing?: Transaction } | undefined
  BudgetDetail: { id: string }
  BudgetForm: { editing?: Budget } | undefined
  GoalForm: { editing?: FinancialGoal } | undefined
  Analytics: undefined
  FinancialHealth: undefined
  Accounts: undefined
  AccountForm: { editing?: Account } | undefined
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}