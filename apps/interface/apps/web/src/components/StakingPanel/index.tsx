import { useCallback, useMemo, useState } from 'react'
import { BlockTag, uint256 } from 'starknet'
import { Button, Flex, Text } from 'ui/src'
import { TextInput } from 'ui/src'
import { WindowCard } from 'components/Card/WindowCard'
import { useReadContract } from '@starknet-react/core'
import { useWallet } from 'context/WalletContext'
import { useTokenAt } from 'cotp/src/hooks/useContract'
import { STAKING_ADDRESS, StakingABI, ERC20ABI } from 'cotp/src/constants/contracts'
import { useCalls } from 'state/transactions/hooks'
import { useOpenModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import { formatWei, formatStrk } from 'cotp/src/utils/format'

interface Props {
  tokenAddress: string
  tokenSymbol: string
}

function parseAmount(value: string, decimals = 18): bigint | null {
  try {
    if (!value || isNaN(Number(value)) || Number(value) <= 0) return null
    const [intPart, fracPart = ''] = value.split('.')
    const frac = fracPart.padEnd(decimals, '0').slice(0, decimals)
    return BigInt(intPart) * BigInt(10 ** decimals) + BigInt(frac)
  } catch {
    return null
  }
}

export function StakingPanel({ tokenAddress, tokenSymbol }: Props) {
  const [tab, setTab] = useState<'stake' | 'unstake'>('stake')
  const [amountInput, setAmountInput] = useState('')

  const { address: connectedAddress } = useWallet()
  const cult = useTokenAt(tokenAddress)
  const [, setCalls] = useCalls()
  const openTransactionModal = useOpenModal({ name: ApplicationModal.TRANSACTION })

  const enabled = Boolean(STAKING_ADDRESS && connectedAddress)

  // Staked balance
  const { data: stakedRaw } = useReadContract({
    abi: StakingABI,
    address: STAKING_ADDRESS as `0x${string}`,
    functionName: 'staked_balance',
    args: enabled ? [tokenAddress as `0x${string}`, connectedAddress as `0x${string}`] : undefined,
    enabled,
    blockIdentifier: BlockTag.LATEST,
    refetchInterval: 15_000,
  })

  // Pending rewards (earned)
  const { data: earnedRaw } = useReadContract({
    abi: StakingABI,
    address: STAKING_ADDRESS as `0x${string}`,
    functionName: 'earned',
    args: enabled ? [tokenAddress as `0x${string}`, connectedAddress as `0x${string}`] : undefined,
    enabled,
    blockIdentifier: BlockTag.LATEST,
    refetchInterval: 15_000,
  })

  // Total staked (for pool share calc)
  const { data: totalStakedRaw } = useReadContract({
    abi: StakingABI,
    address: STAKING_ADDRESS as `0x${string}`,
    functionName: 'total_staked',
    args: [tokenAddress as `0x${string}`],
    enabled: Boolean(STAKING_ADDRESS),
    blockIdentifier: BlockTag.LATEST,
    refetchInterval: 15_000,
  })

  // Wallet token balance
  const { data: walletBalRaw } = useReadContract({
    abi: ERC20ABI,
    address: tokenAddress as `0x${string}`,
    functionName: 'balance_of',
    args: connectedAddress ? [connectedAddress] : undefined,
    enabled: Boolean(connectedAddress),
    blockIdentifier: BlockTag.LATEST,
    refetchInterval: 15_000,
  })

  const stakedBalance = (stakedRaw as bigint | undefined) ?? 0n
  const earned = (earnedRaw as bigint | undefined) ?? 0n
  const totalStaked = (totalStakedRaw as bigint | undefined) ?? 0n
  const walletBalance = (walletBalRaw as bigint | undefined) ?? 0n

  const poolShare = useMemo(() => {
    if (totalStaked === 0n || stakedBalance === 0n) return '0.00'
    return ((Number(stakedBalance) / Number(totalStaked)) * 100).toFixed(2)
  }, [stakedBalance, totalStaked])

  const parsedAmount = useMemo(() => parseAmount(amountInput), [amountInput])

  const handleAction = useCallback(() => {
    if (!parsedAmount || !cult || !STAKING_ADDRESS) return

    const stakingDispatcher = { contract_address: STAKING_ADDRESS }

    const { low, high } = uint256.bnToUint256(parsedAmount)
    const amountCalldata = [low.toString(), high.toString()]
    const calls = tab === 'stake'
      ? [
          cult.populate('approve', [STAKING_ADDRESS, { low, high }]),
          {
            contractAddress: STAKING_ADDRESS,
            entrypoint: 'stake',
            calldata: [tokenAddress, ...amountCalldata],
          },
        ]
      : [
          {
            contractAddress: STAKING_ADDRESS,
            entrypoint: 'unstake',
            calldata: [tokenAddress, ...amountCalldata],
          },
        ]

    setCalls(calls)
    openTransactionModal()
  }, [tab, parsedAmount, cult, tokenAddress, setCalls, openTransactionModal])

  const handleClaim = useCallback(() => {
    if (!STAKING_ADDRESS) return
    setCalls([{
      contractAddress: STAKING_ADDRESS,
      entrypoint: 'claim',
      calldata: [tokenAddress],
    }])
    openTransactionModal()
  }, [tokenAddress, setCalls, openTransactionModal])

  if (!STAKING_ADDRESS) return null

  const isStake = tab === 'stake'
  const maxBalance = isStake ? walletBalance : stakedBalance
  const isDisabled = !connectedAddress || !parsedAmount

  return (
    <WindowCard title="Stake in Cult">
      <Flex gap="$gap16">
        {/* Stats */}
        <Flex flexDirection="row" gap="$gap16" flexWrap="wrap">
          <Flex flex={1} gap="$gap4" backgroundColor="$surface2" p="$padding12" borderRadius="$rounded8">
            <Text variant="body3" color="$neutral2">Your Stake</Text>
            <Text variant="body1">{formatWei(stakedBalance.toString())} {tokenSymbol}</Text>
          </Flex>
          <Flex flex={1} gap="$gap4" backgroundColor="$surface2" p="$padding12" borderRadius="$rounded8">
            <Text variant="body3" color="$neutral2">Pool Share</Text>
            <Text variant="body1">{poolShare}%</Text>
          </Flex>
          <Flex flex={1} gap="$gap4" backgroundColor="$surface2" p="$padding12" borderRadius="$rounded8">
            <Text variant="body3" color="$neutral2">Earned (STRK)</Text>
            <Text variant="body1" color="$accent1">{formatStrk(earned.toString())}</Text>
          </Flex>
        </Flex>

        {/* Claim button */}
        {earned > 0n && (
          <Button
            theme="primary"
            size="medium"
            width="100%"
            onPress={handleClaim}
            disabled={!connectedAddress}
          >
            Claim {formatStrk(earned.toString())} STRK
          </Button>
        )}

        {/* Stake / Unstake tabs */}
        <Flex flexDirection="row" gap="$gap4" borderBottomWidth={1} borderStyle="solid" borderBottomColor="$borderColor">
          {(['stake', 'unstake'] as const).map((t) => (
            <Text
              key={t}
              variant="body1"
              px="$padding16"
              py="$padding8"
              cursor="pointer"
              borderBottomWidth={2}
              borderStyle="solid"
              borderBottomColor={tab === t ? '$accent1' : 'transparent'}
              color={tab === t ? '$accent1' : '$neutral1'}
              onPress={() => { setTab(t); setAmountInput('') }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          ))}
        </Flex>

        <Flex gap="$gap8">
          <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text variant="body3" color="$neutral2">
              {isStake ? `${tokenSymbol} to stake` : `${tokenSymbol} to unstake`}
            </Text>
            {connectedAddress && (
              <Flex flexDirection="row" gap="$gap8" alignItems="center">
                <Text variant="body3" color="$neutral2">
                  {isStake ? `Wallet: ${formatWei(walletBalance.toString())}` : `Staked: ${formatWei(stakedBalance.toString())}`}
                </Text>
                <Text
                  variant="body3"
                  color="$accent1"
                  cursor="pointer"
                  onPress={() => {
                    if (maxBalance > 0n) {
                      const val = Number(maxBalance) / 1e18
                      setAmountInput(val.toFixed(6).replace(/\.?0+$/, ''))
                    }
                  }}
                >
                  Max
                </Text>
              </Flex>
            )}
          </Flex>
          <TextInput
            value={amountInput}
            onChangeText={(v) => setAmountInput(v)}
            placeholder="0.0"
            keyboardType="decimal-pad"
          />
        </Flex>

        <Button
          theme="primary"
          size="large"
          width="100%"
          disabled={isDisabled}
          onPress={handleAction}
        >
          {isStake ? `Stake ${tokenSymbol}` : `Unstake ${tokenSymbol}`}
        </Button>

        <Text variant="body3" color="$neutral2" textAlign="center">
          Earn STRK from every trade in this cult. Stake more = higher yield.
        </Text>
      </Flex>
    </WindowCard>
  )
}
