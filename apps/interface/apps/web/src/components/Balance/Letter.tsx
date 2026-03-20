import { invert, transparentize } from 'polished'
import { useMemo } from 'react'
import { Flex, styled, useSigilColors } from 'ui/src'
import { LetterK, LetterR, LetterS, LetterT } from 'ui/src/components/icons'

const LETTERS = {
  k: LetterK,
  r: LetterR,
  s: LetterS,
  t: LetterT,
}

const LetterBox = styled(Flex, {
  position: 'relative',
  width: 80,
  height: 80,
})

const Gradiant = styled(Flex, {
  position: 'absolute',
  top: -2,
  bottom: -2,
  left: -2,
  right: -2,
  background: '',
})

interface LetterProps {
  letter: keyof typeof LETTERS
  size: number
}

export function Letter({ letter, size }: LetterProps) {
  const LetterComponent = useMemo(() => LETTERS[letter], [letter])

  const colors = useSigilColors()

  return (
    <LetterBox width={size} height={size}>
      <LetterComponent size={size} position="absolute" fill="transparent" strokeWidth={2} stroke={colors.accent1.val} opacity={0.3} overflow="visible" />
      <Gradiant $platform-web={{
        opacity: 0.4,
        filter: 'contrast(170%) brightness(300%) invert(1)',
        backgroundImage: `
          radial-gradient(50% 50% at 50% 50%, ${transparentize(0.3, invert(colors.accent1.val))} 20%, ${transparentize(1, invert(colors.accent1.val))} 200%),
          url("data:image/svg+xml,%3Csvg viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")
        `
      }} />
      <Gradiant $platform-web={{ backgroundImage: `radial-gradient(50% 50% at 50% 50%, ${colors.surface1.val}00 0%, ${colors.surface1.val}80 90%)` }} />
      <LetterComponent size={size} position="absolute" fill={colors.surface1.val} overflow="visible" />
    </LetterBox>
  )
}
