import { UseQueryResult, useQuery } from '@tanstack/react-query'
import { addAddressPadding } from 'starknet'
import { config } from 'cotp/src/config'
import { createApiClient } from 'cotp/src/data/apiClients/createApiClient'
import { UseQueryApiHelperHookArgs } from 'cotp/src/data/apiClients/types'

export const COTP_INDEXER_API_CACHE_KEY = 'CotpIndexerApi'

const cotpIndexerApiClient = createApiClient({
  baseUrl: `${config.cotpIndexerGraphqlUrl}`,
  includeBaseCotpHeaders: false,
})

export interface CultTokenRecord {
  id: string
  name: string
  symbol: string
  contractAddress: string
  createdBy: string
  initialSupply: string
  initialPrice: string
  launchFee: string
  numHolders: number
  graduated: boolean
  tradeCount: number
  currentMarketCap: string
}

export interface CultTradeRecord {
  id: string
  side: number
  kind: number
  tokenQty: string
  strkQty: string
  marketCap: string
  blockNumber: number
  traderId: string
}

export interface CultCandleRecord {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface CultTokenMetrics {
  id: string
  contractAddress: string
  graduated: boolean
  currentMarketCap: string
  lastTradeStrk: string
  lastTradeTokens: string
  totalVolume: string
  tradeCount: string
}

type GraphqlResponse<T> = {
  data?: T
  errors?: Array<{ message: string }>
}

async function queryIndexer<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const response = await cotpIndexerApiClient.post<GraphqlResponse<T>>('', {
    body: JSON.stringify({ query, variables }),
  })

  if (response.errors?.length) {
    throw new Error(response.errors.map((error) => error.message).join('; '))
  }

  if (!response.data) {
    throw new Error('Indexer response was empty')
  }

  return response.data
}

export async function fetchCultTokens(params?: {
  address?: string
  limit?: number
  orderBy?: 'newest' | 'volume' | 'graduation'
}): Promise<CultTokenRecord[]> {
  const address = params?.address ? addAddressPadding(params.address) : undefined
  const limit = params?.limit || 48
  const orderBy = params?.orderBy || 'newest'

  const data = await queryIndexer<{ token: CultTokenRecord[] }>(
    `
      query CultTokens($address: String, $limit: Int!, $orderBy: String) {
        token(
          where: { contractAddress: { _eq: $address } }
          order_by: [{ id: desc }]
          limit: $limit
        ) {
          id
          name
          symbol
          contractAddress
          createdBy
          initialSupply
          initialPrice
          launchFee
          numHolders
          graduated
          tradeCount
          currentMarketCap
        }
      }
    `,
    { address, limit, orderBy }
  )

  return data.token
}

export async function fetchCultTrades(params: {
  tokenId: string
  limit?: number
}): Promise<CultTradeRecord[]> {
  const limit = params.limit || 20

  const data = await queryIndexer<{ trade: CultTradeRecord[] }>(
    `
      query CultTrades($tokenId: numeric!, $limit: Int!) {
        trade(
          where: { tokenId: { _eq: $tokenId } }
          order_by: [{ id: desc }]
          limit: $limit
        ) {
          id
          side
          kind
          tokenQty
          strkQty
          marketCap
          blockNumber
          traderId
        }
      }
    `,
    { tokenId: params.tokenId, limit }
  )

  return data.trade
}

export async function fetchCultCandles(params: {
  tokenId: string
  bucketSeconds?: number
}): Promise<CultCandleRecord[]> {
  const data = await queryIndexer<{ candle: CultCandleRecord[] }>(
    `
      query CultCandles($tokenId: numeric!, $bucketSeconds: Int) {
        candle(tokenId: $tokenId, bucketSeconds: $bucketSeconds) {
          time
          open
          high
          low
          close
          volume
        }
      }
    `,
    { tokenId: params.tokenId, bucketSeconds: params.bucketSeconds || 300 }
  )

  return data.candle
}

export async function fetchTokenMetrics(params: {
  address: string
}): Promise<CultTokenMetrics | null> {
  const address = addAddressPadding(params.address)

  const data = await queryIndexer<{ tokenMetrics: CultTokenMetrics | null }>(
    `
      query CultTokenMetrics($address: String!) {
        tokenMetrics(address: $address) {
          id
          contractAddress
          graduated
          currentMarketCap
          lastTradeStrk
          lastTradeTokens
          totalVolume
          tradeCount
        }
      }
    `,
    { address }
  )

  return data.tokenMetrics
}

export function useCultTokens({
  params,
  ...rest
}: UseQueryApiHelperHookArgs<
  { address?: string; limit?: number; orderBy?: 'newest' | 'volume' | 'graduation' },
  CultTokenRecord[]
>): UseQueryResult<CultTokenRecord[]> {
  const queryKey = [COTP_INDEXER_API_CACHE_KEY, 'token', params?.address || 'all', params?.limit || 48, params?.orderBy || 'newest']

  return useQuery<CultTokenRecord[]>({
    queryKey,
    queryFn: async (): ReturnType<typeof fetchCultTokens> => await fetchCultTokens(params),
    ...rest,
  })
}

export function useCultTrades({
  params,
  ...rest
}: UseQueryApiHelperHookArgs<{ tokenId: string; limit?: number }, CultTradeRecord[]>): UseQueryResult<CultTradeRecord[]> {
  const queryKey = [COTP_INDEXER_API_CACHE_KEY, 'trade', params?.tokenId, params?.limit || 20]

  return useQuery<CultTradeRecord[]>({
    queryKey,
    enabled: Boolean(params?.tokenId) && (rest.enabled ?? true),
    refetchInterval: 3_000,
    queryFn: async (): ReturnType<typeof fetchCultTrades> => {
      if (!params?.tokenId) return []
      return await fetchCultTrades(params)
    },
    ...rest,
  })
}

export function useCultCandles({
  params,
  ...rest
}: UseQueryApiHelperHookArgs<{ tokenId: string; bucketSeconds?: number }, CultCandleRecord[]>): UseQueryResult<CultCandleRecord[]> {
  const queryKey = [COTP_INDEXER_API_CACHE_KEY, 'candles', params?.tokenId, params?.bucketSeconds || 300]

  return useQuery<CultCandleRecord[]>({
    queryKey,
    enabled: Boolean(params?.tokenId) && (rest.enabled ?? true),
    refetchInterval: 30_000,
    queryFn: async (): ReturnType<typeof fetchCultCandles> => {
      if (!params?.tokenId) return []
      return await fetchCultCandles(params)
    },
    ...rest,
  })
}

export function useTokenMetrics({
  params,
  ...rest
}: UseQueryApiHelperHookArgs<{ address: string }, CultTokenMetrics | null>): UseQueryResult<CultTokenMetrics | null> {
  const queryKey = [COTP_INDEXER_API_CACHE_KEY, 'metrics', params?.address]

  return useQuery<CultTokenMetrics | null>({
    queryKey,
    enabled: Boolean(params?.address) && (rest.enabled ?? true),
    refetchInterval: 15_000,
    queryFn: async (): ReturnType<typeof fetchTokenMetrics> => {
      if (!params?.address) return null
      return await fetchTokenMetrics(params)
    },
    ...rest,
  })
}
