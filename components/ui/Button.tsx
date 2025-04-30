import type React from "react"
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
  type TouchableOpacityProps,
} from "react-native"
import { useTheme } from "../../app/theme"

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost"
type ButtonSize = "sm" | "md" | "lg"

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant
  size?: ButtonSize
  label: string
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  fullWidth?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
}

export const Button = ({
  variant = "primary",
  size = "md",
  label,
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  style,
  textStyle,
  ...props
}: ButtonProps) => {
  const theme = useTheme()

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: theme.colors.brand.primary,
          borderWidth: 0,
        }
      case "secondary":
        return {
          backgroundColor: theme.colors.brand.secondary,
          borderWidth: 0,
        }
      case "outline":
        return {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: theme.colors.brand.primary,
        }
      case "ghost":
        return {
          backgroundColor: "transparent",
          borderWidth: 0,
        }
      default:
        return {}
    }
  }

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case "sm":
        return {
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.borderRadius.sm,
        }
      case "md":
        return {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.borderRadius.md,
        }
      case "lg":
        return {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.xl,
          borderRadius: theme.borderRadius.md,
        }
      default:
        return {}
    }
  }

  const getTextColor = (): string => {
    if (variant === "outline" || variant === "ghost") {
      return theme.colors.brand.primary
    }
    return theme.colors.text.primary
  }

  const getTextSize = (): number => {
    switch (size) {
      case "sm":
        return theme.typography.fontSize.sm
      case "md":
        return theme.typography.fontSize.md
      case "lg":
        return theme.typography.fontSize.lg
      default:
        return theme.typography.fontSize.md
    }
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyles(),
        getSizeStyles(),
        fullWidth && styles.fullWidth,
        style,
        props.disabled && styles.disabled,
      ]}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && iconPosition === "left" && icon}
          <Text
            style={[
              {
                fontFamily: theme.typography.fontFamily.medium,
                textAlign: "center",
                color: getTextColor(),
                fontSize: getTextSize(),
              },
              icon
                ? iconPosition === "left"
                  ? { marginLeft: theme.spacing.sm }
                  : { marginRight: theme.spacing.sm }
                : null,
              textStyle,
              props.disabled ? { color: theme.colors.text.disabled } : null,
            ]}
          >
            {label}
          </Text>
          {icon && iconPosition === "right" && icon}
        </>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.6,
  },
})

