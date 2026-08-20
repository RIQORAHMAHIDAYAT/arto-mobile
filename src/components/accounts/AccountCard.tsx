import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { AccountWithBalance } from '@/api/accounts'
import { AccountTypePill } from '@/components/accounts/AccountTypePill'
import { formatRupiah } from '@/lib/currency'
import { fontSizes, radii, spacing, useAppColors } from '@/theme'

interface AccountCardProps {
  account: AccountWithBalance
  onPress: () => void
}

export function AccountCard({ account, onPress }: AccountCardProps) {
  const colors = useAppColors()
  const balance = Number(account.balance ?? account.initialBalance ?? 0)

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
          {account.name}
        </Text>
        <AccountTypePill type={account.type} />
      </View>
      <Text style={[styles.balance, { color: colors.foreground }]}>{formatRupiah(balance)}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: spacing.sm,
    shadowOpacity: 0.4,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: fontSizes.md,
    fontWeight: '700',
  },
  balance: {
    fontSize: fontSizes.xl,
    fontWeight: '800',
  },
})