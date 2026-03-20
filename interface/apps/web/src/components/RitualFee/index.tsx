import { WindowCard } from 'components/Card/WindowCard'
import { Flex, SpinningLoader, styled, Text } from 'ui/src'
import { Background } from './Background'
import { ProgressBar } from './ProgressBar'
import { useSetAuctionPrice } from 'state/summon/hooks'
import { useEffect, useMemo } from 'react'
import { useCurrentAuction } from 'cotp/src/features/auction/api'
import moment from 'moment'
import { useNow } from 'utilities/src/react/hooks/useNow'
import { useAccount } from '@starknet-react/core'

const DateComponent = styled(Text, {
  variant: 'body1',
  fontSize: 20,
  color: '$accent1',
  fontWeight: '$bold',
})

const Amount = styled(Text, {
  variant: 'body2',
})

const DATE_FORMAT = 'DD/MM - HH:mm'
const NEXT_AUCTION_FORMAT = 'HH:mm:ss'

export function RitualFee() {
  const now = useNow()

  const { address } = useAccount()

  // get current auction data
  const { data } = useCurrentAuction()

  // global state setters
  const setAuctionPrice = useSetAuctionPrice()

  // parse current auction data
  const parsedData = useMemo(() => {
    if (!data) return null

    const nextStartTime = data.startTime + data.duration

    if (data.isRunning) {
      return {
        isRunning: data.isRunning,
        price: data.price.toFixed(2, { groupSeparator: ',' }),
        duration: data.duration,
        startTime: data.startTime,
        nextStartTime,
        bounds: {
          start: {
            price: data.startPrice.toFixed(2, { groupSeparator: ',' }),
            date: moment(data.startTime).format(DATE_FORMAT),
          },
          end: {
            price: data.endPrice.toFixed(2, { groupSeparator: ',' }),
            date: moment(data.startTime + data.duration).format(DATE_FORMAT),
          },
        },
      } as const
    } else {
      return {
        isRunning: data.isRunning,
        nextStartTime,
        previousBid: data.bid.toFixed(2, { groupSeparator: ',' }),
      } as const
    }
  }, [data, now])

  // progress bar
  const progress = useMemo(() => {
    if (!parsedData?.isRunning) return 0

    const progress = Math.trunc(((now - parsedData.startTime) / (parsedData.nextStartTime - parsedData.startTime)) * 100)

    if (progress < 0) return 0
    if (progress > 100) return 100

    return progress
  }, [data, now])

  // check if a new ritual is being prepared
  const isPreparingNewRitual = useMemo(
    () => parsedData && parsedData.nextStartTime <= now,
    [parsedData?.nextStartTime, now]
  )

  // time before next auction
  const timeBeforeNextAuction = useMemo(() => {
    if (!parsedData) return 0

    return moment.utc(parsedData.nextStartTime - now).format(NEXT_AUCTION_FORMAT)
  }, [parsedData, now])

  // update auction price
  useEffect(() => {
    if (!isPreparingNewRitual && data?.isRunning) {
      setAuctionPrice(data.price.quotient.toString())
    } else {
      setAuctionPrice(null)
    }
  }, [data?.price, isPreparingNewRitual])

  // React content
  const content = useMemo(() => {
    if (!address) {
      return (
        <Flex alignItems="center" justifyContent="center" flex={1} gap="$gap32">
          <Text textAlign="center">Wallet not connected</Text>
        </Flex>
      )
    }

    if (!parsedData) {
      return (
        <Flex alignItems="center" justifyContent="center" flex={1}>
          <SpinningLoader size={32} />
        </Flex>
      )
    }

    if (isPreparingNewRitual) {
      return (
        <Flex alignItems="center" justifyContent="center" flex={1} gap="$gap16">
          <Text textAlign="center">
            A new ritual is being prepared,<br />please wait <Text fontWeight="$bold">a few seconds</Text>
          </Text>

          <SpinningLoader size={32} />
        </Flex>
      )
    }

    if (parsedData.isRunning) {
      return (
        <>
          <Flex alignItems="center" gap="$gap4">
            <Text variant="heading1">{parsedData.price} STRK</Text>
            <Text variant="body3" color="$neutral2">CURRENT RITUAL FEE</Text>
          </Flex>

          <ProgressBar progress={progress} />

          <Flex flexDirection="row" justifyContent="space-between" alignItems="center" px="$padding32">
            <Flex alignItems="center" gap="$gap8">
              <DateComponent>{parsedData.bounds.start.date}</DateComponent>
              <Amount>{parsedData.bounds.start.price} STRK</Amount>
            </Flex>

            <Text variant="body2" color="$neutral2" fontWeight="$bold">-&gt;</Text>

            <Flex alignItems="center" gap="$gap8">
              <DateComponent>{parsedData.bounds.end.date}</DateComponent>
              <Amount>{parsedData.bounds.end.price} STRK</Amount>
            </Flex>
          </Flex>
        </>
      )
    }

    return (
      <Flex alignItems="center" justifyContent="center" flex={1} gap="$gap32">
        <Flex alignItems="center" gap="$gap4">
          <Text variant="heading1">{timeBeforeNextAuction}</Text>
          <Text variant="body3" color="$neutral2">UNTIL NEXT RITUAL</Text>
        </Flex>

        <Text textAlign="center">
          The last cult has been summoned for <Text fontWeight="$bold" color="$accent1">{parsedData.previousBid} STRK</Text>
        </Text>
      </Flex>
    )
  }, [parsedData, isPreparingNewRitual])

  return (
    <WindowCard title="Ritual Fee" minHeight={300}>
      <Background active={(parsedData?.isRunning ?? false) && !isPreparingNewRitual} />
      <Flex gap="$gap32" flex={1}>
        {content}
      </Flex>
    </WindowCard>
  )
}
