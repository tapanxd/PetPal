"use client"

import { useState, useEffect, useCallback } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native"
import { useTheme } from "../../app/theme"
import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { fetchUpcomingReminders } from "../../utils/reminders"
import { ReminderItem } from "./ReminderItem"
import type { Reminder } from "../../types/reminders"

interface RemindersSectionProps {
  petId: string
  petName: string
}

export const RemindersSection = ({ petId, petName }: RemindersSectionProps) => {
  const theme = useTheme()
  const router = useRouter()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  // Use useCallback for loadReminders to avoid recreating the function on each render
  const loadReminders = useCallback(async () => {
    if (!petId) return

    setLoading(true)
    try {
      const upcomingReminders = await fetchUpcomingReminders(petId)
      setReminders(upcomingReminders)
    } catch (error) {
      console.error("Error loading reminders:", error)
    } finally {
      setLoading(false)
    }
  }, [petId])

  useEffect(() => {
    loadReminders()
  }, [loadReminders])

  const navigateToAddReminder = () => {
    router.push({
      pathname: "/(app)/add-reminder",
      params: { petId, petName },
    })
  }

  // Handle reminder completion
  const handleReminderComplete = (reminderId: string) => {
    // Update the local state to reflect the completed reminder
    setReminders((prevReminders) => prevReminders.filter((reminder) => reminder.id !== reminderId))

    // Optionally reload reminders to get the latest data
    loadReminders()
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Feather name="bell" size={20} color={theme.colors.brand.primary} />
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Upcoming Reminders</Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.brand.primary }]}
          onPress={navigateToAddReminder}
        >
          <Feather name="plus" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>Loading reminders...</Text>
        </View>
      ) : reminders.length > 0 ? (
        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ReminderItem reminder={item} onComplete={handleReminderComplete} />}
          scrollEnabled={false}
          contentContainerStyle={styles.remindersList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
            No upcoming reminders for {petName}.
          </Text>
          <TouchableOpacity onPress={navigateToAddReminder}>
            <Text style={[styles.addReminderText, { color: theme.colors.brand.primary }]}>Add a reminder</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 80, // Increase this value to ensure it's not hidden behind the tab bar
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  remindersList: {
    gap: 8,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  emptyText: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center",
  },
  addReminderText: {
    fontSize: 14,
    fontWeight: "500",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
})
