import { WindowCard } from 'components/Card/WindowCard'
import { Flex, SpinningLoader, styled, Text } from 'ui/src'
import { Letter } from './Letter'
import { useEffect, useMemo } from 'react'
import { useBalances } from 'cotp/src/features/portfolio/api'
import { STRK_SEPOLIA } from 'cotp/src/constants/tokens'
import { useSetStrkBalance } from 'state/summon/hooks'

const LettersBox = styled(Flex, {
  position: 'absolute',
  flexDirection: 'row',
  gap: 10,
  justifyContent: 'center',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  alignItems: 'center',

  variants: {
    active: {
      false: {
        "$platform-web": {
          filter: 'saturate(0)',
        },
      },
    },
  },
})

export function Balance() {
  const { balances, isLoading } = useBalances([STRK_SEPOLIA])
  const strkBalance = balances[0]

  const parsedStrkBalance = useMemo(() => strkBalance?.toFixed(2, { groupSeparator: ',' }), [strkBalance])

  // global state
  const setStrkBalance = useSetStrkBalance()

  // push to global state on change
  useEffect(() => {
    setStrkBalance(strkBalance?.quotient.toString() ?? null)
  }, [strkBalance?.quotient])

  return (
    <WindowCard height={180} title="STRK Balance">
      <LettersBox active={!!parsedStrkBalance}>
        <Letter letter="s" size={80} />
        <Letter letter="t" size={80} />
        <Letter letter="r" size={80} />
        <Letter letter="k" size={80} />
      </LettersBox>

      <Flex flex={1} justifyContent="center" gap="$gap8" alignItems="center">
        {isLoading ? (
          <SpinningLoader size={32} />
        ) : parsedStrkBalance ? (
          <Text variant="heading1">{parsedStrkBalance}</Text>
        ) : (
          <Text variant="heading1" color="$neutral2">N/A</Text>
        )}
        <Text variant="body3" color="$neutral2">STRK BALANCE</Text>
      </Flex>
    </WindowCard>
  )
}
