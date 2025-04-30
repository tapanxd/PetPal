"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { useTheme } from "../theme"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter, Stack } from "expo-router"
import { auth } from "../../firebaseConfig"
import { type MedicalRecord, recordTypeIcons } from "../../types/health"
import { fetchPetHealthData, addMedicalRecord } from "../../utils/firestore"
import { formatDate } from "../../utils/formatters"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { AddRecordModal } from "../../components/health/AddRecordModal"

export default function MedicalRecordsScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { petId, petName } = useLocalSearchParams()

  // States
  const [loading, setLoading] = useState(true)
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [showAddRecordModal, setShowAddRecordModal] = useState(false)

  // Form states for medical record
  const [newRecordType, setNewRecordType] = useState<MedicalRecord["type"]>("checkup")
  const [newRecordTitle, setNewRecordTitle] = useState("")
  const [newRecordDate, setNewRecordDate] = useState(new Date().toISOString().split("T")[0])
  const [newRecordNextDate, setNewRecordNextDate] = useState("")
  const [newRecordNotes, setNewRecordNotes] = useState("")

  // Fetch medical records
  useEffect(() => {
    const loadMedicalRecords = async () => {
      if (!petId || !auth.currentUser) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const data = await fetchPetHealthData(petId as string)
        setMedicalRecords(data.medicalRecords)
      } catch (error) {
        console.error("Error fetching medical records:", error)
        Alert.alert("Error", "Failed to load medical records. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadMedicalRecords()
  }, [petId])

  // Handle adding medical record
  const handleAddRecord = async () => {
    if (!newRecordTitle) {
      Alert.alert("Error", "Please enter a title for the record")
      return
    }

    if (!auth.currentUser) {
      Alert.alert("Error", "You must be logged in to add a medical record")
      return
    }

    if (!petId) {
      Alert.alert("Error", "No pet selected. Please select a pet first.")
      return
    }

    try {
      setLoading(true)
      const dateValue = new Date(newRecordDate)
      const nextDateValue = newRecordNextDate ? new Date(newRecordNextDate) : undefined

      const newRecord = await addMedicalRecord(
        petId as string,
        newRecordType,
        newRecordTitle,
        dateValue,
        nextDateValue,
        newRecordNotes,
      )

      // Add to local state
      setMedicalRecords([newRecord, ...medicalRecords])

      // Reset form and close modal
      setNewRecordType("checkup")
      setNewRecordTitle("")
      setNewRecordDate(new Date().toISOString().split("T")[0])
      setNewRecordNextDate("")
      setNewRecordNotes("")
      setShowAddRecordModal(false)
    } catch (error) {
      console.error("Error adding medical record:", error)

      // Check if it's a permissions error
      if (error instanceof Error && error.message.includes("permission")) {
        Alert.alert(
          "Permission Error",
          "You don't have permission to add medical records. This might be due to Firestore security rules.",
          [{ text: "OK" }],
        )
      } else {
        Alert.alert("Error", "Failed to add medical record. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Filter medical records
  const filteredRecords =
    selectedFilter === "all" ? medicalRecords : medicalRecords.filter((record) => record.type === selectedFilter)

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]} edges={["top"]}>
      <Stack.Screen
        options={{
          title: `${petName}'s Medical Records`,
          headerBackTitle: "Health",
        }}
      />

      <View style={styles.header}>
        <Text style={[styles.screenTitle, { color: theme.colors.text.primary }]}>Medical Records</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.brand.primary }]}
          onPress={() => setShowAddRecordModal(true)}
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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.brand.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>Loading medical records...</Text>
        </View>
      ) : filteredRecords.length > 0 ? (
        <ScrollView style={styles.scrollContent} contentContainerStyle={styles.recordsList}>
          {filteredRecords.map((record) => (
            <Card key={record.id} style={styles.card}>
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
            </Card>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="file-document" size={64} color={theme.colors.text.tertiary} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>No Medical Records</Text>
          <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
            Keep track of {petName}'s vaccinations, check-ups, and other medical events.
          </Text>
          <Button
            label="Add First Medical Record"
            onPress={() => setShowAddRecordModal(true)}
            style={{ marginTop: 16 }}
          />
        </View>
      )}

      {/* Add Record Modal */}
      <AddRecordModal
        visible={showAddRecordModal}
        onClose={() => setShowAddRecordModal(false)}
        petName={(petName as string) || ""}
        recordType={newRecordType}
        title={newRecordTitle}
        date={newRecordDate}
        nextDate={newRecordNextDate}
        notes={newRecordNotes}
        onChangeRecordType={setNewRecordType}
        onChangeTitle={setNewRecordTitle}
        onChangeDate={setNewRecordDate}
        onChangeNextDate={setNewRecordNextDate}
        onChangeNotes={setNewRecordNotes}
        onSave={handleAddRecord}
        loading={loading}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  screenTitle: {
    fontSize: 24,
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
    paddingHorizontal: 16,
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
  scrollContent: {
    flex: 1,
  },
  recordsList: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    padding: 16,
    marginBottom: 12,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
    maxWidth: 300,
  },
})
