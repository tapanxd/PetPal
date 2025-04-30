"use client"

import type React from "react"
import { useState } from "react"
import { View, TextInput, Text, TouchableOpacity, type TextInputProps, type ViewStyle } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "../../app/theme"

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  isPassword?: boolean
  containerStyle?: ViewStyle
}

export const Input = ({
  label,
  error,
  leftIcon,
  rightIcon,
  isPassword = false,
  containerStyle,
  ...props
}: InputProps) => {
  const theme = useTheme()
  const [isFocused, setIsFocused] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(!isPassword)

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible)
  }

  return (
    <View style={[{ marginBottom: theme.spacing.md }, containerStyle]}>
      {label && (
        <Text
          style={{
            fontFamily: theme.typography.fontFamily.medium,
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing.xs,
          }}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.colors.input.background,
            borderRadius: theme.borderRadius.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
          },
          isFocused && { borderColor: theme.colors.brand.primary },
          error && { borderColor: theme.colors.brand.error },
        ]}
      >
        {leftIcon && <View style={{ paddingLeft: theme.spacing.md }}>{leftIcon}</View>}
        <TextInput
        style={[
            {
            flex: 1,
            height: 48,
            paddingHorizontal: theme.spacing.md,
            fontFamily: theme.typography.fontFamily.regular,
            fontSize: theme.typography.fontSize.md,
            color: theme.colors.input.text,
            },
            leftIcon ? { paddingLeft: theme.spacing.xs } : null,
            (rightIcon || isPassword) ? { paddingRight: theme.spacing.xs } : null,
        ]}
        placeholderTextColor={theme.colors.input.placeholder}
        secureTextEntry={isPassword && !isPasswordVisible}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
        />
        {isPassword ? (
          <TouchableOpacity style={{ paddingRight: theme.spacing.md }} onPress={togglePasswordVisibility}>
            <Feather name={isPasswordVisible ? "eye" : "eye-off"} size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        ) : (
          rightIcon && <View style={{ paddingRight: theme.spacing.md }}>{rightIcon}</View>
        )}
      </View>
      {error && (
        <Text
          style={{
            fontFamily: theme.typography.fontFamily.regular,
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.brand.error,
            marginTop: theme.spacing.xs,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  )
}

