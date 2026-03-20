import { useMemo } from 'react'
import { ValueType, getCurrencyAmount } from 'cotp/src/features/tokens/getCurrencyAmount'
import { useAccount, useReadContract } from '@starknet-react/core'
import { MulticallABI, MULTICALL_ADDRESS } from 'cotp/src/constants/contracts'
import { BlockTag, CallStruct, uint256 } from 'starknet'
import { getCasedSelector } from 'cotp/src/utils/selector'
import { Currency } from 'cotp/src/features/entities/currency'
import { CurrencyAmount } from 'cotp/src/features/entities/fractions/currencyAmount'
import { ENTRYPOINT } from 'cotp/src/constants/misc'

interface UseBalancesResult {
  balances: (CurrencyAmount<Currency> | null | undefined)[]
  isLoading: boolean
  error: unknown
}

export function useBalances(currencies: Currency[]): UseBalancesResult {
  const { address: accountAddress } = useAccount()

  const res = useReadContract({
    abi: MulticallABI, // call is not send if abi is undefined
    address: accountAddress ? MULTICALL_ADDRESS : undefined,
    functionName: 'aggregate',
    watch: true,
    blockIdentifier: BlockTag.PENDING,
    args: [
      currencies.map(
        (currency): CallStruct => ({
          to: currency.address,
          selector: getCasedSelector(ENTRYPOINT.BalanceOf, currency.entrypointsCase),
          calldata: [accountAddress ?? ''],
        })
      ),
    ],
  })
  const data: [bigint, [bigint, bigint][]] | undefined = res.data

  const balances = useMemo(() => {
    return currencies.map((currency, index) => {
      const balance = data?.[1]?.[index]
      if (!balance) {
        return undefined
      }

      const parsedBalance = uint256.uint256ToBN({ low: balance[0], high: balance[1] }).toString()

      return getCurrencyAmount({ value: parsedBalance, valueType: ValueType.Raw, currency })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.[0].toString()])

  return { balances, isLoading: res.isLoading, error: res.error }
}
