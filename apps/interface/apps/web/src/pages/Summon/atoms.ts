import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { CARD_GAP, SIDED_STEPS } from './CardsHelpers';
import { SummonStep } from './types';

export const cardSizeFamily = atomFamily(() =>
  atom<{ width: number; height: number }>({ width: 0, height: 0 })
)

export const cardSizesAtom = atom((get) => {
  const reducer = (yOffset: number) =>
    (acc: Array<{ width: number; height: number; y: number }>, step: SummonStep, index: number) => {
      const size = get(cardSizeFamily(step.key))
      const previousSize = index >= 1 ? acc[index - 1] : null

      acc.push({ ...size, y: previousSize ? previousSize.y + previousSize.height + CARD_GAP : yOffset })

      return acc
    }

  return {
    left: SIDED_STEPS.left.reduce(reducer(0), []),
    right: SIDED_STEPS.right.reduce(reducer(CARD_GAP), []),
  }
})
