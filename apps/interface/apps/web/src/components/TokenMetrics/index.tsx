import { Flex, Text, styled } from 'ui/src'
import { WindowCard } from 'components/Card/WindowCard'
import { useTokenMetrics } from 'cotp/src/data/apiClients/cotpIndexerApi/cotpIndexerApiClient'
import { formatMarketCap, formatPrice, computePrice } from 'cotp/src/utils/format'

// Graduation threshold matching the swap contract's strk_amount default (101,010 STRK in wei)
const GRADUATION_THRESHOLD_WEI = BigInt('101010') * BigInt('1000000000000000000')

const ProgressTrack = styled(Flex, {
  width: '100%',
  height: 8,
  backgroundColor: '$surface3',
  borderRadius: 4,
  overflow: 'hidden',
})

const ProgressFill = styled(Flex, {
  height: '100%',
  borderRadius: 4,
  backgroundColor: '$accent1',
  minWidth: 4,
})

const MetricRow = styled(Flex, {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  py: '$padding8',
  borderBottomWidth: 1,
  borderStyle: 'solid',
  borderBottomColor: '$borderColor',
})

interface TokenMetricsProps {
  contractAddress: string
}

export function TokenMetrics({ contractAddress }: TokenMetricsProps) {
  const { data: metrics, isLoading } = useTokenMetrics({ params: { address: contractAddress } })

  if (isLoading) {
    return (
      <WindowCard title="Market Data">
        <Text variant="body3" color="$neutral2">Loading...</Text>
      </WindowCard>
    )
  }

  if (!metrics) {
    return null
  }

  const currentPrice = computePrice(metrics.lastTradeStrk, metrics.lastTradeTokens)
  const marketCapWei = BigInt(metrics.currentMarketCap || '0')
  const graduationPct = Math.min(
    100,
    Number((marketCapWei * 10000n) / GRADUATION_THRESHOLD_WEI) / 100
  )
  const isGraduated = metrics.graduated

  return (
    <WindowCard title="Market Data">
      <Flex gap="$gap12">
        {isGraduated && (
          <Flex
            backgroundColor="$accent1"
            px="$padding12"
            py="$padding8"
            borderRadius="$rounded8"
            alignItems="center"
          >
            <Text variant="body2" fontWeight="$bold" color="$white">
              Graduated — trading on Ekubo
            </Text>
          </Flex>
        )}

        <MetricRow>
          <Text variant="body3" color="$neutral2">Price</Text>
          <Text variant="body2" fontWeight="$bold">
            {formatPrice(currentPrice)} STRK
          </Text>
        </MetricRow>

        <MetricRow>
          <Text variant="body3" color="$neutral2">Market Cap</Text>
          <Text variant="body2">{formatMarketCap(metrics.currentMarketCap)}</Text>
        </MetricRow>

        <MetricRow>
          <Text variant="body3" color="$neutral2">Volume</Text>
          <Text variant="body2">{formatMarketCap(metrics.totalVolume)}</Text>
        </MetricRow>

        <MetricRow style={{ borderBottomWidth: 0 }}>
          <Text variant="body3" color="$neutral2">Trades</Text>
          <Text variant="body2">{metrics.tradeCount}</Text>
        </MetricRow>

        {!isGraduated && (
          <Flex gap="$gap8">
            <Flex flexDirection="row" justifyContent="space-between">
              <Text variant="body3" color="$neutral2">Graduation progress</Text>
              <Text variant="body3" color="$accent1">{graduationPct.toFixed(1)}%</Text>
            </Flex>
            <ProgressTrack>
              <ProgressFill style={{ width: `${Math.max(graduationPct, 0.5)}%` }} />
            </ProgressTrack>
            <Text variant="body3" color="$neutral2">
              {formatMarketCap(metrics.currentMarketCap)} / {formatMarketCap(GRADUATION_THRESHOLD_WEI.toString())} to Ekubo
            </Text>
          </Flex>
        )}
      </Flex>
    </WindowCard>
  )
}
