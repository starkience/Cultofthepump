import { Link } from 'react-router-dom'
import { Flex, Text, styled } from 'ui/src'
import { useGlobalFeed, useEnergy } from 'cotp/src/data/apiClients/cotpIndexerApi/cotpIndexerApiClient'
import { formatStrk, formatWei } from 'cotp/src/utils/format'

const FeedItem = styled(Flex, {
  width: '100%',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  py: '$padding10',
  borderBottomWidth: 1,
  borderStyle: 'solid',
  borderBottomColor: '$borderColor',
  gap: '$gap12',

  hoverStyle: {
    backgroundColor: '$surface2',
  },
})

const EnergyBar = styled(Flex, {
  height: 6,
  borderRadius: '$rounded99',
  backgroundColor: '$surface3',
  overflow: 'hidden',
})

const EnergyFill = styled(Flex, {
  height: '100%',
  borderRadius: '$rounded99',
  backgroundColor: '$accent1',
})

function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function CultEnergy() {
  const { data: energy } = useEnergy()
  const score = energy?.score ?? 0

  return (
    <Flex gap="$gap8">
      <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text variant="body2" fontWeight="$bold">Cult Energy</Text>
        <Text variant="body2" color="$accent1" fontWeight="$bold">{score}/100</Text>
      </Flex>
      <EnergyBar>
        <EnergyFill width={`${score}%`} />
      </EnergyBar>
      {energy && (
        <Flex flexDirection="row" gap="$gap16" flexWrap="wrap">
          <Text variant="body3" color="$neutral2">{energy.recentTrades} recent rituals</Text>
          <Text variant="body3" color="$neutral2">{energy.activeCults} active cults</Text>
          <Text variant="body3" color="$neutral2">{energy.uniqueBelievers} believers</Text>
        </Flex>
      )}
    </Flex>
  )
}

export function GlobalFeed() {
  const { data: feed, isLoading } = useGlobalFeed(50)

  if (isLoading) {
    return <Text variant="body2" color="$neutral2">Listening for rituals...</Text>
  }

  if (!feed?.length) {
    return <Text variant="body2" color="$neutral2">No rituals have been performed yet.</Text>
  }

  return (
    <Flex gap="$gap4">
      {feed.map((item) => {
        const isBuy = item.side === 0
        const isAscended = item.tokenGraduated

        return (
          <Link
            key={item.id}
            to={`/trade/${item.tokenAddress}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <FeedItem>
              <Flex gap="$gap4" flex={1} minWidth={0}>
                <Flex flexDirection="row" gap="$gap8" alignItems="center" flexWrap="wrap">
                  <Text
                    variant="body3"
                    fontWeight="$bold"
                    color={isBuy ? '$accent1' : '$statusCritical'}
                  >
                    {isBuy ? 'RITUAL' : 'SACRIFICE'}
                  </Text>
                  <Text variant="body3" color="$neutral2">
                    {formatAddress(item.traderId)}
                  </Text>
                  <Text variant="body3" color="$neutral2">→</Text>
                  <Text variant="body3" fontWeight="$bold" color={isAscended ? '$accent1' : '$neutral1'}>
                    ${item.tokenSymbol}
                    {isAscended && <Text variant="body3" color="$accent1"> ✦</Text>}
                  </Text>
                </Flex>
              </Flex>

              <Flex alignItems="flex-end" gap="$gap4" flexShrink={0}>
                <Text variant="body3" fontWeight="$bold">
                  {formatWei(item.tokenQty)} {item.tokenSymbol}
                </Text>
                <Text variant="body3" color="$neutral2">{formatStrk(item.strkQty)}</Text>
              </Flex>
            </FeedItem>
          </Link>
        )
      })}
    </Flex>
  )
}
