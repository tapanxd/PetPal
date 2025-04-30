import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { auth, db } from "../firebaseConfig"
import * as Notifications from "expo-notifications"
import type { Reminder } from "../types/reminders"
import type { MedicalRecord } from "../types/health"

// Fetch upcoming reminders for a pet
export const fetchUpcomingReminders = async (petId: string): Promise<Reminder[]> => {
  if (!auth.currentUser) {
    throw new Error("No authenticated user")
  }

  try {
    // Get reminders from Firestore
    const remindersRef = collection(db, "users", auth.currentUser.uid, "pets", petId, "reminders")
    const q = query(remindersRef, where("isCompleted", "==", false), orderBy("date", "asc"))

    const reminderSnapshot = await getDocs(q)
    const reminders = reminderSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Reminder[]

    // Get upcoming vaccinations from medical records
    const medicalRecordsRef = collection(db, "users", auth.currentUser.uid, "pets", petId, "medical-records")
    const vaccineQuery = query(
      medicalRecordsRef,
      where("type", "==", "vaccination"),
      where("nextDueDate", ">=", new Date()),
    )

    const vaccineSnapshot = await getDocs(vaccineQuery)
    const vaccinationReminders = vaccineSnapshot.docs
      .map((doc) => {
        const record = doc.data() as MedicalRecord
        if (!record.nextDueDate) return null

        // Create a reminder for each upcoming vaccination
        // Handle Firestore Timestamp or Date object
        const dueDate =
          typeof record.nextDueDate === "object" &&
          record.nextDueDate !== null &&
          "toDate" in record.nextDueDate &&
          typeof record.nextDueDate.toDate === "function"
            ? record.nextDueDate.toDate()
            : new Date(record.nextDueDate)

        const reminderDate = new Date(dueDate)
        reminderDate.setMonth(reminderDate.getMonth() - 1) // Set reminder 1 month before

        // Only include if the reminder date is in the future or today
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (reminderDate >= today) {
          return {
            id: `vaccine-${doc.id}`,
            petId,
            title: `Vaccination: ${record.title}`,
            description: `Vaccination due on ${dueDate.toLocaleDateString()}`,
            date: reminderDate.toISOString(),
            type: "vaccination" as const,
            relatedRecordId: doc.id,
            isCompleted: false,
            createdAt: new Date().toISOString(),
          }
        }
        return null
      })
      .filter(Boolean) as Reminder[]

    // Combine and sort all reminders by date
    const allReminders = [...reminders, ...vaccinationReminders]
    return allReminders.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  } catch (error) {
    console.error("Error fetching reminders:", error)
    throw error
  }
}

// Add a new reminder
export const addReminder = async (
  petId: string,
  title: string,
  description: string,
  date: Date,
  time?: string,
  type: Reminder["type"] = "custom",
): Promise<Reminder> => {
  if (!auth.currentUser) {
    throw new Error("No authenticated user")
  }

  try {
    // Schedule notification
    let notificationId: string | null = null

    try {
      if (type === "custom") {
        // For custom reminders, notify 15 minutes before
        const notificationDate = new Date(date)
        if (time) {
          const [hours, minutes] = time.split(":").map(Number)
          notificationDate.setHours(hours, minutes - 15, 0) // 15 minutes before
        }

        notificationId = await scheduleNotification(title, description || "Reminder for your pet", notificationDate)
      } else if (type === "vaccination") {
        // For vaccinations, notify 1 month before (already handled in date)
        notificationId = await scheduleNotification(title, description || "Vaccination reminder for your pet", date)
      }
    } catch (error) {
      console.error("Failed to schedule notification:", error)
      // Continue without a notification ID
    }

    // Add to Firestore
    const reminderData = {
      petId,
      title,
      description,
      date: date.toISOString(),
      time,
      type,
      notificationId,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    }

    const remindersRef = collection(db, "users", auth.currentUser.uid, "pets", petId, "reminders")
    const docRef = await addDoc(remindersRef, reminderData)

    return {
      id: docRef.id,
      ...reminderData,
    }
  } catch (error) {
    console.error("Error adding reminder:", error)
    throw error
  }
}

// The completeReminder function is already defined, but let's make sure it's working correctly
// Mark a reminder as completed
export const completeReminder = async (petId: string, reminderId: string): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error("No authenticated user")
  }

  try {
    const reminderRef = doc(db, "users", auth.currentUser.uid, "pets", petId, "reminders", reminderId)
    await updateDoc(reminderRef, {
      isCompleted: true,
      completedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error completing reminder:", error)
    throw error
  }
}

// Delete a reminder
export const deleteReminder = async (petId: string, reminderId: string, notificationId?: string): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error("No authenticated user")
  }

  try {
    // Cancel notification if exists
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId)
    }

    // Delete from Firestore
    const reminderRef = doc(db, "users", auth.currentUser.uid, "pets", petId, "reminders", reminderId)
    await deleteDoc(reminderRef)
  } catch (error) {
    console.error("Error deleting reminder:", error)
    throw error
  }
}

// Schedule a notification and return the identifier
const scheduleNotification = async (title: string, body: string, date: Date): Promise<string | null> => {
  try {
    // Calculate seconds from now until the target date
    const now = new Date()
    const secondsUntilTarget = Math.floor((date.getTime() - now.getTime()) / 1000)

    // Ensure we don't schedule in the past
    const secondsToSchedule = Math.max(1, secondsUntilTarget)

    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: secondsToSchedule,
        repeats: false,
      },
    })
  } catch (error) {
    console.error("Error scheduling notification:", error)
    return null
  }
}

// Set up notification permissions and handlers
export const setupNotifications = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== "granted") {
    return false
  }

  // Set notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  })

  return true
}
