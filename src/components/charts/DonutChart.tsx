import { Text, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { fontSizes, useAppColors } from '@/theme'
import { formatRupiahCompact } from '@/lib/currency'

export interface DonutSegment {
  key: string
  value: number
  color: string
}

interface DonutChartProps {
  segments: DonutSegment[]
  size?: number
  thickness?: number
  centerLabel?: string
  centerValue?: number
}

export function DonutChart({ segments, size = 160, thickness = 20, centerLabel, centerValue }: DonutChartProps) {
  const colors = useAppColors()
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const total = segments.reduce((sum, s) => sum + s.value, 0)

  let offset = 0
  const arcs =
    total > 0
      ? segments.map((segment) => {
          const fraction = segment.value / total
          const dash = Math.max(0, fraction * circumference - 2)
          const arc = (
            <Circle
              key={segment.key}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={segment.color}
              strokeWidth={thickness}
              fill="none"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          )
          offset += fraction * circumference
          return arc
        })
      : null

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.surfaceHover}
          strokeWidth={thickness}
          fill="none"
        />
        {arcs}
      </Svg>
      <View
        style={{
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        {centerLabel ? (
          <Text style={[styles.centerLabel, { color: colors.muted }]}>{centerLabel}</Text>
        ) : null}
        {centerValue !== undefined ? (
          <Text style={[styles.centerValue, { color: colors.foreground }]}>{formatRupiahCompact(centerValue)}</Text>
        ) : null}
      </View>
    </View>
  )
}

const styles = {
  centerLabel: {
    fontSize: fontSizes.sm,
  },
  centerValue: {
    fontSize: fontSizes.lg,
    fontWeight: '800',
  },
} as const