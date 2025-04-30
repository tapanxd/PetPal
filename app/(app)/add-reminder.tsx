"use client"

import { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
  StyleSheet
} from "react-native"
import { useTheme } from "../theme"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams, Stack } from "expo-router"
import { Button } from "../../components/ui/Button"
import { addReminder, setupNotifications } from "../../utils/reminders"
import { DatePicker } from "../../components/ui/DatePicker"

export default function AddReminderScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { petId, petName } = useLocalSearchParams()

  // Form states
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date())
  const [time, setTime] = useState("")
  const [reminderType, setReminderType] = useState<"custom" | "medication" | "appointment">("custom")
  const [loading, setLoading] = useState(false)

  // Handle time change
  const formatTimeForDisplay = (time: string) => {
    if (!time) return "Select time (optional)"

    const [hours, minutes] = time.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const hour12 = hours % 12 || 12
    return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  // Save reminder
  const handleSaveReminder = async () => {
    if (!title) {
      Alert.alert("Error", "Please enter a title for the reminder")
      return
    }

    if (!petId) {
      Alert.alert("Error", "No pet selected")
      return
    }

    try {
      setLoading(true)

      // Request notification permissions
      const hasPermission = await setupNotifications()
      if (!hasPermission) {
        Alert.alert(
          "Notification Permission",
          "We need notification permission to send you reminders. Please enable notifications in your device settings.",
        )
      }

      // Add reminder
      await addReminder(petId as string, title, description, date, time, reminderType)

      Alert.alert("Success", "Reminder added successfully!", [{ text: "OK", onPress: () => router.back() }])
    } catch (error) {
      console.error("Error adding reminder:", error)
      Alert.alert("Error", "Failed to add reminder. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]} edges={["top"]}>
      <Stack.Screen
        options={{
          title: `Add Reminder for ${petName}`,
          headerBackTitle: "Back",
        }}
      />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Reminder Type Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Reminder Type</Text>
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  {
                    backgroundColor:
                      reminderType === "custom" ? theme.colors.brand.primary : theme.colors.background.secondary,
                  },
                ]}
                onPress={() => setReminderType("custom")}
              >
                <Feather
                  name="bell"
                  size={20}
                  color={reminderType === "custom" ? "#fff" : theme.colors.text.secondary}
                />
                <Text
                  style={[styles.typeText, { color: reminderType === "custom" ? "#fff" : theme.colors.text.primary }]}
                >
                  Custom
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  {
                    backgroundColor:
                      reminderType === "medication" ? theme.colors.brand.primary : theme.colors.background.secondary,
                  },
                ]}
                onPress={() => setReminderType("medication")}
              >
                <MaterialCommunityIcons
                  name="pill"
                  size={20}
                  color={reminderType === "medication" ? "#fff" : theme.colors.text.secondary}
                />
                <Text
                  style={[
                    styles.typeText,
                    { color: reminderType === "medication" ? "#fff" : theme.colors.text.primary },
                  ]}
                >
                  Medication
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  {
                    backgroundColor:
                      reminderType === "appointment" ? theme.colors.brand.primary : theme.colors.background.secondary,
                  },
                ]}
                onPress={() => setReminderType("appointment")}
              >
                <MaterialCommunityIcons
                  name="calendar-clock"
                  size={20}
                  color={reminderType === "appointment" ? "#fff" : theme.colors.text.secondary}
                />
                <Text
                  style={[
                    styles.typeText,
                    { color: reminderType === "appointment" ? "#fff" : theme.colors.text.primary },
                  ]}
                >
                  Appointment
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Reminder Details */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Reminder Details</Text>

            <View style={[styles.inputContainer, { backgroundColor: theme.colors.background.secondary }]}>
              <Text style={[styles.inputLabel, { color: theme.colors.text.secondary }]}>Title *</Text>
              <TextInput
                style={[styles.input, { color: theme.colors.text.primary }]}
                placeholder="Enter reminder title"
                placeholderTextColor={theme.colors.text.tertiary}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: theme.colors.background.secondary }]}>
              <Text style={[styles.inputLabel, { color: theme.colors.text.secondary }]}>Description (optional)</Text>
              <TextInput
                style={[styles.textArea, { color: theme.colors.text.primary }]}
                placeholder="Enter reminder description"
                placeholderTextColor={theme.colors.text.tertiary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Date & Time */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Date & Time</Text>

            <View style={styles.datePickerWrapper}>
              <Text style={[styles.inputLabel, { color: theme.colors.text.secondary }]}>Date</Text>
              <DatePicker value={date} onChange={setDate} placeholder="Select date" />
            </View>

            <View style={styles.timePickerWrapper}>
              <Text style={[styles.inputLabel, { color: theme.colors.text.secondary }]}>Time (optional)</Text>
              <View
                style={[styles.inputContainer, { backgroundColor: theme.colors.background.secondary, marginBottom: 0 }]}
              >
                <View style={styles.timeInputRow}>
                  <TextInput
                    style={[styles.timeInput, { color: theme.colors.text.primary }]}
                    placeholder="HH"
                    placeholderTextColor={theme.colors.text.tertiary}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={time ? time.split(":")[0] : ""}
                    onChangeText={(text) => {
                      // Validate hour input (0-23)
                      if (text === "" || (Number.parseInt(text) >= 0 && Number.parseInt(text) <= 23)) {
                        const minutes = time ? time.split(":")[1] || "00" : "00"
                        setTime(`${text.padStart(2, "0")}:${minutes}`)
                      }
                    }}
                  />
                  <Text style={{ color: theme.colors.text.primary, fontSize: 20, marginHorizontal: 8 }}>:</Text>
                  <TextInput
                    style={[styles.timeInput, { color: theme.colors.text.primary }]}
                    placeholder="MM"
                    placeholderTextColor={theme.colors.text.tertiary}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={time ? time.split(":")[1] : ""}
                    onChangeText={(text) => {
                      // Validate minute input (0-59)
                      if (text === "" || (Number.parseInt(text) >= 0 && Number.parseInt(text) <= 59)) {
                        const hours = time ? time.split(":")[0] || "00" : "00"
                        setTime(`${hours}:${text.padStart(2, "0")}`)
                      }
                    }}
                  />

                  <TouchableOpacity
                    style={styles.timePresetButton}
                    onPress={() => {
                      const now = new Date()
                      const hours = now.getHours().toString().padStart(2, "0")
                      const minutes = now.getMinutes().toString().padStart(2, "0")
                      setTime(`${hours}:${minutes}`)
                    }}
                  >
                    <Text style={{ color: theme.colors.brand.primary }}>Now</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.timePresets}>
                  <TouchableOpacity
                    style={[styles.timePresetChip, { backgroundColor: theme.colors.background.tertiary }]}
                    onPress={() => setTime("08:00")}
                  >
                    <Text style={{ color: theme.colors.text.primary }}>8:00 AM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.timePresetChip, { backgroundColor: theme.colors.background.tertiary }]}
                    onPress={() => setTime("12:00")}
                  >
                    <Text style={{ color: theme.colors.text.primary }}>12:00 PM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.timePresetChip, { backgroundColor: theme.colors.background.tertiary }]}
                    onPress={() => setTime("18:00")}
                  >
                    <Text style={{ color: theme.colors.text.primary }}>6:00 PM</Text>
                  </TouchableOpacity>
                </View>

                {time && (
                  <Text style={[styles.timeDisplay, { color: theme.colors.text.secondary }]}>
                    Selected: {formatTimeForDisplay(time)}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Notification Info */}
          <View style={[styles.infoBox, { backgroundColor: theme.colors.background.secondary }]}>
            <Feather name="info" size={20} color={theme.colors.brand.primary} />
            <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
              {reminderType === "custom"
                ? "You'll receive a notification 15 minutes before the scheduled time."
                : "You'll receive a notification on the scheduled date."}
            </Text>
          </View>

          {/* Save Button */}
          <Button
            label="Save Reminder"
            onPress={handleSaveReminder}
            loading={loading}
            disabled={loading || !title}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  typeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  inputContainer: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    padding: 8,
  },
  textArea: {
    fontSize: 16,
    padding: 8,
    minHeight: 100,
  },
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  dateTimeButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateTimeButtonText: {
    fontSize: 16,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  saveButton: {
    marginTop: 8,
  },
  pickerModal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  pickerContainer: {
    width: "90%",
    borderRadius: 12,
    padding: 16,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  datePickerContainer: {
    padding: 10,
  },
  dateSelectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  dayButton: {
    width: 40,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 8,
  },
  datePickerWrapper: {
    marginBottom: 16,
  },
  timePickerWrapper: {
    marginBottom: 16,
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
  },
  timeIcon: {
    marginRight: 12,
  },
  timeText: {
    fontSize: 16,
  },
  timePickerModal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  timePickerContainer: {
    width: "90%",
    borderRadius: 12,
    padding: 16,
  },
  timePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  timeOptionsContainer: {
    maxHeight: 300,
  },
  timeOptionsContent: {
    paddingVertical: 8,
  },
  timeOptionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  timeOptionText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  timeInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  timeInput: {
    fontSize: 24,
    textAlign: "center",
    width: 60,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  timePresets: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 8,
  },
  timePresetChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  timePresetButton: {
    marginLeft: 16,
    padding: 8,
  },
  timeDisplay: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 14,
  },
})

