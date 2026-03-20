export function trimToLength(value: string, maxLength: number): string {
  if (!value) {
    return ''
  }
  const trimmed = value.trim()
  return trimmed.length > maxLength ? `${trimmed.substring(0, maxLength)}...` : trimmed
}
