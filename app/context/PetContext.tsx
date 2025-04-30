"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect, useCallback } from "react"
import { useRouter, useLocalSearchParams, useSegments } from "expo-router"
import { auth, db } from "../../firebaseConfig"
import { collection, getDocs } from "firebase/firestore"
import type { Pet } from "../../types/pet"

interface PetContextType {
  pets: Pet[]
  selectedPet: Pet | null
  setPets: (pets: Pet[]) => void
  selectPet: (pet: Pet) => void
  loading: boolean
  refreshPets: () => Promise<void>
}

const PetContext = createContext<PetContextType>({
  pets: [],
  selectedPet: null,
  setPets: () => {},
  selectPet: () => {},
  loading: true,
  refreshPets: async () => {},
})

export const usePet = () => useContext(PetContext)

export const PetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pets, setPets] = useState<Pet[]>([])
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useLocalSearchParams()
  const petId = params.petId as string | undefined
  const segments = useSegments()

  // Function to fetch pets - made reusable so we can call it when needed
  const fetchPets = useCallback(async () => {
    try {
      // Check if auth is initialized and user is logged in
      if (!auth.currentUser) {
        console.log("No authenticated user found in PetContext. Redirecting to login...")
        router.replace("/(auth)/login")
        return false
      }

      setLoading(true)
      console.log(`Fetching pets for user: ${auth.currentUser.uid}`)

      const petsCollection = collection(db, "users", auth.currentUser.uid, "pets")
      const petsSnapshot = await getDocs(petsCollection)

      if (petsSnapshot.empty) {
        console.log("No pets found for user")
        setPets([])
        setSelectedPet(null)
        setLoading(false)
        return false
      }

      const petsList = petsSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "Unnamed Pet",
        imageUrl: doc.data().imageUrl || undefined,
      }))

      console.log(`Found ${petsList.length} pets:`, petsList.map((p) => `${p.name} (${p.id})`).join(", "))
      setPets(petsList)

      return true
    } catch (error) {
      console.error("Error fetching pets:", error)
      return false
    } finally {
      setLoading(false)
    }
  }, [router])

  // Public method to refresh pets
  const refreshPets = useCallback(async () => {
    await fetchPets()
  }, [fetchPets])

  // Handle pet ID from URL params
  useEffect(() => {
    const handlePetIdFromParams = async () => {
      // If we don't have pets yet or are still loading, don't try to select a pet
      if (pets.length === 0 || loading) return

      // Check if we're on the pet selector screen by examining the URL segments
      const isPetSelectorScreen = segments.some((segment) => segment === "pet-profile-selector")

      // If we're on the pet selector screen, don't auto-select
      if (isPetSelectorScreen) {
        console.log("On pet selector screen, not auto-selecting pet")
        return
      }

      if (petId) {
        console.log(`Looking for pet with ID from URL params: ${petId}`)
        const foundPet = pets.find((pet) => pet.id === petId)

        if (foundPet) {
          console.log(`Found pet from URL params: ${foundPet.name} (${foundPet.id})`)
          setSelectedPet(foundPet)
        } else {
          console.log(`Pet with ID ${petId} not found in user's pets. Selecting first pet.`)
          // If pet not found but we have pets, select the first one
          if (pets.length > 0) {
            setSelectedPet(pets[0])
            router.replace(`/(tabs)/dashboard?petId=${pets[0].id}` as any)
          }
        }
      } else if (pets.length > 0 && !selectedPet) {
        // If no petId in URL but we have pets and no selection, select the first pet
        // But only do this if we're not on the pet selector screen
        console.log(`No pet ID in params. Selecting first pet: ${pets[0].name} (${pets[0].id})`)
        setSelectedPet(pets[0])
        router.replace(`/(tabs)/dashboard?petId=${pets[0].id}` as any)
      }
    }

    handlePetIdFromParams()
  }, [pets, petId, router, loading, selectedPet, segments])

  // Initial fetch of pets
  useEffect(() => {
    // Set up auth state listener
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log("User authenticated in PetContext:", user.uid)
        await fetchPets()
      } else {
        console.log("No authenticated user in PetContext")
        setPets([])
        setSelectedPet(null)
        setLoading(false)
        router.replace("/(auth)/login")
      }
    })

    return () => {
      unsubscribeAuth()
    }
  }, [fetchPets, router])

  // Function to select a pet and update the URL
  const selectPet = useCallback(
    (pet: Pet) => {
      console.log(`Selecting pet in context: ${pet.name} (${pet.id})`)
      setSelectedPet(pet)

      // Update the URL to include the selected pet ID
      // Instead of using router.pathname which doesn't exist, use a fixed path
      const newRoute = `/(tabs)/dashboard?petId=${pet.id}`
      console.log(`Updating route to: ${newRoute}`)
      router.replace(newRoute as any)
    },
    [router],
  )

  return (
    <PetContext.Provider
      value={{
        pets,
        selectedPet,
        setPets,
        selectPet,
        loading,
        refreshPets,
      }}
    >
      {children}
    </PetContext.Provider>
  )
}

export default PetProvider

