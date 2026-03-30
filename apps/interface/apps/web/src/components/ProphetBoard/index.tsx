import { useState, useCallback } from 'react'
import { typedData as snTypedData } from 'starknet'
import { Button, Flex, Text, styled } from 'ui/src'
import { TextAreaInput } from 'ui/src'
import { WindowCard } from 'components/Card/WindowCard'
import { useProphecies, createProphecy } from 'cotp/src/data/apiClients/cotpMetadataApi/cotpMetadataApiClient'
import { SharedQueryClient } from 'cotp/src/data/apiClients/SharedQueryClient'
import { COTP_METADATA_API_CACHE_KEY } from 'cotp/src/data/apiClients/cotpMetadataApi/cotpMetadataApiClient'
import { useWallet } from 'context/WalletContext'

const MAX_LENGTH = 280

const SERVICE_URL = (import.meta.env.VITE_PRIVY_WALLET_SERVICE_URL as string | undefined) ?? 'http://localhost:3002'

const ProphecyItem = styled(Flex, {
  width: '100%',
  gap: '$gap8',
  py: '$padding12',
  borderBottomWidth: 1,
  borderStyle: 'solid',
  borderBottomColor: '$borderColor',
})

function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function timeAgo(createdAt: string): string {
  const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// SNIP-12 typed data for prophecy signing
function buildTypedData(tokenAddress: string, message: string, wallet: string) {
  return {
    types: {
      StarknetDomain: [
        { name: 'name',     type: 'shortstring' },
        { name: 'version',  type: 'shortstring' },
        { name: 'chainId',  type: 'shortstring' },
        { name: 'revision', type: 'shortstring' },
      ],
      Prophecy: [
        { name: 'tokenAddress', type: 'felt' },
        { name: 'wallet',       type: 'felt' },
        { name: 'message',      type: 'shortstring' },
      ],
    },
    primaryType: 'Prophecy' as const,
    domain: {
      name:     'CultOfThePump',
      version:  '1',
      chainId:  'SN_SEPOLIA',
      revision: '1',
    },
    message: {
      tokenAddress,
      wallet,
      message: message.slice(0, 31),
    },
  }
}

interface ProphetBoardProps {
  tokenAddress: string
}

export function ProphetBoard({ tokenAddress }: ProphetBoardProps) {
  const { address: walletAddress } = useWallet()
  const walletId      = walletAddress

  const [message, setMessage]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const prophecies = useProphecies(tokenAddress)

  const handleSubmit = useCallback(async () => {
    if (!walletAddress || !walletId || !message.trim() || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const td   = buildTypedData(tokenAddress, message.trim(), walletAddress)
      const hash = snTypedData.getMessageHash(td, walletAddress)

      // Sign via the privy-wallet service (no auth needed for sign endpoint)
      const res = await fetch(`${SERVICE_URL}/api/wallet/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletId, hash }),
      })
      if (!res.ok) throw new Error(`Sign failed: ${res.status}`)
      const data = await res.json() as { signature: string[] }
      const sigString = data.signature.join(',')

      await createProphecy({
        tokenAddress: tokenAddress.toLowerCase(),
        wallet:       walletAddress.toLowerCase(),
        message:      message.trim(),
        signature:    sigString,
      })
      setMessage('')
      void SharedQueryClient.invalidateQueries({
        queryKey: [COTP_METADATA_API_CACHE_KEY, 'prophecy', tokenAddress],
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('User abort') || msg.includes('rejected')) {
        setError('Signature rejected.')
      } else {
        setError('Failed to submit prophecy. Try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }, [walletAddress, walletId, message, tokenAddress, submitting])

  const remaining = MAX_LENGTH - message.length

  return (
    <WindowCard title="Prophet Board">
      <Flex gap="$gap16">
        {walletAddress ? (
          <Flex gap="$gap8">
            <TextAreaInput
              value={message}
              onChangeText={setMessage}
              placeholder="Speak your prophecy..."
              maxLength={MAX_LENGTH}
              numberOfLines={3}
            />
            <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
              <Text variant="body3" color={remaining < 50 ? '$statusCritical' : '$neutral2'}>
                {remaining} remaining
              </Text>
              <Button
                theme="primary"
                size="small"
                onPress={handleSubmit}
                disabled={submitting || !message.trim()}
              >
                {submitting ? 'Submitting…' : 'Prophesy'}
              </Button>
            </Flex>
            {error && <Text variant="body3" color="$statusCritical">{error}</Text>}
          </Flex>
        ) : (
          <Text variant="body2" color="$neutral2" textAlign="center">
            Connect to submit a prophecy.
          </Text>
        )}

        {prophecies.isLoading ? (
          <Text variant="body3" color="$neutral2">Loading prophecies...</Text>
        ) : prophecies.data?.length === 0 ? (
          <Text variant="body3" color="$neutral2" textAlign="center">No prophecies yet. Be the first prophet.</Text>
        ) : (
          <Flex gap="$gap4">
            {prophecies.data?.map((p) => (
              <ProphecyItem key={p.id}>
                <Flex flexDirection="row" justifyContent="space-between">
                  <Text variant="body3" color="$accent1">{formatAddress(p.wallet)}</Text>
                  <Text variant="body3" color="$neutral2">{timeAgo(p.createdAt)}</Text>
                </Flex>
                <Text variant="body2">{p.message}</Text>
              </ProphecyItem>
            ))}
          </Flex>
        )}
      </Flex>
    </WindowCard>
  )
}
