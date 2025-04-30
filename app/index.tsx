"use client"

import { useEffect, useState } from "react"
import { View, ActivityIndicator, Text } from "react-native"
import { useRouter, useRootNavigationState } from "expo-router"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../firebaseConfig"
import { useTheme } from "./theme"

export default function Index() {
  const router = useRouter()
  const navigationState = useRootNavigationState()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const theme = useTheme()

  useEffect(() => {
    if (!navigationState?.key) return

    try {
      console.log("Checking authentication state...")
      // Subscribe to auth state changes
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          try {
            if (user) {
              // User is signed in
              console.log("User is authenticated, navigating to pet selector")
              router.replace("/(app)/pet-profile-selector")
            } else {
              // User is not signed in
              console.log("No authenticated user, navigating to login")
              router.replace("/(auth)/login")
            }
            setLoading(false)
          } catch (e) {
            console.error("Navigation error:", e)
            setError("Navigation error. Please restart the app.")
            setLoading(false)
          }
        },
        (authError) => {
          console.error("Auth error:", authError)
          setError("Authentication error. Please restart the app.")
          setLoading(false)
        },
      )

      return unsubscribe
    } catch (e) {
      console.error("UseEffect error:", e)
      setError("App initialization error. Please restart the app.")
      setLoading(false)
      return () => {}
    }
  }, [navigationState, router])

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background.primary,
          padding: 20,
        }}
      >
        <Text style={{ color: theme.colors.brand.error, fontSize: 18, marginBottom: 10, textAlign: "center" }}>
          {error}
        </Text>
        <Text style={{ color: theme.colors.text.secondary, textAlign: "center" }}>
          If the problem persists, please contact support.
        </Text>
      </View>
    )
  }

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background.primary,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.brand.primary} />
        <Text style={{ color: theme.colors.text.primary, marginTop: 16 }}>Loading...</Text>
      </View>
    )
  }

  return null
}

