import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { addAddressPadding } from 'starknet'
import { config } from 'cotp/src/config'
import { createApiClient } from 'cotp/src/data/apiClients/createApiClient'
import { UseQueryApiHelperHookArgs } from 'cotp/src/data/apiClients/types'

export const COTP_METADATA_API_CACHE_KEY = 'CotpMetadataApi'

const cotpMetadataApiClient = createApiClient({
  baseUrl: `${config.cotpMetadataApiUrl}`,
  includeBaseCotpHeaders: false,
})

export interface CultMetadataRecord {
  tokenId: number
  name: string
  symbol: string
  address: string
  description: string
  imageUrl: string
  manifesto: string
  network: string
  createdBy: string
  transactionHash: string
}

export interface UpsertCultMetadataRequest {
  name: string
  symbol: string
  address: string
  description?: string
  imageUrl?: string
  manifesto?: string
  network?: string
  createdBy?: string
  transactionHash?: string
}

export interface JoinedCultRecord<TToken> {
  token: TToken
  metadata: CultMetadataRecord | null
}

export async function fetchCultMetadata(params?: {
  network?: string
  address?: string
}): Promise<CultMetadataRecord[]> {
  const normalizedAddress = params?.address ? addAddressPadding(params.address) : undefined

  return await cotpMetadataApiClient.get<CultMetadataRecord[]>('/tokens', {
    params: {
      network: params?.network || 'sepolia',
      address: normalizedAddress,
    },
  })
}

export async function upsertCultMetadata(payload: UpsertCultMetadataRequest): Promise<{ status: string }> {
  const normalizedPayload = {
    ...payload,
    address: addAddressPadding(payload.address),
    createdBy: payload.createdBy ? addAddressPadding(payload.createdBy) : undefined,
    network: payload.network || 'sepolia',
  }

  return await cotpMetadataApiClient.post<{ status: string }>('/tokens', {
    body: JSON.stringify(normalizedPayload),
  })
}

export function useCultMetadata({
  params,
  ...rest
}: UseQueryApiHelperHookArgs<{ network?: string; address?: string }, CultMetadataRecord[]>): UseQueryResult<CultMetadataRecord[]> {
  const queryKey = [COTP_METADATA_API_CACHE_KEY, '/tokens', params?.network || 'sepolia', params?.address || 'all']

  return useQuery<CultMetadataRecord[]>({
    queryKey,
    queryFn: async (): ReturnType<typeof fetchCultMetadata> => await fetchCultMetadata(params),
    ...rest,
  })
}

export function joinCultMetadataByAddress<
  TToken extends { contractAddress?: string | null; address?: string | null }
>(tokens: TToken[], metadata: CultMetadataRecord[]): JoinedCultRecord<TToken>[] {
  const metadataByAddress = new Map(
    metadata.map((record) => [record.address.toLowerCase(), record])
  )

  return tokens.map((token) => {
    const rawAddress = token.contractAddress || token.address || ''
    const key = rawAddress ? addAddressPadding(rawAddress).toLowerCase() : ''

    return {
      token,
      metadata: key ? metadataByAddress.get(key) || null : null,
    }
  })
}
