// TODO: remove this eslint disable
/* eslint-disable import/no-unused-modules */

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { InterfaceState } from 'state/webReducer'
import { setAuctionPrice, setCultData, setCultVisual, setStrkBalance } from './reducer'
import { CurrencyAmount } from 'cotp/src/features/entities/fractions/currencyAmount'
import { Currency } from 'cotp/src/features/entities/currency'
import { SummonStepKey } from 'pages/Summon/types'

// VALIDATION

export function useIsValidSummonSteps(): (cardKey: SummonStepKey) => boolean {
  const state = useAppSelector((state: InterfaceState) => ({
    auctionPrice: state.summon.auctionPrice,
    name: state.summon.name,
    symbol: state.summon.symbol,
    visualUrl: state.summon.visualUrl,
    strkBalance: state.summon.strkBalance,
  }))

  return useCallback((stepKey: SummonStepKey) => {
    switch (stepKey) {
      case SummonStepKey.RitualFee:
        return !!state.auctionPrice

      case SummonStepKey.CultData:
        return !!state.name && !!state.symbol

      case SummonStepKey.CultVisual:
        return !!state.visualUrl

      case SummonStepKey.Balance:
        return !!state.auctionPrice && !!state.strkBalance && BigInt(state.strkBalance) >=  BigInt(state.auctionPrice)
    }
  }, [state.auctionPrice, state.name, state.symbol, state.visualUrl, state.strkBalance])
}

// GETTERS

export function useCultData() {
  return useAppSelector((state: InterfaceState) => ({
    name: state.summon.name,
    symbol: state.summon.symbol,
    manifesto: state.summon.manifesto,
  }))
}

export function useAuctionPrice() {
  return useAppSelector((state: InterfaceState) => state.summon.auctionPrice)
}

export function useCultVisual() {
  return useAppSelector((state: InterfaceState) => state.summon.visualUrl)
}

// CULT DATA

export function useSetCultData(): (name: string, symbol: string, manifesto: string) => void {
  const dispatch = useAppDispatch()
  return useCallback((name: string, symbol: string, manifesto: string) => {
    dispatch(setCultData({ name, symbol, manifesto }))
  }, [dispatch])
}

export function useCleanCultData(): () => void {
  const dispatch = useAppDispatch()
  return useCallback(() => {
    dispatch(setCultData({ name: null, symbol: null, manifesto: null }))
  }, [dispatch])
}

// AUCTION PRICE

export function useSetAuctionPrice(): (price: string | null) => void {
  const dispatch = useAppDispatch()
  return useCallback((price: string | null) => {
    dispatch(setAuctionPrice({ price }))
  }, [dispatch])
}

// CULT VISUAL

export function useSetCultVisual(): (url: string | null) => void {
  const dispatch = useAppDispatch()
  return useCallback((url: string | null) => {
    dispatch(setCultVisual({ url }))
  }, [dispatch])
}

// BALANCE

export function useSetStrkBalance(): (balance: string | null) => void {
  const dispatch = useAppDispatch()
  return useCallback((balance: string | null) => {
    dispatch(setStrkBalance({ balance }))
  }, [dispatch])
}
