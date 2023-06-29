export const formatDate = (date: Date): number =>
  Math.floor(date.getTime() / 1000) // Convert to Unix timestamp
