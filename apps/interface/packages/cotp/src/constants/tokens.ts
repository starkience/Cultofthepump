import { ChainId } from 'cotp/src/constants/chainId'
import { Token } from 'cotp/src/features/entities/token'

export const STRK_SEPOLIA = new Token(
  ChainId.SN_SEPOLIA,
  '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
  18,
  'STRK',
  'Starknet Token'
)
