import { useMemo } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { fontSizes, useAppColors } from '@/theme'
import { formatRupiahCompact } from '@/lib/currency'

export interface BarChartItem {
  label: string
  values: Array<{ key: string; value: number; color: string }>
}

interface BarChartProps {
  data: BarChartItem[]
  maxValue?: number
  /** Tinggi area chart (px). */
  height?: number
}

/**
 * Bar chart ringan berbasis react-native-svg-compatible layout:
 * menggunakan View/perbandingan tinggi agar tetap ringan di perangkat entry-level.
 * Setiap grup = label + kumpulan bar (mis. pemasukan & pengeluaran).
 */
export function BarChart({ data, maxValue, height = 160 }: BarChartProps) {
  const colors = useAppColors()

  const max = useMemo(() => {
    if (maxValue && maxValue > 0) return maxValue
    let top = 1
    for (const item of data) {
      for (const v of item.values) {
        if (v.value > top) top = v.value
      }
    }
    return top
  }, [data, maxValue])

  if (data.length === 0) {
    return <Text style={[styles.empty, { color: colors.muted }]}>Belum ada data pada periode ini.</Text>
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {data.map((item) => (
        <View key={item.label} style={styles.group}>
          <View style={[styles.barsArea, { height }]}>
            {item.values.map((v) => {
              const h = Math.max(2, Math.round((v.value / max) * (height - 12)))
              return (
                <View key={v.key} style={styles.barSlot}>
                  <View style={[styles.bar, { backgroundColor: v.color, height: h }]} />
                  <Text style={[styles.barValue, { color: colors.muted }]} numberOfLines={1}>
                    {formatRupiahCompact(v.value)}
                  </Text>
                </View>
              )
            })}
          </View>
          <Text style={[styles.label, { color: colors.foreground }]} numberOfLines={1}>
            {item.label}
          </Text>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: 4,
  },
  group: {
    marginRight: 16,
    alignItems: 'center',
  },
  barsArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  barSlot: {
    alignItems: 'center',
    gap: 2,
    width: 34,
  },
  bar: {
    width: 22,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    alignSelf: 'center',
  },
  barValue: {
    fontSize: fontSizes.xs,
  },
  label: {
    marginTop: 6,
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    fontSize: fontSizes.sm,
    paddingVertical: 24,
  },
})