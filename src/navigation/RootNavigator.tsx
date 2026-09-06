import { useMemo, useEffect } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { DarkTheme, DefaultTheme, NavigationContainer, useNavigation } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator, type NativeStackNavigationProp } from '@react-navigation/native-stack'
import { StatusBar } from 'expo-status-bar'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { darkColors, fontSizes, lightColors, radii, spacing, useAppColors } from '@/theme'
import type { MainTabParamList, RootStackParamList } from '@/navigation/types'
import { AccountsScreen } from '@/screens/AccountsScreen'
import { AccountFormScreen } from '@/screens/AccountFormScreen'
import { AnalyticsScreen } from '@/screens/AnalyticsScreen'
import { BudgetDetailScreen } from '@/screens/BudgetDetailScreen'
import { BudgetFormScreen } from '@/screens/BudgetFormScreen'
import { BudgetsScreen } from '@/screens/BudgetsScreen'
import { DashboardScreen } from '@/screens/DashboardScreen'
import { FinancialHealthScreen } from '@/screens/FinancialHealthScreen'
import { GoalFormScreen } from '@/screens/GoalFormScreen'
import { GoalsScreen } from '@/screens/GoalsScreen'
import { LoginScreen } from '@/screens/auth/LoginScreen'
import { RegisterScreen } from '@/screens/auth/RegisterScreen'
import { SettingsScreen } from '@/screens/SettingsScreen'
import { TransactionFormScreen } from '@/screens/TransactionFormScreen'
import { TransactionsScreen } from '@/screens/TransactionsScreen'
import { RecurringTransactionsScreen } from '@/screens/RecurringTransactionsScreen'

const Tab = createBottomTabNavigator<MainTabParamList>()
const Stack = createNativeStackNavigator<RootStackParamList>()

const TAB_ICONS: Record<keyof MainTabParamList, string> = {
  Dashboard: '🏠',
  Transactions: '💸',
  Budgets: '🎯',
  Goals: '💰',
  Settings: '⚙️',
}

function MainTabs() {
  const colors = useAppColors()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  return (
    <View style={styles.mainTabs}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.muted,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: () => <Text style={styles.tabIcon}>{TAB_ICONS[route.name]}</Text>,
          tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Beranda' }} />
        <Tab.Screen name="Transactions" component={TransactionsScreen} options={{ tabBarLabel: 'Transaksi' }} />
        <Tab.Screen name="Budgets" component={BudgetsScreen} options={{ tabBarLabel: 'Budget' }} />
        <Tab.Screen name="Goals" component={GoalsScreen} options={{ tabBarLabel: 'Goal' }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Akun' }} />
      </Tab.Navigator>

      {/* Quick action: catat transaksi cepat */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Catat transaksi baru"
        onPress={() => navigation.navigate('TransactionForm', {})}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
    </View>
  )
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  )
}

import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import { registerDeviceToken } from '@/api/notifications'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function AuthedStack() {
  const colors = useAppColors()

  useEffect(() => {
    async function setupNotifications() {
      if (!Device.isDevice) {
        return;
      }
      const existingPermissions = (await Notifications.getPermissionsAsync()) as any;
      let isGranted = existingPermissions.status === 'granted' || existingPermissions.granted;
      
      if (!isGranted) {
        const requestedPermissions = (await Notifications.requestPermissionsAsync()) as any;
        isGranted = requestedPermissions.status === 'granted' || requestedPermissions.granted;
      }
      
      if (!isGranted) {
        return;
      }
      try {
        const projectId = 'arto-project'; // Replace with real expo project ID if applicable
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        const platform = Platform.OS;
        await registerDeviceToken(tokenData.data, platform);
      } catch (err) {
        console.warn('Gagal mendaftar push token:', err);
      }
    }
    setupNotifications();
  }, []);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.foreground,
        headerTitleStyle: styles.headerTitle,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="TransactionForm"
        component={TransactionFormScreen}
        options={{ title: 'Transaksi', presentation: 'modal' }}
      />
      <Stack.Screen name="BudgetDetail" component={BudgetDetailScreen} options={{ title: 'Detail Budget' }} />
      <Stack.Screen name="BudgetForm" component={BudgetFormScreen} options={{ title: 'Budget' }} />
      <Stack.Screen name="GoalForm" component={GoalFormScreen} options={{ title: 'Goal' }} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Analisis' }} />
      <Stack.Screen name="FinancialHealth" component={FinancialHealthScreen} options={{ title: 'Kesehatan Finansial' }} />
      <Stack.Screen name="Accounts" component={AccountsScreen} options={{ title: 'Akun' }} />
      <Stack.Screen name="AccountForm" component={AccountFormScreen} options={{ title: 'Akun' }} />
      <Stack.Screen name="RecurringTransactions" component={RecurringTransactionsScreen} options={{ title: 'Transaksi Rutin' }} />
    </Stack.Navigator>
  )
}

function SplashScreen() {
  const colors = useAppColors()
  return (
    <SafeAreaView style={[styles.splash, { backgroundColor: colors.background }]}>
      <Text style={[styles.splashLogo, { color: colors.primary }]}>ARTO</Text>
      <ActivityIndicator size="large" color={colors.primary} />
    </SafeAreaView>
  )
}

export function RootNavigator() {
  const { resolvedTheme } = useTheme()
  const { user, initializing } = useAuth()

  const navTheme = useMemo(() => {
    const base = resolvedTheme === 'dark' ? DarkTheme : DefaultTheme
    const tokens = resolvedTheme === 'dark' ? darkColors : lightColors
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: tokens.primary,
        background: tokens.background,
        card: tokens.surface,
        text: tokens.foreground,
        border: tokens.border,
        notification: tokens.danger,
      },
    }
  }, [resolvedTheme])

  if (initializing) return <SplashScreen />

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      {user ? <AuthedStack /> : <AuthStack />}
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  mainTabs: {
    flex: 1,
  },
  tabLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
  tabIcon: {
    fontSize: 18,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 84,
    width: 56,
    height: 56,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    zIndex: 10,
  },
  fabIcon: {
    color: '#ffffff',
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '700',
  },
  headerTitle: {
    fontWeight: '700',
  },
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  splashLogo: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 2,
  },
})