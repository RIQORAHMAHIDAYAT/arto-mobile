import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native'
import { fontSizes, radii, useAppColors } from '@/theme'

export interface InputProps extends TextInputProps {
  label?: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, style, editable, ...props }: InputProps) {
  const colors = useAppColors()

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={[styles.label, { color: colors.foreground }]} accessibilityElementsHidden>
          {label}
        </Text>
      ) : null}
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.mutedForeground}
        selectionColor={colors.primary}
        editable={editable}
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.border,
            color: colors.foreground,
            opacity: editable === false ? 0.6 : 1,
          },
          style,
        ]}
        {...props}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" style={[styles.error, { color: colors.danger }]}>
          {error}
        </Text>
      ) : hint ? (
        <Text style={[styles.hint, { color: colors.muted }]}>{hint}</Text>
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
  input: {
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: fontSizes.md,
  },
  error: {
    marginTop: 6,
    fontSize: fontSizes.sm,
  },
  hint: {
    marginTop: 6,
    fontSize: fontSizes.sm,
  },
})