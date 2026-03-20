import { invert, transparentize } from 'polished'
import { useMemo } from 'react'
import { Flex, styled, useSigilColors, View, ViewProps } from 'ui/src'

const StyledBackground = styled(Flex, {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
})

interface BackgroundProps {
  active: boolean
}

export function Background({ active }: BackgroundProps) {
  const colors = useSigilColors()

  const tilesBackground = useMemo(() => ({
    backgroundImage: `
          linear-gradient(90deg, transparent 0%, transparent 99%, ${colors.accent1.val}32 99%),
          linear-gradient(0deg, transparent 0%, transparent 99%, ${colors.accent1.val}32 99%),
          radial-gradient(50% 50% at 50% 50%, ${colors.surface1.val} 88%, ${colors.surface1.val}00 100%)
        `,
    backgroundSize: '50px 50px',
    backgroundRepeat: 'repeat',
    backgroundPosition: 'center',
  }), [colors.accent1.val])

  const veilBackground = useMemo(() => ({
    backgroundImage: `radial-gradient(50% 50% at 50% 50%, ${colors.surface1.val}a0 88%, ${colors.surface1.val}00 100%)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }), [colors.accent1.val])

  const gradientBackground = useMemo(() => {
    const color = invert(colors.accent1.val)

    return {
      backgroundImage: `
        radial-gradient(66% 66% at 50% 50%, ${transparentize(1, color)} 50%, ${transparentize(0.6, color)} 70%, ${transparentize(0.35, color)} 87%),
        url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")
          `,
      filter: 'contrast(170%) brightness(300%) invert(1)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      opacity: 0.1,
    }
  }, [colors.accent1.val])

  return (
    <StyledBackground $platform-web={{ filter: active ? undefined : 'saturate(0)' }}>
      <StyledBackground $platform-web={tilesBackground} />
      <StyledBackground $platform-web={veilBackground} />
      <StyledBackground $platform-web={gradientBackground} />
    </StyledBackground>
  )
}
