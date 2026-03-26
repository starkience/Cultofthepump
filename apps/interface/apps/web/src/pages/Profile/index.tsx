import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { addAddressPadding } from 'starknet'
import { Button, Flex, Image, Text, styled } from 'ui/src'
import { WindowCard } from 'components/Card/WindowCard'
import { useCultMetadata, joinCultMetadataByAddress } from 'cotp/src/data/apiClients/cotpMetadataApi/cotpMetadataApiClient'
import { useCultTokens } from 'cotp/src/data/apiClients/cotpIndexerApi/cotpIndexerApiClient'
import { formatMarketCap } from 'cotp/src/utils/format'

const GRADUATION_THRESHOLD_WEI = BigInt('101010') * BigInt('1000000000000000000')

const ProgressTrack = styled(Flex, {
  width: '100%',
  height: 4,
  backgroundColor: '$surface3',
  borderRadius: 2,
  overflow: 'hidden',
})

const ProgressFill = styled(Flex, {
  height: '100%',
  borderRadius: 2,
  backgroundColor: '$accent1',
})

const Grid = styled(Flex, {
  width: '100%',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: '$gap24',
})

const CultCard = styled(Flex, {
  width: 'calc(33.333% - 16px)',
  minWidth: 280,
  backgroundColor: '$surface1',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: '$borderColor',
  overflow: 'hidden',

  hoverStyle: {
    borderColor: '$accent1',
    transform: 'translateY(-2px)',
  },
})

const CultPreview = styled(Flex, {
  width: '100%',
  height: 180,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '$surface3',
  overflow: 'hidden',
  position: 'relative',
})

const GraduatedBadge = styled(Flex, {
  position: 'absolute',
  top: 8,
  right: 8,
  backgroundColor: '$accent1',
  px: '$padding8',
  py: '$padding4',
  borderRadius: '$rounded4',
})

const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`

function ProfileContent({ address }: { address: string }) {
  const cultTokens = useCultTokens({ params: { createdBy: address, orderBy: 'newest' } })
  const cultMetadata = useCultMetadata({})

  const joinedCults = useMemo(() => {
    return joinCultMetadataByAddress(cultTokens.data || [], cultMetadata.data || [])
  }, [cultTokens.data, cultMetadata.data])

  const totalBelievers = useMemo(() => {
    return (cultTokens.data || []).reduce((sum, t) => sum + (t.believerCount ?? t.tradeCount ?? 0), 0)
  }, [cultTokens.data])

  const totalTrades = useMemo(() => {
    return (cultTokens.data || []).reduce((sum, t) => sum + (t.tradeCount ?? 0), 0)
  }, [cultTokens.data])

  return (
    <Flex width="100%" maxWidth={1200} gap="$gap24" px="$padding16" py="$padding24">
      <Link to="/" style={{ textDecoration: 'none', width: 'fit-content' }}>
        <Text variant="body2" color="$accent1">← Back To Cults</Text>
      </Link>

      <WindowCard title="Creator Profile">
        <Flex gap="$gap16">
          <Flex gap="$gap4">
            <Text variant="heading2">Prophet</Text>
            <Text variant="body2" color="$neutral2">{address}</Text>
          </Flex>

          <Flex flexDirection="row" gap="$gap24" flexWrap="wrap">
            <Flex gap="$gap4">
              <Text variant="body3" color="$neutral2">Cults Summoned</Text>
              <Text variant="heading2" color="$accent1">{cultTokens.data?.length ?? 0}</Text>
            </Flex>
            <Flex gap="$gap4">
              <Text variant="body3" color="$neutral2">Total Believers</Text>
              <Text variant="heading2" color="$accent1">{totalBelievers}</Text>
            </Flex>
            <Flex gap="$gap4">
              <Text variant="body3" color="$neutral2">Total Rituals</Text>
              <Text variant="heading2" color="$accent1">{totalTrades}</Text>
            </Flex>
          </Flex>
        </Flex>
      </WindowCard>

      <WindowCard title={`Summoned Cults (${joinedCults.length})`}>
        {cultTokens.isLoading ? (
          <Text variant="body2">Loading cults...</Text>
        ) : joinedCults.length ? (
          <Grid>
            {joinedCults.map(({ token, metadata }) => (
              <Link
                key={token.contractAddress}
                to={`/trade/${token.contractAddress}`}
                style={{ textDecoration: 'none', color: 'inherit', width: 'calc(33.333% - 16px)', minWidth: 280 }}
              >
                <CultCard>
                  <CultPreview>
                    {metadata?.imageUrl ? (
                      <Image src={metadata.imageUrl} width="100%" height="100%" />
                    ) : (
                      <Text variant="heading1" color="$accent1">${token.symbol}</Text>
                    )}
                    {token.graduated && (
                      <GraduatedBadge>
                        <Text variant="body3" color="$white" fontWeight="$bold">✦ Ascended</Text>
                      </GraduatedBadge>
                    )}
                  </CultPreview>

                  <Flex p="$padding16" gap="$gap12">
                    <Flex gap="$gap4">
                      <Text variant="body1" fontWeight="$bold">{metadata?.name || token.name}</Text>
                      <Text variant="body3" color="$accent1">${metadata?.symbol || token.symbol}</Text>
                    </Flex>

                    <Text variant="body3" color="$neutral2" numberOfLines={2}>
                      {metadata?.description || metadata?.manifesto || 'No manifesto yet.'}
                    </Text>

                    <Flex flexDirection="row" justifyContent="space-between" flexWrap="wrap" gap="$gap8">
                      <Text variant="body3" color="$accent1">{token.believerCount ?? token.tradeCount} believers</Text>
                      <Text variant="body3">{formatMarketCap(token.currentMarketCap)}</Text>
                    </Flex>

                    {!token.graduated && (
                      <Flex gap="$gap4">
                        <ProgressTrack>
                          <ProgressFill style={{ width: `${Math.min(100, Math.max(0.5, Number((BigInt(token.currentMarketCap || '0') * 10000n) / GRADUATION_THRESHOLD_WEI) / 100))}%` }} />
                        </ProgressTrack>
                        <Text variant="body3" color="$neutral2">
                          {(Math.min(100, Number((BigInt(token.currentMarketCap || '0') * 10000n) / GRADUATION_THRESHOLD_WEI) / 100)).toFixed(1)}% to Ascension
                        </Text>
                      </Flex>
                    )}
                  </Flex>
                </CultCard>
              </Link>
            ))}
          </Grid>
        ) : (
          <Flex gap="$gap12">
            <Text variant="body2">This prophet has not summoned any cults yet.</Text>
            <Link to="/summon" style={{ textDecoration: 'none', width: 'fit-content' }}>
              <Button theme="primary">Summon A Cult</Button>
            </Link>
          </Flex>
        )}
      </WindowCard>
    </Flex>
  )
}

export default function ProfilePage() {
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
    return (
      <Flex width="100%" maxWidth={1200} px="$padding16" py="$padding24">
        <WindowCard title="Profile Not Found">
          <Text variant="body2">No address provided.</Text>
        </WindowCard>
      </Flex>
    )
  }

  return <ProfileContent address={normalizedAddress} />
}
