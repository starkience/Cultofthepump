// eslint-disable-next-line no-restricted-imports
import { UNRUGGABLE_API_URL } from 'react-native-dotenv'

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
}

export const config = Object.freeze(_config)
