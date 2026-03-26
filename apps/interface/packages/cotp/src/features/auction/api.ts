import { useMemo } from 'react'
import { ValueType, getCurrencyAmount } from 'cotp/src/features/tokens/getCurrencyAmount'
import { useReadContract } from '@starknet-react/core'
import { DutchAuctionABI, DUTCH_AUCTION_ADDRESS } from 'cotp/src/constants/contracts'
import { BlockTag } from 'starknet'
import { Currency } from 'cotp/src/features/entities/currency'
import { CurrencyAmount } from 'cotp/src/features/entities/fractions/currencyAmount'
import { STRK_SEPOLIA } from 'cotp/src/constants/tokens'

export interface AuctionTimerData {
  startTimestamp: number   // unix seconds
  duration: number         // seconds
  endTimestamp: number     // unix seconds
  startPriceWei: bigint
  endPriceWei: bigint
}

export interface UseCurrentAuctionResult {
  data?: {
    isRunning: boolean
    price?: CurrencyAmount<Currency>
    timer?: AuctionTimerData
  }
  isLoading: boolean
  error: unknown
}

export function useCurrentAuction(): UseCurrentAuctionResult {
  const devBypass = import.meta.env.VITE_DEV_AUCTION_BYPASS === 'true'

  const priceRes = useReadContract({
    abi: DutchAuctionABI,
    address: DUTCH_AUCTION_ADDRESS as `0x${string}`,
    functionName: 'current_price',
    args: [],
    blockIdentifier: BlockTag.LATEST,
  })

  const startTsRes = useReadContract({
    abi: DutchAuctionABI,
    address: DUTCH_AUCTION_ADDRESS as `0x${string}`,
    functionName: 'start_timestamp',
    args: [],
    blockIdentifier: BlockTag.LATEST,
    enabled: !devBypass,
  })

  const durationRes = useReadContract({
    abi: DutchAuctionABI,
    address: DUTCH_AUCTION_ADDRESS as `0x${string}`,
    functionName: 'duration',
    args: [],
    blockIdentifier: BlockTag.LATEST,
    enabled: !devBypass,
  })

  const startPriceRes = useReadContract({
    abi: DutchAuctionABI,
    address: DUTCH_AUCTION_ADDRESS as `0x${string}`,
    functionName: 'start_price',
    args: [],
    blockIdentifier: BlockTag.LATEST,
    enabled: !devBypass,
  })

  const endPriceRes = useReadContract({
    abi: DutchAuctionABI,
    address: DUTCH_AUCTION_ADDRESS as `0x${string}`,
    functionName: 'end_price',
    args: [],
    blockIdentifier: BlockTag.LATEST,
    enabled: !devBypass,
  })

  const isLoading = !devBypass && priceRes.fetchStatus === 'fetching'

  const data = useMemo((): UseCurrentAuctionResult['data'] => {
    if (devBypass) {
      const now = Math.floor(Date.now() / 1000)
      const price = getCurrencyAmount({ value: '10000000000000000000', valueType: ValueType.Raw, currency: STRK_SEPOLIA })
      return {
        isRunning: true,
        price: price ?? undefined,
        timer: {
          startTimestamp: now - 300,
          duration: 3600,
          endTimestamp: now + 3300,
          startPriceWei: 100n * 10n ** 18n,
          endPriceWei: 10n * 10n ** 18n,
        },
      }
    }

    if (priceRes.fetchStatus !== 'idle') return undefined

    if (priceRes.error) {
      return { isRunning: false }
    }

    if (priceRes.data == null) return undefined

    const rawPrice = priceRes.data as bigint
    const price = getCurrencyAmount({
      value: rawPrice.toString(),
      valueType: ValueType.Raw,
      currency: STRK_SEPOLIA,
    })

    let timer: AuctionTimerData | undefined
    if (
      startTsRes.data != null &&
      durationRes.data != null &&
      startPriceRes.data != null &&
      endPriceRes.data != null
    ) {
      const startTimestamp = Number(startTsRes.data as bigint)
      const duration = Number(durationRes.data as bigint)
      timer = {
        startTimestamp,
        duration,
        endTimestamp: startTimestamp + duration,
        startPriceWei: startPriceRes.data as bigint,
        endPriceWei: endPriceRes.data as bigint,
      }
    }

    return { isRunning: true, price: price ?? undefined, timer }
  }, [
    priceRes.data, priceRes.error, priceRes.fetchStatus,
    startTsRes.data, durationRes.data, startPriceRes.data, endPriceRes.data,
    devBypass,
  ])

  return { data, isLoading, error: priceRes.error }
}
