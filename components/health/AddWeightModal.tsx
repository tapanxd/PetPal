"use client"

import type React from "react"
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native"
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { DatePicker } from "../../components/ui/DatePicker"

interface AddWeightModalProps {
  visible: boolean
  onClose: () => void
  petName: string
  weight: string
  date: Date
  notes: string
  onChangeWeight: (text: string) => void
  onChangeDate: (date: Date) => void
  onChangeNotes: (text: string) => void
  onSave: () => void
  loading: boolean
}

export const AddWeightModal: React.FC<AddWeightModalProps> = ({
  visible,
  onClose,
  petName,
  weight,
  date,
  notes,
  onChangeWeight,
  onChangeDate,
  onChangeNotes,
  onSave,
  loading,
}) => {
  const theme = useTheme()

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background.secondary }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>Add Weight for {petName}</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <Input
            label="Weight (kg)"
            placeholder="Enter weight in kg"
            keyboardType="numeric"
            value={weight}
            onChangeText={onChangeWeight}
            leftIcon={<MaterialCommunityIcons name="scale" size={18} color={theme.colors.brand.primary} />}
          />

          <View style={{ marginBottom: 16 }}>
            <Text style={[{ fontSize: 14, fontWeight: "500", marginBottom: 8, color: theme.colors.text.secondary }]}>
              Date
            </Text>
            <DatePicker value={date} onChange={onChangeDate} placeholder="Select date" />
          </View>

          <Input
            label="Notes (optional)"
            placeholder="Add any notes about this weight entry"
            value={notes}
            onChangeText={onChangeNotes}
            multiline
            leftIcon={<Feather name="file-text" size={18} color={theme.colors.brand.primary} />}
          />

          <Button
            label="Save Weight Entry"
            onPress={onSave}
            style={{ marginTop: 16 }}
            loading={loading}
            disabled={loading || !weight}
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
})

import { useTheme } from "../../app/theme"
