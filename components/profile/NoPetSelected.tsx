"use client"
import { View, Text, StyleSheet } from "react-native"
import { useTheme } from "../../app/theme"
import { Button } from "../ui/Button"

interface NoPetSelectedProps {
  hasPets: boolean
  onSelectPet: () => void
  onAddPet: () => void
}

export const NoPetSelected = ({ hasPets, onSelectPet, onAddPet }: NoPetSelectedProps) => {
  const theme = useTheme()

  return (
    <View style={[styles.noPetContainer, { backgroundColor: theme.colors.background.secondary }]}>
      <Text style={[styles.noPetTitle, { color: theme.colors.text.primary }]}>No Pet Selected</Text>
      <Text style={[styles.noPetText, { color: theme.colors.text.secondary }]}>
        {hasPets
          ? "Please select a pet to view and edit their profile."
          : "You don't have any pets yet. Add a pet to get started."}
      </Text>
      <Button
        label={hasPets ? "Select a Pet" : "Add a Pet"}
        onPress={hasPets ? onSelectPet : onAddPet}
        style={{ marginTop: 16 }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  noPetContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderRadius: 12,
  },
  noPetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  noPetText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
})

