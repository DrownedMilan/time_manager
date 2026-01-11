/**
 * Formats late time in minutes to a readable string.
 * If minutes > 59, converts to hours format (e.g., "1h 15min")
 */
export function formatLateTime(minutes: number): string {
  if (minutes < 1) return 'On Time'
  
  if (minutes > 59) {
    const hours = Math.floor(minutes / 60)
    const remainingMins = Math.round(minutes % 60)
    if (remainingMins === 0) {
      return `${hours}h`
    }
    return `${hours}h ${remainingMins}min`
  }
  
  return `${Math.round(minutes)} min`
}