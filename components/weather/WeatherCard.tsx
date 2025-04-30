"use client"

import { useState, useEffect, useCallback } from "react"
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native"
import * as Location from "expo-location"
import * as Network from "expo-network"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useTheme } from "../../app/theme"
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons"

// Storage key for cached weather data
const WEATHER_STORAGE_KEY = "petpal_cached_weather_data"

// Replace with your actual API URL
const WEATHER_API_URL = "https://weather-api-47gm.onrender.com/check-weather"

interface WeatherCardProps {
  petName?: string
}

interface WeatherData {
  recommendation: string
  triggered_by: string
  value: string
  location?: string
  country?: string
  temp?: number
  feels_like?: number
  description?: string
  humidity?: number
  wind_speed?: number
  air_quality?: string
  main?: string // Main weather condition (Clear, Clouds, Rain, etc.)
  is_day?: boolean // Whether it's daytime or nighttime
}

// Weather icon component that renders the appropriate icon based on weather conditions
const WeatherIcon = ({
  condition,
  isDay = true,
  size = 30,
  color = "#4A90E2",
}: {
  condition?: string
  isDay?: boolean
  size?: number
  color?: string
}) => {
  // Default to sunny/clear if no condition is provided
  if (!condition) {
    return isDay ? <Feather name="sun" size={size} color={color} /> : <Feather name="moon" size={size} color={color} />
  }

  const lowerCondition = condition.toLowerCase()

  // Map weather conditions to appropriate icons using valid icon names
  if (lowerCondition.includes("clear") || lowerCondition.includes("sunny")) {
    return isDay ? <Feather name="sun" size={size} color={color} /> : <Feather name="moon" size={size} color={color} />
  } else if (lowerCondition.includes("few clouds") || lowerCondition.includes("partly cloudy")) {
    return isDay ? (
      <MaterialCommunityIcons name="weather-partly-cloudy" size={size} color={color} />
    ) : (
      <MaterialCommunityIcons name="weather-night-partly-cloudy" size={size} color={color} />
    )
  } else if (lowerCondition.includes("scattered clouds") || lowerCondition.includes("broken clouds")) {
    return <MaterialCommunityIcons name="weather-cloudy" size={size} color={color} />
  } else if (lowerCondition.includes("overcast")) {
    return <MaterialCommunityIcons name="weather-cloudy" size={size} color={color} />
  } else if (lowerCondition.includes("shower rain") || lowerCondition.includes("drizzle")) {
    return <MaterialCommunityIcons name="weather-pouring" size={size} color={color} />
  } else if (lowerCondition.includes("rain")) {
    return <MaterialCommunityIcons name="weather-rainy" size={size} color={color} />
  } else if (lowerCondition.includes("thunderstorm")) {
    return <MaterialCommunityIcons name="weather-lightning" size={size} color={color} />
  } else if (lowerCondition.includes("snow")) {
    return <MaterialCommunityIcons name="weather-snowy" size={size} color={color} />
  } else if (lowerCondition.includes("mist") || lowerCondition.includes("fog") || lowerCondition.includes("haze")) {
    return <MaterialCommunityIcons name="weather-fog" size={size} color={color} />
  } else if (lowerCondition.includes("dust") || lowerCondition.includes("sand")) {
    return <MaterialCommunityIcons name="weather-windy" size={size} color={color} />
  } else if (lowerCondition.includes("tornado") || lowerCondition.includes("hurricane")) {
    return <MaterialCommunityIcons name="weather-tornado" size={size} color={color} />
  }

  // Default fallback
  return <MaterialCommunityIcons name="weather-cloudy" size={size} color={color} />
}

