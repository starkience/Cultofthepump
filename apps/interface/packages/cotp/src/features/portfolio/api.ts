import { useMemo } from 'react'
import { ValueType, getCurrencyAmount } from 'cotp/src/features/tokens/getCurrencyAmount'
import { useBalance } from '@starknet-react/core'
import { BlockTag } from 'starknet'
import { Currency } from 'cotp/src/features/entities/currency'
import { CurrencyAmount } from 'cotp/src/features/entities/fractions/currencyAmount'

interface UseBalancesResult {
  balances: (CurrencyAmount<Currency> | null | undefined)[]
  isLoading: boolean
  error: unknown
}

/**
 * Read on-chain balances for the given currencies.
 * @param currencies - tokens to read balances for
 * @param walletAddress - optional override address (e.g. Privy wallet). Falls back to starknet-react connected account.
 */
export function useBalances(currencies: Currency[], walletAddress?: string | null): UseBalancesResult {
  const res = useBalance({
    token: (currencies[0]?.address ?? undefined) as `0x${string}` | undefined,
    address: (walletAddress ?? undefined) as `0x${string}` | undefined,
    blockIdentifier: BlockTag.LATEST,
  })

  const balances = useMemo(() => {
    return currencies.map((currency) => {
      if (!res.data?.value) return undefined
      return getCurrencyAmount({ value: res.data.value.toString(), valueType: ValueType.Raw, currency })
    })
  }, [res.data?.value?.toString(), currencies.length])

  return { balances, isLoading: res.isLoading, error: res.error }
}
