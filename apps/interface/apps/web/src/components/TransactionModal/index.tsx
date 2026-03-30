import { useExplorer, useTransactionReceipt } from '@starknet-react/core'
import Modal from 'components/Modal'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCultData, useCultVisual } from 'state/summon/hooks'
import { useCalls, usePushTransaction } from 'state/transactions/hooks'
import { TamaguiClickableStyle } from 'theme'
import { Button, Flex, SpinningLoader, Text } from 'ui/src'
import { External } from 'ui/src/components/icons'
import { extractLaunchedTokenAddress, persistSummonMetadata } from './metadata'
import { SharedQueryClient } from 'cotp/src/data/apiClients/SharedQueryClient'
import { COTP_INDEXER_API_CACHE_KEY } from 'cotp/src/data/apiClients/cotpIndexerApi/cotpIndexerApiClient'
import { useWallet } from 'context/WalletContext'

interface WalletModalProps {
  isOpen: boolean
  onDismiss: () => void
}

export function TransactionModal({ isOpen, onDismiss }: WalletModalProps) {
  const pushTransaction = usePushTransaction()
  const [calls, setCalls] = useCalls()
  const { name, symbol, manifesto } = useCultData()
  const visualUrl = useCultVisual()
  const { address: creatorAddress, execute, executeStatus: status, executeTxHash: txHash, executeError: error, executeReset: reset } = useWallet()
  const [launchedTokenAddress, setLaunchedTokenAddress] = useState<string | null>(null)
  const persistedTransactionRef = useRef<string | null>(null)

  // Transaction receipt polling (read-only — no wallet needed)
  const transactionReceipt = useTransactionReceipt({ hash: txHash ?? undefined, watch: true, refetchInterval: 2000 })

  // Fire the tx when the modal opens; reset state when it closes
  useEffect(() => {
    if (isOpen && calls?.length) {
      void execute(calls).catch(() => { /* error captured in hook state */ })
    }
    if (!isOpen) {
      setCalls([])
      setLaunchedTokenAddress(null)
      reset()
    }
  }, [isOpen])

  // Push confirmed hash to global tx list
  useEffect(() => {
    if (txHash) pushTransaction({ hash: txHash })
  }, [txHash])

  // Persist summon metadata once receipt is confirmed
  useEffect(() => {
    const receipt = transactionReceipt.data
    if (
      !receipt ||
      receipt.statusReceipt !== 'success' ||
      !txHash ||
      !name ||
      !symbol ||
      persistedTransactionRef.current === txHash
    ) return

    persistedTransactionRef.current = txHash
    void persistSummonMetadata({
      receipt: { events: 'events' in receipt ? receipt.events : [] },
      transactionHash: txHash,
      name, symbol, manifesto, visualUrl, creatorAddress,
    }).catch(() => { persistedTransactionRef.current = null })
  }, [transactionReceipt.data?.statusReceipt, txHash, name, symbol, manifesto, visualUrl, creatorAddress])

  // Extract launched token address from receipt events
  useEffect(() => {
    const receipt = transactionReceipt.data
    if (receipt && 'events' in receipt) {
      const addr = extractLaunchedTokenAddress({ events: receipt.events })
      if (addr) setLaunchedTokenAddress(addr)
    }
  }, [transactionReceipt.data])

  // Invalidate indexer cache on success
  useEffect(() => {
    if (transactionReceipt.data?.statusReceipt === 'success') {
      void SharedQueryClient.invalidateQueries({ queryKey: [COTP_INDEXER_API_CACHE_KEY] })
    }
  }, [transactionReceipt.data?.statusReceipt])

  // Auto-redirect to trade page after summon
  const navigate = useNavigate()
  useEffect(() => {
    if (!launchedTokenAddress) return
    const timer = setTimeout(() => {
      onDismiss()
      navigate(`/trade/${launchedTokenAddress}`)
    }, 3000)
    return () => clearTimeout(timer)
  }, [launchedTokenAddress])

  const explorer = useExplorer()
  const txLink = useMemo(() => txHash ? explorer.transaction(txHash) : '', [txHash])

  const executedContent = useMemo(() => {
    if (!transactionReceipt.data?.statusReceipt) {
      return (
        <Flex gap="$gap24" flexDirection="column" alignItems="center">
          <Text variant="body2" textAlign="center">Executing transaction...</Text>
          <SpinningLoader size={32} />
        </Flex>
      )
    }

    const TransactionLink = () => (
      <Link style={{ textDecoration: 'none' }} to={txLink} target="_blank">
        <Flex flexDirection="row" gap="$gap4" alignItems="center">
          <Text variant="body2" color="$neutral2" textAlign="center" {...TamaguiClickableStyle}>See transaction</Text>
          <External color="$neutral2" size="$icon.12" />
        </Flex>
      </Link>
    )

    switch (transactionReceipt.data.statusReceipt) {
      case 'rejected':
      case 'reverted':
        return (
          <Flex gap="$gap16" flexDirection="column" alignItems="center">
            <Text variant="body2" color="$statusCritical" textAlign="center">Transaction failed</Text>
            <TransactionLink />
          </Flex>
        )
      case 'success':
        if (launchedTokenAddress) {
          return (
            <Flex gap="$gap24" flexDirection="column" alignItems="center">
              <Flex gap="$gap8" alignItems="center">
                <Text variant="heading3" color="$accent1" textAlign="center">Your cult has been summoned!</Text>
                <Text variant="body2" color="$neutral2" textAlign="center">${symbol} is now live on Starknet.</Text>
                <Text variant="body3" color="$neutral2" textAlign="center">Redirecting to trade page...</Text>
              </Flex>
              <Button theme="primary" size="large" width="100%" onPress={() => { onDismiss(); navigate(`/trade/${launchedTokenAddress}`) }}>
                Trade ${symbol} now
              </Button>
              <TransactionLink />
            </Flex>
          )
        }
        return (
          <Flex gap="$gap16" flexDirection="column" alignItems="center">
            <Text variant="body1" color="$accent1" textAlign="center">Transaction succeeded</Text>
            <TransactionLink />
          </Flex>
        )
    }
    return null
  }, [transactionReceipt, launchedTokenAddress, symbol, txLink, onDismiss, navigate])

  const content = useMemo(() => {
    switch (status) {
      case 'pending':
        return (
          <Flex gap="$gap24" flexDirection="column" alignItems="center">
            <Text variant="body2" textAlign="center">Submitting via paymaster...</Text>
            <SpinningLoader size={32} />
          </Flex>
        )
      case 'success':
        return executedContent
      case 'error':
        return (
          <Flex gap="$gap24" flexDirection="column" alignItems="center">
            <Text variant="body2" color="$statusCritical" textAlign="center">
              {error?.name === 'UserRejectedRequestError' ? 'Transaction rejected' : (error?.message ?? 'Transaction failed')}
            </Text>
          </Flex>
        )
    }
    return null
  }, [status, error, executedContent])

  return (
    <Modal title="Transaction" backgroundColor="$surface1" maxWidth={450} isOpen={isOpen} onDismiss={onDismiss}>
      {content}
    </Modal>
  )
}
