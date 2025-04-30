"use client"

import { useState, useEffect, useCallback } from "react"
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Text,
} from "react-native"
import { useTheme } from "../theme"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { auth, db } from "../../firebaseConfig"
import { doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore"
import { signOut } from "firebase/auth"
import { usePet } from "../context/PetContext"
import type { Pet } from "../../types/pet"

// Components
import { PetSelector } from "../../components/health/PetSelector"
import { PetProfileSection } from "../../components/profile/PetProfileSection"
import { UserSettingsSection } from "../../components/profile/UserSettingsSection"
import { EditPetModal } from "../../components/profile/EditPetModal"
import { DeleteConfirmationModal } from "../../components/profile/DeleteConfirmationModal"
import { NoPetSelected } from "../../components/profile/NoPetSelected"

export default function ProfileScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { pets, selectedPet, selectPet, loading: petsLoading, refreshPets } = usePet()

  // States
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [petDetails, setPetDetails] = useState<any>(null)
  const [showPetSelector, setShowPetSelector] = useState(false)
  const [showEditPetModal, setShowEditPetModal] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [editPetName, setEditPetName] = useState("")
  const [editPetBreed, setEditPetBreed] = useState("")
  const [editPetAge, setEditPetAge] = useState("")
  const [editPetBirthdate, setEditPetBirthdate] = useState<Date | null>(null)

  // User settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [darkModeEnabled, setDarkModeEnabled] = useState(true)
  const [locationEnabled, setLocationEnabled] = useState(true)

  // Calculate age from birthdate
  const calculateAge = (birthdate: Date | null): string => {
    if (!birthdate) return ""

    const today = new Date()
    let age = today.getFullYear() - birthdate.getFullYear()
    const monthDiff = today.getMonth() - birthdate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
      age--
    }

    return age.toString()
  }

  // Function to fetch pet details
  const fetchPetDetails = useCallback(
    async (showLoadingIndicator = true) => {
      if (!selectedPet || !auth.currentUser) {
        setLoading(false)
        return
      }

      try {
        if (showLoadingIndicator) {
          setLoading(true)
        }
        const petDocRef = doc(db, "users", auth.currentUser.uid, "pets", selectedPet.id)
        const petDoc = await getDoc(petDocRef)

        if (petDoc.exists()) {
          const data = petDoc.data()
          setPetDetails(data)
          setEditPetName(data.name || "")
          setEditPetBreed(data.breed || "")

          // Handle birthdate
          if (data.birthdate) {
            const birthdate = data.birthdate.toDate()
            setEditPetBirthdate(birthdate)
            setEditPetAge(calculateAge(birthdate))
          } else {
            setEditPetAge(data.age?.toString() || "")
            setEditPetBirthdate(null)
          }
        }
      } catch (error) {
        console.error("Error fetching pet details:", error)
        Alert.alert("Error", "Failed to load pet details. Please try again.")
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [selectedPet],
  )

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      // Refresh pets list
      await refreshPets()

      // Refresh selected pet details if available
      if (selectedPet) {
        await fetchPetDetails(false)
      }
    } catch (error) {
      console.error("Error refreshing profile data:", error)
      Alert.alert("Error", "Failed to refresh profile data. Please try again.")
    } finally {
      setRefreshing(false)
    }
  }, [selectedPet, refreshPets, fetchPetDetails])

  // Fetch detailed pet information when selected pet changes
  useEffect(() => {
    fetchPetDetails()
  }, [fetchPetDetails, selectedPet])

  // Handle sign out
  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        onPress: async () => {
          try {
            await signOut(auth)
            router.replace("/(auth)/login")
          } catch (error) {
            console.error("Error signing out:", error)
            Alert.alert("Error", "Failed to sign out. Please try again.")
          }
        },
      },
    ])
  }

  // Update pet details
  const handleUpdatePetDetails = async () => {
    if (!selectedPet || !auth.currentUser) return

    try {
      setLoading(true)

      // Prepare update data
      const updateData: any = {
        name: editPetName,
        breed: editPetBreed,
      }

      // If birthdate is set, use it instead of manual age
      if (editPetBirthdate) {
        updateData.birthdate = editPetBirthdate
        updateData.age = Number.parseInt(calculateAge(editPetBirthdate), 10)
      } else if (editPetAge) {
        updateData.age = Number.parseInt(editPetAge, 10)
      }

      // Update pet document in Firestore
      const petDocRef = doc(db, "users", auth.currentUser.uid, "pets", selectedPet.id)
      await updateDoc(petDocRef, updateData)

      // Update local state
      selectPet({
        ...selectedPet,
        name: editPetName,
      })

      setPetDetails({
        ...petDetails,
        ...updateData,
      })

      // Close modal
      setShowEditPetModal(false)
      Alert.alert("Success", "Pet details updated successfully!")
    } catch (error) {
      console.error("Error updating pet details:", error)
      Alert.alert("Error", "Failed to update pet details. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Delete pet
  const handleDeletePet = async () => {
    if (!selectedPet || !auth.currentUser) return

    try {
      setLoading(true)

      // Delete pet document from Firestore
      const petDocRef = doc(db, "users", auth.currentUser.uid, "pets", selectedPet.id)
      await deleteDoc(petDocRef)

      // Close modal
      setShowDeleteConfirmation(false)
      Alert.alert("Success", "Pet deleted successfully!")

      // Navigate back to pet selector
      router.replace("/(app)/pet-profile-selector")
    } catch (error) {
      console.error("Error deleting pet:", error)
      Alert.alert("Error", "Failed to delete pet. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle pet selection
  const handleSelectPet = (pet: Pet) => {
    selectPet(pet)
    setShowPetSelector(false)
  }

  // Handle pet update from child component
  const handlePetUpdated = (updatedPet: Pet, updatedDetails: any) => {
    selectPet(updatedPet)
    setPetDetails(updatedDetails)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]} edges={["top"]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
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
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.screenTitle, { color: theme.colors.text.primary }]}>Profile</Text>

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

            {petsLoading || loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.brand.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
                  Loading profile data...
                </Text>
              </View>
            ) : (
              <>
                {/* Pet Profile Section */}
                {selectedPet && petDetails ? (
                  <PetProfileSection
                    pet={selectedPet}
                    petDetails={petDetails}
                    onEditPress={() => setShowEditPetModal(true)}
                    onDeletePress={() => setShowDeleteConfirmation(true)}
                    onPetUpdated={handlePetUpdated}
                  />
                ) : (
                  <NoPetSelected
                    hasPets={pets.length > 0}
                    onSelectPet={() => setShowPetSelector(true)}
                    onAddPet={() => router.push("/(app)/create-pet")}
                  />
                )}

                {/* User Settings Section */}
                <UserSettingsSection
                  notificationsEnabled={notificationsEnabled}
                  darkModeEnabled={darkModeEnabled}
                  locationEnabled={locationEnabled}
                  onNotificationsChange={setNotificationsEnabled}
                  onDarkModeChange={setDarkModeEnabled}
                  onLocationChange={setLocationEnabled}
                  onSignOut={handleSignOut}
                />
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {/* Pet Selector Modal */}
      <PetSelector
        visible={showPetSelector}
        onClose={() => setShowPetSelector(false)}
        pets={pets}
        selectedPet={selectedPet}
        onSelectPet={handleSelectPet}
      />

      {/* Edit Pet Modal */}
      <EditPetModal
        visible={showEditPetModal}
        onClose={() => setShowEditPetModal(false)}
        petName={editPetName}
        petBreed={editPetBreed}
        petAge={editPetAge}
        petBirthdate={editPetBirthdate}
        onPetNameChange={setEditPetName}
        onPetBreedChange={setEditPetBreed}
        onPetAgeChange={setEditPetAge}
        onPetBirthdateChange={(date) => {
          setEditPetBirthdate(date)
          setEditPetAge(calculateAge(date))
        }}
        onSave={handleUpdatePetDetails}
        loading={loading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        petName={selectedPet?.name || ""}
        onConfirm={handleDeletePet}
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
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
})
