import { RectProps } from 'react-native-svg'
import { GeneratedIcon } from 'ui/src'

type RectCoords = Pick<RectProps, 'x' | 'y' | 'width' | 'height'>

export interface Line {
  linePath: string
  plugPoints1: RectCoords
  plugPoints2: RectCoords
}

export interface SummoningStepRune {
  icon: GeneratedIcon
  size: number
  name: string
  description: string
}

export enum SummonStepKey {
  CultData,
  CultVisual,
  RitualFee,
  Balance,
}

export interface SummonStep {
  key: SummonStepKey
  card: () => JSX.Element
  rune: SummoningStepRune
}
