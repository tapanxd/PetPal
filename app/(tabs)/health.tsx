"use client"

import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
} from "react-native"
import { useTheme } from "../theme"
import { Button } from "../../components/ui/Button"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather } from "@expo/vector-icons"
import { auth } from "../../firebaseConfig"
import { useRouter } from "expo-router"
import { usePet } from "../context/PetContext"

// Types
import type { WeightEntry, MedicalRecord, Document } from "../../types/health"
import type { Pet } from "../../types/pet"

// Utils
import { fetchPetHealthData, addWeightEntry } from "../../utils/firestore"

// Components
import { PetSelector } from "../../components/health/PetSelector"
import { AddWeightModal } from "../../components/health/AddWeightModal"
import { WeightSection } from "../../components/health/WeightSection"
import { RecordsSection } from "../../components/health/RecordsSection"
import { DocumentsSection } from "../../components/health/DocumentsSection"

export default function HealthScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { pets, selectedPet, selectPet, loading: petsLoading, refreshPets } = usePet()

  // Loading states
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Data states
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([])
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [documents, setDocuments] = useState<Document[]>([])

  // Modal visibility states
  const [showPetSelector, setShowPetSelector] = useState(false)
  const [showAddWeightModal, setShowAddWeightModal] = useState(false)

  // Form states for weight entry
  const [newWeight, setNewWeight] = useState("")
  const [newWeightDate, setNewWeightDate] = useState(new Date())
  const [newWeightNotes, setNewWeightNotes] = useState("")

  // Error state
  const [error, setError] = useState<string | null>(null)

  // Function to load pet data
  const loadPetData = useCallback(
    async (showLoadingIndicator = true) => {
      if (!selectedPet || !auth.currentUser) {
        setLoading(false)
        return
      }

      try {
        if (showLoadingIndicator) {
          setLoading(true)
        }
        console.log(`Fetching health data for pet: ${selectedPet.name} (${selectedPet.id})`)
        setError(null)

        // Clear previous data first to avoid showing data from other pets
        setWeightEntries([])
        setMedicalRecords([])
        setDocuments([])

        const data = await fetchPetHealthData(selectedPet.id)
        setWeightEntries(data.weightEntries)
        setMedicalRecords(data.medicalRecords)
        setDocuments(data.documents)
      } catch (error) {
        console.error("Error fetching pet health data:", error)
        Alert.alert("Error", "Failed to load health data. Please try again.")
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [selectedPet],
  )

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (!selectedPet) return

    setRefreshing(true)
    try {
      // Refresh pets data
      await refreshPets()

      // Refresh pet-specific health data
      await loadPetData(false)
    } catch (error) {
      console.error("Error refreshing health data:", error)
      Alert.alert("Error", "Failed to refresh health data. Please try again.")
    } finally {
      setRefreshing(false)
    }
  }, [selectedPet, refreshPets, loadPetData])

  // Fetch pet health data when selected pet changes
  useEffect(() => {
    loadPetData()
  }, [loadPetData, selectedPet])

  // Handle adding weight entry
  const handleAddWeight = async () => {
    if (!newWeight) {
      Alert.alert("Error", "Please enter a weight value")
      return
    }

    if (isNaN(Number.parseFloat(newWeight))) {
      Alert.alert("Error", "Please enter a valid number for weight")
      return
    }

    if (!auth.currentUser) {
      Alert.alert("Error", "You must be logged in to add a weight entry")
      return
    }

    if (!selectedPet) {
      Alert.alert("Error", "No pet selected. Please select a pet first.")
      return
    }

    try {
      setLoading(true)
      const weightValue = Number.parseFloat(newWeight)

      // Use the Date object directly
      console.log(`Adding weight entry with date: ${newWeightDate.toISOString()}`)
      const newEntry = await addWeightEntry(selectedPet.id, weightValue, newWeightDate, newWeightNotes)

      // Add to local state
      setWeightEntries([newEntry, ...weightEntries])

      // Reset form and close modal
      setNewWeight("")
      setNewWeightDate(new Date())
      setNewWeightNotes("")
      setShowAddWeightModal(false)
    } catch (error) {
      console.error("Error adding weight entry:", error)
      Alert.alert("Error", "Failed to add weight entry. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Navigate to medical records screen
  const navigateToMedicalRecords = () => {
    if (selectedPet) {
      router.push(
        `/(app)/medical-records?petId=${selectedPet.id}&petName=${encodeURIComponent(selectedPet.name)}` as any,
      )
    }
  }

  // Navigate to documents screen
  const navigateToDocuments = () => {
    if (selectedPet) {
      router.push(`/(app)/documents?petId=${selectedPet.id}&petName=${encodeURIComponent(selectedPet.name)}` as any)
    }
  }

  // Handle pet selection
  const handleSelectPet = (pet: Pet) => {
    selectPet(pet)
    setShowPetSelector(false)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.brand.primary]}
            tintColor={theme.colors.brand.primary}
          />
        }
      >
        {/* Header with Pet Selector */}
        <View style={styles.header}>
          <Text style={[styles.screenTitle, { color: theme.colors.text.primary }]}>Pet Health</Text>

          {selectedPet ? (
            <TouchableOpacity onPress={() => setShowPetSelector(true)}>
              {selectedPet.imageUrl ? (
                <Image
                  source={{ uri: selectedPet.imageUrl }}
                  style={styles.petImage}
                  defaultSource={require("../../assets/images/logo.png")}
                />
              ) : (
                <View style={[styles.petInitial, { backgroundColor: theme.colors.brand.primary }]}>
                  <Text style={{ color: theme.colors.text.primary, fontWeight: "bold" }}>
                    {selectedPet.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.addPetButton, { backgroundColor: theme.colors.brand.primary }]}
              onPress={() => {
                if (pets.length > 0) {
                  setShowPetSelector(true)
                } else {
                  router.push("/(app)/create-pet")
                }
              }}
            >
              <Feather name="plus" size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {(petsLoading || loading) && !selectedPet ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.brand.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>Loading pet data...</Text>
          </View>
        ) : !selectedPet ? (
          <View style={styles.noPetContainer}>
            <Text style={[styles.noPetTitle, { color: theme.colors.text.primary }]}>No Pet Selected</Text>
            <Text style={[styles.noPetText, { color: theme.colors.text.secondary }]}>
              {pets.length > 0
                ? "Please select a pet to view their health records."
                : "You don't have any pets yet. Add a pet to start tracking their health."}
            </Text>
            <Button
              label={pets.length > 0 ? "Select a Pet" : "Add a Pet"}
              onPress={() => {
                if (pets.length > 0) {
                  setShowPetSelector(true)
                } else {
                  router.push("/(app)/create-pet")
                }
              }}
              style={{ marginTop: 16 }}
            />
          </View>
        ) : (
          <>
            {/* Weight Section */}
            {selectedPet && (
              <WeightSection
                weightEntries={weightEntries}
                petName={selectedPet.name}
                onAddWeight={() => setShowAddWeightModal(true)}
              />
            )}

            {/* Medical Records Section */}
            {selectedPet && (
              <RecordsSection
                medicalRecords={medicalRecords}
                petName={selectedPet.name}
                onAddRecord={navigateToMedicalRecords}
              />
            )}

            {/* Documents Section */}
            {selectedPet && (
              <DocumentsSection documents={documents} petName={selectedPet.name} onAddDocument={navigateToDocuments} />
            )}
          </>
        )}
      </ScrollView>

      {/* Modals */}
      <PetSelector
        visible={showPetSelector}
        onClose={() => setShowPetSelector(false)}
        pets={pets}
        selectedPet={selectedPet}
        onSelectPet={handleSelectPet}
      />

      <AddWeightModal
        visible={showAddWeightModal}
        onClose={() => setShowAddWeightModal(false)}
        petName={selectedPet?.name || ""}
        weight={newWeight}
        date={newWeightDate}
        notes={newWeightNotes}
        onChangeWeight={setNewWeight}
        onChangeDate={setNewWeightDate}
        onChangeNotes={setNewWeightNotes}
        onSave={handleAddWeight}
        loading={loading}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  petSelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 8,
  },
  petImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  petInitial: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  addPetButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  petName: {
    fontSize: 14,
    fontWeight: "500",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  noPetContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    padding: 24,
  },
  noPetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  noPetText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
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
})
