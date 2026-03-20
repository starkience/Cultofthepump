import { Balance } from 'components/Balance'
import { CultData } from 'components/CultData'
import { CultVisual } from 'components/CultVisual/CultVisual'
import { RitualFee } from 'components/RitualFee'
import { DataRune, TimeRune, VisualRune, WealthRune } from 'ui/src/components/icons'
import { SummonStep, SummonStepKey } from 'pages/Summon/types'

export const CARD_GAP = 64
export const LINES_BOX_WIDTH = 80
export const CARD_HEADER_HEIGHT = 38
export const LINE_GAP = 16
export const LINE_CORNER_RADIUS = 4
export const LINE_PLUG_WIDTH = 10
export const LINE_PLUG_HEIGHT = 5

const CULT_DATA_STEP: SummonStep = {
  key: SummonStepKey.CultData,
  card: CultData,
  rune: {
    icon: DataRune,
    size: 36,
    name: 'Rune of Data',
    description: 'You have to provide basic data to start your cult.',
  },
}

const CULT_VISUAL_STEP: SummonStep = {
  key: SummonStepKey.CultVisual,
  card: CultVisual,
  rune: {
    icon: VisualRune,
    size: 42,
    name: 'Rune of Vision',
    description: 'You have to provide a visual asset to represent your cult.',
  },
}

const RITUAL_FEE_STEP: SummonStep = {
  key: SummonStepKey.RitualFee,
  card: RitualFee,
  rune: {
    icon: TimeRune,
    size: 36,
    name: 'Rune of Time',
    description: 'An auction must be in progress for you to start your cult.',
  },
}

const BALANCE_STEP: SummonStep = {
  key: SummonStepKey.Balance,
  card: Balance,
  rune: {
    icon: WealthRune,
    size: 40,
    name: 'Rune of Wealth',
    description: 'You need to hold enough STRK to pay the auction price.',
  },
}

export const SIDED_STEPS = {
  left: [CULT_DATA_STEP, CULT_VISUAL_STEP],
  right: [RITUAL_FEE_STEP, BALANCE_STEP],
}
