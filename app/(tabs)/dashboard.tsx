"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  BackHandler,
  Alert,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  RefreshControl, // Add this import
} from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useTheme } from "../theme"
import { Feather } from "@expo/vector-icons"
import { WeatherCard } from "../../components/weather/WeatherCard"
import { WeightDisplay } from "../../components/health/WeightDisplay"
import { RemindersSection } from "../../components/reminders/RemindersSection"
import { fetchPetHealthData } from "../../utils/firestore"
import { PetSelector } from "../../components/health/PetSelector"
import type { WeightEntry } from "../../types/health"
import { usePet } from "../context/PetContext"
import type { Pet } from "../../types/pet"
import { auth } from "../../firebaseConfig"
import { SafeAreaView } from "react-native-safe-area-context"
import { setupNotifications } from "../../utils/reminders"

const { width } = Dimensions.get("window")

export default function Dashboard() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const theme = useTheme()
  const { pets, selectedPet, selectPet, loading: petsLoading, refreshPets } = usePet()
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [showPetSelector, setShowPetSelector] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      if (!auth.currentUser) {
        console.log("No authenticated user in dashboard, redirecting to login")
        router.replace("/(auth)/login")
      }
    }

    checkAuth()
  }, [router])

  // Handle back button press
  useEffect(() => {
    const backAction = () => {
      Alert.alert("Exit App", "Are you sure you want to exit?", [
        { text: "Cancel", onPress: () => null, style: "cancel" },
        { text: "Yes", onPress: () => BackHandler.exitApp() },
      ])
      return true // Prevent default behavior
    }

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction)
    return () => backHandler.remove()
  }, [])

  // Setup notifications when app loads
  useEffect(() => {
    setupNotifications().catch((err) => {
      console.error("Error setting up notifications:", err)
    })
  }, [])

  // Refresh pets when dashboard loads
  useEffect(() => {
    const loadPets = async () => {
      if (!auth.currentUser) return

      try {
        await refreshPets()
      } catch (error) {
        console.error("Error refreshing pets:", error)
      }
    }

    loadPets()
  }, [refreshPets])

  // Fetch weight data when selected pet changes
  useEffect(() => {
    const fetchWeightData = async () => {
      if (!selectedPet) {
        setLoading(false)
        return
      }

      try {
        console.log(`Fetching weight data for pet: ${selectedPet.name} (${selectedPet.id})`)
        setLoading(true)
        setError(null)

        const data = await fetchPetHealthData(selectedPet.id)
        console.log(`Weight data fetched: ${data.weightEntries.length} entries`)
        setWeightEntries(data.weightEntries)
        setDataLoaded(true)
      } catch (error) {
        console.error("Error fetching weight data:", error)
        setError("Failed to load pet data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchWeightData()
  }, [selectedPet])

  // Handle pet selection
  const handleSelectPet = (pet: Pet) => {
    console.log(`Selecting pet in dashboard: ${pet.name} (${pet.id})`)
    selectPet(pet)
    setShowPetSelector(false)
  }

  // Navigate to health tab
  const navigateToHealth = () => {
    if (selectedPet) {
      router.push(`/(tabs)/health?petId=${selectedPet.id}`)
    }
  }

  // Add a refresh function to reload data
  const handleRefresh = async () => {
    if (!selectedPet) return

    setRefreshing(true)
    try {
      // Refresh pets data
      await refreshPets()

      // Refresh pet-specific data if a pet is selected
      if (selectedPet) {
        const data = await fetchPetHealthData(selectedPet.id)
        setWeightEntries(data.weightEntries)
      }
    } catch (error) {
      console.error("Error refreshing data:", error)
      // Optionally show an error message
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background.primary} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 100 }, // Increase bottom padding to prevent content from being hidden by tab bar
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.brand.primary]}
              tintColor={theme.colors.brand.primary}
            />
          }
        >
          {/* Header with Logo and Pet Selector */}
          <View style={styles.header}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
              defaultSource={require("../../assets/images/logo.png")}
            />

            {selectedPet ? (
              <TouchableOpacity onPress={() => setShowPetSelector(true)} activeOpacity={0.7}>
                {selectedPet.imageUrl ? (
                  <Image
                    source={{ uri: selectedPet.imageUrl }}
                    style={styles.petSelectorImage}
                    defaultSource={require("../../assets/images/logo.png")}
                  />
                ) : (
                  <View style={[styles.petSelectorInitial, { backgroundColor: theme.colors.brand.primary }]}>
                    <Text style={[styles.petSelectorInitialText, { color: theme.colors.text.primary }]}>
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

          {petsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.brand.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>Loading pets...</Text>
            </View>
          ) : !selectedPet ? (
            <View style={styles.noPetContainer}>
              <Text style={[styles.noPetText, { color: theme.colors.text.primary }]}>
                {pets.length > 0
                  ? "Please select a pet to view their dashboard."
                  : "No pets found. Add a pet to get started."}
              </Text>
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
                <Text style={[styles.addPetButtonText, { color: theme.colors.text.primary }]}>
                  {pets.length > 0 ? "Select Pet" : "Add a Pet"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.brand.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
                Loading {selectedPet.name}'s data...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={40} color={theme.colors.status.error} />
              <Text style={[styles.errorText, { color: theme.colors.text.primary }]}>{error}</Text>
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: theme.colors.brand.primary }]}
                onPress={() => {
                  if (selectedPet) {
                    setLoading(true)
                    fetchPetHealthData(selectedPet.id)
                      .then((data) => {
                        setWeightEntries(data.weightEntries)
                        setError(null)
                      })
                      .catch((err) => {
                        console.error("Error retrying fetch:", err)
                        setError("Failed to load pet data. Please try again.")
                      })
                      .finally(() => setLoading(false))
                  }
                }}
              >
                <Text style={{ color: theme.colors.text.primary }}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Pet Info */}
              <View style={styles.petContainer}>
                <Image
                  source={{ uri: selectedPet.imageUrl }}
                  style={styles.petImage}
                  defaultSource={require("../../assets/images/logo.png")}
                  onError={() => console.log("Error loading pet image")}
                />
                <Text style={[styles.petName, { color: theme.colors.text.primary }]}>{selectedPet.name}</Text>
              </View>

              {/* Weight Display */}
              <WeightDisplay weightEntries={weightEntries} onPress={navigateToHealth} />

              {/* Weather Card */}
              <View style={[styles.weatherContainer, { backgroundColor: theme.colors.background.secondary }]}>
                <WeatherCard petName={selectedPet?.name} />
              </View>

              {/* Reminders Section */}
              {selectedPet && <RemindersSection petId={selectedPet.id} petName={selectedPet.name} />}
            </>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* Pet Selector Modal */}
      <PetSelector
        visible={showPetSelector}
        onClose={() => setShowPetSelector(false)}
        pets={pets}
        selectedPet={selectedPet}
        onSelectPet={handleSelectPet}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
  },
  logo: {
    width: 100,
    height: 28,
    resizeMode: "contain",
  },
  petSelectorImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  petSelectorInitial: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  petSelectorInitialText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  petSelectorText: {
    fontSize: 14,
    fontWeight: "500",
  },
  petContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  petImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  petName: {
    fontSize: 22,
    fontWeight: "bold",
  },
  weatherContainer: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  noPetContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  noPetText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  addPetButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  addPetButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
})

