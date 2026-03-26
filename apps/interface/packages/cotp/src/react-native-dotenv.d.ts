// Adds typings for env vars
// Keep in sync with .env files
declare module 'react-native-dotenv' {
  export const UNRUGGABLE_API_URL: string
  export const COTP_METADATA_API_URL: string
  export const COTP_INDEXER_GRAPHQL_URL: string
  export const COTP_INDEXER_WS_URL: string
}
