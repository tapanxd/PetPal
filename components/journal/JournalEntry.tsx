"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from "react-native"
import { useTheme } from "../../app/theme"
import { Feather } from "@expo/vector-icons"
import type { JournalEntry } from "../../utils/journal"

interface JournalEntryProps {
  entry: JournalEntry
  onPress?: () => void
  onDelete?: (entryId: string) => void
}

export const JournalEntryComponent: React.FC<JournalEntryProps> = ({ entry, onPress, onDelete }) => {
  const theme = useTheme()
  const [showMenu, setShowMenu] = useState(false)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleDeletePress = () => {
    Alert.alert("Delete Entry", "Are you sure you want to delete this journal entry? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          if (onDelete) {
            onDelete(entry.id)
          }
        },
      },
    ])
  }

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <Text style={[styles.timestamp, { color: theme.colors.text.secondary }]}>{formatDate(entry.timestamp)}</Text>
        <TouchableOpacity style={styles.moreButton} onPress={() => setShowMenu(!showMenu)}>
          <Feather name="more-horizontal" size={20} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Dropdown menu */}
      {showMenu && (
        <View style={[styles.menu, { backgroundColor: theme.colors.background.tertiary }]}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false)
              handleDeletePress()
            }}
          >
            <Feather name="trash-2" size={16} color={theme.colors.status.error} />
            <Text style={[styles.menuItemText, { color: theme.colors.status.error }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      {(entry.type === "both" || entry.type === "photo") && entry.imageUrl && (
        <Image source={{ uri: entry.imageUrl }} style={styles.image} resizeMode="cover" />
      )}

      {(entry.type === "both" || entry.type === "text") && entry.content && (
        <Text style={[styles.content, { color: theme.colors.text.primary }]}>{entry.content}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  timestamp: {
    fontSize: 14,
  },
  moreButton: {
    padding: 4,
  },
  image: {
    width: "100%",
    height: 250, // Adjusted for better aspect ratio
    alignSelf: "center",
    marginBottom: 12,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    padding: 12,
    paddingTop: 0,
  },
  menu: {
    position: "absolute",
    top: 40,
    right: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 8,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "500",
  },
})
