"use client"
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "../../app/theme"

interface UserSettingsProps {
  notificationsEnabled: boolean
  darkModeEnabled: boolean
  locationEnabled: boolean
  onNotificationsChange: (value: boolean) => void
  onDarkModeChange: (value: boolean) => void
  onLocationChange: (value: boolean) => void
  onSignOut: () => void
}

export const UserSettingsSection = ({
  notificationsEnabled,
  darkModeEnabled,
  locationEnabled,
  onNotificationsChange,
  onDarkModeChange,
  onLocationChange,
  onSignOut,
}: UserSettingsProps) => {
  const theme = useTheme()

  return (
    <View style={[styles.settingsSection, { backgroundColor: theme.colors.background.secondary }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Settings</Text>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Feather name="bell" size={20} color={theme.colors.text.secondary} />
          <Text style={[styles.settingText, { color: theme.colors.text.primary }]}>Notifications</Text>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={onNotificationsChange}
          trackColor={{ false: "#767577", true: theme.colors.brand.primary }}
          thumbColor="#f4f3f4"
        />
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Feather name="moon" size={20} color={theme.colors.text.secondary} />
          <Text style={[styles.settingText, { color: theme.colors.text.primary }]}>Dark Mode</Text>
        </View>
        <Switch
          value={darkModeEnabled}
          onValueChange={onDarkModeChange}
          trackColor={{ false: "#767577", true: theme.colors.brand.primary }}
          thumbColor="#f4f3f4"
        />
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Feather name="map-pin" size={20} color={theme.colors.text.secondary} />
          <Text style={[styles.settingText, { color: theme.colors.text.primary }]}>Location Services</Text>
        </View>
        <Switch
          value={locationEnabled}
          onValueChange={onLocationChange}
          trackColor={{ false: "#767577", true: theme.colors.brand.primary }}
          thumbColor="#f4f3f4"
        />
      </View>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => Alert.alert("Coming Soon", "This feature is not yet implemented.")}
      >
        <Feather name="user" size={20} color={theme.colors.text.secondary} />
        <Text style={[styles.menuItemText, { color: theme.colors.text.primary }]}>Account Information</Text>
        <Feather name="chevron-right" size={20} color={theme.colors.text.secondary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => Alert.alert("Coming Soon", "This feature is not yet implemented.")}
      >
        <Feather name="lock" size={20} color={theme.colors.text.secondary} />
        <Text style={[styles.menuItemText, { color: theme.colors.text.primary }]}>Privacy & Security</Text>
        <Feather name="chevron-right" size={20} color={theme.colors.text.secondary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => Alert.alert("Coming Soon", "This feature is not yet implemented.")}
      >
        <Feather name="help-circle" size={20} color={theme.colors.text.secondary} />
        <Text style={[styles.menuItemText, { color: theme.colors.text.primary }]}>Help & Support</Text>
        <Feather name="chevron-right" size={20} color={theme.colors.text.secondary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => Alert.alert("Coming Soon", "This feature is not yet implemented.")}
      >
        <Feather name="info" size={20} color={theme.colors.text.secondary} />
        <Text style={[styles.menuItemText, { color: theme.colors.text.primary }]}>About</Text>
        <Feather name="chevron-right" size={20} color={theme.colors.text.secondary} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.signOutButton, { borderColor: theme.colors.status.error }]} onPress={onSignOut}>
        <Feather name="log-out" size={20} color={theme.colors.status.error} />
        <Text style={[styles.signOutButtonText, { color: theme.colors.status.error }]}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  settingsSection: {
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150, 150, 150, 0.1)",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingText: {
    fontSize: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150, 150, 150, 0.1)",
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    flex: 1,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
})

