import type React from "react"
import { View, type ViewStyle } from "react-native"
import { useTheme } from "../../app/theme"

interface CardProps {
  children: React.ReactNode
  style?: ViewStyle
  elevation?: "none" | "sm" | "md" | "lg"
}

export const Card = ({ children, style, elevation = "md" }: CardProps) => {
  const theme = useTheme()

  const getShadow = () => {
    switch (elevation) {
      case "none":
        return {}
      case "sm":
        return theme.shadows.sm
      case "md":
        return theme.shadows.md
      case "lg":
        return theme.shadows.lg
      default:
        return theme.shadows.md
    }
  }

  return <View style={[styles.card(theme), getShadow(), style]}>{children}</View>
}

const styles = {
  card: (theme: any) => ({
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    overflow: "hidden",
  }),
}

