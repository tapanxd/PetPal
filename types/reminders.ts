export interface Reminder {
  id: string
  petId: string
  title: string
  description?: string
  date: string // ISO date string
  time?: string // HH:MM format
  type: "vaccination" | "medication" | "appointment" | "custom"
  notificationId?: string | null // Changed to allow null
  relatedRecordId?: string // For reminders linked to medical records
  isCompleted?: boolean
  completedAt?: string // ISO date string for when the reminder was completed
  createdAt: string // ISO date string
}
