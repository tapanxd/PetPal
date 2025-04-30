"use client"

import { useEffect } from "react"
import { Stack, useRouter } from "expo-router"
import { useTheme } from "../theme"
import { auth } from "../../firebaseConfig"
import { View } from "react-native"

export default function AuthLayout() {
  const theme = useTheme()
  const router = useRouter()

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, redirect to pet selector
        console.log("User is authenticated in auth layout, redirecting to pet selector")
        router.replace("/(app)/pet-profile-selector")
      }
    })

    return unsubscribe
  }, [router])

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.background.primary,
          },
          headerTintColor: theme.colors.text.primary,
          headerTitleStyle: {
            fontFamily: theme.typography.fontFamily.bold,
          },
          contentStyle: {
            backgroundColor: theme.colors.background.primary,
          },
          // Prevent going back to login/signup once authenticated
          headerBackVisible: false,
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
      </Stack>
    </View>
  )
}

