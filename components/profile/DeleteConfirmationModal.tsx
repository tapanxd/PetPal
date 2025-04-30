"use client"
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "../../app/theme"
import { Button } from "../ui/Button"

interface DeleteConfirmationModalProps {
  visible: boolean
  onClose: () => void
  petName: string
  onConfirm: () => void
  loading: boolean
}

export const DeleteConfirmationModal = ({
  visible,
  onClose,
  petName,
  onConfirm,
  loading,
}: DeleteConfirmationModalProps) => {
  const theme = useTheme()

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background.secondary }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>Delete Pet</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.deleteConfirmText, { color: theme.colors.text.primary }]}>
            Are you sure you want to delete {petName}? This action cannot be undone.
          </Text>

          <View style={styles.deleteButtonsContainer}>
            <Button label="Cancel" variant="outline" onPress={onClose} style={{ flex: 1 }} />
            <Button
              label="Delete"
              onPress={onConfirm}
              style={{ flex: 1, backgroundColor: theme.colors.status.error }}
              loading={loading}
              disabled={loading}
            />
          </View>
        </View>
      </View>
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
  deleteConfirmText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  deleteButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
})

