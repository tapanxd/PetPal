"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native"
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons"
import { Button } from "../../components/ui/Button"
import { type MedicalRecord, recordTypeIcons } from "../../types/health"
import { formatDate } from "../../utils/formatters"

interface RecordsSectionProps {
  medicalRecords: MedicalRecord[]
  petName: string
  onAddRecord: () => void
}

export const RecordsSection: React.FC<RecordsSectionProps> = ({ medicalRecords, petName, onAddRecord }) => {
  const theme = useTheme()
  const [selectedFilter, setSelectedFilter] = useState("all")

  // Filter medical records
  const filteredRecords =
    selectedFilter === "all" ? medicalRecords : medicalRecords.filter((record) => record.type === selectedFilter)

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Medical Records</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.brand.primary }]}
          onPress={onAddRecord}
        >
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Record Type Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {["all", ...Object.keys(recordTypeIcons)].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    selectedFilter === filter ? theme.colors.brand.primary : theme.colors.background.secondary,
                },
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              {filter !== "all" && (
                <MaterialCommunityIcons
                  name={recordTypeIcons[filter as keyof typeof recordTypeIcons] as any}
                  size={14}
                  color={selectedFilter === filter ? "#fff" : theme.colors.text.secondary}
                />
              )}
              <Text
                style={[
                  styles.filterText,
                  {
                    color: selectedFilter === filter ? "#fff" : theme.colors.text.secondary,
                    fontSize: 12, // Smaller font size
                  },
                ]}
              >
                {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Medical Records List */}
      {filteredRecords.length > 0 ? (
        <View style={styles.recordsList}>
          {filteredRecords.map((record) => (
            <View key={record.id} style={[styles.recordItem, { backgroundColor: theme.colors.background.secondary }]}>
              <View style={styles.recordHeader}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.brand.primary + "20" }]}>
                  <MaterialCommunityIcons
                    name={recordTypeIcons[record.type] as any}
                    size={20}
                    color={theme.colors.brand.primary}
                  />
                </View>
                <View style={styles.recordInfo}>
                  <Text style={[styles.recordTitle, { color: theme.colors.text.primary }]}>{record.title}</Text>
                  <Text style={[styles.date, { color: theme.colors.text.secondary }]}>{formatDate(record.date)}</Text>
                </View>
                {record.nextDueDate && (
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor:
                          record.nextDueDate < new Date()
                            ? theme.colors.status.error + "20"
                            : theme.colors.status.info + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        {
                          color: record.nextDueDate < new Date() ? theme.colors.status.error : theme.colors.status.info,
                        },
                      ]}
                    >
                      {record.nextDueDate < new Date() ? "Overdue" : "Due"}: {formatDate(record.nextDueDate)}
                    </Text>
                  </View>
                )}
              </View>
              {record.notes && (
                <Text style={[styles.notes, { color: theme.colors.text.secondary }]}>{record.notes}</Text>
              )}
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background.secondary }]}>
          <MaterialCommunityIcons name="file-document" size={48} color={theme.colors.text.tertiary} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>No Medical Records</Text>
          <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
            Keep track of {petName}'s vaccinations, check-ups, and other medical events.
          </Text>
          <Button label="Add First Medical Record" onPress={onAddRecord} style={{ marginTop: 16 }} />
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
  filtersContainer: {
    marginBottom: 16,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 6,
    gap: 3,
  },
  filterText: {
    fontSize: 12,
  },
  recordsList: {
    gap: 12,
  },
  recordItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  recordHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
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
  notes: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
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
