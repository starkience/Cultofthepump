import { useAccount, useDisconnect } from '@starknet-react/core'
import Modal from 'components/Modal'
import { useCallback } from 'react'
import { Button, Flex, Text } from 'ui/src'
import { shortenAddress } from 'utilities/src/addresses'

interface WalletModalProps {
  isOpen: boolean
  onDismiss: () => void
}

export function WalletOverviewModal({ isOpen, onDismiss }: WalletModalProps) {
  // accounts
  const { address } = useAccount()

  // disconnect
  const { disconnect } = useDisconnect()

  const disconnectAndDismiss = useCallback(() => {
    disconnect()
    onDismiss()
  }, [disconnect, close])

  return (
    <Modal title="Wallet" backgroundColor="$surface1" maxWidth={450} isOpen={isOpen} onDismiss={onDismiss}>
      <Flex gap="$gap24" flexDirection="column" alignItems="center">
        <Text variant="buttonLabel1">{shortenAddress(address)}</Text>
        <Button theme="secondary" onPress={disconnectAndDismiss}>Disconnect</Button>
      </Flex>
    </Modal>
  )
}
