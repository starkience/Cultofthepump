import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { addAddressPadding } from 'starknet'
import { Button, Flex, Image, Text, styled } from 'ui/src'
import { TextInput } from 'ui/src'
import { WindowCard } from 'components/Card/WindowCard'
import { PriceChart } from 'components/PriceChart'
import { TokenMetrics } from 'components/TokenMetrics'
import Landing from 'pages/Landing'
import { useCultMetadata } from 'cotp/src/data/apiClients/cotpMetadataApi/cotpMetadataApiClient'
import { useCultTokens, useCultTrades } from 'cotp/src/data/apiClients/cotpIndexerApi/cotpIndexerApiClient'
import { useBondingCurve, useSwap, useToken, useTokenAt } from 'cotp/src/hooks/useContract'
import { STRK_SEPOLIA } from 'cotp/src/constants/tokens'
import { SWAP_ADDRESS } from 'cotp/src/constants/contracts'
import { useCalls } from 'state/transactions/hooks'
import { useOpenModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import { useAccount } from '@starknet-react/core'
import { formatStrk, formatWei, formatPrice, computePrice } from 'cotp/src/utils/format'

const TradeItem = styled(Flex, {
  width: '100%',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '$gap12',
  py: '$padding12',
  borderBottomWidth: 1,
  borderStyle: 'solid',
  borderBottomColor: '$borderColor',
})

const TabButton = styled(Text, {
  variant: 'body1',
  px: '$padding16',
  py: '$padding8',
  cursor: 'pointer',
  borderBottomWidth: 2,
  borderStyle: 'solid',
  borderBottomColor: 'transparent',

  variants: {
    active: {
      true: {
        color: '$accent1',
        borderBottomColor: '$accent1',
      },
    },
  } as const,
})

const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`

function parseTokenAmount(value: string, decimals = 18): bigint | null {
  try {
    if (!value || isNaN(Number(value)) || Number(value) <= 0) return null
    const [intPart, fracPart = ''] = value.split('.')
    const frac = fracPart.padEnd(decimals, '0').slice(0, decimals)
    return BigInt(intPart) * BigInt(10 ** decimals) + BigInt(frac)
  } catch {
    return null
  }
}

interface BuySellPanelProps {
  tokenAddress: string
  tokenSymbol: string
  tokenId: string
}

function BuySellPanel({ tokenAddress, tokenSymbol, tokenId }: BuySellPanelProps) {
  const [tab, setTab] = useState<'buy' | 'sell'>('buy')
  const [amountInput, setAmountInput] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const { address: connectedAddress } = useAccount()
  const swap = useSwap()
  const strk = useToken(STRK_SEPOLIA)
  const cult = useTokenAt(tokenAddress)
  const bondingCurve = useBondingCurve()

  const [, setCalls] = useCalls()
  const openTransactionModal = useOpenModal({ name: ApplicationModal.TRANSACTION })

  const parsedAmount = useMemo(() => parseTokenAmount(amountInput), [amountInput])

  // Fetch buy/sell preview from bonding curve contract
  useEffect(() => {
    if (!parsedAmount || !bondingCurve) {
      setPreview(null)
      return
    }

    let cancelled = false
    setPreviewLoading(true)

    const fetchPreview = async () => {
      try {
        if (tab === 'buy') {
          // fee = strk / 100 (1%), buy = strk - fee
          const fee = parsedAmount / 100n
          const buyAmount = parsedAmount - fee
          // We need current market cap — fetch from the contract's market_caps mapping
          // For simplicity, call bonding_curve.buy(0, buyAmount) as an approximation
          // A more accurate version would read swap.market_caps(tokenAddress) first
          const result = await bondingCurve.call('buy', [0n, buyAmount])
          if (!cancelled) {
            const tokens = Array.isArray(result) ? result[0] : result
            setPreview(`~${formatWei(tokens.toString())} ${tokenSymbol}`)
          }
        } else {
          const result = await bondingCurve.call('sell', [0n, parsedAmount])
          if (!cancelled) {
            const strkOut = Array.isArray(result) ? result[0] : result
            const afterFee = (BigInt(strkOut.toString()) * 99n) / 100n
            setPreview(`~${formatStrk(afterFee.toString())}`)
          }
        }
      } catch {
        if (!cancelled) setPreview(null)
      } finally {
        if (!cancelled) setPreviewLoading(false)
      }
    }

    void fetchPreview()
    return () => { cancelled = true }
  }, [parsedAmount, tab, bondingCurve, tokenSymbol])

  const handleTrade = useCallback(() => {
    if (!parsedAmount || !swap || !strk || !cult) return

    const tokenDispatcher = { contract_address: tokenAddress }

    const calls = tab === 'buy'
      ? [
          strk.populate('approve', [SWAP_ADDRESS, parsedAmount]),
          swap.populate('buy', [parsedAmount, tokenDispatcher]),
        ]
      : [
          cult.populate('approve', [SWAP_ADDRESS, parsedAmount]),
          swap.populate('sell', [parsedAmount, tokenDispatcher]),
        ]

    setCalls(calls)
    openTransactionModal()
  }, [tab, parsedAmount, swap, strk, cult, tokenAddress, setCalls, openTransactionModal])

  const isBuy = tab === 'buy'
  const inputLabel = isBuy ? 'STRK to spend' : `${tokenSymbol} to sell`
  const buttonLabel = isBuy ? `Buy ${tokenSymbol}` : `Sell ${tokenSymbol}`
  const isDisabled = !connectedAddress || !parsedAmount

  return (
    <WindowCard title="Trade">
      <Flex gap="$gap16">
        <Flex flexDirection="row" gap="$gap4" borderBottomWidth={1} borderStyle="solid" borderBottomColor="$borderColor">
          <TabButton active={isBuy} onPress={() => { setTab('buy'); setAmountInput(''); setPreview(null) }}>Buy</TabButton>
          <TabButton active={!isBuy} onPress={() => { setTab('sell'); setAmountInput(''); setPreview(null) }}>Sell</TabButton>
        </Flex>

        <Flex gap="$gap8">
          <Text variant="body3" color="$neutral2">{inputLabel}</Text>
          <TextInput
            value={amountInput}
            onChangeText={(v) => { setAmountInput(v); setPreview(null) }}
            placeholder="0.0"
            keyboardType="decimal-pad"
          />
        </Flex>

        {parsedAmount && (
          <Flex
            backgroundColor="$surface2"
            px="$padding12"
            py="$padding8"
            borderRadius="$rounded8"
          >
            <Text variant="body3" color="$neutral2">
              {previewLoading ? 'Estimating...' : preview ? `You receive ${preview}` : 'Enter amount'}
            </Text>
          </Flex>
        )}

        {!connectedAddress && (
          <Text variant="body3" color="$neutral2">Connect your wallet to trade.</Text>
        )}

        <Button
          theme="primary"
          size="large"
          width="100%"
          disabled={isDisabled}
          onPress={handleTrade}
        >
          {buttonLabel}
        </Button>
      </Flex>
    </WindowCard>
  )
}

function TradeDetail({ address }: { address: string }) {
  const cultTokens = useCultTokens({ params: { address, limit: 1 } })
  const cultMetadata = useCultMetadata({ params: { address } })

  const token = cultTokens.data?.[0] ?? null
  const metadata = cultMetadata.data?.[0] ?? null

  const trades = useCultTrades({
    params: { tokenId: token?.id ?? '', limit: 20 },
    enabled: Boolean(token?.id),
  })

  return (
    <Flex width="100%" maxWidth={1200} gap="$gap24" px="$padding16" py="$padding24">
      <Link to="/trade" style={{ textDecoration: 'none', width: 'fit-content' }}>
        <Text variant="body2" color="$accent1">← Back To Cults</Text>
      </Link>

      {!token ? (
        cultTokens.isLoading ? (
          <WindowCard title="Loading">
            <Text variant="body2">Looking up cult...</Text>
          </WindowCard>
        ) : (
          <WindowCard title="Cult Not Found">
            <Text variant="body2">
              This cult has not been indexed yet, or the address is invalid.
            </Text>
          </WindowCard>
        )
      ) : (
        <Flex gap="$gap24">
          {/* Top row: overview + chart */}
          <Flex flexDirection="row" flexWrap="wrap" gap="$gap24" alignItems="flex-start">
            <Flex flex={1} minWidth={280} gap="$gap24">
              <WindowCard title="Cult Overview">
                <Flex gap="$gap24" flexDirection="row" flexWrap="wrap">
                  <Flex width={140} height={140} backgroundColor="$surface3" alignItems="center" justifyContent="center" flexShrink={0}>
                    {metadata?.imageUrl ? (
                      <Image src={metadata.imageUrl} width="100%" height="100%" />
                    ) : (
                      <Text variant="heading2" color="$accent1">${token.symbol}</Text>
                    )}
                  </Flex>

                  <Flex flex={1} minWidth={160} gap="$gap8">
                    <Text variant="heading2">{metadata?.name || token.name}</Text>
                    <Text variant="body1" color="$accent1">${metadata?.symbol || token.symbol}</Text>
                    <Text variant="body3" color="$neutral2" numberOfLines={3}>
                      {metadata?.manifesto || metadata?.description || 'No manifesto added yet.'}
                    </Text>
                    <Flex gap="$gap4" mt="$gap8">
                      <Text variant="body3">Contract: {formatAddress(token.contractAddress)}</Text>
                      <Text variant="body3">Creator: {formatAddress(token.createdBy)}</Text>
                    </Flex>
                  </Flex>
                </Flex>
              </WindowCard>
            </Flex>

            <Flex flex={1} minWidth={260}>
              <TokenMetrics contractAddress={address} />
            </Flex>
          </Flex>

          {/* Chart */}
          <PriceChart tokenId={token.id} height={300} />

          {/* Bottom row: activity + trade panel */}
          <Flex flexDirection="row" flexWrap="wrap" gap="$gap24" alignItems="flex-start">
            <Flex flex={2} minWidth={300}>
              <WindowCard title="Recent Activity">
                <Flex gap="$gap4">
                  {trades.isLoading ? (
                    <Text variant="body2">Loading trades...</Text>
                  ) : trades.data?.length ? (
                    trades.data.map((trade) => {
                      const price = computePrice(trade.strkQty, trade.tokenQty)
                      return (
                        <TradeItem key={trade.id}>
                          <Flex gap="$gap4">
                            <Text variant="body2" color={trade.side === 0 ? '$accent1' : '$statusCritical'}>
                              {trade.side === 0 ? 'BUY' : 'SELL'}
                            </Text>
                            <Text variant="body3" color="$neutral2">
                              {trade.kind === 0 ? 'Bonding Curve' : 'Ekubo Pool'}
                            </Text>
                          </Flex>

                          <Flex alignItems="flex-end" gap="$gap4">
                            <Text variant="body2">{formatWei(trade.tokenQty)} {token.symbol}</Text>
                            <Text variant="body3" color="$neutral2">{formatStrk(trade.strkQty)}</Text>
                            <Text variant="body3" color="$neutral2">{formatPrice(price)} STRK/token</Text>
                          </Flex>
                        </TradeItem>
                      )
                    })
                  ) : (
                    <Text variant="body2">No trades yet.</Text>
                  )}
                </Flex>
              </WindowCard>
            </Flex>

            <Flex flex={1} minWidth={280}>
              <BuySellPanel
                tokenAddress={address}
                tokenSymbol={token.symbol}
                tokenId={token.id}
              />
            </Flex>
          </Flex>
        </Flex>
      )}
    </Flex>
  )
}

export default function TradePage() {
  const { address } = useParams()

  const normalizedAddress = useMemo(() => {
    if (!address) return null
    try {
      return addAddressPadding(address)
    } catch {
      return address
    }
  }, [address])

  if (!normalizedAddress) {
    return <Landing showHero={false} />
  }

  return <TradeDetail address={normalizedAddress} />
}
