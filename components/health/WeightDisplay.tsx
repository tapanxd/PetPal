"use client"

import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useTheme } from "../../app/theme"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import type { WeightEntry } from "../../types/health"
import { formatDate, getWeightChange } from "../../utils/formatters"

interface WeightDisplayProps {
  weightEntries: WeightEntry[]
  onPress: () => void
}

export const WeightDisplay: React.FC<WeightDisplayProps> = ({ weightEntries, onPress }) => {
  const theme = useTheme()
  const weightChange = getWeightChange(weightEntries)

  // If no weight entries, show a placeholder
  if (weightEntries.length === 0) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}
      >
        <View style={styles.content}>
          <MaterialCommunityIcons name="scale" size={24} color={theme.colors.text.secondary} />
          <Text style={[styles.noDataText, { color: theme.colors.text.secondary }]}>Tap to add weight</Text>
        </View>
      </TouchableOpacity>
    )
  }

  // Get the most recent weight entry
  const latestWeight = weightEntries[0]

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}
    >
      <View style={styles.header}>
        <MaterialCommunityIcons name="scale" size={20} color={theme.colors.brand.primary} />
        <Text style={[styles.title, { color: theme.colors.text.secondary }]}>Current Weight</Text>
      </View>

      <View style={styles.weightContainer}>
        <Text style={[styles.weight, { color: theme.colors.text.primary }]}>{latestWeight.weight} kg</Text>

        {weightChange && weightEntries.length > 1 && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  weightChange.direction === "gained"
                    ? theme.colors.status.warning + "20"
                    : weightChange.direction === "lost"
                      ? theme.colors.status.success + "20"
                      : theme.colors.status.info + "20",
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color:
                    weightChange.direction === "gained"
                      ? theme.colors.status.warning
                      : weightChange.direction === "lost"
                        ? theme.colors.status.success
                        : theme.colors.status.info,
                },
              ]}
            >
              {weightChange.direction === "maintained"
                ? "No change"
                : `${weightChange.direction === "gained" ? "+" : "-"}${weightChange.value} kg`}
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.date, { color: theme.colors.text.tertiary }]}>{formatDate(latestWeight.date)}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  noDataText: {
    fontSize: 14,
  },
  weightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  weight: {
    fontSize: 24,
    fontWeight: "bold",
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  date: {
    fontSize: 12,
  },
})

