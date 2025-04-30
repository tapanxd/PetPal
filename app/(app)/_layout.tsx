"use client"

import { Stack } from "expo-router"
import { useTheme } from "../theme"

export default function AppLayout() {
  const theme = useTheme()

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background.primary,
        },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: {
          fontFamily: theme.typography.fontFamily.bold,
          fontSize: theme.typography.fontSize.lg,
        },
        contentStyle: {
          backgroundColor: theme.colors.background.primary,
        },
      }}
    >
      <Stack.Screen
        name="pet-profile-selector"
        options={{
          headerShown: false,
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="create-pet"
        options={{
          title: "Add New Pet",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="medical-records"
        options={{
          title: "Medical Records",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="documents"
        options={{
          title: "Documents",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="add-reminder"
        options={{
          title: "Add Reminder",
          animation: "slide_from_right",
        }}
      />
    </Stack>
  )
}

