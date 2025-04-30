import { Redirect } from "expo-router"

export default function TabIndex() {
  // Redirect to the dashboard tab by default
  return <Redirect href="/(tabs)/dashboard" />
}



