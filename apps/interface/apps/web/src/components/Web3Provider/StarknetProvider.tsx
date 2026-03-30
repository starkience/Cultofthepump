import { nethermindRpcProviders, SUPPORTED_STARKNET_NETWORKS } from 'cotp/src/constants/networks'
import { StarknetConfig, voyager } from '@starknet-react/core'
import { SharedQueryClient } from 'cotp/src/data/apiClients/SharedQueryClient'
import { getL2Connections } from 'connections'

interface StarknetProviderProps {
  children: React.ReactNode
}

// Re-enable ArgentX/Braavos/WebWallet connectors for Starknet wallet login.
// Also supports read-only hooks: useReadContract, useBlock, useTransactionReceipt, useExplorer.
const connectors = getL2Connections().map(c => c.connector)

export function StarknetProvider({ children }: StarknetProviderProps) {
  return (
    <StarknetConfig
      queryClient={SharedQueryClient}
      connectors={connectors}
      chains={SUPPORTED_STARKNET_NETWORKS}
      provider={nethermindRpcProviders}
      explorer={voyager}
    >
      {children}
    </StarknetConfig>
  )
}
