import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { Account, AccountInput, AccountType } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { parseAmountText, sanitizeAmountInput } from '@/lib/currency'
import { getErrorMessage } from '@/lib/errorMessage'
import { radii, spacing, useAppColors } from '@/theme'

interface AccountFormProps {
  initial?: Account | null
  loading?: boolean
  error?: string | null
  onCancel?: () => void
  onSubmit: (input: AccountInput) => Promise<void>
}

export function AccountForm({ initial, loading, error, onCancel, onSubmit }: AccountFormProps) {
  const colors = useAppColors()
  const [name, setName] = useState(initial?.name ?? '')
  const [type, setType] = useState<AccountType>(initial?.type ?? 'cash')
  const [initialBalance, setInitialBalance] = useState(
    initial !== null && initial !== undefined && initial.balance != null && initial.balance > 0
      ? String(initial.balance)
      : '',
  )
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setSubmitError(null)
    const cleanedName = name.trim()
    if (!cleanedName) {
      setSubmitError('Nama akun wajib diisi.')
      return
    }
    const balance = parseAmountText(initialBalance)
    if (initialBalance && balance === null) {
      setSubmitError('Saldo awal harus berupa angka yang valid.')
      return
    }
    try {
      await onSubmit({
        name: cleanedName,
        type,
        initialBalance: initialBalance ? (balance ?? 0) : 0,
      })
    } catch (err) {
      setSubmitError(getErrorMessage(err))
    }
  }

  const shownError = submitError ?? error

  return (
    <View style={styles.wrapper}>
      <Input label="Nama Akun" placeholder="contoh: Rekening Mandiri" value={name} onChangeText={setName} />

      <Select
        label="Jenis Akun"
        value={type}
        onChange={(value) => setType(value as AccountType)}
        options={[
          { value: 'cash', label: '💵 Tunai' },
          { value: 'bank', label: '🏦 Bank' },
          { value: 'ewallet', label: '📱 E-Wallet' },
        ]}
      />

      <Input
        label="Saldo Awal (Rp, opsional)"
        keyboardType="number-pad"
        placeholder="0"
        value={initialBalance}
        onChangeText={(text) => setInitialBalance(sanitizeAmountInput(text))}
        hint={initial ? 'Saldo saat ini dapat disesuaikan.' : 'Saldo saat akun pertama dibuat.'}
      />

      {shownError ? (
        <Text accessibilityRole="alert" style={[styles.errorBox, { backgroundColor: withAlpha(colors.danger, 0.1), color: colors.danger }]}>
          {shownError}
        </Text>
      ) : null}

      <View style={styles.footer}>
        {onCancel && (
          <Button variant="ghost" onPress={onCancel}>
            Batal
          </Button>
        )}
        <View style={styles.footerSpacer} />
        <Button loading={loading} onPress={() => void handleSubmit()}>
          {initial ? 'Simpan Perubahan' : 'Tambah Akun'}
        </Button>
      </View>
    </View>
  )
}

function withAlpha(hexColor: string, alpha: number): string {
  if (hexColor.startsWith('#') && hexColor.length === 7) {
    const r = Number.parseInt(hexColor.slice(1, 3), 16)
    const g = Number.parseInt(hexColor.slice(3, 5), 16)
    const b = Number.parseInt(hexColor.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  return hexColor
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.lg,
  },
  errorBox: {
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  footerSpacer: {
    flex: 1,
  },
})