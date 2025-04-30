"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  BackHandler,
  ActivityIndicator,
} from "react-native"
import { useRouter } from "expo-router"
import { auth } from "../../firebaseConfig"
import { signOut } from "firebase/auth"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "../../app/theme"
import { usePet } from "../context/PetContext"
import type { Pet } from "../../types/pet"

export default function PetProfileSelector() {
  const router = useRouter()
  const theme = useTheme()
  const { pets, setPets, selectPet, loading: contextLoading, refreshPets } = usePet()
  const [loading, setLoading] = useState(true)

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      if (!auth.currentUser) {
        console.log("No authenticated user in pet selector, redirecting to login")
        router.replace("/(auth)/login")
        return
      }

      // Refresh pets from the context but don't auto-select
      setLoading(true)
      await refreshPets()
      setLoading(false)
    }

    checkAuth()
  }, [router, refreshPets])

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

  // Handle sign out
  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        onPress: async () => {
          try {
            await signOut(auth)
            // Explicitly navigate to login screen after sign out
            router.replace("/(auth)/login")
          } catch (error) {
            console.error("Error signing out:", error)
            Alert.alert("Error", "Failed to sign out. Please try again.")
          }
        },
      },
    ])
  }

  // Handle pet selection
  const handleSelectPet = (pet: Pet) => {
    console.log(`Selected pet in selector: ${pet.name} (${pet.id})`)
    selectPet(pet)
    router.push({
      pathname: "/(tabs)/dashboard",
      params: { petId: pet.id },
    })
  }

  const isLoading = loading || contextLoading

  // Update the pet profile selector layout
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: theme.colors.text.primary, fontSize: 22 }]}>Select Your Pet</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Feather name="log-out" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.brand.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>Loading your pets...</Text>
        </View>
      ) : pets.length > 0 ? (
        <ScrollView contentContainerStyle={styles.bubbleContainer}>
          {pets.map((pet) => (
            <TouchableOpacity key={pet.id} onPress={() => handleSelectPet(pet)} style={styles.petItemContainer}>
              <View
                style={[
                  styles.petCircle,
                  { backgroundColor: theme.colors.background.secondary, borderColor: theme.colors.brand.primary },
                ]}
              >
                {pet.imageUrl ? (
                  <Image source={{ uri: pet.imageUrl }} style={styles.petImage} />
                ) : (
                  <View style={[styles.petInitialContainer, { backgroundColor: theme.colors.brand.primary }]}>
                    <Text style={[styles.petInitial, { color: theme.colors.text.primary }]}>
                      {pet.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[styles.petNameOutside, { color: theme.colors.text.primary }]}>{pet.name}</Text>
            </TouchableOpacity>
          ))}

          {/* Add New Pet Button */}
          <TouchableOpacity onPress={() => router.push("/create-pet")} style={styles.petItemContainer}>
            <View style={[styles.petCircle, { backgroundColor: theme.colors.brand.primary }]}>
              <Feather name="plus" size={40} color={theme.colors.text.primary} />
            </View>
            <Text style={[styles.petNameOutside, { color: theme.colors.text.primary }]}>Add Pet</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.noPetContainer}>
          <Text style={[styles.noPetTitle, { color: theme.colors.text.primary }]}>No Pets Found</Text>
          <Text style={[styles.noPetText, { color: theme.colors.text.secondary }]}>
            You don't have any pets yet. Add your first pet to get started.
          </Text>
          <TouchableOpacity
            style={[styles.addPetButton, { backgroundColor: theme.colors.brand.primary }]}
            onPress={() => router.push("/create-pet")}
          >
            <Text style={[styles.addPetButtonText, { color: theme.colors.text.primary }]}>Add Your First Pet</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

// Update the styles for the pet profile selector
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
    width: "90%",
    paddingHorizontal: 10,
  },
  title: {
    fontWeight: "bold",
    textAlign: "left",
  },
  signOutButton: {
    padding: 8,
  },
  bubbleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingBottom: 20,
  },
  petItemContainer: {
    width: 120,
    alignItems: "center",
    margin: 10,
  },
  petCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 2,
  },
  petImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  petInitialContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  petInitial: {
    fontSize: 40,
    fontWeight: "bold",
  },
  petNameOutside: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
    textAlign: "center",
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
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  noPetText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  addPetButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  addPetButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
})

