import { Chain, sepolia, mainnet } from '@starknet-react/chains'
import { ChainProviderFactory } from '@starknet-react/core'
import { RpcProvider } from 'starknet'

export const SUPPORTED_STARKNET_NETWORKS = [mainnet, sepolia]

const NETHERMIND_KEY = import.meta.env.VITE_NETHERMIND_KEY as string
if (typeof NETHERMIND_KEY === 'undefined') {
  throw new Error(`REACT_APP_NETHERMIND_KEY must be a defined environment variable`)
}

export const nethermindRpcProviders: ChainProviderFactory = (chain: Chain) => {
  switch (chain.id) {
    case sepolia.id:
      return new RpcProvider({
        nodeUrl: `https://rpc.nethermind.io/sepolia-juno/?apikey=${NETHERMIND_KEY}`,
      })

    case mainnet.id:
      return new RpcProvider({
        nodeUrl: `https://rpc.nethermind.io/mainnet-juno/?apikey=${NETHERMIND_KEY}`,
      })

    default:
      return null
  }
}
