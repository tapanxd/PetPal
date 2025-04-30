"use client"
import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native"
import { useTheme } from "../../app/theme"
import { Feather } from "@expo/vector-icons"
import { Button } from "../ui/Button"
import * as ImagePicker from "expo-image-picker"

interface AddEntryModalProps {
  visible: boolean
  onClose: () => void
  onSave: (content: string, imageUri?: string) => Promise<void>
  petName: string
  loading: boolean
}

// Changed to default export to match import pattern
export default function AddEntryModal({ visible, onClose, onSave, petName, loading }: AddEntryModalProps) {
  const theme = useTheme()
  const [content, setContent] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const resetForm = () => {
    setContent("")
    setSelectedImage(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSave = async () => {
    if (!content.trim() && !selectedImage) {
      return // Don't save empty entries
    }

    await onSave(content, selectedImage || undefined)
    resetForm()
  }

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error picking image:", error)
    }
  }

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()

      if (status !== "granted") {
        alert("Camera permission is required to take a photo")
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error taking photo:", error)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background.secondary }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
                New Journal Entry for {petName}
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <Feather name="x" size={24} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <TextInput
                style={[
                  styles.contentInput,
                  {
                    color: theme.colors.text.primary,
                    backgroundColor: theme.colors.background.tertiary,
                  },
                ]}
                placeholder="What's happening with your pet today?"
                placeholderTextColor={theme.colors.text.tertiary}
                multiline
                value={content}
                onChangeText={setContent}
              />

              {selectedImage && (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={[styles.removeImageButton, { backgroundColor: theme.colors.status.error }]}
                    onPress={() => setSelectedImage(null)}
                  >
                    <Feather name="x" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.imageButtonsContainer}>
                <TouchableOpacity
                  style={[styles.imageButton, { backgroundColor: theme.colors.background.tertiary }]}
                  onPress={pickImage}
                >
                  <Feather name="image" size={20} color={theme.colors.brand.primary} />
                  <Text style={[styles.imageButtonText, { color: theme.colors.text.primary }]}>Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.imageButton, { backgroundColor: theme.colors.background.tertiary }]}
                  onPress={takePhoto}
                >
                  <Feather name="camera" size={20} color={theme.colors.brand.primary} />
                  <Text style={[styles.imageButtonText, { color: theme.colors.text.primary }]}>Camera</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <Button
              label="Post"
              onPress={handleSave}
              loading={loading}
              disabled={loading || (!content.trim() && !selectedImage)}
              style={{ marginTop: 16 }}
            />
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  formContainer: {
    maxHeight: 400,
  },
  contentInput: {
    borderRadius: 12,
    padding: 12,
    minHeight: 120,
    textAlignVertical: "top",
    fontSize: 16,
    marginBottom: 16,
  },
  imagePreviewContainer: {
    position: "relative",
    marginBottom: 16,
    alignItems: "center",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  imageButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  imageButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  imageButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
})

