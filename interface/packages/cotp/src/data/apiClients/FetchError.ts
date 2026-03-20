export class FetchError extends Error {
  response: Response
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor({ response, data, cause }: { response: Response; data?: any; cause?: unknown }) {
    super(`Response status: ${response.status}`)
    this.name = 'FetchError'
    this.response = response
    this.data = data
    this.cause = cause
  }
}
