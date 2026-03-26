import { nethermindRpcProviders, SUPPORTED_STARKNET_NETWORKS } from 'cotp/src/constants/networks'
import { publicProvider, StarknetConfig, voyager } from '@starknet-react/core'
import { SharedQueryClient } from 'cotp/src/data/apiClients/SharedQueryClient'

interface StarknetProviderProps {
  children: React.ReactNode
}

// No wallet connectors — all txs go through the Privy embedded wallet service.
// StarknetConfig is kept for read-only hooks: useReadContract, useBlock, useTransactionReceipt, useExplorer.
export function StarknetProvider({ children }: StarknetProviderProps) {
  return (
    <StarknetConfig
      queryClient={SharedQueryClient}
      connectors={[]}
      chains={SUPPORTED_STARKNET_NETWORKS}
      provider={nethermindRpcProviders}
      explorer={voyager}
    >
      {children}
    </StarknetConfig>
  )
}
