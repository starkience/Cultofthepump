import { useExplorer, useSendTransaction, useTransactionReceipt } from '@starknet-react/core'
import Modal from 'components/Modal'
import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCalls, useLastTransaction, usePushTransaction } from 'state/transactions/hooks'
import { TamaguiClickableStyle } from 'theme'
import { Flex, SpinningLoader, Text } from 'ui/src'
import { External } from 'ui/src/components/icons'

interface WalletModalProps {
  isOpen: boolean
  onDismiss: () => void
}

export function TransactionModal({ isOpen, onDismiss }: WalletModalProps) {
  // global state
  const pushTransaction = usePushTransaction()
  const [calls, setCalls] = useCalls()

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
    }
  }, [isOpen])

  // push the transaction to the global state
  useEffect(() => {
    if (data?.transaction_hash) {
      pushTransaction({ hash: data.transaction_hash })
    }
  }, [data])

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
            <Text variant="body2" color="$statusCritical" textAlign="center">"Transaction failed"</Text>
            <TransactionLink />
          </Flex>
        )

      case 'success':
        return (
          <Flex gap="$gap16" flexDirection="column" alignItems="center">
            <Text variant="body1" color="$accent1" textAlign="center">"Transaction succeed"</Text>
            <TransactionLink />
          </Flex>
        )
    }

    return null
  }, [transactionReceipt])

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
