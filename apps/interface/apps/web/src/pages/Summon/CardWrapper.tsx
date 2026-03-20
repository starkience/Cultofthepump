import { useAtom } from 'jotai'
import { PropsWithChildren, useEffect, useRef } from 'react'
import { View } from 'ui/src'
import { cardSizeFamily } from './atoms'
import useResizeObserver from 'use-resize-observer'
import { SummonStepKey } from './types'

interface CardWrapperProps {
  stepKey: SummonStepKey
}

export function CardWrapper({ children, stepKey }: PropsWithChildren<CardWrapperProps>) {
  const ref = useRef<HTMLElement>(null)
  const [, setSize] = useAtom(cardSizeFamily(stepKey))

  const size = useResizeObserver({ ref })

  useEffect(() => {
    if (size.width !== undefined && size.height !== undefined) {
      setSize({ width: size.width ?? 0, height: size.height ?? 0 })
    }
  }, [size.width, size.height])

  return (
    <View width="100%" ref={ref}>{children}</View>
  )
}
