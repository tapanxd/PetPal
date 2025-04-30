"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "../../app/theme"

interface DatePickerProps {
  value: Date | null
  onChange: (date: Date) => void
  label?: string
  placeholder?: string
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label = "Date",
  placeholder = "Select date",
}) => {
  const theme = useTheme()
  const [showPicker, setShowPicker] = useState(false)

  // Initialize with current value or current date
  const currentDate = value || new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
  const [selectedDay, setSelectedDay] = useState(currentDate.getDate())

  // Generate years (100 years back from current year)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i)

  // Month names
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // Generate days array based on selected year and month
  const days = Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1)

  // Format date for display
  const formatDate = (date: Date | null): string => {
    if (!date) return placeholder
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Handle confirm selection
  const handleConfirm = () => {
    const newDate = new Date(selectedYear, selectedMonth, selectedDay)
    onChange(newDate)
    setShowPicker(false)
  }

  // Open picker with current value
  const openPicker = () => {
    if (value) {
      setSelectedYear(value.getFullYear())
      setSelectedMonth(value.getMonth())
      setSelectedDay(value.getDate())
    } else {
      const now = new Date()
      setSelectedYear(now.getFullYear())
      setSelectedMonth(now.getMonth())
      setSelectedDay(now.getDate())
    }
    setShowPicker(true)
  }

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: theme.colors.text.secondary }]}>{label}</Text>}

      <TouchableOpacity
        style={[styles.dateButton, { backgroundColor: theme.colors.background.tertiary }]}
        onPress={openPicker}
      >
        <Feather name="calendar" size={18} color={theme.colors.brand.primary} style={styles.icon} />
        <Text style={[styles.dateText, { color: value ? theme.colors.text.primary : theme.colors.text.tertiary }]}>
          {formatDate(value)}
        </Text>
      </TouchableOpacity>

      {/* Custom Date Picker Modal */}
      <Modal visible={showPicker} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={[styles.pickerContainer, { backgroundColor: theme.colors.background.secondary }]}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={[styles.pickerButton, { color: theme.colors.text.secondary }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.pickerTitle, { color: theme.colors.text.primary }]}>Select Date</Text>
              <TouchableOpacity onPress={handleConfirm}>
                <Text style={[styles.pickerButton, { color: theme.colors.brand.primary }]}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateSelectors}>
              {/* Month Selector */}
              <View style={styles.selectorContainer}>
                <Text style={[styles.selectorLabel, { color: theme.colors.text.secondary }]}>Month</Text>
                <View style={[styles.selector, { backgroundColor: theme.colors.background.tertiary }]}>
                  <ScrollView style={styles.selectorScroll}>
                    {months.map((month, index) => (
                      <TouchableOpacity
                        key={month}
                        style={[
                          styles.selectorItem,
                          selectedMonth === index && {
                            backgroundColor: theme.colors.brand.primary + "20",
                          },
                        ]}
                        onPress={() => {
                          setSelectedMonth(index)
                          // Adjust day if it exceeds the days in the new month
                          const daysInNewMonth = getDaysInMonth(selectedYear, index)
                          if (selectedDay > daysInNewMonth) {
                            setSelectedDay(daysInNewMonth)
                          }
                        }}
                      >
                        <Text
                          style={[
                            styles.selectorItemText,
                            { color: theme.colors.text.primary },
                            selectedMonth === index && {
                              color: theme.colors.brand.primary,
                              fontWeight: "bold",
                            },
                          ]}
                        >
                          {month}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Day Selector */}
              <View style={styles.selectorContainer}>
                <Text style={[styles.selectorLabel, { color: theme.colors.text.secondary }]}>Day</Text>
                <View style={[styles.selector, { backgroundColor: theme.colors.background.tertiary }]}>
                  <ScrollView style={styles.selectorScroll}>
                    {days.map((day) => (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.selectorItem,
                          selectedDay === day && {
                            backgroundColor: theme.colors.brand.primary + "20",
                          },
                        ]}
                        onPress={() => setSelectedDay(day)}
                      >
                        <Text
                          style={[
                            styles.selectorItemText,
                            { color: theme.colors.text.primary },
                            selectedDay === day && {
                              color: theme.colors.brand.primary,
                              fontWeight: "bold",
                            },
                          ]}
                        >
                          {day}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Year Selector */}
              <View style={styles.selectorContainer}>
                <Text style={[styles.selectorLabel, { color: theme.colors.text.secondary }]}>Year</Text>
                <View style={[styles.selector, { backgroundColor: theme.colors.background.tertiary }]}>
                  <ScrollView style={styles.selectorScroll}>
                    {years.map((year) => (
                      <TouchableOpacity
                        key={year}
                        style={[
                          styles.selectorItem,
                          selectedYear === year && {
                            backgroundColor: theme.colors.brand.primary + "20",
                          },
                        ]}
                        onPress={() => {
                          setSelectedYear(year)
                          // Check if the day is valid in the new month/year (e.g., Feb 29 in non-leap years)
                          const daysInNewMonth = getDaysInMonth(year, selectedMonth)
                          if (selectedDay > daysInNewMonth) {
                            setSelectedDay(daysInNewMonth)
                          }
                        }}
                      >
                        <Text
                          style={[
                            styles.selectorItemText,
                            { color: theme.colors.text.primary },
                            selectedYear === year && {
                              color: theme.colors.brand.primary,
                              fontWeight: "bold",
                            },
                          ]}
                        >
                          {year}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>

            <Text style={[styles.selectedDate, { color: theme.colors.text.primary }]}>
              {`${months[selectedMonth]} ${selectedDay}, ${selectedYear}`}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
  },
  icon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  pickerContainer: {
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  pickerButton: {
    fontSize: 16,
    padding: 8,
  },
  dateSelectors: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  selectorContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  selectorLabel: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center",
  },
  selector: {
    height: 150,
    borderRadius: 8,
    overflow: "hidden",
  },
  selectorScroll: {
    flex: 1,
  },
  selectorItem: {
    padding: 12,
    alignItems: "center",
  },
  selectorItemText: {
    fontSize: 16,
  },
  selectedDate: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 16,
  },
})

