/**
 * Format a date to a readable string
 */
export const formatDate = (date: Date | string) => {
  // Ensure we're working with a Date object
  const dateObj = date instanceof Date ? date : new Date(date)
  return dateObj.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

/**
 * Format time to a readable string
 */
export const formatTime = (time: string) => {
  // Convert 24-hour format to 12-hour format
  const [hours, minutes] = time.split(":").map(Number)
  const period = hours >= 12 ? "PM" : "AM"
  const hour12 = hours % 12 || 12
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`
}

/**
 * Format file size to a readable string
 */
export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B"
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
  else return (bytes / 1048576).toFixed(1) + " MB"
}

/**
 * Calculate weight change between two entries
 */
export const getWeightChange = (weightEntries: { weight: number }[]) => {
  if (weightEntries.length < 2) return null
  const latest = weightEntries[0].weight
  const previous = weightEntries[1].weight
  const change = latest - previous
  return {
    value: Math.abs(change).toFixed(1),
    direction: change > 0 ? "gained" : change < 0 ? "lost" : "maintained",
  }
}
