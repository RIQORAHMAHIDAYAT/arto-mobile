import { useState } from 'react'
import { StyleSheet, TextInput, View, TouchableOpacity, Text, KeyboardAvoidingView, Platform } from 'react-native'
import { useAppColors, fontSizes, radii, spacing } from '@/theme'

interface MobileQuickAddProps {
  onAdd: (type: 'income' | 'expense', amount: number, note: string) => Promise<void>
}

export function MobileQuickAdd({ onAdd }: MobileQuickAddProps) {
  const colors = useAppColors()
  const [note, setNote] = useState('')
  const [amountStr, setAmountStr] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAdd = async (type: 'income' | 'expense') => {
    const num = Number(amountStr.replace(/\D/g, ''))
    if (!num) return

    setLoading(true)
    try {
      await onAdd(type, num, note)
      setNote('')
      setAmountStr('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}
    >
      <View style={styles.row}>
        <View style={styles.inputs}>
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
            placeholder="Keterangan..."
            placeholderTextColor={colors.muted}
            value={note}
            onChangeText={setNote}
            accessible={true}
            accessibilityLabel="Input keterangan transaksi"
            allowFontScaling={true}
          />
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
            placeholder="Nominal (Rp)..."
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            value={amountStr}
            onChangeText={setAmountStr}
            accessible={true}
            accessibilityLabel="Input nominal transaksi dalam Rupiah"
            allowFontScaling={true}
          />
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity 
            disabled={loading}
            style={[styles.btn, { backgroundColor: colors.success }]} 
            onPress={() => handleAdd('income')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Tambah Pemasukan"
            accessibilityHint="Menyimpan transaksi sebagai pemasukan"
          >
            <Text style={styles.btnText} allowFontScaling={true}>+ Masuk</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            disabled={loading}
            style={[styles.btn, { backgroundColor: colors.danger }]} 
            onPress={() => handleAdd('expense')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Tambah Pengeluaran"
            accessibilityHint="Menyimpan transaksi sebagai pengeluaran"
          >
            <Text style={styles.btnText} allowFontScaling={true}>- Keluar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  inputs: {
    flex: 1,
    gap: spacing.xs,
  },
  input: {
    minHeight: 44,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    fontSize: fontSizes.sm,
  },
  buttons: {
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  btn: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  btnText: {
    color: '#fff',
    fontSize: fontSizes.xs,
    fontWeight: '700',
  }
})
