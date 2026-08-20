import { useEffect, useMemo, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { Budget, BudgetInput, Category } from '@/types'
import { Button } from '@/components/ui/Button'
import { DateField } from '@/components/ui/DateField'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { daysBetween, endOfMonth, startOfMonth, toISODate } from '@/lib/date'
import { parseAmountText, sanitizeAmountInput } from '@/lib/currency'
import { getErrorMessage } from '@/lib/errorMessage'
import { fontSizes, radii, spacing, useAppColors } from '@/theme'

interface BudgetFormProps {
  categories: Category[]
  initial?: Budget | null
  loading?: boolean
  error?: string | null
  onCancel?: () => void
  onSubmit: (input: BudgetInput) => Promise<void>
}

export function BudgetForm({ categories, initial, loading, error, onCancel, onSubmit }: BudgetFormProps) {
  const colors = useAppColors()
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '')
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [periodStart, setPeriodStart] = useState(initial?.periodStart ?? toISODate(startOfMonth(new Date())))
  const [periodEnd, setPeriodEnd] = useState(initial?.periodEnd ?? toISODate(endOfMonth(new Date())))
  const [submitError, setSubmitError] = useState<string | null>(null)

  const expenseCategories = useMemo(() => categories.filter((c) => c.type === 'expense'), [categories])

  // eslint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    if (expenseCategories.length > 0 && !categoryId)
      // eslint-disable-next-line react/set-state-in-effect
      setCategoryId(expenseCategories[0].id)
  }, [expenseCategories, categoryId])

  const handleSubmit = async () => {
    setSubmitError(null)
    const value = parseAmountText(amount)
    if (value === null) {
      setSubmitError('Nominal budget harus berupa angka yang valid.')
      return
    }
    if (value <= 0) {
      setSubmitError('Nominal budget harus lebih dari 0.')
      return
    }
    if (!categoryId) {
      setSubmitError('Pilih kategori terlebih dahulu.')
      return
    }
    if (periodEnd < periodStart) {
      setSubmitError('Tanggal akhir harus setelah tanggal mulai.')
      return
    }
    try {
      await onSubmit({ categoryId, amount: value, periodStart, periodEnd })
    } catch (err) {
      setSubmitError(getErrorMessage(err))
    }
  }

  const shownError = submitError ?? error
  const rangeDays = daysBetween(parseISODateSafe(periodStart), parseISODateSafe(periodEnd))

  return (
    <View style={styles.wrapper}>
      <Select
        label="Kategori"
        value={categoryId}
        onChange={setCategoryId}
        options={expenseCategories.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` }))}
      />

      <Input
        label="Nominal Budget (Rp)"
        keyboardType="number-pad"
        placeholder="contoh: 1000000"
        value={amount}
        onChangeText={(text) => setAmount(sanitizeAmountInput(text))}
      />

      <DateField label="Periode Mulai" value={periodStart} onChange={setPeriodStart} />
      <DateField label="Periode Selesai" value={periodEnd} onChange={setPeriodEnd} minimumDate={parseISODateSafe(periodStart)} />

      {rangeDays > 0 ? (
        <Text style={[styles.hint, { color: colors.muted }]}>
          Periode berlangsung {rangeDays + 1} hari.
        </Text>
      ) : null}

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
          {initial ? 'Simpan Perubahan' : 'Buat Budget'}
        </Button>
      </View>
    </View>
  )
}

function parseISODateSafe(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return Number.isNaN(date.getTime()) ? new Date() : date
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
  hint: {
    fontSize: fontSizes.sm,
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