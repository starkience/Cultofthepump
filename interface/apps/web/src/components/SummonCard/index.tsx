import { WindowCard } from 'components/Card/WindowCard'
import { Button, Flex, FlexProps, useSigilColors, View } from 'ui/src'
import { Kulthii } from './Kulthii'
import { useAuctionPrice, useCultData, useIsValidSummonSteps } from 'state/summon/hooks'
import { Rune } from './Rune'
import { useCallback, useEffect, useMemo } from 'react'
import { SIDED_STEPS } from 'pages/Summon/CardsHelpers'
import { useSendTransaction } from '@starknet-react/core'
import { STRK_SEPOLIA } from 'cotp/src/constants/tokens'
import { Token } from 'cotp/src/features/entities/token'
import { useToken, useDutchAuction } from 'cotp/src/hooks/useContract'
import { useCalls, usePushTransaction } from 'state/transactions/hooks'
import { useOpenModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'

const ALL_STEPS = [...SIDED_STEPS.left, ...SIDED_STEPS.right]

export function SummonCard(props: FlexProps) {
  const colors = useSigilColors()

  const isValidSummonSteps = useIsValidSummonSteps()

  const isValidSummon = useMemo(
    () => ALL_STEPS.every((step) => isValidSummonSteps(step.key)),
    [isValidSummonSteps]
  )

  // compute the ratio of valid steps
  const validStepsRatio = useMemo(() => isValidSummon
    ? 1
    : ALL_STEPS.reduce((acc, step) => acc + (isValidSummonSteps(step.key) ? 1 : 0), 0) / ALL_STEPS.length,
  [isValidSummon, isValidSummonSteps])

  // get global state
  const { name, symbol } = useCultData()
  const auctionPrice = useAuctionPrice()

  // prepare tx
  const dutchAuction = useDutchAuction()
  const strk = useToken(STRK_SEPOLIA)

  // populate calls
  const calls = useMemo(() => {
    if (!isValidSummon) return undefined

    return [
      strk.populate('approve', [dutchAuction.address, auctionPrice]),
      dutchAuction.populate('bid', [name, symbol]), // TODO: add manifesto
    ]
  }, [isValidSummon, auctionPrice, dutchAuction, strk, name, symbol])

  // handle tx
  const [, setCalls] = useCalls()

  const onSubmit = useCallback(() => {
    // TODO: upload visual
    if (calls) {
      setCalls(calls)
      openTransactionModal()
    }
  }, [calls, setCalls])

  // open transaction modal
  const openTransactionModal = useOpenModal({ name: ApplicationModal.TRANSACTION })

  return (
    <WindowCard title="Summon" zIndex={1} {...props}>
      <Flex alignItems="center" flexDirection="row" gap={64}>
        <Flex flexDirection="row" alignItems="center" gap={42} flex={1}>
          <Flex gap={48} flex={1}>
            {SIDED_STEPS.left.map((step) => <Rune key={step.key} {...step.rune} active={isValidSummonSteps(step.key)} />)}
          </Flex>

          <Flex gap={48} flex={1}>
            {SIDED_STEPS.right.map((step) => <Rune key={step.key} {...step.rune} active={isValidSummonSteps(step.key)} />)}
          </Flex>
        </Flex>

        <Flex width="100%" maxWidth={380} gap="$gap24" alignItems="center" flex={1}>
          <Flex boxShadow={`inset 0 0 10px 10px ${colors.surface1.val}`} width="fit-content">
            <View zIndex={-1}>
              <Kulthii width={200} level={validStepsRatio} />
            </View>
          </Flex>

          <Button theme="primary" size="large" width="100%" disabled={!isValidSummon} onPress={onSubmit}>Summon</Button>
        </Flex>
      </Flex>
    </WindowCard>
  )
}