export const WeatherCard = ({ petName }: WeatherCardProps) => {
  const theme = useTheme()
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingCachedData, setUsingCachedData] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  // Helper function to get recommendation icon
  const getRecommendationIcon = (recommendation: string) => {
    if (recommendation?.includes("No Worries")) return "check-circle"
    if (recommendation?.includes("Take Precaution")) return "alert-triangle"
    if (recommendation?.includes("Do Not Go Out")) return "x-circle"
    return "info"
  }

  // Save weather data to AsyncStorage
  const saveWeatherData = async (data: WeatherData) => {
    try {
      const weatherInfo = {
        data,
        timestamp: new Date().toISOString(),
      }
      await AsyncStorage.setItem(WEATHER_STORAGE_KEY, JSON.stringify(weatherInfo))
    } catch (error) {
      console.error("Error saving weather data to storage:", error)
    }
  }

  // Load weather data from AsyncStorage
  const loadCachedWeatherData = async () => {
    try {
      const cachedData = await AsyncStorage.getItem(WEATHER_STORAGE_KEY)
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData)
        setWeatherData(data)
        setUsingCachedData(true)

        // Format the timestamp for display
        const date = new Date(timestamp)
        setLastUpdated(
          `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`,
        )

        return true
      }
      return false
    } catch (error) {
      console.error("Error loading cached weather data:", error)
      return false
    }
  }

  // Custom fetch with timeout function
  const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 10000) => {
    // Create an abort controller for the fetch
    const controller = new AbortController()
    const { signal } = controller

    // Set up the timeout
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      // Add the signal to the fetch options
      const response = await fetch(url, { ...options, signal })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  // Fetch weather data from our API
  const fetchWeatherData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true)
    }
    setError(null)
    setUsingCachedData(false)

    try {
      // Get current location
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        setError("Location permission is required to check weather conditions")

        // Try to load cached data if available
        const hasCachedData = await loadCachedWeatherData()
        if (!hasCachedData) {
          setLoading(false)
        }
        return
      }

      // Check for internet connectivity
      const networkState = await Network.getNetworkStateAsync()
      if (!networkState.isConnected || !networkState.isInternetReachable) {
        setError("No internet connection. Using cached weather data if available.")

        // Try to load cached data if available
        const hasCachedData = await loadCachedWeatherData()
        if (!hasCachedData) {
          setError("No internet connection and no cached weather data available.")
        }
        setLoading(false)
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = location.coords

      try {
        // Use our custom fetch with timeout function
        const response = await fetchWithTimeout(
          WEATHER_API_URL,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ lat: latitude, lon: longitude }),
          },
          10000, // 10 second timeout
        )

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`)
        }

        const data = await response.json()

        // Validate the required fields in the response
        if (!data || typeof data !== "object") {
          throw new Error("Invalid response")
        }

        // Determine if it's day or night (simple approach)
        const now = new Date()
        const hours = now.getHours()
        const isDay = hours >= 6 && hours < 18

        // Add isDay to the weather data
        const weatherDataWithDayInfo = {
          ...data,
          is_day: isDay,
        }

        setWeatherData(weatherDataWithDayInfo)
        setLastUpdated("Just now")

        // Save the fresh data to AsyncStorage
        saveWeatherData(weatherDataWithDayInfo)
      } catch (fetchError) {
        // Log the error for debugging but don't show technical details to the user
        console.error("Weather fetch error:", fetchError)

        // Try to load cached data if available
        const hasCachedData = await loadCachedWeatherData()
        if (!hasCachedData) {
          // Use a user-friendly message without technical details
          setError("Weather information is currently unavailable")
        }
      }
    } catch (error) {
      // Log the error for debugging but don't show it to the user
      console.error("Error in weather data flow:", error)

      // Try to load cached data if available
      const hasCachedData = await loadCachedWeatherData()
      if (!hasCachedData) {
        // Use a user-friendly message
        setError("Weather information is currently unavailable")
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch weather data when component mounts
  useEffect(() => {
    fetchWeatherData()
  }, [fetchWeatherData])

  // Toggle expanded view
  const toggleExpanded = () => {
    setExpanded(!expanded)
  }

  return (
    <View>
      <View style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Feather name="cloud" size={20} color={theme.colors.brand.primary} />
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>Weather</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.expandButton} onPress={toggleExpanded}>
              <Feather name={expanded ? "chevron-up" : "chevron-down"} size={18} color={theme.colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.refreshButton} onPress={() => fetchWeatherData(false)} disabled={loading}>
              <Feather name="refresh-cw" size={18} color={theme.colors.brand.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.brand.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
              Checking weather conditions...
            </Text>
          </View>
        ) : error && !weatherData ? (
          <View style={styles.fallbackContainer}>
            <View style={styles.fallbackContent}>
              <Feather name="cloud-off" size={24} color={theme.colors.text.tertiary} />
              <Text style={[styles.fallbackText, { color: theme.colors.text.primary, marginTop: 8 }]}>{error}</Text>
              <TouchableOpacity
                style={[
                  styles.retryButton,
                  {
                    borderColor: theme.colors.brand.primary,
                    marginTop: 12,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                  },
                ]}
                onPress={() => fetchWeatherData()}
              >
                <Text style={{ color: theme.colors.brand.primary }}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : weatherData ? (
          // Existing weather data rendering
          <View>
            {/* Show error banner if there was an error but we're using cached data */}
            {usingCachedData && (
              <View
                style={[
                  styles.errorBanner,
                  {
                    backgroundColor: theme.colors.status.info + "20",
                    marginBottom: 10,
                    padding: 8,
                    borderRadius: 6,
                  },
                ]}
              >
                <Text style={[styles.errorBannerText, { color: theme.colors.status.info, fontSize: 12 }]}>
                  Showing last known weather data
                </Text>
              </View>
            )}

            {/* Compact View */}
            <View style={styles.compactView}>
              <View style={styles.locationContainer}>
                {weatherData.location && (
                  <Text style={[styles.locationText, { color: theme.colors.text.secondary }]}>
                    {weatherData.location}
                    {weatherData.country ? `, ${weatherData.country}` : ""}
                  </Text>
                )}
              </View>

              <View style={styles.mainWeatherInfo}>
                {/* Weather Icon and Temperature */}
                <View style={styles.tempContainer}>
                  <View style={styles.weatherIcon}>
                    <WeatherIcon
                      condition={weatherData.description || weatherData.main}
                      isDay={weatherData.is_day !== undefined ? weatherData.is_day : true}
                      size={40}
                      color={theme.colors.brand.primary}
                    />
                  </View>
                  {weatherData.temp !== undefined && (
                    <Text style={[styles.temperature, { color: theme.colors.text.primary }]}>{weatherData.temp}°C</Text>
                  )}
                </View>

                {/* Weather Description and Recommendation */}
                <View style={styles.descriptionContainer}>
                  {weatherData.description && (
                    <Text style={[styles.weatherDescription, { color: theme.colors.text.primary }]}>
                      {weatherData.description.charAt(0).toUpperCase() + weatherData.description.slice(1)}
                    </Text>
                  )}
                </View>
              </View>

              {/* Recommendation - moved outside to be full width */}
              {weatherData.recommendation && (
                <View style={styles.recommendationContainer}>
                  <Feather
                    name={getRecommendationIcon(weatherData.recommendation)}
                    size={16}
                    color={
                      weatherData.recommendation?.includes("No Worries")
                        ? theme.colors.status.success
                        : weatherData.recommendation?.includes("Take Precaution")
                          ? theme.colors.status.warning
                          : theme.colors.status.error
                    }
                    style={styles.recommendationIcon}
                  />
                  <Text
                    style={[
                      styles.recommendationText,
                      {
                        color: weatherData.recommendation?.includes("No Worries")
                          ? theme.colors.status.success
                          : weatherData.recommendation?.includes("Take Precaution")
                            ? theme.colors.status.warning
                            : theme.colors.status.error,
                      },
                    ]}
                  >
                    {weatherData.recommendation?.replace(/$$.*?$$/g, "")}
                  </Text>
                </View>
              )}
            </View>

            {/* Expanded View */}
            {expanded && (
              <View style={styles.expandedView}>
                <View style={styles.detailsGrid}>
                  {weatherData.feels_like !== undefined && (
                    <View style={styles.detailItem}>
                      <Feather name="thermometer" size={16} color={theme.colors.text.secondary} />
                      <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Feels like</Text>
                      <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                        {weatherData.feels_like}°C
                      </Text>
                    </View>
                  )}

                  {weatherData.humidity !== undefined && (
                    <View style={styles.detailItem}>
                      <Feather name="droplet" size={16} color={theme.colors.text.secondary} />
                      <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Humidity</Text>
                      <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                        {weatherData.humidity}%
                      </Text>
                    </View>
                  )}

                  {weatherData.wind_speed !== undefined && (
                    <View style={styles.detailItem}>
                      <Feather name="wind" size={16} color={theme.colors.text.secondary} />
                      <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Wind</Text>
                      <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                        {weatherData.wind_speed} km/h
                      </Text>
                    </View>
                  )}

                  {weatherData.air_quality && (
                    <View style={styles.detailItem}>
                      <Feather name="activity" size={16} color={theme.colors.text.secondary} />
                      <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Air Quality</Text>
                      <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                        {weatherData.air_quality}
                      </Text>
                    </View>
                  )}
                </View>

                {petName && (
                  <Text style={[styles.petAdvice, { color: theme.colors.text.secondary }]}>
                    {weatherData.recommendation?.includes("No Worries")
                      ? `Great day to take ${petName} for a walk!`
                      : `Keep ${petName} safe in these conditions.`}
                  </Text>
                )}
              </View>
            )}

            {usingCachedData && lastUpdated && (
              <View style={styles.cachedDataContainer}>
                <Feather name="clock" size={12} color={theme.colors.text.tertiary} style={styles.clockIcon} />
                <Text style={[styles.cachedDataText, { color: theme.colors.text.tertiary }]}>
                  Last updated: {lastUpdated}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.fallbackContainer}>
            <View style={styles.fallbackContent}>
              <Feather name="cloud-off" size={24} color={theme.colors.text.tertiary} />
              <Text style={[styles.fallbackText, { color: theme.colors.text.primary, marginTop: 8 }]}>
                Weather information unavailable
              </Text>
              <TouchableOpacity
                style={[
                  styles.retryButton,
                  {
                    borderColor: theme.colors.brand.primary,
                    marginTop: 12,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                  },
                ]}
                onPress={() => fetchWeatherData()}
              >
                <Text style={{ color: theme.colors.brand.primary }}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  refreshButton: {
    padding: 8,
  },
  expandButton: {
    padding: 8,
    marginRight: 4,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  errorContainer: {
    padding: 12,
  },
  errorContentContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
  },
  compactView: {
    marginVertical: 4,
  },
  locationContainer: {
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
  },
  mainWeatherInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  tempContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  weatherIcon: {
    marginRight: 8,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  temperature: {
    fontSize: 32,
    fontWeight: "bold",
  },
  descriptionContainer: {
    alignItems: "flex-end",
  },
  weatherDescription: {
    fontSize: 16,
    fontWeight: "500",
  },
  recommendationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  recommendationIcon: {
    marginRight: 8,
  },
  recommendationText: {
    fontSize: 14,
    fontWeight: "500",
  },
  expandedView: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(150, 150, 150, 0.2)",
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailItem: {
    width: "48%",
    flexDirection: "column",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  detailLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  petAdvice: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 4,
  },
  weatherText: {
    fontSize: 16,
    textAlign: "center",
    padding: 16,
  },
  retryButton: {
    marginTop: 8,
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  cachedDataContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(150, 150, 150, 0.2)",
  },
  clockIcon: {
    marginRight: 4,
  },
  cachedDataText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  errorBannerText: {
    textAlign: "center",
  },
  fallbackContainer: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackContent: {
    alignItems: "center",
  },
  fallbackText: {
    fontSize: 14,
    textAlign: "center",
  },
})
