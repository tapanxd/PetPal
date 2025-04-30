"use client"

import { Tabs } from "expo-router"
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons"
import { useTheme } from "../theme"
import { useLocalSearchParams } from "expo-router"

export default function TabLayout() {
  const theme = useTheme()
  const params = useLocalSearchParams()

  // Extract petId from URL params to preserve it across tab navigation
  const petId = params.petId as string | undefined

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background.secondary,
          borderTopColor: theme.colors.border,
          // This ensures the tab bar stays at the bottom even when keyboard appears
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
          elevation: 0,
        },
        tabBarHideOnKeyboard: true, // Hide tab bar when keyboard is visible
        tabBarIcon: ({ focused, size }) => {
          let iconComponent
          const color = focused ? theme.colors.brand.secondary : theme.colors.text.tertiary

          switch (route.name) {
            case "dashboard":
              iconComponent = <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
              break
            case "maps":
              iconComponent = <Feather name="map" size={size} color={color} />
              break
            case "health":
              iconComponent = <MaterialCommunityIcons name="heart-pulse" size={size} color={color} />
              break
            case "journal":
              iconComponent = <MaterialCommunityIcons name="notebook-outline" size={size} color={color} />
              break
            case "profile":
              iconComponent = <Feather name="user" size={size} color={color} />
              break
            default:
              iconComponent = null
          }

          return iconComponent
        },
        tabBarActiveTintColor: theme.colors.brand.secondary,
        tabBarInactiveTintColor: theme.colors.text.tertiary,
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Hide this tab from navigation
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          href: petId ? `/(tabs)/dashboard?petId=${petId}` : undefined,
        }}
      />
      <Tabs.Screen
        name="maps"
        options={{
          title: "Maps",
          href: petId ? `/(tabs)/maps?petId=${petId}` : undefined,
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: "Health",
          href: petId ? `/(tabs)/health?petId=${petId}` : undefined,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: "Journal",
          href: petId ? `/(tabs)/journal?petId=${petId}` : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          href: petId ? `/(tabs)/profile?petId=${petId}` : undefined,
        }}
      />
    </Tabs>
  )
}

