import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Image, Button, Flex, Text, styled } from 'ui/src'
import { TextInput } from 'ui/src'
import { WindowCard } from 'components/Card/WindowCard'
import { useCultMetadata, joinCultMetadataByAddress } from 'cotp/src/data/apiClients/cotpMetadataApi/cotpMetadataApiClient'
import { useCultTokens } from 'cotp/src/data/apiClients/cotpIndexerApi/cotpIndexerApiClient'
import { formatMarketCap } from 'cotp/src/utils/format'

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

const SortButton = styled(Text, {
  variant: 'body3',
  px: '$padding12',
  py: '$padding6',
  cursor: 'pointer',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: '$borderColor',
  borderRadius: '$rounded4',

  variants: {
    active: {
      true: {
        color: '$accent1',
        borderColor: '$accent1',
      },
    },
  } as const,
})

const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`

type SortMode = 'newest' | 'volume' | 'graduation'

type LandingProps = {
  showHero?: boolean
}

export default function Landing({ showHero = true }: LandingProps) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortMode>('newest')

  const cultTokens = useCultTokens({ params: { orderBy: sort } })
  const cultMetadata = useCultMetadata({})

  const joinedCults = useMemo(() => {
    return joinCultMetadataByAddress(cultTokens.data || [], cultMetadata.data || [])
  }, [cultTokens.data, cultMetadata.data])

  const filteredCults = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) return joinedCults

    return joinedCults.filter(({ token, metadata }) => {
      const haystack = [
        token.name,
        token.symbol,
        metadata?.name,
        metadata?.symbol,
        metadata?.manifesto,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(needle)
    })
  }, [joinedCults, search])

  return (
    <Flex width="100%" maxWidth={1200} gap="$gap24" px="$padding16" py="$padding24">
      {showHero && (
        <WindowCard title="Sepolia Cult Factory">
          <Flex gap="$gap24">
            <Text variant="heading1">Launches are live on Sepolia.</Text>
            <Text variant="body2" color="$neutral2">
              Browse live cults, inspect launch metadata, and jump into the trading flow.
            </Text>
            <Flex flexDirection="row" gap="$gap12" flexWrap="wrap">
              <Link to="/summon" style={{ textDecoration: 'none' }}>
                <Button theme="primary">Summon A Cult</Button>
              </Link>
              <Link to="/trade" style={{ textDecoration: 'none' }}>
                <Button theme="secondary">Browse Live Cults</Button>
              </Link>
            </Flex>
          </Flex>
        </WindowCard>
      )}

      <WindowCard title={`Live Cults (${filteredCults.length})`}>
        <Flex gap="$gap24">
          <Flex flexDirection="row" gap="$gap12" flexWrap="wrap" alignItems="center">
            <Flex flex={1} minWidth={200}>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search by name, symbol, or manifesto"
                width="100%"
              />
            </Flex>
            <Flex flexDirection="row" gap="$gap8">
              <SortButton active={sort === 'newest'} onPress={() => setSort('newest')}>Newest</SortButton>
              <SortButton active={sort === 'volume'} onPress={() => setSort('volume')}>Most Traded</SortButton>
              <SortButton active={sort === 'graduation'} onPress={() => setSort('graduation')}>Near Graduation</SortButton>
            </Flex>
          </Flex>

          {cultTokens.isLoading || cultMetadata.isLoading ? (
            <Text variant="body2">Loading Sepolia cults...</Text>
          ) : filteredCults.length ? (
            <Grid>
              {filteredCults.map(({ token, metadata }) => (
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
                          <Text variant="body3" color="$white" fontWeight="$bold">Graduated</Text>
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
                        <Text variant="body3">Trades: {token.tradeCount}</Text>
                        <Text variant="body3">MCap: {formatMarketCap(token.currentMarketCap)}</Text>
                      </Flex>

                      <Text variant="body3" color="$neutral2">
                        {formatAddress(token.contractAddress)}
                      </Text>
                    </Flex>
                  </CultCard>
                </Link>
              ))}
            </Grid>
          ) : (
            <Flex gap="$gap12">
              <Text variant="body2">No cults matched your search.</Text>
              <Link to="/summon" style={{ textDecoration: 'none', width: 'fit-content' }}>
                <Button theme="primary">Launch The First One</Button>
              </Link>
            </Flex>
          )}
        </Flex>
      </WindowCard>
    </Flex>
  )
}
