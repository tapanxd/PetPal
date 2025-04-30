"use client"

import { useEffect, useState } from "react"
import { Stack } from "expo-router"
import { PetProvider } from "./context/PetContext"
import { auth } from "../firebaseConfig"
import { View, Text, ActivityIndicator, StatusBar } from "react-native"
import { useTheme } from "./theme"

export default function Layout() {
  const [authInitialized, setAuthInitialized] = useState(false)
  const theme = useTheme()

  // Wait for auth to initialize before rendering
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      setAuthInitialized(true)
    })
    return unsubscribe
  }, [])

  if (!authInitialized) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background.primary,
        }}
      >
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background.primary} translucent={false} />
        <ActivityIndicator size="large" color={theme.colors.brand.primary} />
        <Text style={{ color: theme.colors.text.primary, marginTop: 16 }}>Initializing app...</Text>
      </View>
    )
  }

  return (
    <PetProvider>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background.primary} translucent={false} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </PetProvider>
  )
}

