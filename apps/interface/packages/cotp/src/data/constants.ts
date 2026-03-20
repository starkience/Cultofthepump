import { isAndroid, isIOS } from 'utilities/src/platform'

export const REQUEST_SOURCE = getRequestSource()

function getRequestSource(): string {
  if (isIOS) {
    return 'cotp-ios'
  }
  if (isAndroid) {
    return 'cotp-android'
  }
  return 'cotp-web'
}

export { getVersionHeader } from './getVersionHeader'
