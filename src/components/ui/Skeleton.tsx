import { StyleSheet, View } from 'react-native'
import { radii, useAppColors } from '@/theme'

export function Skeleton({ width = '100%', height = 14, style }: { width?: number | string; height?: number; style?: object }) {
  const colors = useAppColors()
  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          backgroundColor: colors.surfaceHover,
        },
        style,
      ]}
    />
  )
}

const styles = StyleSheet.create({
  skeleton: {
    borderRadius: radii.sm,
  },
})