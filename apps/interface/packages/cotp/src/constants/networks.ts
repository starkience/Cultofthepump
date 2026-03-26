import { Chain, sepolia, mainnet } from '@starknet-react/chains'
import { ChainProviderFactory } from '@starknet-react/core'
import { RpcProvider } from 'starknet'

export const SUPPORTED_STARKNET_NETWORKS = [sepolia]

const ALCHEMY_RPC_URL = import.meta.env.VITE_ALCHEMY_RPC_URL as string

export const nethermindRpcProviders: ChainProviderFactory = (chain: Chain) => {
  switch (chain.id) {
    case sepolia.id:
      return new RpcProvider({
        nodeUrl: ALCHEMY_RPC_URL || 'https://starknet-sepolia.public.blastapi.io/rpc/v0_7',
      })

    case mainnet.id:
      return new RpcProvider({
        nodeUrl: 'https://starknet-mainnet.public.blastapi.io/rpc/v0_7',
      })

    default:
      return null
  }
}
