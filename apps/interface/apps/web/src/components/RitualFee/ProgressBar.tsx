import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Flex, styled, Text } from 'ui/src'
import useResizeObserver from 'use-resize-observer'

const TICK_WIDTH = 12
const TICK_SPACING = 2
const PROGRESS_BAR_BORDER_WIDTH = 2

const ProgressBarContainer = styled(Flex, {
  height: 28,
  backgroundColor: '$surface1',
  borderColor: '$accent1',
  borderWidth: PROGRESS_BAR_BORDER_WIDTH,
  borderStyle: 'solid',
  minWidth: '100%',
  flexDirection: 'row',
  gap: TICK_SPACING,
  p: TICK_SPACING,
})

const Tick = styled(Flex, {
  width: TICK_WIDTH,

  "$platform-web": {
    backgroundImage: '$accent1Gradiant',
  },

  variants: {
    active: {
      false: {
        opacity: 0.2,
      },
    },
  },
})

interface ProgressBarProps {
  progress: number
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const [progressBarWidth, setProgressBarWidth] = useState(0)
  const [ticksCount, setTicksCount] = useState(0)

  const progressBarRef = useRef<HTMLElement>(null)

  const { width: progressBarInitialWidth } = useResizeObserver({ ref: progressBarRef })

  // compute the number of active ticks
  const activeTicksCount = useMemo(() => Math.ceil((progress / 100) * ticksCount), [progress, ticksCount])

  // update size of progress bar
  useLayoutEffect(() => {
    if (progressBarInitialWidth) {
      const ticksNumber = Math.ceil((progressBarInitialWidth - TICK_SPACING - PROGRESS_BAR_BORDER_WIDTH * 2) / (TICK_WIDTH + TICK_SPACING))

      setTicksCount(ticksNumber)
      setProgressBarWidth(ticksNumber * TICK_WIDTH + (ticksNumber + 1) * TICK_SPACING + PROGRESS_BAR_BORDER_WIDTH * 2)
    }
  }, [progressBarInitialWidth])

  return (
    <Flex gap="$gap8" alignItems="center">
      <ProgressBarContainer ref={progressBarRef} minWidth={progressBarWidth ? progressBarWidth : '100%'}>
        {Array.from({ length: ticksCount }).map((_, index) => (
          <Tick key={index} active={index < activeTicksCount} />
        ))}
      </ProgressBarContainer>
      <Text variant="body2" color="$accent1">{progress}%</Text>
    </Flex>
  )
}
