import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '@/hooks/use-theme';
import { formatCompactINR } from '@/utils/currency';

interface DataPoint {
  label: string;
  value: number;
}

interface TrendLineChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({
  data,
  height = 160,
  color,
}) => {
  const { colors } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = Math.min(screenWidth - 64, 340);
  const chartHeight = height;

  const strokeColor = color || colors.accent;

  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1000);
  const minValue = 0;

  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 15;
  const paddingBottom = 25;

  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  const points = data.map((d, i) => {
    const x = paddingLeft + (i / (data.length - 1 || 1)) * plotWidth;
    const y = paddingTop + plotHeight - ((d.value - minValue) / (maxValue - minValue)) * plotHeight;
    return { x, y, ...d };
  });

  // Create smooth curved path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const midX = (p0.x + p1.x) / 2;
    pathD += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  // Gradient area
  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + plotHeight} L ${points[0].x} ${paddingTop + plotHeight} Z`;

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={chartHeight}>
        <Defs>
          <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={strokeColor} stopOpacity="0.15" />
            <Stop offset="1" stopColor={strokeColor} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Baseline & Grid */}
        <Line
          x1={paddingLeft}
          y1={paddingTop + plotHeight}
          x2={chartWidth - paddingRight}
          y2={paddingTop + plotHeight}
          stroke={colors.border}
          strokeWidth="1"
        />
        <Line
          x1={paddingLeft}
          y1={paddingTop + plotHeight / 2}
          x2={chartWidth - paddingRight}
          y2={paddingTop + plotHeight / 2}
          stroke={colors.border}
          strokeDasharray="4, 4"
          strokeWidth="0.8"
        />

        {/* Axis Labels */}
        <SvgText
          x={paddingLeft - 8}
          y={paddingTop + 4}
          fontSize="10"
          fill={colors.textMuted}
          textAnchor="end"
        >
          {formatCompactINR(maxValue)}
        </SvgText>
        <SvgText
          x={paddingLeft - 8}
          y={paddingTop + plotHeight / 2 + 3}
          fontSize="10"
          fill={colors.textMuted}
          textAnchor="end"
        >
          {formatCompactINR(maxValue / 2)}
        </SvgText>
        <SvgText
          x={paddingLeft - 8}
          y={paddingTop + plotHeight}
          fontSize="10"
          fill={colors.textMuted}
          textAnchor="end"
        >
          0
        </SvgText>

        {/* Area fill */}
        <Path d={areaD} fill="url(#chartGradient)" />

        {/* Line */}
        <Path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Points & Bottom Labels */}
        {points.map((p, idx) => (
          <React.Fragment key={idx}>
            <Circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill={colors.card}
              stroke={strokeColor}
              strokeWidth="2"
            />
            <SvgText
              x={p.x}
              y={chartHeight - 6}
              fontSize="11"
              fill={colors.textSecondary}
              textAnchor="middle"
            >
              {p.label}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
});
