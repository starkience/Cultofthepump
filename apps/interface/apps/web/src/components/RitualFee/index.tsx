import { WindowCard } from 'components/Card/WindowCard'
import { Button, Flex, SpinningLoader, Text } from 'ui/src'
import { Background } from './Background'
import { useSetAuctionPrice } from 'state/summon/hooks'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useCurrentAuction, AuctionTimerData } from 'cotp/src/features/auction/api'
import { useBlock } from '@starknet-react/core'
import { useStarknetWallet } from 'components/PrivyConnect/useStarknetWallet'
import { usePrivyExecute } from 'hooks/usePrivyExecute'
import { DutchAuctionABI, DUTCH_AUCTION_ADDRESS } from 'cotp/src/constants/contracts'
import { CallData } from 'starknet'

const WEI = 10n ** 18n

function formatCountdown(secondsLeft: number): string {
  if (secondsLeft <= 0) return 'Expired'
  const h = Math.floor(secondsLeft / 3600)
  const m = Math.floor((secondsLeft % 3600) / 60)
  const s = secondsLeft % 60
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function computeLivePrice(timer: AuctionTimerData, nowSeconds: number): number {
  const elapsed = Math.max(0, nowSeconds - timer.startTimestamp)
  const fraction = Math.min(1, elapsed / timer.duration)
  const start = Number(timer.startPriceWei) / Number(WEI)
  const end = Number(timer.endPriceWei) / Number(WEI)
  return start - (start - end) * fraction
}

function AuctionCountdown({ timer }: { timer: AuctionTimerData }) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000))
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000))
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const secondsLeft = Math.max(0, timer.endTimestamp - now)
  const livePrice = computeLivePrice(timer, now)
  const endPrice = Number(timer.endPriceWei) / Number(WEI)

  // Progress through the auction (0 = just started, 1 = expired)
  const elapsed = Math.max(0, now - timer.startTimestamp)
  const progress = Math.min(100, (elapsed / timer.duration) * 100)

  return (
    <Flex gap="$gap12" width="100%">
      <Flex alignItems="center" gap="$gap4">
        <Text variant="heading1">{livePrice.toFixed(4)} STRK</Text>
        <Text variant="body3" color="$neutral2">CURRENT RITUAL FEE</Text>
      </Flex>

      {/* Decay progress bar */}
      <Flex width="100%" gap="$gap4">
        <Flex
          width="100%"
          height={4}
          backgroundColor="$surface3"
          borderRadius={2}
          overflow="hidden"
        >
          <Flex
            height="100%"
            borderRadius={2}
            backgroundColor="$accent1"
            style={{ width: `${100 - progress}%`, transition: 'width 1s linear' }}
          />
        </Flex>
        <Flex flexDirection="row" justifyContent="space-between">
          <Text variant="body3" color="$neutral2">Floor: {endPrice.toFixed(2)} STRK</Text>
          <Text variant="body3" color={secondsLeft < 300 ? '$statusCritical' : '$neutral2'}>
            Expires in {formatCountdown(secondsLeft)}
          </Text>
        </Flex>
      </Flex>

      <Text variant="body3" color="$neutral2" textAlign="center">
        Price decays linearly to the floor. Each launch doubles the next start price.
      </Text>
    </Flex>
  )
}

export function RitualFee() {
  const { wallet } = useStarknetWallet()
  const address = wallet?.address
  const { data: auctionData, isLoading, error } = useCurrentAuction()
  const setAuctionPrice = useSetAuctionPrice()

  // Default price (10 STRK) used when no active auction — create_auction is always
  // called in the multicall, so we just need a price estimate for validation/display.
  const DEFAULT_PRICE = '10000000000000000000'

  useEffect(() => {
    if (auctionData?.isRunning && auctionData.price) {
      setAuctionPrice(auctionData.price.quotient.toString())
    } else if (!isLoading) {
      // Auction expired or not running — set default so the form stays unblocked.
      // The multicall always calls create_auction before bid, so this is safe.
      setAuctionPrice(DEFAULT_PRICE)
    }
  }, [auctionData?.isRunning, auctionData?.price?.quotient.toString(), isLoading])

  const { data: block } = useBlock({ blockIdentifier: 'latest' })
  const restartCalls = useMemo(() => block ? [
    {
      contractAddress: DUTCH_AUCTION_ADDRESS,
      entrypoint: 'create_auction',
      calldata: CallData.compile({
        start_time: (block.timestamp - 10).toString(),
        start_price: { low: '0', high: '0' },
      }),
    },
  ] : undefined, [block?.timestamp])
  const { execute: sendRestart, status: restartStatus } = usePrivyExecute()
  const isRestarting = restartStatus === 'pending'

  if (!address) {
    return (
      <WindowCard title="Ritual Fee" minHeight={200}>
        <Flex alignItems="center" justifyContent="center" flex={1}>
          <Text variant="body2" color="$neutral2">Wallet not connected</Text>
        </Flex>
      </WindowCard>
    )
  }

  if (isLoading) {
    return (
      <WindowCard title="Ritual Fee" minHeight={200}>
        <Flex alignItems="center" justifyContent="center" flex={1}>
          <SpinningLoader size={32} />
        </Flex>
      </WindowCard>
    )
  }

  if (!auctionData?.isRunning) {
    return (
      <WindowCard title="Ritual Fee" minHeight={200}>
        <Background active={false} />
        <Flex alignItems="center" justifyContent="center" flex={1} gap="$gap16">
          <Flex gap="$gap8" alignItems="center">
            <Text variant="body2" color="$neutral2" textAlign="center">No auction currently running.</Text>
            <Text variant="body3" color="$neutral2" textAlign="center">
              Anyone can restart the auction to begin a new ritual cycle.
            </Text>
          </Flex>
          <Button
            theme="primary"
            onPress={() => restartCalls && void sendRestart(restartCalls)}
            disabled={isRestarting || !block}
          >
            {isRestarting ? <SpinningLoader size={16} /> : <Text variant="body2">Restart Auction</Text>}
          </Button>
        </Flex>
      </WindowCard>
    )
  }

  return (
    <WindowCard title="Ritual Fee" minHeight={200}>
      <Background active />
      <Flex gap="$gap16" flex={1} alignItems="center" justifyContent="center">
        {auctionData.timer ? (
          <AuctionCountdown timer={auctionData.timer} />
        ) : (
          <Flex alignItems="center" gap="$gap4">
            <Text variant="heading1">{auctionData.price?.toFixed(4) ?? '—'} STRK</Text>
            <Text variant="body3" color="$neutral2">CURRENT RITUAL FEE</Text>
          </Flex>
        )}
      </Flex>
    </WindowCard>
  )
}
