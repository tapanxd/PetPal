import { collection, query, orderBy, limit, getDocs, addDoc, Timestamp, deleteDoc, doc } from "firebase/firestore"
import { auth, db } from "../firebaseConfig"
import { uploadDocumentToS3 } from "./storage"

// Update the JournalEntry interface to allow null for imageUrl
export interface JournalEntry {
  id: string
  content: string
  imageUrl?: string | null
  timestamp: Date
  type: "text" | "photo" | "both"
}

/**
 * Fetch journal entries for a specific pet
 */
export const fetchJournalEntries = async (petId: string, limitCount = 20): Promise<JournalEntry[]> => {
  if (!auth.currentUser) {
    throw new Error("No authenticated user")
  }

  try {
    const entriesPath = `users/${auth.currentUser.uid}/pets/${petId}/journal-entries`
    console.log(`Fetching journal entries from: ${entriesPath}`)

    const entriesQuery = query(collection(db, entriesPath), orderBy("timestamp", "desc"), limit(limitCount))

    const entriesSnapshot = await getDocs(entriesQuery)

    return entriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      content: doc.data().content || "",
      imageUrl: doc.data().imageUrl,
      timestamp: doc.data().timestamp.toDate(),
      type: doc.data().type || "text",
    }))
  } catch (error) {
    console.error("Error fetching journal entries:", error)
    throw error
  }
}

// Update the addJournalEntry function to handle undefined imageUrl properly
export const addJournalEntry = async (petId: string, content: string, imageUri?: string): Promise<JournalEntry> => {
  if (!auth.currentUser) {
    throw new Error("No authenticated user")
  }

  try {
    let imageUrl: string | null = null
    let type: "text" | "photo" | "both" = "text"

    // If there's an image, upload it first
    if (imageUri) {
      const fileName = `journal-${auth.currentUser.uid}-${Date.now()}.jpg`
      imageUrl = await uploadDocumentToS3(imageUri, fileName)
      type = content.trim() ? "both" : "photo"
    }

    const entriesPath = `users/${auth.currentUser.uid}/pets/${petId}/journal-entries`
    console.log(`Adding journal entry to: ${entriesPath}`)

    const entryData = {
      content,
      imageUrl,
      timestamp: Timestamp.now(),
      type,
    }

    const docRef = await addDoc(collection(db, entriesPath), entryData)

    return {
      id: docRef.id,
      content,
      imageUrl,
      timestamp: new Date(),
      type,
    }
  } catch (error) {
    console.error("Error adding journal entry:", error)
    throw error
  }
}

/**
 * Delete a journal entry
 */
export const deleteJournalEntry = async (petId: string, entryId: string): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error("No authenticated user")
  }

  try {
    const entryPath = `users/${auth.currentUser.uid}/pets/${petId}/journal-entries/${entryId}`
    console.log(`Deleting journal entry: ${entryPath}`)

    await deleteDoc(doc(db, "users", auth.currentUser.uid, "pets", petId, "journal-entries", entryId))

    // Note: We're not deleting the image from S3 here as it would require additional AWS SDK integration
    // In a production app, you might want to also delete the associated image from storage
  } catch (error) {
    console.error("Error deleting journal entry:", error)
    throw error
  }
}
