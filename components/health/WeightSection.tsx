"use client"

import type React from "react"
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native"
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons"
import { Button } from "../../components/ui/Button"
import type { WeightEntry } from "../../types/health"
import { formatDate, getWeightChange } from "../../utils/formatters"
import { WeightChart } from "./WeightChart"

const { width } = Dimensions.get("window")

interface WeightSectionProps {
  weightEntries: WeightEntry[]
  petName: string
  onAddWeight: () => void
}

export const WeightSection: React.FC<WeightSectionProps> = ({ weightEntries, petName, onAddWeight }) => {
  const theme = useTheme()
  const weightChange = getWeightChange(weightEntries)

  // Prepare chart data
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
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Weight Tracking</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.brand.primary }]}
          onPress={onAddWeight}
        >
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {weightEntries.length > 0 ? (
        <View style={[styles.contentContainer, { backgroundColor: theme.colors.background.secondary }]}>
          {/* Current Weight */}
          <View style={styles.currentWeightContainer}>
            <View>
              <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Current Weight</Text>
              <Text style={[styles.currentWeight, { color: theme.colors.text.primary }]}>
                {weightEntries[0].weight} kg
              </Text>
              <Text style={[styles.date, { color: theme.colors.text.tertiary }]}>
                {formatDate(weightEntries[0].date)}
              </Text>
            </View>

            {weightChange && (
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

          {/* Weight Chart */}
          {weightEntries.length > 1 && (
            <View style={styles.chartContainer}>
              <WeightChart weightEntries={weightEntries} />
            </View>
          )}

          {/* Recent Entries */}
          <View style={styles.entriesContainer}>
            <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Recent Entries</Text>
            {weightEntries.slice(0, 3).map((entry) => (
              <View key={entry.id} style={styles.entryRow}>
                <Text style={[styles.entryDate, { color: theme.colors.text.secondary }]}>{formatDate(entry.date)}</Text>
                <Text style={[styles.entryValue, { color: theme.colors.text.primary }]}>{entry.weight} kg</Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background.secondary }]}>
          <MaterialCommunityIcons name="scale" size={48} color={theme.colors.text.tertiary} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>No Weight Data</Text>
          <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
            Start tracking {petName}'s weight to monitor their health over time.
          </Text>
          <Button label="Add First Weight Entry" onPress={onAddWeight} style={{ marginTop: 16 }} />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  contentContainer: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  currentWeightContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "500",
  },
  currentWeight: {
    fontSize: 28,
    fontWeight: "bold",
  },
  date: {
    fontSize: 12,
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
  chartContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  entriesContainer: {
    marginTop: 8,
  },
  entryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150, 150, 150, 0.1)",
  },
  entryDate: {
    fontSize: 14,
  },
  entryValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
})

import { useTheme } from "../../app/theme"

