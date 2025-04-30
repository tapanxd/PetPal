"use client"

import type React from "react"
import { View, Text, TouchableOpacity, StyleSheet, Linking } from "react-native"
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons"
import { Button } from "../../components/ui/Button"
import type { Document } from "../../types/health"
import { formatDate, formatFileSize } from "../../utils/formatters"

interface DocumentsSectionProps {
  documents: Document[]
  petName: string
  onAddDocument: () => void
}

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({ documents, petName, onAddDocument }) => {
  const theme = useTheme()

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
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Documents</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.brand.primary }]}
          onPress={onAddDocument}
        >
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Documents List */}
      {documents.length > 0 ? (
        <View style={styles.documentsList}>
          {documents.map((document) => (
            <View
              key={document.id}
              style={[styles.documentItem, { backgroundColor: theme.colors.background.secondary }]}
            >
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
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background.secondary }]}>
          <MaterialCommunityIcons name="file-pdf-box" size={48} color={theme.colors.text.tertiary} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>No Documents</Text>
          <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
            Upload important documents like vet reports, lab results, and prescriptions for {petName}.
          </Text>
          <Button label="Add First Document" onPress={onAddDocument} style={{ marginTop: 16 }} />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
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
  documentsList: {
    gap: 12,
  },
  documentItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
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
  emptyContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
})

import { useTheme } from "../../app/theme"
import { Alert } from "react-native"

