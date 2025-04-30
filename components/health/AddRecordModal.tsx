"use client"

import type React from "react"
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native"
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { type MedicalRecord, recordTypeIcons } from "../../types/health"

interface AddRecordModalProps {
  visible: boolean
  onClose: () => void
  petName: string
  recordType: MedicalRecord["type"]
  title: string
  date: string
  nextDate: string
  notes: string
  onChangeRecordType: (type: MedicalRecord["type"]) => void
  onChangeTitle: (text: string) => void
  onChangeDate: (text: string) => void
  onChangeNextDate: (text: string) => void
  onChangeNotes: (text: string) => void
  onSave: () => void
  loading: boolean
}

export const AddRecordModal: React.FC<AddRecordModalProps> = ({
  visible,
  onClose,
  petName,
  recordType,
  title,
  date,
  nextDate,
  notes,
  onChangeRecordType,
  onChangeTitle,
  onChangeDate,
  onChangeNextDate,
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
            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
              Add Medical Record for {petName}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Record Type</Text>
          <View style={styles.recordTypeContainer}>
            {Object.entries(recordTypeIcons).map(([type, icon]) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.recordTypeButton,
                  {
                    backgroundColor:
                      recordType === type ? theme.colors.brand.primary : theme.colors.background.tertiary,
                  },
                ]}
                onPress={() => onChangeRecordType(type as MedicalRecord["type"])}
              >
                <MaterialCommunityIcons
                  name={icon as any}
                  size={20}
                  color={recordType === type ? "#fff" : theme.colors.text.secondary}
                />
                <Text
                  style={[styles.recordTypeText, { color: recordType === type ? "#fff" : theme.colors.text.secondary }]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Title"
            placeholder="Enter record title"
            value={title}
            onChangeText={onChangeTitle}
            leftIcon={<Feather name="file" size={18} color={theme.colors.brand.primary} />}
          />

          <Input
            label="Date"
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={onChangeDate}
            leftIcon={<Feather name="calendar" size={18} color={theme.colors.brand.primary} />}
          />

          {recordType === "vaccination" && (
            <Input
              label="Next Due Date (optional)"
              placeholder="YYYY-MM-DD"
              value={nextDate}
              onChangeText={onChangeNextDate}
              leftIcon={<Feather name="calendar" size={18} color={theme.colors.brand.primary} />}
            />
          )}

          <Input
            label="Notes (optional)"
            placeholder="Add any notes about this record"
            value={notes}
            onChangeText={onChangeNotes}
            multiline
            leftIcon={<Feather name="file-text" size={18} color={theme.colors.brand.primary} />}
          />

          <Button
            label="Save Medical Record"
            onPress={onSave}
            style={{ marginTop: 16 }}
            loading={loading}
            disabled={loading || !title}
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
  label: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "500",
  },
  recordTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  recordTypeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
    minWidth: "45%",
  },
  recordTypeText: {
    fontSize: 14,
  },
})

import { useTheme } from "../../app/theme"

