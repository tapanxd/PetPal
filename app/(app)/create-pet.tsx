"use client"

import { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
} from "react-native"
import * as ImagePicker from "expo-image-picker"
import { useRouter } from "expo-router"
import { addDoc, collection } from "firebase/firestore"
import { db, auth } from "../../firebaseConfig"
import { useTheme } from "../../app/theme"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"

const { width } = Dimensions.get("window")

// Pet types with icons
const petTypes = [
  { value: "dog", label: "Dog", icon: "dog" },
  { value: "cat", label: "Cat", icon: "cat" },
  { value: "bird", label: "Bird", icon: "bird" },
  { value: "rabbit", label: "Rabbit", icon: "rabbit" },
  { value: "fish", label: "Fish", icon: "fish" },
  { value: "other", label: "Other", icon: "paw" },
]

// Load AWS Credentials from .env
const S3_BUCKET_NAME = process.env.EXPO_PUBLIC_S3_BUCKET_NAME
const S3_REGION = process.env.EXPO_PUBLIC_S3_REGION
const S3_ACCESS_KEY = process.env.EXPO_PUBLIC_S3_ACCESS_KEY
const S3_SECRET_KEY = process.env.EXPO_PUBLIC_S3_SECRET_KEY

export default function CreatePet() {
  const router = useRouter()
  const theme = useTheme()
  const [petName, setPetName] = useState("")
  const [petAge, setPetAge] = useState("")
  const [petType, setPetType] = useState("")
  const [petBreed, setPetBreed] = useState("")
  const [image, setImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  // Pick Image from Gallery
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    })

    if (!result.canceled) {
      setImage(result.assets[0].uri)
    }
  }

  // Take a photo with camera
  const takePhoto = async () => {
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

    if (!result.canceled) {
      setImage(result.assets[0].uri)
    }
  }

  // Upload Image to S3
  const uploadImageToS3 = async (uri: string): Promise<string | null> => {
    try {
      setUploading(true)

      const response = await fetch(uri)
      const blob = await response.blob()
      const fileName = `pets-${auth.currentUser?.uid}-${Date.now()}.jpg`

      // Generate Authorization Headers
      const date = new Date().toUTCString()
      const stringToSign = `PUT

                      image/jpeg
                      ${date}
                      /${S3_BUCKET_NAME}/${fileName}`

      const uploadURL = `https://${S3_BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com/${fileName}`

      const uploadRes = await fetch(uploadURL, {
        method: "PUT",
        body: blob,
        headers: {
          "Content-Type": "image/jpeg",
        },
      })

      if (!uploadRes.ok) throw new Error("Failed to upload image")

      console.log("✅ Image uploaded successfully:", uploadURL)
      return uploadURL
    } catch (error: unknown) {
      console.error("❌ Image upload failed:", error instanceof Error ? error.message : error)
      Alert.alert("Upload Error", error instanceof Error ? error.message : "Unknown upload error.")
      return null
    } finally {
      setUploading(false)
    }
  }

  // Save Pet Details to Firestore
  const handleSavePet = async () => {
    if (!petName) {
      Alert.alert("Error", "Please enter your pet's name")
      return
    }

    if (!petType) {
      Alert.alert("Error", "Please select your pet's type")
      return
    }

    const user = auth.currentUser
    if (!user) {
      Alert.alert("Error", "User not found.")
      return
    }

    setUploading(true)

    try {
      let uploadedImageUrl = ""
      if (image) {
        const uploadResult = await uploadImageToS3(image)
        if (uploadResult) {
          uploadedImageUrl = uploadResult
        }
      }

      await addDoc(collection(db, "users", user.uid, "pets"), {
        name: petName,
        age: petAge,
        type: petType,
        breed: petBreed,
        imageUrl: uploadedImageUrl,
        createdAt: new Date(),
      })

      Alert.alert("Success", "Pet added successfully!", [
        { text: "OK", onPress: () => router.push("/pet-profile-selector") },
      ])
    } catch (error) {
      console.error("Error saving pet:", error)
      Alert.alert("Error", "Could not save pet. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]} edges={["top"]}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.imageSection}>
            <TouchableOpacity
              onPress={pickImage}
              style={[
                styles.imageContainer,
                {
                  backgroundColor: theme.colors.background.secondary,
                  borderColor: image ? theme.colors.brand.primary : "transparent",
                },
              ]}
            >
              {image ? (
                <Image source={{ uri: image }} style={styles.petImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Feather name="camera" size={40} color={theme.colors.brand.primary} />
                  <Text style={[styles.uploadText, { color: theme.colors.text.secondary }]}>Upload Photo</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.imageButtons}>
              <TouchableOpacity
                onPress={pickImage}
                style={[styles.imageButton, { backgroundColor: theme.colors.background.secondary }]}
              >
                <Feather name="image" size={20} color={theme.colors.brand.primary} />
                <Text style={[styles.imageButtonText, { color: theme.colors.text.primary }]}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={takePhoto}
                style={[styles.imageButton, { backgroundColor: theme.colors.background.secondary }]}
              >
                <Feather name="camera" size={20} color={theme.colors.brand.primary} />
                <Text style={[styles.imageButtonText, { color: theme.colors.text.primary }]}>Camera</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Pet Details</Text>

            <Input
              label="Pet Name *"
              placeholder="Enter pet name"
              value={petName}
              onChangeText={setPetName}
              leftIcon={<Feather name="user" size={18} color={theme.colors.brand.primary} />}
            />

            <Input
              label="Age"
              placeholder="Enter age (years)"
              keyboardType="numeric"
              value={petAge}
              onChangeText={setPetAge}
              leftIcon={<Feather name="calendar" size={18} color={theme.colors.brand.primary} />}
            />

            <Text style={[styles.inputLabel, { color: theme.colors.text.secondary }]}>Pet Type *</Text>
            <View style={styles.petTypeContainer}>
              {petTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.petTypeButton,
                    {
                      backgroundColor:
                        petType === type.value ? theme.colors.brand.primary : theme.colors.background.secondary,
                      borderColor: petType === type.value ? theme.colors.brand.primary : theme.colors.border,
                    },
                  ]}
                  onPress={() => setPetType(type.value)}
                >
                  <MaterialCommunityIcons
                    name={type.icon as any}
                    size={24}
                    color={petType === type.value ? theme.colors.text.primary : theme.colors.brand.primary}
                  />
                  <Text
                    style={[
                      styles.petTypeText,
                      {
                        color: petType === type.value ? theme.colors.text.primary : theme.colors.text.secondary,
                      },
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Breed"
              placeholder="Enter breed (optional)"
              value={petBreed}
              onChangeText={setPetBreed}
              leftIcon={<MaterialCommunityIcons name="paw" size={18} color={theme.colors.brand.primary} />}
            />

            <Button
              label={uploading ? "Saving..." : "Save Pet"}
              onPress={handleSavePet}
              disabled={uploading || !petName || !petType}
              loading={uploading}
              style={styles.saveButton}
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {uploading && (
        <View style={[styles.loadingOverlay, { backgroundColor: "rgba(0,0,0,0.7)" }]}>
          <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background.secondary }]}>
            <ActivityIndicator size="large" color={theme.colors.brand.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text.primary }]}>Saving your pet...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
  imageSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  imageContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 3,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  petImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadText: {
    marginTop: 8,
    fontSize: 14,
  },
  imageButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  imageButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  imageButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  formSection: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 12,
    marginTop: 8,
  },
  petTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  petTypeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    width: (width - 56) / 2,
    marginBottom: 12,
    borderWidth: 1,
  },
  petTypeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  saveButton: {
    marginTop: 24,
    height: 56,
    borderRadius: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingContainer: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    width: "80%",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
})

