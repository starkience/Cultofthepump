import { config } from 'cotp/src/config'
import { createApiClient } from 'cotp/src/data/apiClients/createApiClient'

export const UNRUGGABLE_API_CACHE_KEY = 'UnruggableApi'

const unruggableApiClient = createApiClient({
  baseUrl: `${config.unruggableApiUrl}`,
  includeBaseCotpHeaders: false,
})

export type UnruggableTrendingResponse = {
  success: boolean
  data: PairData[]
}

interface PairData {
  id: string
  baseTokenId: number
  quoteTokenId: number
  dexId: string
  dexScreenerAddress: string
  liquidityUsd: string
  marketCap: string
  priceUsd: string
  priceChange24h: string
  priceChange6h: string
  priceChange1h: string
  priceChange5m: string
  volume24h: string
  volume6h: string
  volume1h: string
  volume5m: string
  transactions24h: number
  transactions6h: number
  transactions1h: number
  transactions5m: number
  transactions24hBuys: null
  transactions6hBuys: null
  transactions1hBuys: null
  transactions5mBuys: null
  transactions24hSells: null
  transactions6hSells: null
  transactions1hSells: null
  transactions5mSells: null
  pairCreatedAt: string
  baseToken: Token
  quoteToken: Token
  fdv: string
}

interface Token {
  id: number
  chainId: string
  address: string
  symbol: string
  name: string
  imageUrl: string | null
  header: string | null
  openGraph: string | null
  websiteUrl: string | null
  twitterUrl: string | null
  telegramUrl: string
  isUnruggable: boolean
  createdAt: string
  updatedAt: string
}

export async function fetchTrending(): Promise<UnruggableTrendingResponse> {
  return await unruggableApiClient.get<UnruggableTrendingResponse>('/trending')
}
