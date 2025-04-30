"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  Linking,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native"
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps"
import * as Location from "expo-location"
import { FontAwesome5 } from "@expo/vector-icons"
import { useTheme } from "../theme"
import { SafeAreaView } from "react-native-safe-area-context"
import { BlurView } from "expo-blur"
import { DARK_MAP_STYLE } from "../../components/maps/mapStyles"

// Replace with your actual API key
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY

export default function Maps() {
  const theme = useTheme()
  const mapRef = useRef<MapView>(null)

  // State
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [places, setPlaces] = useState<any[]>([])
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null)
  const [routeInfo, setRouteInfo] = useState<any | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Get user location on component mount
  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== "granted") {
          setErrorMessage("Location permission is required to find places near you.")
          setIsLoading(false)
          return
        }

        const userLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })

        setLocation(userLocation.coords)
        setIsLoading(false)
      } catch (error) {
        console.error("Error getting location:", error)
        setErrorMessage("Could not get your location. Please check your device settings.")
        setIsLoading(false)
      }
    }

    getLocation()
  }, [])

  // Add this useEffect after the existing location useEffect
  const centerOnUser = useCallback(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.005, // Smaller value for more zoom
          longitudeDelta: 0.005, // Smaller value for more zoom
        },
        500,
      )
    }
  }, [location])

  useEffect(() => {
    // When location is first available, center the map on the user
    if (location && mapRef.current) {
      // Short delay to ensure map is ready
      setTimeout(() => {
        centerOnUser()
      }, 500)
    }
  }, [location, centerOnUser])

  // Search for places using Google Places API
  const searchPlaces = useCallback(async () => {
    if (!location) {
      setErrorMessage("Location is required to search for places.")
      return
    }

    if (!searchQuery.trim()) {
      setErrorMessage("Please enter a search term")
      return
    }

    setIsLoading(true)
    setErrorMessage(null)
    Keyboard.dismiss()

    try {
      // Use the Google Places API Text Search endpoint
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        searchQuery,
      )}&location=${location.latitude},${location.longitude}&radius=5000&key=${GOOGLE_MAPS_API_KEY}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        throw new Error(`API Error: ${data.status}`)
      }

      // Process and format the results
      const formattedPlaces = data.results.map((place: any) => ({
        id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        rating: place.rating,
      }))

      setPlaces(formattedPlaces)

      // If no results found
      if (formattedPlaces.length === 0) {
        setErrorMessage("No places found. Try a different search.")
      } else {
        // Fit map to show all places
        fitMapToPlaces(formattedPlaces)
      }
    } catch (error) {
      console.error("Error searching places:", error)
      setErrorMessage("Could not search for places. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [location, searchQuery])

  // Fit map to show all places
  const fitMapToPlaces = useCallback(
    (placesToFit: any[]) => {
      if (!mapRef.current || !location || placesToFit.length === 0) return

      const coordinates = [
        ...placesToFit.map((place) => ({
          latitude: place.lat,
          longitude: place.lng,
        })),
        { latitude: location.latitude, longitude: location.longitude },
      ]

      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 50, bottom: 150, left: 50 },
        animated: true,
      })
    },
    [location],
  )

  // Get directions to a place using Google Directions API
  const getDirections = useCallback(
    async (place: any) => {
      if (!location) return

      setIsLoading(true)
      setErrorMessage(null)

      try {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${location.latitude},${location.longitude}&destination=${place.lat},${place.lng}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`

        const response = await fetch(url)
        const data = await response.json()

        if (data.status !== "OK") {
          throw new Error(`Directions API Error: ${data.status}`)
        }

        const route = data.routes[0]
        const leg = route.legs[0]
        const points = decodePolyline(route.overview_polyline.points)

        setRouteInfo({
          distance: leg.distance.text,
          duration: leg.duration.text,
          polyline: points,
        })

        // Fit map to show the route
        mapRef.current?.fitToCoordinates(points, {
          edgePadding: { top: 100, right: 50, bottom: 150, left: 50 },
          animated: true,
        })
      } catch (error) {
        console.error("Error getting directions:", error)
        setErrorMessage("Could not get directions. Please try again.")
      } finally {
        setIsLoading(false)
      }
    },
    [location],
  )

  // Open in external maps app
  const openInMaps = useCallback((place: any) => {
    const scheme = Platform.select({ ios: "maps://0,0?q=", android: "geo:0,0?q=" })
    const latLng = `${place.lat},${place.lng}`
    const label = place.name
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    })

    if (url) {
      Linking.openURL(url)
    }
  }, [])

  // Center map on user

  // Select a place and get directions
  const selectPlace = useCallback(
    (place: any) => {
      console.log("Place selected:", place.name)
      setSelectedPlace(place)
      getDirections(place)
    },
    [getDirections],
  )

  // Handle marker press
  const handleMarkerPress = useCallback(
    (place: any) => {
      console.log("Marker pressed:", place.name)
      selectPlace(place)
    },
    [selectPlace],
  )

  // Clear selected place and route
  const clearSelection = useCallback(() => {
    setSelectedPlace(null)
    setRouteInfo(null)
    centerOnUser()
  }, [centerOnUser])

  // Handle map press to dismiss keyboard
  const handleMapPress = useCallback(() => {
    Keyboard.dismiss()
  }, [])

  // Decode Google Maps polyline
  const decodePolyline = (encoded: string) => {
    const poly: { latitude: number; longitude: number }[] = []
    let index = 0,
      lat = 0,
      lng = 0

    while (index < encoded.length) {
      let b,
        shift = 0,
        result = 0

      do {
        b = encoded.charCodeAt(index++) - 63
        result |= (b & 0x1f) << shift
        shift += 5
      } while (b >= 0x20)

      const dlat = result & 1 ? ~(result >> 1) : result >> 1
      lat += dlat

      shift = 0
      result = 0

      do {
        b = encoded.charCodeAt(index++) - 63
        result |= (b & 0x1f) << shift
        shift += 5
      } while (b >= 0x20)

      const dlng = result & 1 ? ~(result >> 1) : result >> 1
      lng += dlng

      poly.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      })
    }

    return poly
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: theme.colors.background.secondary }]}>
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text.primary }]}
            placeholder="Search for places..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchPlaces}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: theme.colors.brand.primary }]}
            onPress={searchPlaces}
          >
            <FontAwesome5 name="search" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {errorMessage && (
          <View style={[styles.errorContainer, { backgroundColor: theme.colors.background.secondary }]}>
            <FontAwesome5 name="exclamation-circle" size={16} color="#FF6B6B" />
            <Text style={[styles.errorText, { color: theme.colors.text.primary }]}>{errorMessage}</Text>
            <TouchableOpacity onPress={() => setErrorMessage(null)}>
              <FontAwesome5 name="times" size={16} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Map */}
        <View style={[styles.mapContainer, { backgroundColor: theme.colors.background.primary }]}>
          {location ? (
            <MapView
              ref={mapRef}
              provider={PROVIDER_DEFAULT}
              style={styles.map}
              showsUserLocation
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.005, // Smaller value for more zoom
                longitudeDelta: 0.005, // Smaller value for more zoom
              }}
              showsMyLocationButton={false}
              showsCompass={false}
              showsScale={true}
              onPress={handleMapPress}
              customMapStyle={DARK_MAP_STYLE}
            >
              {/* Place Markers */}
              {places.map((place) => (
                <Marker
                  key={place.id}
                  coordinate={{ latitude: place.lat, longitude: place.lng }}
                  title={place.name}
                  description={place.address}
                  onPress={() => handleMarkerPress(place)}
                  pinColor={Platform.OS === "ios" ? "red" : undefined}
                />
              ))}

              {/* Route Polyline */}
              {routeInfo?.polyline && (
                <Polyline
                  coordinates={routeInfo.polyline}
                  strokeWidth={5}
                  strokeColor={Platform.OS === "ios" ? "#FF3B30" : theme.colors.brand.primary}
                  lineDashPattern={[0]}
                />
              )}
            </MapView>
          ) : (
            <View style={[styles.loadingMapContainer, { backgroundColor: theme.colors.background.secondary }]}>
              <ActivityIndicator size="large" color={theme.colors.brand.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.text.primary }]}>Getting your location...</Text>
            </View>
          )}
          {error && (
            <View style={[styles.mapErrorOverlay, { backgroundColor: "rgba(0,0,0,0.7)" }]}>
              <Text style={{ color: "white", textAlign: "center" }}>{error}</Text>
            </View>
          )}

          {/* My Location Button */}
          {location && (
            <TouchableOpacity
              style={[styles.myLocationButton, { backgroundColor: theme.colors.background.secondary }]}
              onPress={centerOnUser}
            >
              <FontAwesome5 name="location-arrow" size={18} color={theme.colors.brand.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Place Details */}
        {selectedPlace && (
          <View style={[styles.detailPanel, { backgroundColor: theme.colors.background.secondary }]}>
            <View style={styles.detailHeader}>
              <View style={styles.detailInfo}>
                <Text style={[styles.detailTitle, { color: theme.colors.text.primary }]}>{selectedPlace.name}</Text>
                <Text style={[styles.detailSubtitle, { color: theme.colors.text.secondary }]}>
                  {selectedPlace.address}
                </Text>
                {selectedPlace.rating && (
                  <View style={styles.ratingContainer}>
                    <FontAwesome5 name="star" solid size={14} color="#FFD700" />
                    <Text style={[styles.ratingText, { color: theme.colors.text.secondary }]}>
                      {selectedPlace.rating.toFixed(1)}
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: theme.colors.background.tertiary }]}
                onPress={clearSelection}
              >
                <FontAwesome5 name="times" size={16} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Route Info */}
            {routeInfo && (
              <View style={styles.routeInfo}>
                <View style={styles.routeDetail}>
                  <FontAwesome5 name="road" size={14} color={theme.colors.text.secondary} />
                  <Text style={[styles.routeText, { color: theme.colors.text.secondary }]}>{routeInfo.distance}</Text>
                </View>
                <View style={styles.routeDetail}>
                  <FontAwesome5 name="clock" size={14} color={theme.colors.text.secondary} />
                  <Text style={[styles.routeText, { color: theme.colors.text.secondary }]}>{routeInfo.duration}</Text>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.brand.primary }]}
                onPress={() => openInMaps(selectedPlace)}
              >
                <FontAwesome5 name="directions" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Directions</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.background.tertiary }]}
                onPress={() => {
                  const url = `https://www.google.com/maps/place/?q=place_id:${selectedPlace.id}`
                  Linking.openURL(url)
                }}
              >
                <FontAwesome5 name="info-circle" size={16} color={theme.colors.text.primary} />
                <Text style={[styles.actionButtonText, { color: theme.colors.text.primary }]}>Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <BlurView intensity={80} style={styles.loadingBlur} tint="dark">
              <ActivityIndicator size="large" color={theme.colors.brand.primary} />
            </BlurView>
          </View>
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  searchBar: {
    flexDirection: "row",
    margin: 16,
    borderRadius: 25,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  searchButton: {
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
  },
  errorText: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 14,
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    marginBottom: 80, // Increased to account for tab bar
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  loadingMapContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 10,
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  myLocationButton: {
    position: "absolute",
    bottom: 24, // Increased to position above the tab bar
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 5,
  },
  detailPanel: {
    position: "absolute",
    bottom: 64, // Increased to position above the tab bar
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24, // Extra padding at the bottom
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10,
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  detailInfo: {
    flex: 1,
    marginRight: 16,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  detailSubtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
  },
  routeInfo: {
    flexDirection: "row",
    marginTop: 12,
    marginBottom: 16,
  },
  routeDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  routeText: {
    marginLeft: 8,
    fontSize: 14,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 14,
  },
  loadingBlur: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  mapErrorOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
})

