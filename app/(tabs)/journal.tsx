"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
} from "react-native"
import { useTheme } from "../theme"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather } from "@expo/vector-icons"
import { usePet } from "../context/PetContext"
import { useRouter } from "expo-router"
import { fetchJournalEntries, addJournalEntry, deleteJournalEntry, type JournalEntry } from "../../utils/journal"
import { JournalEntryComponent } from "../../components/journal/JournalEntry"
// Updated import to use default export
import AddEntryModal from "../../components/journal/AddEntryModal"
import { PetSelector } from "../../components/health/PetSelector"
import type { Pet } from "../../types/pet"

export default function JournalScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { pets, selectedPet, selectPet, loading: petsLoading } = usePet()

  // States
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [addingEntry, setAddingEntry] = useState(false)
  const [showAddEntryModal, setShowAddEntryModal] = useState(false)
  const [showPetSelector, setShowPetSelector] = useState(false)

  // Fetch journal entries when selected pet changes
  useEffect(() => {
    const loadEntries = async () => {
      if (!selectedPet) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const journalEntries = await fetchJournalEntries(selectedPet.id)
        setEntries(journalEntries)
      } catch (error) {
        console.error("Error loading journal entries:", error)
        Alert.alert("Error", "Failed to load journal entries. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadEntries()
  }, [selectedPet])

  // Handle refresh
  const onRefresh = async () => {
    if (!selectedPet) return

    try {
      setRefreshing(true)
      const journalEntries = await fetchJournalEntries(selectedPet.id)
      setEntries(journalEntries)
    } catch (error) {
      console.error("Error refreshing journal entries:", error)
      Alert.alert("Error", "Failed to refresh journal entries. Please try again.")
    } finally {
      setRefreshing(false)
    }
  }

  // Handle adding a new entry
  const handleAddEntry = async (content: string, imageUri?: string) => {
    if (!selectedPet) {
      Alert.alert("Error", "No pet selected. Please select a pet first.")
      return
    }

    try {
      setAddingEntry(true)
      const newEntry = await addJournalEntry(selectedPet.id, content, imageUri)
      setEntries([newEntry, ...entries])
      setShowAddEntryModal(false)
    } catch (error) {
      console.error("Error adding journal entry:", error)
      Alert.alert("Error", "Failed to add journal entry. Please try again.")
    } finally {
      setAddingEntry(false)
    }
  }

  // Handle deleting an entry
  const handleDeleteEntry = async (entryId: string) => {
    if (!selectedPet) {
      Alert.alert("Error", "No pet selected.")
      return
    }

    try {
      setLoading(true)
      await deleteJournalEntry(selectedPet.id, entryId)

      // Update the entries list by removing the deleted entry
      setEntries(entries.filter((entry) => entry.id !== entryId))

      // Show success message
      Alert.alert("Success", "Journal entry deleted successfully.")
    } catch (error) {
      console.error("Error deleting journal entry:", error)
      Alert.alert("Error", "Failed to delete journal entry. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle pet selection
  const handleSelectPet = (pet: Pet) => {
    selectPet(pet)
    setShowPetSelector(false)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background.primary} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {/* Header with Pet Selector */}
          <View style={styles.header}>
            <Text style={[styles.screenTitle, { color: theme.colors.text.primary }]}>Journal</Text>

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

          {/* Journal Entries */}
          {petsLoading || loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.brand.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
                Loading journal entries...
              </Text>
            </View>
          ) : !selectedPet ? (
            <View style={styles.noPetContainer}>
              <Text style={[styles.noPetTitle, { color: theme.colors.text.primary }]}>No Pet Selected</Text>
              <Text style={[styles.noPetText, { color: theme.colors.text.secondary }]}>
                {pets.length > 0
                  ? "Please select a pet to view their journal."
                  : "You don't have any pets yet. Add a pet to start journaling."}
              </Text>
              <TouchableOpacity
                style={[styles.selectPetButton, { backgroundColor: theme.colors.brand.primary }]}
                onPress={() => {
                  if (pets.length > 0) {
                    setShowPetSelector(true)
                  } else {
                    router.push("/(app)/create-pet")
                  }
                }}
              >
                <Text style={[styles.selectPetButtonText, { color: theme.colors.text.primary }]}>
                  {pets.length > 0 ? "Select Pet" : "Add a Pet"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : entries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="book-open" size={64} color={theme.colors.text.tertiary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>No Journal Entries</Text>
              <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
                Start documenting {selectedPet.name}'s journey by adding your first journal entry.
              </Text>
              <TouchableOpacity
                style={[styles.addEntryButton, { backgroundColor: theme.colors.brand.primary }]}
                onPress={() => setShowAddEntryModal(true)}
              >
                <Text style={[styles.addEntryButtonText, { color: theme.colors.text.primary }]}>Add First Entry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              style={styles.entriesContainer}
              contentContainerStyle={styles.entriesContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.brand.primary]} />
              }
            >
              {entries.map((entry) => (
                <JournalEntryComponent key={entry.id} entry={entry} onDelete={handleDeleteEntry} />
              ))}
            </ScrollView>
          )}

          {/* Add Entry Button */}
          {selectedPet && (
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.colors.brand.primary }]}
              onPress={() => setShowAddEntryModal(true)}
            >
              <Feather name="plus" size={24} color="#fff" />
            </TouchableOpacity>
          )}

          {/* Modals */}
          <PetSelector
            visible={showPetSelector}
            onClose={() => setShowPetSelector(false)}
            pets={pets}
            selectedPet={selectedPet}
            onSelectPet={handleSelectPet}
          />

          <AddEntryModal
            visible={showAddEntryModal}
            onClose={() => setShowAddEntryModal(false)}
            onSave={handleAddEntry}
            petName={selectedPet?.name || ""}
            loading={addingEntry}
          />
        </View>
      </TouchableWithoutFeedback>
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
    textAlign: "center",
  },
  petName: {
    fontSize: 14,
    fontWeight: "500",
  },
  addButton: {
    position: "absolute",
    bottom: 100, // Increased to position well above the tab bar
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10,
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
  noPetContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  noPetTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  noPetText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  selectPetButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  selectPetButtonText: {
    fontSize: 16,
    fontWeight: "600",
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
  },
  addEntryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  addEntryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  entriesContainer: {
    flex: 1,
  },
  entriesContent: {
    padding: 16,
    paddingBottom: 120, // Increased to provide more space at the bottom for the floating button
  },
  addPetButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
})
