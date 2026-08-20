import { useEffect, useMemo, useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import type { Account, Category, Transaction, TransactionInput, TransactionType } from '@/types'
import { Button } from '@/components/ui/Button'
import { DateField } from '@/components/ui/DateField'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { toISODate } from '@/lib/date'
import { parseAmountText, sanitizeAmountInput } from '@/lib/currency'
import { getErrorMessage } from '@/lib/errorMessage'
import { fontSizes, radii, spacing, useAppColors } from '@/theme'

interface TransactionFormProps {
  categories: Category[]
  accounts: Account[]
  initial?: Transaction | null
  defaultType?: TransactionType
  loading?: boolean
  error?: string | null
  onCancel?: () => void
  onSubmit: (input: TransactionInput) => Promise<void>
}

export function TransactionForm({
  categories,
  accounts,
  initial,
  defaultType = 'expense',
  loading,
  error,
  onCancel,
  onSubmit,
}: TransactionFormProps) {
  const colors = useAppColors()
  const [type, setType] = useState<TransactionType>(initial?.type ?? defaultType)
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '')
  const [accountId, setAccountId] = useState(initial?.accountId ?? '')
  const [date, setDate] = useState(initial?.transactionDate ?? toISODate(new Date()))
  const [note, setNote] = useState(initial?.note ?? '')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const matchingCategories = useMemo(() => categories.filter((c) => c.type === type), [categories, type])

  // eslint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    if (accounts.length > 0 && !accountId)
      // eslint-disable-next-line react/set-state-in-effect
      setAccountId(accounts[0].id)
  }, [accounts, accountId])

  // eslint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    if (matchingCategories.length > 0 && !matchingCategories.some((c) => c.id === categoryId)) {
      // eslint-disable-next-line react/set-state-in-effect
      setCategoryId(matchingCategories[0].id)
    }
    if (matchingCategories.length === 0)
      // eslint-disable-next-line react/set-state-in-effect
      setCategoryId('')
  }, [matchingCategories, categoryId])

  const switchType = (next: TransactionType) => {
    setType(next)
    setCategoryId('')
  }

  const handleSubmit = async () => {
    setSubmitError(null)
    const value = parseAmountText(amount)
    if (value === null) {
      setSubmitError('Nominal harus berupa angka yang valid.')
      return
    }
    if (!categoryId) {
      setSubmitError('Pilih kategori terlebih dahulu.')
      return
    }
    if (!accountId) {
      setSubmitError('Pilih akun terlebih dahulu.')
      return
    }
    try {
      await onSubmit({ type, amount: value, categoryId, accountId, transactionDate: date, note })
    } catch (err) {
      setSubmitError(getErrorMessage(err))
    }
  }

  const shownError = submitError ?? error

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.wrapper}>
      <View accessibilityRole="radiogroup" style={styles.typeRow}>
        {(['expense', 'income'] as const).map((t) => {
          const active = type === t
          const activeColor = t === 'expense' ? colors.danger : colors.success
          return (
            <Pressable
              key={t}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              onPress={() => switchType(t)}
              style={[
                styles.typeButton,
                {
                  borderColor: active ? activeColor : colors.border,
                  backgroundColor: active ? withAlpha(activeColor, 0.1) : 'transparent',
                },
              ]}
            >
              <Text style={[styles.typeText, { color: active ? activeColor : colors.muted }]}>
                {t === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
              </Text>
            </Pressable>
          )
        })}
      </View>

      <Input
        label="Nominal (Rp)"
        keyboardType="number-pad"
        placeholder="contoh: 50000"
        autoFocus
        value={amount}
        onChangeText={(text) => setAmount(sanitizeAmountInput(text))}
      />

      <Select
        label="Kategori"
        value={categoryId}
        onChange={setCategoryId}
        placeholder={matchingCategories.length === 0 ? 'Tidak ada kategori untuk jenis ini' : 'Pilih kategori…'}
        options={matchingCategories.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` }))}
      />

      <Select
        label="Akun"
        value={accountId}
        onChange={setAccountId}
        options={accounts.map((a) => ({ value: a.id, label: a.name }))}
      />

      <DateField label="Tanggal" value={date} onChange={setDate} />

      <Input label="Catatan (opsional)" placeholder="misal: makan siang di kantin" value={note} onChangeText={setNote} />

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
          {initial ? 'Simpan Perubahan' : 'Simpan Transaksi'}
        </Button>
      </View>
    </KeyboardAvoidingView>
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
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    height: 42,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeText: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
  },
  errorBox: {
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: fontSizes.sm,
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