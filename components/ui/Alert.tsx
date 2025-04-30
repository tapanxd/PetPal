import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity, type ViewStyle, Alert as RNAlert } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "../../app/theme"

type AlertVariant = "default" | "success" | "warning" | "error" | "info"

interface AlertProps {
  variant?: AlertVariant
  title?: string
  description?: string
  icon?: boolean
  action?: {
    label: string
    onPress: () => void
  }
  onClose?: () => void
  style?: ViewStyle
}

// Define the component type with static methods
interface AlertComponent extends React.FC<AlertProps> {
  alert: (title: string, description?: string, variant?: AlertVariant) => void
}

// Create the base component
const AlertBase: React.FC<AlertProps> = ({
  variant = "default",
  title,
  description,
  icon = true,
  action,
  onClose,
  style,
}) => {
  const theme = useTheme()

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          background: theme.colors.status.success + "1A", // 10% opacity
          border: theme.colors.status.success + "40", // 25% opacity
          icon: theme.colors.status.success,
          iconName: "check-circle",
        }
      case "warning":
        return {
          background: theme.colors.status.warning + "1A",
          border: theme.colors.status.warning + "40",
          icon: theme.colors.status.warning,
          iconName: "alert-triangle",
        }
      case "error":
        return {
          background: theme.colors.status.error + "1A",
          border: theme.colors.status.error + "40",
          icon: theme.colors.status.error,
          iconName: "alert-circle",
        }
      case "info":
        return {
          background: theme.colors.status.info + "1A",
          border: theme.colors.status.info + "40",
          icon: theme.colors.status.info,
          iconName: "info",
        }
      default:
        return {
          background: theme.colors.surface + "40",
          border: theme.colors.border,
          icon: theme.colors.text.primary,
          iconName: "bell",
        }
    }
  }

  const variantStyles = getVariantStyles()

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variantStyles.background,
          borderColor: variantStyles.border,
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {icon && (
          <Feather name={variantStyles.iconName as any} size={20} color={variantStyles.icon} style={styles.icon} />
        )}
        <View style={styles.textContainer}>
          {title && (
            <Text
              style={[
                styles.title,
                {
                  color: theme.colors.text.primary,
                  fontFamily: theme.typography.fontFamily.medium,
                },
              ]}
            >
              {title}
            </Text>
          )}
          {description && (
            <Text
              style={[
                styles.description,
                {
                  color: theme.colors.text.secondary,
                  fontFamily: theme.typography.fontFamily.regular,
                },
              ]}
            >
              {description}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        {action && (
          <TouchableOpacity onPress={action.onPress}>
            <Text
              style={[
                styles.actionText,
                {
                  color: variantStyles.icon,
                  fontFamily: theme.typography.fontFamily.medium,
                },
              ]}
            >
              {action.label}
            </Text>
          </TouchableOpacity>
        )}
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

// Create the Alert component with the static method
export const Alert: AlertComponent = Object.assign(AlertBase, {
  // Static method for showing alerts (using React Native's Alert)
  alert: (title: string, description?: string, variant: AlertVariant = "default") => {
    RNAlert.alert(title, description)
  },
})

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 8,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
  },
  actionText: {
    fontSize: 14,
    marginRight: 16,
  },
  closeButton: {
    marginLeft: 8,
    marginTop: -4,
  },
})

export default Alert

