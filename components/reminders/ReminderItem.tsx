"use client"

import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native"
import { useTheme } from "../../app/theme"
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons"
import { formatDate, formatTime } from "../../utils/formatters"
import type { Reminder } from "../../types/reminders"
import { completeReminder } from "../../utils/reminders"
import { addJournalEntry } from "../../utils/journal"
import { useState } from "react"

interface ReminderItemProps {
  reminder: Reminder
  onPress?: () => void
  onComplete?: (reminderId: string) => void
}

export const ReminderItem = ({ reminder, onPress, onComplete }: ReminderItemProps) => {
  const theme = useTheme()
  const [loading, setLoading] = useState(false)

  // Get icon based on reminder type
  const getIcon = () => {
    switch (reminder.type) {
      case "vaccination":
        return <MaterialCommunityIcons name="needle" size={20} color={theme.colors.brand.primary} />
      case "medication":
        return <MaterialCommunityIcons name="pill" size={20} color={theme.colors.brand.primary} />
      case "appointment":
        return <MaterialCommunityIcons name="calendar-clock" size={20} color={theme.colors.brand.primary} />
      case "custom":
      default:
        return <Feather name="bell" size={20} color={theme.colors.brand.primary} />
    }
  }

  // Calculate days remaining
  const getDaysRemaining = () => {
    const today = new Date()
    const reminderDate = new Date(reminder.date)
    const diffTime = reminderDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    if (diffDays < 0) return "Overdue"
    return `In ${diffDays} days`
  }

  // Handle marking reminder as complete
  const handleMarkAsDone = async () => {
    try {
      setLoading(true)

      // Complete the reminder in the database
      await completeReminder(reminder.petId, reminder.id)

      // Create a journal entry about the completed task
      const journalContent = `Completed: ${reminder.title} - ${reminder.description || "No description"}`
      await addJournalEntry(reminder.petId, journalContent)

      // Notify parent component
      if (onComplete) {
        onComplete(reminder.id)
      }

      Alert.alert("Success", "Reminder marked as complete and added to journal")
    } catch (error) {
      console.error("Error completing reminder:", error)
      Alert.alert("Error", "Failed to mark reminder as complete")
    } finally {
      setLoading(false)
    }
  }

  const daysRemaining = getDaysRemaining()
  const isOverdue = daysRemaining === "Overdue"

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background.tertiary,
          borderLeftColor: isOverdue ? theme.colors.status.error : theme.colors.brand.primary,
        },
      ]}
    >
      <TouchableOpacity style={styles.contentContainer} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.iconContainer}>{getIcon()}</View>

        <View style={styles.contentContainer}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>{reminder.title}</Text>

          <View style={styles.detailsContainer}>
            <Text style={[styles.date, { color: theme.colors.text.secondary }]}>
              {formatDate(new Date(reminder.date))}
              {reminder.time && ` at ${formatTime(reminder.time)}`}
            </Text>

            <Text
              style={[
                styles.daysRemaining,
                {
                  color: isOverdue
                    ? theme.colors.status.error
                    : daysRemaining === "Today"
                      ? theme.colors.status.warning
                      : theme.colors.text.secondary,
                },
              ]}
            >
              {daysRemaining}
            </Text>
          </View>

          {reminder.description && (
            <Text style={[styles.description, { color: theme.colors.text.secondary }]} numberOfLines={2}>
              {reminder.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Mark as Done button */}
      <TouchableOpacity
        style={[styles.doneButton, { backgroundColor: theme.colors.brand.primary }]}
        onPress={handleMarkAsDone}
        disabled={loading || reminder.isCompleted}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : reminder.isCompleted ? (
          <Feather name="check-circle" size={16} color="#fff" />
        ) : (
          <Text style={styles.doneButtonText}>Mark Done</Text>
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    marginBottom: 8,
  },
  contentContainer: {
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
  },
  daysRemaining: {
    fontSize: 12,
    fontWeight: "500",
  },
  description: {
    fontSize: 14,
    lineHeight: 18,
  },
  doneButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: "flex-end",
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
})
