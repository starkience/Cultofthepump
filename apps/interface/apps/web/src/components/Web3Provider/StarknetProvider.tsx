import { nethermindRpcProviders, SUPPORTED_STARKNET_NETWORKS } from 'cotp/src/constants/networks'
import { publicProvider, StarknetConfig, starkscan } from '@starknet-react/core'
import { ArgentMobileConnector } from 'starknetkit/argentMobile'
import { InjectedConnector } from 'starknetkit/injected'
import { WebWalletConnector } from 'starknetkit/webwallet'
import { SharedQueryClient } from 'cotp/src/data/apiClients/SharedQueryClient'

interface StarknetProviderProps {
  children: React.ReactNode
}

export function StarknetProvider({ children }: StarknetProviderProps) {
  const connectors = [
    new InjectedConnector({ options: { id: 'argentX', name: 'Argent' } }),
    new InjectedConnector({ options: { id: 'braavos', name: 'Braavos' } }),
    new WebWalletConnector({ url: 'https://web.argent.xyz' }),
    new ArgentMobileConnector(),
  ]

  return (
    <StarknetConfig
      queryClient={SharedQueryClient}
      connectors={connectors}
      chains={SUPPORTED_STARKNET_NETWORKS}
      provider={nethermindRpcProviders}
      explorer={starkscan}
      autoConnect
    >
      {children}
    </StarknetConfig>
  )
}
