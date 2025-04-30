"use client"

import type React from "react"
import { createContext, useContext, type ReactNode } from "react"
import type { FlexAlignType, ViewStyle } from "react-native"

// Update the colors object with a new dark theme palette that removes violet colors
export const colors = {
  // Base colors
  background: {
    primary: "#121212",
    secondary: "#1E1E1E", // Darker gray instead of blue-tinted
    tertiary: "#2A2A2A", // Neutral dark gray instead of blue-gray
  },
  text: {
    primary: "#FFFFFF",
    secondary: "#B0B0B0", // Neutral light gray instead of blue-tinted
    tertiary: "#808080", // Neutral medium gray
    disabled: "#666666",
  },
  // Brand colors
  brand: {
    primary: "#4A90E2", // Blue instead of purple
    secondary: "#50C878", // Emerald green instead of purple
    accent: "#36F1CD", // Keep teal for accents
    error: "#FF5252", // Keep bright red for errors
  },
  // UI element colors
  surface: "#1F1F1F", // Neutral dark surface
  border: "#3D3D3D", // Neutral border
  divider: "#454545", // Neutral divider
  overlay: "rgba(0, 0, 0, 0.5)",
  input: {
    background: "#262626", // Neutral input background
    text: "#FFFFFF",
    placeholder: "#808080", // Match text tertiary
  },
  // Status colors
  status: {
    success: "#4CAF50", // Keep vibrant green
    info: "#2196F3", // Keep bright blue
    warning: "#FFC107", // Keep vibrant yellow
    error: "#FF5252", // Keep bright red
  },
}

// Spacing system
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

// Typography
export const typography = {
  fontFamily: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semiBold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
    xxxl: 40,
  },
}

// Border radius
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
}

// Update shadows to be more subtle and appropriate for dark theme
export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15, // Reduced opacity
    shadowRadius: 3, // Increased radius for softer shadow
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, // Reduced opacity
    shadowRadius: 5, // Increased radius for softer shadow
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, // Reduced opacity
    shadowRadius: 8, // Increased radius for softer shadow
    elevation: 6,
  },
}

// Button styles with proper TypeScript types
export const buttonStyles: {
  base: ViewStyle
  variants: Record<string, ViewStyle>
  states: Record<string, ViewStyle>
  sizes: Record<string, ViewStyle>
} = {
  base: {
    borderRadius: borderRadius.round,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: "center" as FlexAlignType,
    justifyContent: "center" as ViewStyle["justifyContent"],
  },
  variants: {
    primary: {
      backgroundColor: colors.brand.primary,
    },
    secondary: {
      backgroundColor: colors.brand.secondary,
    },
    outline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.brand.primary,
    },
  },
  states: {
    disabled: {
      opacity: 0.6,
    },
  },
  sizes: {
    sm: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    md: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    lg: {
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
    },
  },
}

// Input styles
export const inputStyles = {
  base: {
    backgroundColor: colors.input.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.input.text,
    fontSize: typography.fontSize.md,
  },
}

// Theme context
export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  buttonStyles,
  inputStyles,
}

type ThemeContextType = typeof theme

const ThemeContext = createContext<ThemeContextType>(theme)

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)

export default ThemeProvider

