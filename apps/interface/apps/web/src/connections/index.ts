import ARGENT_X_ICON from 'assets/wallets/argent-x.svg?react'
import BRAAVOS_ICON from 'assets/wallets/braavos.svg?react'
import WEB_WALLET_ICON from 'assets/wallets/web-wallet.svg?react'
import { InjectedConnector } from 'starknetkit/injected'
import { WebWalletConnector } from 'starknetkit/webwallet'
import ReactComponent from '*.svg?react'

import { getShouldAdvertiseArgentX, getShouldAdvertiseBraavos } from 'connections/utils'
import { isMobileWeb } from 'utilities/src/platform'

enum ConnectionType {
  ARGENT_X = 'ARGENT_X',
  BRAAVOS = 'BRAAVOS',
  WEBWALLET = 'WEBWALLET',
}

export interface L2Connection {
  getName(): string
  connector: InjectedConnector | WebWalletConnector
  type: ConnectionType
  getIcon: typeof ReactComponent
  shouldDisplay(): boolean
  overrideActivate?: () => boolean
}

export type Connection = L2Connection

// ARGENT X

const starknetArgentXWallet = new InjectedConnector({ options: { id: 'argentX' } })

const argentXWalletConnection: L2Connection = {
  getName: () => 'Ready',
  connector: starknetArgentXWallet,
  type: ConnectionType.ARGENT_X,
  getIcon: ARGENT_X_ICON,
  shouldDisplay: () => Boolean(!isMobileWeb),
  // If on non-injected, non-mobile browser, prompt user to install ArgentX
  overrideActivate: () => {
    if (getShouldAdvertiseArgentX()) {
      window.open('https://www.argent.xyz/argent-x/', 'inst_argent')
      return true
    }
    return false
  },
}

// BRAAVOS

const starknetBraavosWallet = new InjectedConnector({ options: { id: 'braavos' } })

const braavosWalletConnection: L2Connection = {
  getName: () => 'Braavos',
  connector: starknetBraavosWallet,
  type: ConnectionType.BRAAVOS,
  getIcon: BRAAVOS_ICON,
  shouldDisplay: () => true,
  // If on non-injected, prompt user to install Braavos
  overrideActivate: () => {
    if (getShouldAdvertiseBraavos()) {
      window.open('https://braavos.app/', 'inst_braavos')
      return true
    }
    return false
  },
}

// WEB WALLET

const webWallet = new WebWalletConnector({ url: 'https://web.argent.xyz' })

const webWalletConnection: L2Connection = {
  getName: () => 'Web Wallet',
  connector: webWallet,
  type: ConnectionType.WEBWALLET,
  getIcon: WEB_WALLET_ICON,
  shouldDisplay: () => true,
}

// GETTERS

export function getL2Connections() {
  return [argentXWalletConnection, braavosWalletConnection, webWalletConnection]
}
