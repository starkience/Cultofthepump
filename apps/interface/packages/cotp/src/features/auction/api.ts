import { useMemo } from 'react'
import { ValueType, getCurrencyAmount } from 'cotp/src/features/tokens/getCurrencyAmount'
import { useReadContract } from '@starknet-react/core'
import { DutchAuctionABI, DUTCH_AUCTION_ADDRESS } from 'cotp/src/constants/contracts'
import { BlockTag } from 'starknet'
import { Currency } from 'cotp/src/features/entities/currency'
import { CurrencyAmount } from 'cotp/src/features/entities/fractions/currencyAmount'
import { STRK_SEPOLIA } from 'cotp/src/constants/tokens'

export interface UseCurrentAuctionResult {
  data?: {
    isRunning: boolean
    // Only present when isRunning = true
    price?: CurrencyAmount<Currency>
  }
  isLoading: boolean
  error: unknown
}

export function useCurrentAuction(): UseCurrentAuctionResult {
  // Dev bypass: skip the contract call entirely and return a live auction at 0 STRK
  const devBypass = import.meta.env.VITE_DEV_AUCTION_BYPASS === 'true'

  // current_price() returns u256 when auction is live.
  // It REVERTS (panics) when the auction is expired — so error = expired.
  const res = useReadContract({
    abi: DutchAuctionABI,
    address: DUTCH_AUCTION_ADDRESS as `0x${string}`,
    functionName: 'current_price',
    args: [],
    blockIdentifier: BlockTag.LATEST,
  })

  const isLoading = !devBypass && res.fetchStatus === 'fetching'

  const data = useMemo((): UseCurrentAuctionResult['data'] => {
    if (devBypass) {
      // end_price from deploy script = 10 STRK (what bid() charges when auction restarts from expired state)
      const price = getCurrencyAmount({ value: '10000000000000000000', valueType: ValueType.Raw, currency: STRK_SEPOLIA })
      return { isRunning: true, price: price ?? undefined }
    }

    if (res.fetchStatus !== 'idle') return undefined

    // If error: contract reverted → auction is expired / not running
    if (res.error) {
      return { isRunning: false }
    }

    if (res.data == null) return undefined

    const rawPrice = res.data as bigint
    const price = getCurrencyAmount({
      value: rawPrice.toString(),
      valueType: ValueType.Raw,
      currency: STRK_SEPOLIA,
    })

    return { isRunning: true, price: price ?? undefined }
  }, [res.data, res.error, res.fetchStatus])

  return { data, isLoading, error: res.error }
}
