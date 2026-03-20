import { useAccount, useConnect } from '@starknet-react/core'
import { WindowCard } from 'components/Card/WindowCard'
import Modal from 'components/Modal'
import { useEffect, useMemo } from 'react'
import { Flex, SpinningLoader, Text } from 'ui/src'
import { L2Option } from './WalletOption'
import { getL2Connections } from 'connections'

interface WalletModalProps {
  isOpen: boolean
  onDismiss: () => void
}

export function ConnectWalletModal({ isOpen, onDismiss }: WalletModalProps) {
  // accounts
  const { address, isConnecting, ...props } = useAccount()

  // connections
  const l2Connections = useMemo(() => getL2Connections(), [])

  // close modal if both layers have a connected wallet
  useEffect(() => {
    if (address) {
      onDismiss()
    }
  }, [onDismiss, address])

  return (
    <Modal title="Connect Wallet" backgroundColor="$surface1" maxWidth={450} isOpen={isOpen} onDismiss={onDismiss}>
      {isConnecting ? (
        <Flex alignItems="center">
          <SpinningLoader size={42} />
        </Flex>
      ) : (
        <Flex gap="$gap16">
          {l2Connections
            .filter((connection) => connection.shouldDisplay())
            .map((connection) => (
              <L2Option key={connection.getName()} connection={connection} />
            ))}
        </Flex>
      )}
    </Modal>
  )
}
