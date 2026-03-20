export function getCanonicalUrl(locationPathName: string): string {
  const baseUrl = `${window.location.origin}${locationPathName}`
  const modifiedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  return modifiedBaseUrl
}
