"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "../../app/theme"
import { Button } from "../ui/Button"
import * as ImagePicker from "expo-image-picker"
import { doc, updateDoc } from "firebase/firestore"
import { auth, db } from "../../firebaseConfig"
import { uploadDocumentToS3 } from "../../utils/storage"
import type { Pet } from "../../types/pet"

interface PetProfileSectionProps {
  pet: Pet
  petDetails: any
  onEditPress: () => void
  onDeletePress: () => void
  onPetUpdated: (updatedPet: Pet, updatedDetails: any) => void
}

export const PetProfileSection = ({
  pet,
  petDetails,
  onEditPress,
  onDeletePress,
  onPetUpdated,
}: PetProfileSectionProps) => {
  const theme = useTheme()
  const [uploadingImage, setUploadingImage] = useState(false)

  // Format date for display
  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return "Not set"
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Pick Image from Gallery
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        updatePetImage(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("Error", "Failed to pick image. Please try again.")
    }
  }

  // Take a photo with camera
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()

      if (status !== "granted") {
        Alert.alert("Permission needed", "Please grant camera permissions to take a photo")
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        updatePetImage(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error taking photo:", error)
      Alert.alert("Error", "Failed to take photo. Please try again.")
    }
  }

  // Update pet image
  const updatePetImage = async (imageUri: string) => {
    if (!pet || !auth.currentUser) return

    try {
      setUploadingImage(true)

      // Upload image to S3
      const uploadedImageUrl = await uploadDocumentToS3(imageUri, `pet-${pet.id}-profile.jpg`)

      if (!uploadedImageUrl) {
        throw new Error("Failed to upload image")
      }

      // Update pet document in Firestore
      const petDocRef = doc(db, "users", auth.currentUser.uid, "pets", pet.id)
      await updateDoc(petDocRef, {
        imageUrl: uploadedImageUrl,
      })

      // Update local state via callback
      const updatedPet = {
        ...pet,
        imageUrl: uploadedImageUrl,
      }

      const updatedDetails = {
        ...petDetails,
        imageUrl: uploadedImageUrl,
      }

      onPetUpdated(updatedPet, updatedDetails)

      Alert.alert("Success", "Pet profile picture updated successfully!")
    } catch (error) {
      console.error("Error updating pet image:", error)
      Alert.alert("Error", "Failed to update pet profile picture. Please try again.")
    } finally {
      setUploadingImage(false)
    }
  }

  return (
    <View style={[styles.petProfileSection, { backgroundColor: theme.colors.background.secondary }]}>
      <View style={styles.petProfileHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Pet Profile</Text>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: theme.colors.brand.primary }]}
          onPress={onEditPress}
        >
          <Feather name="edit-2" size={16} color="#fff" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.petProfileContent}>
        <TouchableOpacity style={styles.profileImageContainer} onPress={pickImage}>
          {uploadingImage ? (
            <View style={[styles.profileImage, { backgroundColor: theme.colors.background.tertiary }]}>
              <ActivityIndicator color={theme.colors.brand.primary} />
            </View>
          ) : (
            <Image
              source={{ uri: pet.imageUrl }}
              style={styles.profileImage}
              defaultSource={require("../../assets/images/logo.png")}
            />
          )}
          <View style={[styles.imageEditBadge, { backgroundColor: theme.colors.brand.primary }]}>
            <Feather name="camera" size={14} color="#fff" />
          </View>
        </TouchableOpacity>

        <View style={styles.petDetailsContainer}>
          <View style={styles.petDetailRow}>
            <Text style={[styles.petDetailLabel, { color: theme.colors.text.secondary }]}>Name:</Text>
            <Text style={[styles.petDetailValue, { color: theme.colors.text.primary }]}>{petDetails.name}</Text>
          </View>

          <View style={styles.petDetailRow}>
            <Text style={[styles.petDetailLabel, { color: theme.colors.text.secondary }]}>Type:</Text>
            <Text style={[styles.petDetailValue, { color: theme.colors.text.primary }]}>
              {petDetails.type ? petDetails.type.charAt(0).toUpperCase() + petDetails.type.slice(1) : "N/A"}
            </Text>
          </View>

          <View style={styles.petDetailRow}>
            <Text style={[styles.petDetailLabel, { color: theme.colors.text.secondary }]}>Breed:</Text>
            <Text style={[styles.petDetailValue, { color: theme.colors.text.primary }]}>
              {petDetails.breed || "N/A"}
            </Text>
          </View>

          <View style={styles.petDetailRow}>
            <Text style={[styles.petDetailLabel, { color: theme.colors.text.secondary }]}>Age:</Text>
            <Text style={[styles.petDetailValue, { color: theme.colors.text.primary }]}>
              {petDetails.age ? `${petDetails.age} years` : "N/A"}
            </Text>
          </View>

          {petDetails.birthdate && (
            <View style={styles.petDetailRow}>
              <Text style={[styles.petDetailLabel, { color: theme.colors.text.secondary }]}>Birthdate:</Text>
              <Text style={[styles.petDetailValue, { color: theme.colors.text.primary }]}>
                {formatDate(petDetails.birthdate?.toDate ? petDetails.birthdate.toDate() : null)}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.petActionsContainer}>
        <Button
          label="Change Photo"
          onPress={pickImage}
          variant="outline"
          icon={<Feather name="image" size={16} color={theme.colors.brand.primary} />}
          style={{ flex: 1 }}
        />
        <Button
          label="Take Photo"
          onPress={takePhoto}
          variant="outline"
          icon={<Feather name="camera" size={16} color={theme.colors.brand.primary} />}
          style={{ flex: 1 }}
        />
      </View>

      <TouchableOpacity
        style={[styles.deletePetButton, { borderColor: theme.colors.status.error }]}
        onPress={onDeletePress}
      >
        <Feather name="trash-2" size={16} color={theme.colors.status.error} />
        <Text style={[styles.deletePetButtonText, { color: theme.colors.status.error }]}>Delete Pet</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  petProfileSection: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  petProfileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  petProfileContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  profileImageContainer: {
    position: "relative",
    marginRight: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  imageEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  petDetailsContainer: {
    flex: 1,
  },
  petDetailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  petDetailLabel: {
    width: 70,
    fontSize: 14,
    fontWeight: "500",
  },
  petDetailValue: {
    flex: 1,
    fontSize: 14,
  },
  petActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  deletePetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  deletePetButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
})

