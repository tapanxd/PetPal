"use client"

import type React from "react"
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native"
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import type * as DocumentPicker from "expo-document-picker"

interface AddDocumentModalProps {
  visible: boolean
  onClose: () => void
  petName: string
  title: string
  notes: string
  selectedDocument: DocumentPicker.DocumentPickerResult | null
  onChangeTitle: (text: string) => void
  onChangeNotes: (text: string) => void
  onPickDocument: () => void
  onSave: () => void
  loading: boolean
  uploading: boolean
}

export const AddDocumentModal: React.FC<AddDocumentModalProps> = ({
  visible,
  onClose,
  petName,
  title,
  notes,
  selectedDocument,
  onChangeTitle,
  onChangeNotes,
  onPickDocument,
  onSave,
  loading,
  uploading,
}) => {
  const theme = useTheme()

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background.secondary }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>Add Document for {petName}</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.documentPickerContainer}>
            <TouchableOpacity
              style={[
                styles.documentPicker,
                {
                  backgroundColor: theme.colors.background.tertiary,
                  borderColor: selectedDocument ? theme.colors.brand.primary : theme.colors.border,
                },
              ]}
              onPress={onPickDocument}
            >
              <MaterialCommunityIcons
                name="file-pdf-box"
                size={36}
                color={selectedDocument ? theme.colors.brand.primary : theme.colors.text.secondary}
              />
              <Text style={[styles.documentPickerText, { color: theme.colors.text.secondary }]}>
                {selectedDocument && !selectedDocument.canceled
                  ? selectedDocument.assets[0].name
                  : "Tap to select a PDF document"}
              </Text>
            </TouchableOpacity>
          </View>

          <Input
            label="Title"
            placeholder="Enter document title"
            value={title}
            onChangeText={onChangeTitle}
            leftIcon={<Feather name="file-text" size={18} color={theme.colors.brand.primary} />}
          />

          <Input
            label="Notes (optional)"
            placeholder="Add any notes about this document"
            value={notes}
            onChangeText={onChangeNotes}
            multiline
            leftIcon={<Feather name="info" size={18} color={theme.colors.brand.primary} />}
          />

          <Button
            label={uploading ? "Uploading..." : "Upload Document"}
            onPress={onSave}
            style={{ marginTop: 16 }}
            loading={loading || uploading}
            disabled={loading || uploading || !selectedDocument || selectedDocument.canceled || !title}
          />
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
  documentPickerContainer: {
    marginBottom: 16,
  },
  documentPicker: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  documentPickerText: {
    marginTop: 8,
    textAlign: "center",
  },
})

import { useTheme } from "../../app/theme"

