"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking } from "react-native"
import { useTheme } from "../theme"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter, Stack } from "expo-router"
import { auth } from "../../firebaseConfig"
import * as DocumentPicker from "expo-document-picker"
import type { Document } from "../../types/health"
import { fetchPetHealthData, addDocument } from "../../utils/firestore"
import { uploadDocumentToS3 } from "../../utils/storage"
import { formatDate, formatFileSize } from "../../utils/formatters"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { AddDocumentModal } from "../../components/health/AddDocumentModal"

export default function DocumentsScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { petId, petName } = useLocalSearchParams()

  // States
  const [loading, setLoading] = useState(true)
  const [uploadingDocument, setUploadingDocument] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false)

  // Form states for document
  const [newDocumentTitle, setNewDocumentTitle] = useState("")
  const [newDocumentNotes, setNewDocumentNotes] = useState("")
  const [selectedDocument, setSelectedDocument] = useState<DocumentPicker.DocumentPickerResult | null>(null)

  // Fetch documents
  useEffect(() => {
    const loadDocuments = async () => {
      if (!petId || !auth.currentUser) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const data = await fetchPetHealthData(petId as string)
        setDocuments(data.documents)
      } catch (error) {
        console.error("Error fetching documents:", error)
        Alert.alert("Error", "Failed to load documents. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadDocuments()
  }, [petId])

  // Pick a document
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      })

      if (result.canceled) {
        console.log("Document picking was canceled")
        return
      }

      console.log("Document picked:", result.assets[0])
      setSelectedDocument(result)

      // Auto-fill title with filename if not already set
      if (!newDocumentTitle) {
        const fileName = result.assets[0].name
        const fileNameWithoutExtension = fileName.replace(/\.[^/.]+$/, "")
        setNewDocumentTitle(fileNameWithoutExtension)
      }
    } catch (error) {
      console.error("Error picking document:", error)
      Alert.alert("Error", "Failed to pick document. Please try again.")
    }
  }

  // Handle adding document
  const handleAddDocument = async () => {
    if (!newDocumentTitle) {
      Alert.alert("Error", "Please enter a title for the document")
      return
    }

    if (
      !selectedDocument ||
      selectedDocument.canceled ||
      !selectedDocument.assets ||
      selectedDocument.assets.length === 0
    ) {
      Alert.alert("Error", "Please select a PDF document")
      return
    }

    if (!auth.currentUser) {
      Alert.alert("Error", "You must be logged in to add a document")
      return
    }

    if (!petId) {
      Alert.alert("Error", "No pet selected. Please select a pet first.")
      return
    }

    try {
      setLoading(true)
      setUploadingDocument(true)

      const documentAsset = selectedDocument.assets[0]
      const documentUri = documentAsset.uri
      const documentName = documentAsset.name
      const documentSize = documentAsset.size || 0
      const documentType = documentAsset.mimeType || "application/pdf"

      // Upload document to S3
      const uploadedDocumentUrl = await uploadDocumentToS3(documentUri, documentName)

      if (!uploadedDocumentUrl) {
        throw new Error("Failed to upload document")
      }

      // Add document to Firestore
      const newDocument = await addDocument(
        petId as string,
        newDocumentTitle,
        uploadedDocumentUrl,
        documentType,
        documentSize,
        documentName,
        newDocumentNotes,
      )

      // Add to local state
      setDocuments([newDocument, ...documents])

      // Reset form and close modal
      setNewDocumentTitle("")
      setNewDocumentNotes("")
      setSelectedDocument(null)
      setShowAddDocumentModal(false)
    } catch (error) {
      console.error("Error adding document:", error)

      // Check if it's a permissions error
      if (error instanceof Error && error.message.includes("permission")) {
        Alert.alert(
          "Permission Error",
          "You don't have permission to add documents. This might be due to Firestore security rules.",
          [{ text: "OK" }],
        )
      } else {
        Alert.alert("Error", "Failed to add document. Please try again.")
      }
    } finally {
      setLoading(false)
      setUploadingDocument(false)
    }
  }

  // Open document
  const openDocument = async (fileUrl: string) => {
    try {
      // Check if the URL is valid
      if (!fileUrl.startsWith("http")) {
        throw new Error("Invalid document URL")
      }

      // Open the URL in the device's browser or PDF viewer
      const supported = await Linking.canOpenURL(fileUrl)

      if (supported) {
        await Linking.openURL(fileUrl)
      } else {
        Alert.alert("Error", "Cannot open this document on your device")
      }
    } catch (error) {
      console.error("Error opening document:", error)
      Alert.alert("Error", "Failed to open document. Please try again.")
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]} edges={["top"]}>
      <Stack.Screen
        options={{
          title: `${petName}'s Documents`,
          headerBackTitle: "Health",
        }}
      />

      <View style={styles.header}>
        <Text style={[styles.screenTitle, { color: theme.colors.text.primary }]}>Documents</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.brand.primary }]}
          onPress={() => setShowAddDocumentModal(true)}
        >
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.brand.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>Loading documents...</Text>
        </View>
      ) : documents.length > 0 ? (
        <ScrollView style={styles.scrollContent} contentContainerStyle={styles.documentsList}>
          {documents.map((document) => (
            <Card key={document.id} style={styles.card}>
              <TouchableOpacity onPress={() => openDocument(document.fileUrl)}>
                <View style={styles.documentHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: theme.colors.brand.primary + "20" }]}>
                    <MaterialCommunityIcons name="file-pdf-box" size={20} color={theme.colors.brand.primary} />
                  </View>
                  <View style={styles.documentInfo}>
                    <Text style={[styles.documentTitle, { color: theme.colors.text.primary }]}>{document.title}</Text>
                    <Text style={[styles.date, { color: theme.colors.text.secondary }]}>
                      {formatDate(document.uploadDate)} • {formatFileSize(document.fileSize)}
                    </Text>
                  </View>
                  <Feather name="external-link" size={18} color={theme.colors.text.secondary} />
                </View>
                {document.notes && (
                  <Text style={[styles.notes, { color: theme.colors.text.secondary }]}>{document.notes}</Text>
                )}
              </TouchableOpacity>
            </Card>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="file-pdf-box" size={64} color={theme.colors.text.tertiary} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>No Documents</Text>
          <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
            Upload important documents like vet reports, lab results, and prescriptions for {petName}.
          </Text>
          <Button label="Add First Document" onPress={() => setShowAddDocumentModal(true)} style={{ marginTop: 16 }} />
        </View>
      )}

      {/* Add Document Modal */}
      <AddDocumentModal
        visible={showAddDocumentModal}
        onClose={() => setShowAddDocumentModal(false)}
        petName={(petName as string) || ""}
        title={newDocumentTitle}
        notes={newDocumentNotes}
        selectedDocument={selectedDocument}
        onChangeTitle={setNewDocumentTitle}
        onChangeNotes={setNewDocumentNotes}
        onPickDocument={pickDocument}
        onSave={handleAddDocument}
        loading={loading}
        uploading={uploadingDocument}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  scrollContent: {
    flex: 1,
  },
  documentsList: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    padding: 16,
    marginBottom: 12,
  },
  documentHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
  },
  notes: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
    maxWidth: 300,
  },
})

