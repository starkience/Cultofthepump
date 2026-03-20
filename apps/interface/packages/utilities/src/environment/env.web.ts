import { logger } from 'utilities/src/logger/logger'
import { isInterface } from 'utilities/src/platform'

export function isTestEnv(): boolean {
  return !!process.env.JEST_WORKER_ID || process.env.NODE_ENV === 'test'
}

export function isDevEnv(): boolean {
  if (isInterface) {
    return process.env.NODE_ENV === 'development'
  } else if (isTestEnv()) {
    return false
  } else {
    throw createAndLogError()
  }
}

export function isBetaEnv(): boolean {
  if (isInterface) {
    // This is set in vercel builds and deploys from web/staging.
    return Boolean(process.env.VITE_STAGING)
  } else if (isTestEnv()) {
    return false
  } else {
    throw createAndLogError()
  }
}

export function isProdEnv(): boolean {
  if (isInterface) {
    return process.env.NODE_ENV === 'production' && !isBetaEnv()
  } else if (isTestEnv()) {
    return false
  } else {
    throw createAndLogError()
  }
}

function createAndLogError(): Error {
  const e = new Error('Unsupported app environment that failed all checks')
  logger.error(e)
  return e
}
