export type TransactionType = 'income' | 'expense'
export type AccountType = 'cash' | 'bank' | 'ewallet'
export type ThemePreference = 'light' | 'dark' | 'system'
export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN'

export interface User {
  id: string
  email: string
  name: string
  theme: ThemePreference
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface Credentials {
  name?: string
  email: string
  password: string
}

export interface Session {
  accessToken: string
  refreshToken: string
  user: User
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface Account {
  id: string
  userId: string
  name: string
  type: AccountType
  initialBalance: number
  balance?: number
  createdAt: string
  updatedAt: string
}

export interface AccountInput {
  name: string
  type: AccountType
  initialBalance?: number
}

export interface Category {
  id: string
  userId: string | null
  name: string
  type: TransactionType
  icon: string
  createdAt: string
}

export interface CategoryInput {
  name: string
  type: TransactionType
  icon?: string
}

export interface Transaction {
  id: string
  userId: string
  accountId: string
  categoryId: string
  type: TransactionType
  amount: number
  transactionDate: string
  note: string | null
  createdAt: string
  updatedAt: string
}

export interface TransactionInput {
  accountId: string
  categoryId: string
  type: TransactionType
  amount: number
  transactionDate: string
  note?: string | null
}

export interface TransactionFilters {
  type?: TransactionType
  categoryId?: string
  accountId?: string
  from?: string
  to?: string
  query?: string
}

export interface Paginated<T> {
  items: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface Budget {
  id: string
  userId: string
  categoryId: string
  amount: number
  periodStart: string
  periodEnd: string
  createdAt: string
  updatedAt: string
}

export interface BudgetWithMeta extends Budget {
  spent: number
  utilization: number
  categoryName: string
  categoryIcon: string
}

export interface BudgetInput {
  categoryId: string
  amount: number
  periodStart: string
  periodEnd: string
}

export interface BudgetSummaryItem {
  budgetId: string
  categoryId: string
  categoryName: string
  categoryIcon: string
  spent: number
  amount: number
  utilization: number
}

export interface DailyLimitInfo {
  budgetId: string
  categoryName: string
  periodEnd: string
  remainingBudget: number
  remainingDays: number
  dailyLimit: number
  spentToday: number
  remainingToday: number
}

export interface SpendingChartPoint {
  date: string
  income: number
  expense: number
}

export interface DashboardSummary {
  totalBalance: number
  totalIncome: number
  totalExpense: number
  periodLabel: string
  recentTransactions: Transaction[]
  budgetSummary: BudgetSummaryItem[]
  dailyLimit: DailyLimitInfo | null
  spendingChart: SpendingChartPoint[]
}

export interface CategoryStat {
  categoryId: string
  categoryName: string
  categoryIcon: string
  amount: number
  percentage: number
}

export interface TrendPoint {
  label: string
  income: number
  expense: number
}

export interface AnalyticsSummary {
  income: number
  expense: number
  net: number
  averageSpending: number
  transactionCount: number
}

export interface FinancialGoal {
  id: string
  userId: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string | null
  createdAt: string
  updatedAt: string
}

export interface GoalWithMeta extends FinancialGoal {
  progress: number
  remaining: number
  remainingDays: number | null
  requiredDaily: number | null
}

export interface FinancialGoalInput {
  name: string
  targetAmount: number
  currentAmount?: number
  deadline?: string | null
}

export interface FinancialHealthFactor {
  key: 'savingRate' | 'budgetDiscipline' | 'expenseStability' | 'goalProgress'
  label: string
  description: string
  score: number
  detail: string
}

export interface FinancialHealthReport {
  score: number
  level: 'baik' | 'cukup' | 'perlu-pemantauan'
  summary: string
  factors: FinancialHealthFactor[]
}