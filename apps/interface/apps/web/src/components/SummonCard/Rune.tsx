import { FrameCard } from 'components/Card/FrameCard'
import { SummoningStepRune } from 'pages/Summon/types'
import { useMemo } from 'react'
import { Flex, styled, Text, useSigilColors } from 'ui/src'
import { opacify } from 'ui/src/theme'

const RuneContainer = styled(Flex, {
  flexDirection: 'row',
  gap: '$gap24',
  transition: 'opacity 0.2s',

  variants: {
    active: {
      true: {
        opacity: 1,
      },
      false: {
        opacity: 0.3,
      },
    },
  },
})

const RuneFrame = styled(FrameCard, {
  width: 56,
  height: 56,
  alignItems: 'center',
  justifyContent: 'center',
})

interface RuneProps extends SummoningStepRune {
  active: boolean
}

export function Rune({ icon, size, name, description, active }: RuneProps) {
  const colors = useSigilColors()

  const IconComponent = icon
  const iconStyle = useMemo(
    () => active
      ? {
        filter: `
          drop-shadow(0 0 0.5px ${colors.white.val})
          drop-shadow(0 0 2px ${colors.accent1.val})
          drop-shadow(0 0 12px ${opacify(50, colors.accent1.val)})
        `,
      }
      : {},
    [active, colors]
  )

  return (
    <RuneContainer active={active}>
      <RuneFrame>
        <IconComponent size={size} color="$accent1" style={iconStyle} />
      </RuneFrame>

      <Flex gap="$gap12" flex={1}>
        <Text variant="body1" color="$accent1" fontWeight="$medium">{name}</Text>
        <Text variant="body3">{description}</Text>
      </Flex>
    </RuneContainer>
  )
}
