import { WindowCard } from 'components/Card/WindowCard'
import { Button, Flex, FlexProps, useSigilColors, View } from 'ui/src'
import { Kulthii } from './Kulthii'
import { useAuctionPrice, useCultData, useIsValidSummonSteps } from 'state/summon/hooks'
import { Rune } from './Rune'
import { useCallback, useEffect, useMemo } from 'react'
import { SIDED_STEPS } from 'pages/Summon/CardsHelpers'
import { useBlock } from '@starknet-react/core'
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
  const { name, symbol, snipingWei } = useCultData()
  const auctionPrice = useAuctionPrice()

  // prepare tx
  const dutchAuction = useDutchAuction()
  const strk = useToken(STRK_SEPOLIA)

  const devBypass = import.meta.env.VITE_DEV_AUCTION_BYPASS === 'true'
  const { data: block } = useBlock({ blockIdentifier: 'latest' })

  // populate calls
  const calls = useMemo(() => {
    if (!isValidSummon || !strk || !dutchAuction) return undefined

    const sniping = snipingWei ?? '0'
    const snipingBig = BigInt(sniping)

    // In dev bypass mode, prepend create_auction and approve end_price (10 STRK) + sniping.
    if (devBypass && block) {
      const END_PRICE = BigInt('10000000000000000000') // 10 STRK — deployed end_price
      const totalApprove = (END_PRICE + snipingBig).toString()
      return [
        dutchAuction.populate('create_auction', [(block.timestamp - 10).toString(), { low: END_PRICE.toString(), high: '0' }]),
        strk.populate('approve', [dutchAuction.address, { low: totalApprove, high: '0' }]),
        dutchAuction.populate('bid', [name, symbol, { low: sniping, high: '0' }]),
      ]
    }

    const auctionPriceBig = BigInt(auctionPrice ?? '0')
    const totalApprove = (auctionPriceBig + snipingBig).toString()
    return [
      strk.populate('approve', [dutchAuction.address, { low: totalApprove, high: '0' }]),
      dutchAuction.populate('bid', [name, symbol, { low: sniping, high: '0' }]),
    ]
  }, [isValidSummon, auctionPrice, dutchAuction, strk, name, symbol, snipingWei, devBypass, block])

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
