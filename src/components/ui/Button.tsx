import type { ReactNode } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'
import { fontSizes, radii, useAppColors } from '@/theme'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps {
  variant?: Variant
  size?: Size
  loading?: boolean
  disabled?: boolean
  onPress?: () => void
  children: ReactNode
  style?: object
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onPress,
  children,
  style,
}: ButtonProps) {
  const colors = useAppColors()
  const disabledState = disabled || loading

  const backgroundColor = ((): string => {
    switch (variant) {
      case 'primary': return colors.primary
      case 'secondary': return colors.secondary
      case 'danger': return colors.danger
      case 'ghost': return 'transparent'
    }
  })()

  const textColor = variant === 'ghost' ? colors.foreground : '#ffffff'

  const sizeStyle = ((): { height: number; paddingHorizontal: number; borderRadius: number; fontSize: number } => {
    switch (size) {
      case 'sm': return { height: 34, paddingHorizontal: 12, borderRadius: radii.sm, fontSize: fontSizes.sm }
      case 'lg': return { height: 48, paddingHorizontal: 24, borderRadius: radii.lg, fontSize: fontSizes.md }
      case 'md': return { height: 42, paddingHorizontal: 16, borderRadius: radii.md, fontSize: fontSizes.sm }
    }
  })()

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabledState, busy: loading }}
      disabled={disabledState}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor,
          borderColor: colors.border,
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderRadius: sizeStyle.borderRadius,
          height: sizeStyle.height,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          opacity: disabledState ? 0.6 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading && <ActivityIndicator size="small" color={textColor} />}
      <Text style={[styles.label, { color: textColor, fontSize: sizeStyle.fontSize }]}>{children}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontWeight: '700',
  },
})