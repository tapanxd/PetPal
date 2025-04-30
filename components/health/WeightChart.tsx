"use client"

import type React from "react"
import { View, Text, StyleSheet, Dimensions } from "react-native"
import { LineChart } from "react-native-chart-kit"
import { useTheme } from "../../app/theme"
import type { WeightEntry } from "../../types/health"

const { width } = Dimensions.get("window")

interface WeightChartProps {
  weightEntries: WeightEntry[]
  height?: number
}

export const WeightChart: React.FC<WeightChartProps> = ({ weightEntries, height = 180 }) => {
  const theme = useTheme()

  if (weightEntries.length < 2) {
    return (
      <View style={[styles.emptyChart, { backgroundColor: theme.colors.background.secondary }]}>
        <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>Not enough data to display chart</Text>
      </View>
    )
  }

  // Prepare chart data - use the most recent 6 entries in chronological order
  const chartData = {
    labels: weightEntries
      .slice(0, 6)
      .reverse()
      .map((entry) => entry.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })),
    datasets: [
      {
        data: weightEntries
          .slice(0, 6)
          .reverse()
          .map((entry) => entry.weight),
        color: () => theme.colors.brand.primary,
        strokeWidth: 2,
      },
    ],
  }

  return (
    <LineChart
      data={chartData}
      width={width - 80}
      height={height}
      chartConfig={{
        backgroundColor: theme.colors.background.secondary,
        backgroundGradientFrom: theme.colors.background.secondary,
        backgroundGradientTo: theme.colors.background.secondary,
        decimalPlaces: 1,
        color: () => theme.colors.text.secondary,
        labelColor: () => theme.colors.text.secondary,
        style: { borderRadius: 16 },
        propsForDots: {
          r: "6",
          strokeWidth: "2",
          stroke: theme.colors.brand.primary,
        },
      }}
      bezier
      style={{ marginVertical: 8, borderRadius: 16 }}
    />
  )
}

const styles = StyleSheet.create({
  emptyChart: {
    height: 180,
    width: "100%",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
  },
})

