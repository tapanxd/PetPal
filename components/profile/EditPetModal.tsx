"use client"
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons"
import { useTheme } from "../../app/theme"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { DatePicker } from "../ui/DatePicker"

interface EditPetModalProps {
  visible: boolean
  onClose: () => void
  petName: string
  petBreed: string
  petAge: string
  petBirthdate: Date | null
  onPetNameChange: (name: string) => void
  onPetBreedChange: (breed: string) => void
  onPetAgeChange: (age: string) => void
  onPetBirthdateChange: (date: Date) => void
  onSave: () => void
  loading: boolean
}

export const EditPetModal = ({
  visible,
  onClose,
  petName,
  petBreed,
  petAge,
  petBirthdate,
  onPetNameChange,
  onPetBreedChange,
  onPetAgeChange,
  onPetBirthdateChange,
  onSave,
  loading,
}: EditPetModalProps) => {
  const theme = useTheme()

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

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.background.secondary }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>Edit Pet Details</Text>
                <TouchableOpacity onPress={onClose}>
                  <Feather name="x" size={24} color={theme.colors.text.secondary} />
                </TouchableOpacity>
              </View>

              <ScrollView>
                <Input
                  label="Pet Name"
                  placeholder="Enter pet name"
                  value={petName}
                  onChangeText={onPetNameChange}
                  leftIcon={<Feather name="user" size={18} color={theme.colors.brand.primary} />}
                />

                <Input
                  label="Breed (optional)"
                  placeholder="Enter breed"
                  value={petBreed}
                  onChangeText={onPetBreedChange}
                  leftIcon={<MaterialCommunityIcons name="paw" size={18} color={theme.colors.brand.primary} />}
                />

                <View style={styles.birthdateContainer}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text.secondary }]}>Birthdate (optional)</Text>
                  <DatePicker value={petBirthdate} onChange={onPetBirthdateChange} placeholder="Select birthdate" />
                  {petBirthdate && (
                    <Text style={[styles.calculatedAge, { color: theme.colors.text.secondary }]}>
                      Age: {calculateAge(petBirthdate)} years
                    </Text>
                  )}
                </View>

                {!petBirthdate && (
                  <Input
                    label="Age (years, optional)"
                    placeholder="Enter age"
                    keyboardType="numeric"
                    value={petAge}
                    onChangeText={onPetAgeChange}
                    leftIcon={<Feather name="calendar" size={18} color={theme.colors.brand.primary} />}
                  />
                )}

                <Button
                  label="Save Changes"
                  onPress={onSave}
                  style={{ marginTop: 16 }}
                  loading={loading}
                  disabled={loading || !petName}
                />
              </ScrollView>
            </View>
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
  birthdateContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  calculatedAge: {
    fontSize: 14,
    marginTop: 8,
    fontStyle: "italic",
  },
})

