import { useAccount, useExplorer, useSendTransaction, useTransactionReceipt } from '@starknet-react/core'
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

interface WalletModalProps {
  isOpen: boolean
  onDismiss: () => void
}

export function TransactionModal({ isOpen, onDismiss }: WalletModalProps) {
  // global state
  const pushTransaction = usePushTransaction()
  const [calls, setCalls] = useCalls()
  const { name, symbol, manifesto } = useCultData()
  const visualUrl = useCultVisual()
  const { address: creatorAddress } = useAccount()
  const persistedTransactionRef = useRef<string | null>(null)
  const [launchedTokenAddress, setLaunchedTokenAddress] = useState<string | null>(null)

  // execution of the transaction
  const { send, data, error, status } = useSendTransaction({ calls })

  // transaction receipt
  const transactionReceipt = useTransactionReceipt({ hash: data?.transaction_hash, watch: true, refetchInterval: 2000 })

  // execute the transaction when the modal is opened and reset the calls when it is closed
  useEffect(() => {
    if (isOpen) {
      send()
    } else {
      setCalls([])
      setLaunchedTokenAddress(null)
    }
  }, [isOpen])

  // push the transaction to the global state
  useEffect(() => {
    if (data?.transaction_hash) {
      pushTransaction({ hash: data.transaction_hash })
    }
  }, [data])

  useEffect(() => {
    const receipt = transactionReceipt.data
    if (
      !receipt ||
      receipt.statusReceipt !== 'success' ||
      !data?.transaction_hash ||
      !name ||
      !symbol ||
      persistedTransactionRef.current === data.transaction_hash
    ) {
      return
    }

    persistedTransactionRef.current = data.transaction_hash

    void persistSummonMetadata({
      receipt: { events: 'events' in receipt ? receipt.events : [] },
      transactionHash: data.transaction_hash,
      name,
      symbol,
      manifesto,
      visualUrl,
      creatorAddress,
    }).catch(() => {
      persistedTransactionRef.current = null
    })
  }, [transactionReceipt.data?.statusReceipt, data?.transaction_hash, name, symbol, manifesto, visualUrl, creatorAddress])

  // track launched token address after success
  useEffect(() => {
    const receipt = transactionReceipt.data
    if (receipt && 'events' in receipt) {
      const addr = extractLaunchedTokenAddress({ events: receipt.events })
      if (addr) setLaunchedTokenAddress(addr)
    }
  }, [transactionReceipt.data])

  // invalidate all indexer queries the moment any tx confirms so trades/metrics update immediately
  useEffect(() => {
    if (transactionReceipt.data?.statusReceipt === 'success') {
      void SharedQueryClient.invalidateQueries({ queryKey: [COTP_INDEXER_API_CACHE_KEY] })
    }
  }, [transactionReceipt.data?.statusReceipt])

  // auto-redirect to trade page 3s after a successful summon
  useEffect(() => {
    if (!launchedTokenAddress) return
    const timer = setTimeout(() => {
      onDismiss()
      navigate(`/trade/${launchedTokenAddress}`)
    }, 3000)
    return () => clearTimeout(timer)
  }, [launchedTokenAddress])

  const navigate = useNavigate()

  // explorer
  const explorer = useExplorer()
  const txLink = useMemo(() => data ? explorer.transaction(data.transaction_hash) : '', [data?.transaction_hash])

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
              <Button
                theme="primary"
                size="large"
                width="100%"
                onPress={() => {
                  onDismiss()
                  navigate(`/trade/${launchedTokenAddress}`)
                }}
              >
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

  // React component that displays the last transaction
  const content = useMemo(() => {
    switch (status) {
      case 'pending':
        return (
          <Flex gap="$gap24" flexDirection="column" alignItems="center">
            <Text variant="body2" textAlign="center">Please sign the transaction in your wallet.</Text>
            <SpinningLoader size={32} />
          </Flex>
        )

      case 'success':
        return executedContent

      case 'error':
        const errorMessage = error?.name === 'UserRejectedRequestError'
          ? 'Transaction rejected'
          : 'Failed to execure transaction'

        return (
          <Flex gap="$gap24" flexDirection="column" alignItems="center">
            <Text variant="body2" color="$statusCritical" textAlign="center">{errorMessage}</Text>
          </Flex>
        )
    }

    return null
  }, [data, error, status, executedContent])

  return (
    <Modal title="Transaction" backgroundColor="$surface1" maxWidth={450} isOpen={isOpen} onDismiss={onDismiss}>
      {content}
    </Modal>
  )
}
