"use client"

import type React from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { Button } from "../../components/ui/Button"
import type { Pet } from "../../types/pet"
import { useTheme } from "../../app/theme"

interface PetSelectorProps {
  visible: boolean
  onClose: () => void
  pets: Pet[]
  selectedPet: Pet | null
  onSelectPet: (pet: Pet) => void
}

export const PetSelector: React.FC<PetSelectorProps> = ({ visible, onClose, pets, selectedPet, onSelectPet }) => {
  const router = useRouter()
  const theme = useTheme()

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background.secondary }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>Select a Pet</Text>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={24} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.petList}>
              {pets.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  style={[
                    styles.petItem,
                    {
                      backgroundColor: selectedPet?.id === pet.id ? theme.colors.brand.primary + "20" : "transparent",
                      borderColor: selectedPet?.id === pet.id ? theme.colors.brand.primary : theme.colors.border,
                    },
                  ]}
                  onPress={() => onSelectPet(pet)}
                >
                  {pet.imageUrl ? (
                    <Image
                      source={{ uri: pet.imageUrl }}
                      style={styles.petItemImage}
                      defaultSource={require("../../assets/images/logo.png")}
                    />
                  ) : (
                    <View style={[styles.petItemInitial, { backgroundColor: theme.colors.brand.primary }]}>
                      <Text style={{ color: theme.colors.text.primary, fontWeight: "bold" }}>
                        {pet.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <Text style={[styles.petItemName, { color: theme.colors.text.primary }]}>{pet.name}</Text>
                  {selectedPet?.id === pet.id && <Feather name="check" size={20} color={theme.colors.brand.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Button
              label="Add New Pet"
              onPress={() => {
                onClose()
                router.push("/(app)/create-pet")
              }}
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
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
  petList: {
    maxHeight: 300,
  },
  petItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  petItemImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  petItemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  petItemInitial: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
})

