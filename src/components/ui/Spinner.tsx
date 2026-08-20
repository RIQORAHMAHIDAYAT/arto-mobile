import { ActivityIndicator, StyleSheet } from 'react-native'
import { useAppColors } from '@/theme'

export function Spinner({ size = 'small', color }: { size?: 'small' | 'large'; color?: string }) {
  const colors = useAppColors()
  return <ActivityIndicator size={size} color={color ?? colors.primary} style={styles.spinner} />
}

const styles = StyleSheet.create({
  spinner: {
    margin: 0,
  },
})