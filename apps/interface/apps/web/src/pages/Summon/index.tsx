import { Flex, styled } from 'ui/src'
import { Svg } from 'react-native-svg'
import { SummonCard } from 'components/SummonCard'
import { useMemo } from 'react'
import { useAtom } from 'jotai'
import { cardSizesAtom } from 'pages/Summon/atoms'
import { CARD_GAP, CARD_HEADER_HEIGHT, LINE_CORNER_RADIUS, LINE_GAP, LINE_PLUG_HEIGHT, LINE_PLUG_WIDTH, LINES_BOX_WIDTH, SIDED_STEPS } from 'pages/Summon/CardsHelpers'
import { CardWrapper } from 'pages/Summon/CardWrapper'
import { LineComponent } from 'pages/Summon/Line'
import { Line } from 'pages/Summon/types'
import { useIsValidSummonSteps } from 'state/summon/hooks'

const CardsColumn = styled(Flex, {
  alignItems: 'flex-start',
  gap: CARD_GAP,
  mt: CARD_GAP,
  flex: 1,
  flexBasis: 0,
})

export default function CultCreatorPage() {
  const [sizes] = useAtom(cardSizesAtom)

  const linesBoxHeight = useMemo(() => Math.max(
    sizes.left.reduce((acc, { height }) => acc + height + CARD_GAP, 0),
    sizes.right.reduce((acc, { height }) => acc + height + CARD_GAP, 0)
  ), [sizes])

  const lines = useMemo(() => {
    return {
      left: sizes.left.map<Line>(({ y }, index) => {
        const p1 = { x: 0, y: y + CARD_HEADER_HEIGHT / 2 + CARD_GAP }
        const p2 = { x: LINES_BOX_WIDTH / 2 - (sizes.left.length - index - 0.5) * LINE_GAP, y: 0 }

        return {
          linePath: `M${p1.x},${p1.y}h${p2.x - p1.x - LINE_CORNER_RADIUS}c${LINE_CORNER_RADIUS / 2},0,${LINE_CORNER_RADIUS},${-LINE_CORNER_RADIUS / 2},${LINE_CORNER_RADIUS},${-LINE_CORNER_RADIUS},v${p2.y - p1.y - LINE_CORNER_RADIUS}`,
          plugPoints1: { x: p1.x, y: p1.y - LINE_PLUG_WIDTH / 2, width: LINE_PLUG_HEIGHT, height: LINE_PLUG_WIDTH },
          plugPoints2: { x: p2.x - LINE_PLUG_WIDTH / 2, y: p2.y, width: LINE_PLUG_WIDTH, height: LINE_PLUG_HEIGHT },
        }
      }),
      right: sizes.right.map<Line>(({ y }, index) => {
        const p1 = { x: LINES_BOX_WIDTH, y: y + CARD_HEADER_HEIGHT / 2 }
        const p2 = { x: LINES_BOX_WIDTH / 2 + (sizes.right.length - index - 0.5) * LINE_GAP, y: 0 }

        return {
          linePath: `M${p1.x},${p1.y}h${p2.x - p1.x + LINE_CORNER_RADIUS}c${-LINE_CORNER_RADIUS / 2},0,${-LINE_CORNER_RADIUS},${-LINE_CORNER_RADIUS / 2},${-LINE_CORNER_RADIUS},${-LINE_CORNER_RADIUS},v${p2.y - p1.y - LINE_CORNER_RADIUS}`,
          plugPoints1: { x: p1.x - LINE_PLUG_HEIGHT, y: p1.y - LINE_PLUG_WIDTH / 2, width: LINE_PLUG_HEIGHT, height: LINE_PLUG_WIDTH },
          plugPoints2: { x: p2.x - LINE_PLUG_WIDTH / 2, y: p2.y, width: LINE_PLUG_WIDTH, height: LINE_PLUG_HEIGHT },
        }
      }),
    }
  }, [sizes, linesBoxHeight])

  // state
  const isValidSummonCard = useIsValidSummonSteps()

  return (
    <Flex my={96} alignItems="center" maxWidth={1216}>
      <SummonCard width="100%" />

      <Flex flexDirection="row" flexWrap="wrap" alignItems="flex-start" width="100%">
        <CardsColumn>
          {SIDED_STEPS.left.map((step, index) =>
            <CardWrapper key={index} stepKey={step.key}>{step.card()}</CardWrapper>
          )}
        </CardsColumn>

        <Svg width={LINES_BOX_WIDTH} height={linesBoxHeight}>
          {SIDED_STEPS.left.map((step, index) =>
            <LineComponent key={index} {...lines.left[index]} active={isValidSummonCard(step.key)} />
          )}
          {SIDED_STEPS.right.map((step, index) =>
            <LineComponent key={index} {...lines.right[index]} active={isValidSummonCard(step.key)} />
          )}
        </Svg>

        <CardsColumn>
          {SIDED_STEPS.right.map((step, index) =>
            <CardWrapper key={index} stepKey={step.key}>{step.card()}</CardWrapper>
          )}
        </CardsColumn>
      </Flex>
    </Flex>
  )
}
