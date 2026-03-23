import { useState } from 'react'
import { Liveline } from 'liveline'
import { styled, Text, Flex } from 'ui/src'
import { WindowCard } from 'components/Card/WindowCard'
import { useCultCandles } from 'cotp/src/data/apiClients/cotpIndexerApi/cotpIndexerApiClient'

interface WindowOption {
  label: string
  secs: number       // liveline window (time visible)
  bucketSecs: number // candle granularity
}

const WINDOWS: WindowOption[] = [
  { label: '1m',  secs: 300,     bucketSecs: 30 },
  { label: '5m',  secs: 1800,    bucketSecs: 60 },
  { label: '1h',  secs: 14400,   bucketSecs: 300 },
  { label: '6h',  secs: 86400,   bucketSecs: 1800 },
  { label: 'All', secs: 9999999, bucketSecs: 3600 },
]

const WindowBtn = styled(Text, {
  variant: 'body3',
  px: '$padding8',
  py: '$padding4',
  cursor: 'pointer',
  borderRadius: '$rounded4',
  color: '$neutral2',

  variants: {
    active: {
      true: {
        color: '$accent1',
        backgroundColor: '$surface1',
      },
    },
  } as const,
})

interface PriceChartProps {
  tokenId: string
  height?: number
}

export function PriceChart({ tokenId, height = 300 }: PriceChartProps) {
  const [activeWindow, setActiveWindow] = useState<WindowOption>(WINDOWS[1]) // default 5m

  const candles = useCultCandles({
    params: { tokenId, bucketSeconds: activeWindow.bucketSecs },
  })

  const data = (candles.data ?? [])
    .filter((c) => c.close > 0)
    .map((c) => ({ time: c.time * 1000, value: c.close }))

  const latestValue = data.length > 0 ? data[data.length - 1].value : 0

  const headerRight = (
    <Flex flexDirection="row" gap="$gap4">
      {WINDOWS.map((w) => (
        <WindowBtn
          key={w.label}
          active={activeWindow.label === w.label}
          onPress={() => setActiveWindow(w)}
        >
          {w.label}
        </WindowBtn>
      ))}
    </Flex>
  )

  return (
    <WindowCard title="Price Chart" headerRight={headerRight}>
      <div style={{ width: '100%', height }}>
        <Liveline
          data={data}
          value={latestValue}
          theme="dark"
          color="#a855f7"
          loading={candles.isLoading}
          emptyText="No trades yet — chart will appear after the first buy."
          window={activeWindow.secs}
          momentum={true}
          showValue={true}
          valueMomentumColor={true}
          exaggerate={true}
          formatValue={(v: number) => {
            if (v === 0) return '0'
            if (v >= 0.001) return v.toFixed(6)
            return v.toExponential(3)
          }}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </WindowCard>
  )
}
