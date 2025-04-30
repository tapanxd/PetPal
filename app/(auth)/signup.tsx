"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native"
import { useRouter, Stack } from "expo-router"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "../../firebaseConfig"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../app/theme"
import Alert from "../../components/ui/Alert"

export default function SignupScreen() {
  const router = useRouter()
  const theme = useTheme()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<{ title: string; message: string } | null>(null)

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      setError({
        title: "Error",
        message: "Passwords do not match",
      })
      return
    }

    setLoading(true)
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      router.push("/pet-profile-selector")
    } catch (error) {
      if (error instanceof Error) {
        setError({
          title: "Signup Failed",
          message: error.message,
        })
      } else {
        setError({
          title: "Error",
          message: "An unknown error occurred.",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.innerContainer}>
              <Image source={require("../../assets/images/logo.png")} style={styles.logo} />

              {error && (
                <Alert
                  variant="error"
                  title={error.title}
                  description={error.message}
                  onClose={() => setError(null)}
                  style={{ marginBottom: theme.spacing.md }}
                />
              )}

              <Text style={[styles.title, { color: theme.colors.text.primary }]}>Create an Account</Text>

              <View style={[styles.inputContainer, { backgroundColor: theme.colors.input.background }]}>
                <TextInput
                  style={[styles.input, { color: theme.colors.input.text }]}
                  placeholder="Email"
                  placeholderTextColor={theme.colors.input.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={[styles.inputContainer, { backgroundColor: theme.colors.input.background }]}>
                <TextInput
                  style={[styles.input, { color: theme.colors.input.text }]}
                  placeholder="Password"
                  placeholderTextColor={theme.colors.input.placeholder}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={theme.colors.text.secondary} />
                </TouchableOpacity>
              </View>

              <View style={[styles.inputContainer, { backgroundColor: theme.colors.input.background }]}>
                <TextInput
                  style={[styles.input, { color: theme.colors.input.text }]}
                  placeholder="Confirm Password"
                  placeholderTextColor={theme.colors.input.placeholder}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={20}
                    color={theme.colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleSignup}
                disabled={loading}
                style={[
                  styles.signupButton,
                  theme.buttonStyles.base,
                  theme.buttonStyles.variants.primary,
                  loading && theme.buttonStyles.states.disabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.text.primary} />
                ) : (
                  <Text style={[styles.signupButtonText, { color: theme.colors.text.primary }]}>Sign Up</Text>
                )}
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
                <Text style={[styles.orText, { color: theme.colors.text.secondary }]}>OR</Text>
                <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
              </View>

              <TouchableOpacity onPress={() => router.push("/login")}>
                <Text style={[styles.loginText, { color: theme.colors.text.secondary }]}>
                  Already have an account?{" "}
                  <Text style={[styles.loginLink, { color: theme.colors.brand.primary }]}>Log In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  innerContainer: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 42,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  inputContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 12,
  },
  signupButton: {
    width: "100%",
    height: 50,
    marginTop: 8,
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  orText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontWeight: "600",
  },
})

