import { useMemo } from 'react'
import { ValueType, getCurrencyAmount } from 'cotp/src/features/tokens/getCurrencyAmount'
import { useReadContract } from '@starknet-react/core'
import { MulticallABI, MULTICALL_ADDRESS } from 'cotp/src/constants/contracts'
import { BlockTag, selector, uint256 } from 'starknet'
import { Currency } from 'cotp/src/features/entities/currency'
import { CurrencyAmount } from 'cotp/src/features/entities/fractions/currencyAmount'
import { DUTCH_AUCTION_ADDRESS } from 'cotp/src/constants/contracts'
import { ENTRYPOINT } from 'cotp/src/constants/misc'
import { STRK_SEPOLIA } from 'cotp/src/constants/tokens'

interface UseCurrentAuctionResult {
  data?: {
    isRunning: boolean
    price: CurrencyAmount<Currency>
    duration: number
    startTime: number
    startPrice: CurrencyAmount<Currency>
    endPrice: CurrencyAmount<Currency>
    bid: CurrencyAmount<Currency>
  }
  isLoading: boolean
  error: unknown
}

export function useCurrentAuction(): UseCurrentAuctionResult {
  const res = useReadContract({
    abi: MulticallABI, // call is not send if abi is undefined
    address: MULTICALL_ADDRESS,
    functionName: 'aggregate',
    watch: true,
    blockIdentifier: BlockTag.PENDING,
    args: [
      [
        {
          to: DUTCH_AUCTION_ADDRESS,
          selector: selector.getSelector(ENTRYPOINT.CurrentAuctionStart),
          calldata: [],
        },
        {
          to: DUTCH_AUCTION_ADDRESS,
          selector: selector.getSelector(ENTRYPOINT.CurrentPrice),
          calldata: [],
        },
        {
          to: DUTCH_AUCTION_ADDRESS,
          selector: selector.getSelector(ENTRYPOINT.Duration),
          calldata: [],
        },
        {
          to: DUTCH_AUCTION_ADDRESS,
          selector: selector.getSelector(ENTRYPOINT.CurrentAuctionBounds),
          calldata: [],
        },
        {
          to: DUTCH_AUCTION_ADDRESS,
          selector: selector.getSelector(ENTRYPOINT.CurrentAuctionBid),
          calldata: [],
        }
      ],
    ],
  })
  const data: [
    bigint, [
      [bigint],
      ([1n] | [0n, bigint, bigint]),
      [bigint],
      [bigint, bigint, bigint, bigint],
      [bigint, bigint]
    ]
  ] | undefined = res.data

  const parsedData = useMemo(() => {
    // Invalid data
    if (!data) {
      return undefined
    }

    const [rawStartTime, rawPrice, rawDuration, rawBounds, rawBid] = data[1]

    const isRunning = !rawPrice[0]

    const price = uint256.uint256ToBN({ low: rawPrice[1] ?? 0, high: rawPrice[2] ?? 0 }).toString()
    const parsedPrice = getCurrencyAmount({ value: price, valueType: ValueType.Raw, currency: STRK_SEPOLIA })
    if (!parsedPrice) return undefined

    const startPrice = uint256.uint256ToBN({ low: rawBounds[0], high: rawBounds[1] }).toString()
    const parsedStartPrice = getCurrencyAmount({ value: startPrice, valueType: ValueType.Raw, currency: STRK_SEPOLIA })
    if (!parsedStartPrice) return undefined

    const endPrice = uint256.uint256ToBN({ low: rawBounds[2], high: rawBounds[3] }).toString()
    const parsedEndPrice = getCurrencyAmount({ value: endPrice, valueType: ValueType.Raw, currency: STRK_SEPOLIA })
    if (!parsedEndPrice) return undefined

    const bid = uint256.uint256ToBN({ low: rawBid[0], high: rawBid[1] }).toString()
    const parsedBid = getCurrencyAmount({ value: bid, valueType: ValueType.Raw, currency: STRK_SEPOLIA })
    if (!parsedBid) return undefined

    return {
      isRunning,
      price: parsedPrice,
      duration: Number(rawDuration[0].toString()) * 1000,
      startTime: Number(rawStartTime[0].toString()) * 1000,
      startPrice: parsedStartPrice,
      endPrice: parsedEndPrice,
      bid: parsedBid,
    } as const
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.[0].toString()])

  return { data: parsedData, isLoading: res.fetchStatus === 'fetching', error: res.error }
}
