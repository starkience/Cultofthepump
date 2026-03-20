import { Flex, styled, Text } from 'ui/src'
import { zIndices } from 'ui/src/theme'
import { useUnruggableTrending } from 'cotp/src/data/apiClients/unruggableApi/useUnruggableTrending'
import { useMemo } from 'react'

const AppFooter = styled(Flex, {
  width: '100%',
  bottom: 0,
  zIndex: zIndices.sticky,
  alignItems: 'center',
  pr: '$spacing20',
  mx: 'auto',
  backgroundColor: '$surface1',
  height: 32,
  flexDirection: 'row',
  borderColor: '$borderColor',
  borderTopWidth: 1,
  borderBottomWidth: 0,
  borderRightWidth: 0,
  borderLeftWidth: 0,
  borderStyle: 'solid',

  '$platform-web': {
    position: 'fixed',
  },
})

export function Footer() {
  const { data } = useUnruggableTrending({})

  const trendingTokens = useMemo(() => {
    if (!data) {
      return []
    }

    return data.data.map((pair) => {
      return {
        symbol: pair.baseToken.symbol,
        priceChange24h: pair.priceChange24h,
        isUp: +pair.priceChange24h >= 0,
      }
    })
  }, [data])

  return (
    <AppFooter>
      <Flex justifyContent="flex-start" flexDirection="row" alignItems="center" gap="$gap32">
        {trendingTokens.map((token, index) => (
          <Flex key={index} flexDirection="row" alignItems="center" gap="$gap8">
            <Text variant="body3" fontWeight="$medium" color="$neutral2">{token.symbol}</Text>
            <Text variant="body3" color={token.isUp ? '$accent1' : '$redVibrant'}>{token.priceChange24h}%</Text>
          </Flex>
        ))}
      </Flex>
    </AppFooter>
  )
}
