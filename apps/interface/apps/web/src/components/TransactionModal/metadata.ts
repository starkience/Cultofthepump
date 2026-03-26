import { addAddressPadding } from 'starknet'
import { FACTORY_ADDRESS } from 'cotp/src/constants/contracts'
import { COTP_METADATA_API_CACHE_KEY, upsertCultMetadata } from 'cotp/src/data/apiClients/cotpMetadataApi/cotpMetadataApiClient'
import { SharedQueryClient } from 'cotp/src/data/apiClients/SharedQueryClient'

const SHITCOIN_LAUNCHED_SELECTOR =
  '0x13c55d5a688e68efda2ce06be4610294f379806ba89c405627c50579d9bf052'

type ReceiptEvent = {
  from_address?: string
  data?: string[]
  keys?: string[]
}

type SuccessfulReceipt = {
  events?: ReceiptEvent[]
}

export interface PersistSummonMetadataParams {
  receipt: SuccessfulReceipt
  transactionHash: string
  name: string
  symbol: string
  manifesto?: string | null
  visualUrl?: string | null
  creatorAddress?: string
}

export function extractLaunchedTokenAddress(receipt?: SuccessfulReceipt): string | null {
  const events = receipt?.events || []
  const normalizedFactory = FACTORY_ADDRESS.toLowerCase()

  for (const event of events) {
    if (
      event.from_address?.toLowerCase() === normalizedFactory &&
      event.keys?.[0]?.toLowerCase() === SHITCOIN_LAUNCHED_SELECTOR &&
      event.data?.[0]
    ) {
      return addAddressPadding(event.data[0])
    }
  }

  return null
}

function normalizeRemoteImageUrl(imageUrl?: string | null): string {
  if (!imageUrl) {
    return ''
  }

  try {
    const parsed = new URL(imageUrl)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return imageUrl
    }
  } catch {
    return ''
  }

  return ''
}

export async function persistSummonMetadata({
  receipt,
  transactionHash,
  name,
  symbol,
  manifesto,
  visualUrl,
  creatorAddress,
}: PersistSummonMetadataParams): Promise<string | null> {
  const address = extractLaunchedTokenAddress(receipt)
  if (!address) {
    return null
  }

  // Retry with exponential backoff — the metadata API may not be immediately reachable
  // after a summon (e.g. if the service is restarting or the network is briefly unavailable).
  const MAX_ATTEMPTS = 5
  let delay = 1000
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await upsertCultMetadata({
        name,
        symbol,
        address,
        description: (manifesto || '').slice(0, 280),
        imageUrl: normalizeRemoteImageUrl(visualUrl),
        manifesto: manifesto || '',
        network: 'sepolia',
        createdBy: creatorAddress,
        transactionHash,
      })
      break
    } catch (err) {
      if (attempt === MAX_ATTEMPTS) {
        console.error('[persistSummonMetadata] all retries failed', err)
        // Don't throw — the summon succeeded on-chain; metadata can be added later.
        return address
      }
      console.warn(`[persistSummonMetadata] attempt ${attempt} failed, retrying in ${delay}ms`, err)
      await new Promise((resolve) => setTimeout(resolve, delay))
      delay *= 2
    }
  }

  await SharedQueryClient.invalidateQueries({
    queryKey: [COTP_METADATA_API_CACHE_KEY],
  })

  return address
}
