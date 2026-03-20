import { isProdEnv } from 'utilities/src/environment/env'

function isAppCultOfThePumpFun({ hostname }: { hostname: string }): boolean {
  return hostname === 'cotp.fun'
}

export function isBrowserRouterEnabled(): boolean {
  if (isProdEnv()) {
    if (
      isAppCultOfThePumpFun(window.location) ||
      isLocalhost(window.location) // cypress tests
    ) {
      return true
    }
    return false // production builds *not* served through our domains or localhost, eg IPFS
  }
  return true // local dev builds
}

function isLocalhost({ hostname }: { hostname: string }): boolean {
  return hostname === 'localhost'
}
