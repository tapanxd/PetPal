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
  StyleSheet,
  ActivityIndicator,
} from "react-native"
import { useRouter } from "expo-router"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../../firebaseConfig"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../app/theme"
import Alert from "../../components/ui/Alert"

export default function LoginScreen() {
  const router = useRouter()
  const theme = useTheme()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<{ title: string; message: string } | null>(null)

  const handleLogin = async () => {
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/pet-profile-selector")
    } catch (error) {
      if (error instanceof Error) {
        // Replace Alert.alert with our custom Alert component
        setError({
          title: "Login Failed",
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

            <View style={[styles.inputContainer, { backgroundColor: theme.colors.input.background }]}>
              <TextInput
                style={[styles.input, { color: theme.colors.input.text }]}
                placeholder="Email or Username"
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

            <TouchableOpacity>
              <Text style={[styles.forgotPassword, { color: theme.colors.brand.primary }]}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={[
                styles.loginButton,
                theme.buttonStyles.base,
                theme.buttonStyles.variants.primary,
                loading && theme.buttonStyles.states.disabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.text.primary} />
              ) : (
                <Text style={[styles.loginButtonText, { color: theme.colors.text.primary }]}>Log In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
              <Text style={[styles.orText, { color: theme.colors.text.secondary }]}>OR</Text>
              <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
            </View>

            <TouchableOpacity style={[styles.googleButton, { borderColor: theme.colors.divider }]}>
              <Ionicons name="logo-google" size={20} color={theme.colors.text.primary} />
              <Text style={[styles.googleButtonText, { color: theme.colors.text.primary }]}>Log in with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text style={[styles.signupText, { color: theme.colors.text.secondary }]}>
                Don't have an account?{" "}
                <Text style={[styles.signupLink, { color: theme.colors.brand.primary }]}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
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
  forgotPassword: {
    fontSize: 14,
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  loginButton: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
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
  googleButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
  },
  googleButtonText: {
    marginLeft: 12,
    fontSize: 16,
  },
  signupText: {
    fontSize: 14,
    marginTop: 24,
  },
  signupLink: {
    fontWeight: "600",
  },
})

