// eslint-disable-next-line no-restricted-imports
import {
  COTP_INDEXER_GRAPHQL_URL,
  COTP_INDEXER_WS_URL,
  COTP_METADATA_API_URL,
  UNRUGGABLE_API_URL,
} from 'react-native-dotenv'

/**
 * Naming requirements for different environments:
 * - Web ENV vars: must have process.env.VITE_<var_name>
 * - Extension ENV vars: must have process.env.<var_name>
 * - Mobile ENV vars: must have BOTH process.env.<var_name> and <var_name>
 *
 *  The CI requires web vars to have the required 'VITE_' prefix. The react-dot-env library doesnt integrate with CI correctly,
 *  so we pull from github secrets directly with process.env.<var_name> for both extension and mobile. <var_name> is used for local mobile builds.
 */

export interface Config {
  unruggableApiUrl: string
  cotpMetadataApiUrl: string
  cotpIndexerGraphqlUrl: string
  cotpIndexerWsUrl: string
}

/**
 * Naming requirements for different environments:
 * - Web ENV vars: must have process.env.VITE_<var_name>
 * - Extension ENV vars: must have process.env.<var_name>
 * - Mobile ENV vars: must have BOTH process.env.<var_name> and <var_name>
 *
 *  The CI requires web vars to have the required 'VITE_' prefix. The react-dot-env library doesnt integrate with CI correctly,
 *  so we pull from github secrets directly with process.env.<var_name> for both extension and mobile. <var_name> is used for local mobile builds.
 */

const _config: Config = {
  unruggableApiUrl: import.meta.env.VITE_UNRUGGABLE_API_URL || process.env.UNRUGGABLE_API_URL || UNRUGGABLE_API_URL,
  cotpMetadataApiUrl:
    import.meta.env.VITE_COTP_METADATA_API_URL ||
    process.env.COTP_METADATA_API_URL ||
    COTP_METADATA_API_URL ||
    'http://127.0.0.1:8080',
  cotpIndexerGraphqlUrl:
    import.meta.env.VITE_COTP_INDEXER_GRAPHQL_URL ||
    process.env.COTP_INDEXER_GRAPHQL_URL ||
    COTP_INDEXER_GRAPHQL_URL ||
    'http://127.0.0.1:8080/v1/graphql',
  cotpIndexerWsUrl:
    import.meta.env.VITE_COTP_INDEXER_WS_URL ||
    process.env.COTP_INDEXER_WS_URL ||
    COTP_INDEXER_WS_URL ||
    'ws://127.0.0.1:8080/v1/graphql',
}

export const config = Object.freeze(_config)
