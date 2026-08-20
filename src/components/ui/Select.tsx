import { useState } from 'react'
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { fontSizes, radii, spacing, useAppColors } from '@/theme'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  value?: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  error?: string
  disabled?: boolean
}

export function Select({ label, value, onChange, options, placeholder = 'Pilih…', error, disabled = false }: SelectProps) {
  const colors = useAppColors()
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)

  const handleSelect = (option: SelectOption) => {
    onChange(option.value)
    setOpen(false)
  }

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.border,
            opacity: disabled ? 0.6 : pressed ? 0.9 : 1,
          },
        ]}
      >
        <Text style={[styles.triggerText, { color: selected ? colors.foreground : colors.mutedForeground }]}>
          {selected ? selected.label : placeholder}
        </Text>
        <Text style={{ color: colors.muted }}>▾</Text>
      </Pressable>
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>{label ?? 'Pilih opsi'}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = item.value === value
                return (
                  <Pressable
                    onPress={() => handleSelect(item)}
                    style={({ pressed }) => [
                      styles.option,
                      {
                        backgroundColor: isSelected
                          ? withAlpha(colors.primary, 0.12)
                          : pressed
                            ? colors.surfaceHover
                            : 'transparent',
                      },
                    ]}
                  >
                    <Text style={[styles.optionText, { color: isSelected ? colors.primary : colors.foreground }]}>
                      {item.label}
                    </Text>
                    {isSelected ? <Text style={{ color: colors.primary }}>✓</Text> : null}
                  </Pressable>
                )
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
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
  error: {
    marginTop: 6,
    fontSize: fontSizes.sm,
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
    maxHeight: '70%',
  },
  sheetTitle: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    marginBottom: 2,
  },
  optionText: {
    fontSize: fontSizes.md,
  },
})