import { useAccount, useConnect } from '@starknet-react/core'
import { useMemo } from 'react'
import { useOpenModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import { Button } from 'ui/src'
import { shortenAddress } from 'utilities/src/addresses'

export function Web3Status() {
  const { address } = useAccount()
  const { status } = useConnect()

  const openWalletOverviewModal = useOpenModal({ name: ApplicationModal.WALLET_OVERVIEW })
  const openConnectWalletModal = useOpenModal({ name: ApplicationModal.CONNECT_WALLET })

  const isLoading = useMemo(() => status === 'pending', [status])

  if (isLoading) {
    return (
      <Button theme="secondary" disabled>
        Connecting...
      </Button>
    )
  } else if (address) {
    return (
      <Button theme="secondary" onPress={openWalletOverviewModal}>
        {shortenAddress(address)}
      </Button>
    )
  } else {
    return (
      <Button theme="secondary" onPress={openConnectWalletModal}>
        Connect
      </Button>
    )
  }
}
