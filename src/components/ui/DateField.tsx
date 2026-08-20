import DateTimePicker from '@react-native-community/datetimepicker'
import { useState } from 'react'
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { parseISODate, toISODate } from '@/lib/date'
import { fontSizes, radii, spacing, useAppColors } from '@/theme'

interface DateFieldProps {
  label?: string
  /** Format YYYY-MM-DD */
  value: string
  onChange: (isoDate: string) => void
  minimumDate?: Date
  maximumDate?: Date
}

export function DateField({ label, value, onChange, minimumDate, maximumDate }: DateFieldProps) {
  const colors = useAppColors()
  const [show, setShow] = useState(false)

  const current = value ? parseISODate(value) : new Date()

  const handleChange = (_event: unknown, selected?: Date) => {
    if (!selected) return
    // Android: tutup picker setelah memilih; iOS: diperbarui live, modal ditutup lewat tombol Selesai.
    if (Platform.OS === 'android') setShow(false)
    onChange(toISODate(selected))
  }

  const picker = (
    <DateTimePicker
      value={current}
      mode="date"
      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      minimumDate={minimumDate}
      maximumDate={maximumDate}
      onChange={handleChange}
      themeVariant="light"
    />
  )

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text> : null}
      <Pressable
        accessibilityRole="button"
        onPress={() => setShow(true)}
        style={({ pressed }) => [
          styles.trigger,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <Text style={[styles.triggerText, { color: colors.foreground }]}>{value}</Text>
        <Text style={{ color: colors.muted }}>📅</Text>
      </Pressable>

      {show && Platform.OS === 'android' ? picker : null}

      {show && Platform.OS === 'ios' ? (
        <Modal transparent animationType="fade" onRequestClose={() => setShow(false)}>
          <Pressable style={styles.backdrop} onPress={() => setShow(false)}>
            <Pressable style={[styles.sheet, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>{label ?? 'Pilih tanggal'}</Text>
              {picker}
              <Pressable
                onPress={() => setShow(false)}
                style={[styles.applyButton, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.applyText}>Selesai</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    marginBottom: 6,
    fontSize: fontSizes.sm,
    fontWeight: '500',
  },
  trigger: {
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerText: {
    fontSize: fontSizes.md,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  sheet: {
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  sheetTitle: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  applyButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: radii.md,
  },
  applyText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: fontSizes.md,
  },
})