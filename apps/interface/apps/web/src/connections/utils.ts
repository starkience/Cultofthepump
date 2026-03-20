import { isMobileWeb } from 'utilities/src/platform'

// wallet

const getIsArgentXWallet = () => Boolean(window.starknet_argentX)

const getIsBraavosWallet = () => Boolean(window.starknet_braavos)

// advertise

export const getShouldAdvertiseArgentX = () => !getIsArgentXWallet() && !isMobileWeb

export const getShouldAdvertiseBraavos = () => !getIsBraavosWallet()
