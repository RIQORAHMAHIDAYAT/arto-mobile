import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { FinancialGoal, FinancialGoalInput } from '@/types'
import { Button } from '@/components/ui/Button'
import { DateField } from '@/components/ui/DateField'
import { Input } from '@/components/ui/Input'
import { parseAmountText, sanitizeAmountInput } from '@/lib/currency'
import { getErrorMessage } from '@/lib/errorMessage'
import { radii, spacing, useAppColors } from '@/theme'

interface GoalFormProps {
  initial?: FinancialGoal | null
  loading?: boolean
  error?: string | null
  onCancel?: () => void
  onSubmit: (input: FinancialGoalInput) => Promise<void>
}

export function GoalForm({ initial, loading, error, onCancel, onSubmit }: GoalFormProps) {
  const colors = useAppColors()
  const [name, setName] = useState(initial?.name ?? '')
  const [targetAmount, setTargetAmount] = useState(initial ? String(initial.targetAmount) : '')
  const [currentAmount, setCurrentAmount] = useState(initial ? String(initial.currentAmount ?? 0) : '0')
  const [deadline, setDeadline] = useState(initial?.deadline ?? '')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setSubmitError(null)
    const cleanedName = name.trim()
    if (!cleanedName) {
      setSubmitError('Nama goal wajib diisi.')
      return
    }
    const target = parseAmountText(targetAmount)
    if (target === null || target <= 0) {
      setSubmitError('Target nominal harus lebih dari 0.')
      return
    }
    const current = parseAmountText(currentAmount) ?? 0
    if (current < 0 || current > target) {
      setSubmitError('Nominal terkumpul tidak boleh melebihi target.')
      return
    }
    try {
      await onSubmit({
        name: cleanedName,
        targetAmount: target,
        currentAmount: current,
        deadline: deadline || null,
      })
    } catch (err) {
      setSubmitError(getErrorMessage(err))
    }
  }

  const shownError = submitError ?? error

  return (
    <View style={styles.wrapper}>
      <Input label="Nama Goal" placeholder="contoh: Dana Darurat 6 Bulan" value={name} onChangeText={setName} />

      <Input
        label="Target Nominal (Rp)"
        keyboardType="number-pad"
        placeholder="contoh: 10000000"
        value={targetAmount}
        onChangeText={(text) => setTargetAmount(sanitizeAmountInput(text))}
      />

      <Input
        label="Sudah Terkumpul (Rp)"
        keyboardType="number-pad"
        placeholder="0"
        value={currentAmount}
        onChangeText={(text) => setCurrentAmount(sanitizeAmountInput(text))}
      />

      <View>
        <DateField
          label="Deadline (opsional)"
          value={deadline}
          onChange={(iso) => {
            setDeadline(iso)
          }}
        />
        {deadline ? (
          <Text style={styles.clearDeadlineWrap}>
            <Text onPress={() => setDeadline('')} style={[styles.clearDeadline, { color: colors.secondary }]}>
              Hapus deadline
            </Text>
          </Text>
        ) : null}
      </View>

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
          {initial ? 'Simpan Perubahan' : 'Buat Goal'}
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
  clearDeadlineWrap: {
    marginTop: 6,
  },
  clearDeadline: {
    fontSize: 13,
    fontWeight: '600',
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