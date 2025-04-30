import { collection, query, orderBy, limit, getDocs, addDoc, Timestamp } from "firebase/firestore"
import { auth, db } from "../firebaseConfig"
import type { WeightEntry, MedicalRecord, Document } from "../types/health"

/**
 * Fetch pet health data from Firestore
 */
export const fetchPetHealthData = async (petId: string) => {
  if (!auth.currentUser) {
    throw new Error("No authenticated user")
  }

  const result = {
    weightEntries: [] as WeightEntry[],
    medicalRecords: [] as MedicalRecord[],
    documents: [] as Document[],
  }

  try {
    // Fetch weight entries
    const weightPath = `users/${auth.currentUser.uid}/pets/${petId}/weight-entries`
    console.log(`Attempting to access: ${weightPath}`)

    const weightQuery = query(
      collection(db, "users", auth.currentUser.uid, "pets", petId, "weight-entries"),
      orderBy("date", "desc"),
      limit(10),
    )
    const weightSnapshot = await getDocs(weightQuery)
    result.weightEntries = weightSnapshot.docs.map((doc) => ({
      id: doc.id,
      weight: doc.data().weight,
      date: doc.data().date.toDate(),
      notes: doc.data().notes,
    }))
    console.log(`Found ${result.weightEntries.length} weight entries`)

    // Fetch medical records
    const recordsPath = `users/${auth.currentUser.uid}/pets/${petId}/medical-records`
    console.log(`Attempting to access: ${recordsPath}`)

    const recordsQuery = query(
      collection(db, "users", auth.currentUser.uid, "pets", petId, "medical-records"),
      orderBy("date", "desc"),
      limit(20),
    )
    const recordsSnapshot = await getDocs(recordsQuery)
    result.medicalRecords = recordsSnapshot.docs.map((doc) => ({
      id: doc.id,
      type: doc.data().type,
      title: doc.data().title,
      date: doc.data().date.toDate(),
      nextDueDate: doc.data().nextDueDate ? doc.data().nextDueDate.toDate() : undefined,
      notes: doc.data().notes,
    }))
    console.log(`Found ${result.medicalRecords.length} medical records`)

    // Fetch documents
    const documentsPath = `users/${auth.currentUser.uid}/pets/${petId}/documents`
    console.log(`Attempting to access: ${documentsPath}`)

    const documentsQuery = query(
      collection(db, "users", auth.currentUser.uid, "pets", petId, "documents"),
      orderBy("uploadDate", "desc"),
      limit(20),
    )
    const documentsSnapshot = await getDocs(documentsQuery)
    result.documents = documentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title,
      fileUrl: doc.data().fileUrl,
      fileType: doc.data().fileType,
      fileSize: doc.data().fileSize,
      uploadDate: doc.data().uploadDate.toDate(),
      notes: doc.data().notes,
    }))
    console.log(`Found ${result.documents.length} documents`)

    return result
  } catch (error) {
    console.error("Error fetching pet health data:", error)
    throw error
  }
}

/**
 * Create initial collections for a pet
 */
export const createInitialCollections = async (petId: string) => {
  if (!auth.currentUser) {
    throw new Error("No authenticated user")
  }

  try {
    console.log("Attempting to create initial collections...")

    // Create an initial weight entry to establish the collection
    const weightRef = collection(db, "users", auth.currentUser.uid, "pets", petId, "weight-entries")
    await addDoc(weightRef, {
      weight: 0,
      date: Timestamp.now(),
      notes: "Initial entry to create collection",
      createdAt: Timestamp.now(),
    })

    // Create an initial medical record to establish the collection
    const recordRef = collection(db, "users", auth.currentUser.uid, "pets", petId, "medical-records")
    await addDoc(recordRef, {
      type: "checkup",
      title: "Initial Record",
      date: Timestamp.now(),
      notes: "Initial entry to create collection",
      createdAt: Timestamp.now(),
    })

    // Create an initial document entry to establish the collection
    const documentRef = collection(db, "users", auth.currentUser.uid, "pets", petId, "documents")
    await addDoc(documentRef, {
      title: "Initial Document",
      fileUrl: "",
      fileType: "application/pdf",
      fileSize: 0,
      fileName: "initial.pdf",
      uploadDate: Timestamp.now(),
      notes: "Initial entry to create collection",
    })

    console.log("Initial collections created successfully")
    return true
  } catch (error) {
    console.error("Error creating initial collections:", error)
    throw error
  }
}

/**
 * Add a weight entry to Firestore
 */
export const addWeightEntry = async (petId: string, weight: number, date: Date, notes: string) => {
  if (!auth.currentUser) {
    throw new Error("No authenticated user")
  }

  try {
    const weightPath = `users/${auth.currentUser.uid}/pets/${petId}/weight-entries`
    console.log(`Attempting to write to: ${weightPath}`)
    console.log(`Adding weight entry with date: ${date.toISOString()}`)

    // Ensure we're using a proper Date object
    const entryDate = new Date(date)

    const docRef = await addDoc(collection(db, "users", auth.currentUser.uid, "pets", petId, "weight-entries"), {
      weight,
      date: Timestamp.fromDate(entryDate),
      notes,
      createdAt: Timestamp.now(),
    })

    console.log("Weight entry added successfully")
    return {
      id: docRef.id,
      weight,
      date: entryDate,
      notes,
    }
  } catch (error) {
    console.error("Error adding weight entry:", error)
    throw error
  }
}

/**
 * Add a medical record to Firestore
 */
export const addMedicalRecord = async (
  petId: string,
  type: MedicalRecord["type"],
  title: string,
  date: Date,
  nextDueDate: Date | undefined,
  notes: string,
) => {
  if (!auth.currentUser) {
    throw new Error("No authenticated user")
  }

  try {
    const recordPath = `users/${auth.currentUser.uid}/pets/${petId}/medical-records`
    console.log(`Attempting to write to: ${recordPath}`)

    const docRef = await addDoc(collection(db, "users", auth.currentUser.uid, "pets", petId, "medical-records"), {
      type,
      title,
      date: Timestamp.fromDate(date),
      nextDueDate: nextDueDate ? Timestamp.fromDate(nextDueDate) : null,
      notes,
      createdAt: Timestamp.now(),
    })

    console.log("Medical record added successfully")
    return {
      id: docRef.id,
      type,
      title,
      date,
      nextDueDate,
      notes,
    }
  } catch (error) {
    console.error("Error adding medical record:", error)
    throw error
  }
}

/**
 * Add a document to Firestore
 */
export const addDocument = async (
  petId: string,
  title: string,
  fileUrl: string,
  fileType: string,
  fileSize: number,
  fileName: string,
  notes: string,
) => {
  if (!auth.currentUser) {
    throw new Error("No authenticated user")
  }

  try {
    const documentPath = `users/${auth.currentUser.uid}/pets/${petId}/documents`
    console.log(`Attempting to write to: ${documentPath}`)

    const docRef = await addDoc(collection(db, "users", auth.currentUser.uid, "pets", petId, "documents"), {
      title,
      fileUrl,
      fileType,
      fileSize,
      fileName,
      uploadDate: Timestamp.now(),
      notes,
    })

    console.log("Document added successfully")
    return {
      id: docRef.id,
      title,
      fileUrl,
      fileType,
      fileSize,
      uploadDate: new Date(),
      notes,
    }
  } catch (error) {
    console.error("Error adding document:", error)
    throw error
  }
}
