import { useMemo } from 'react'
import { Path, Rect } from 'react-native-svg'
import { useSigilColors } from 'ui/src'
import { Line } from './types'
import { darken } from 'polished'

interface LineProps extends Line {
  active: boolean
}

export function LineComponent({ linePath, plugPoints1, plugPoints2, active }: LineProps) {
  const colors = useSigilColors()

  const color = useMemo(() => active ? colors.accent1.val : colors.neutral2.val, [active, colors])

  return (
    <>
      <Path d={linePath} fill="none" stroke={color} strokeWidth={2} />
      <Rect {...plugPoints1} fill={darken(0.2, color)} />
      <Rect {...plugPoints2} fill={darken(0.2, color)} />
    </>
  )
}
