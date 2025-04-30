export interface WeightEntry {
  id: string
  weight: number
  date: Date
  notes?: string
}

export interface MedicalRecord {
  id: string
  type: "vaccination" | "checkup" | "medication" | "surgery" | "other"
  title: string
  date: Date
  nextDueDate?: Date
  notes?: string
}

export interface Document {
  id: string
  title: string
  fileUrl: string
  fileType: string
  fileSize: number
  uploadDate: Date
  notes?: string
}

// Record type icons mapping
export const recordTypeIcons = {
  vaccination: "needle",
  checkup: "stethoscope",
  medication: "pill",
  surgery: "scissors-cutting",
  other: "medical-bag",
}

