import { useContract } from '@starknet-react/core'
import { ERC20ABI } from 'cotp/src/constants/contracts'
import { DutchAuctionABI, DUTCH_AUCTION_ADDRESS } from 'cotp/src/constants/contracts'
import { Token } from 'cotp/src/features/entities/token'

export function useDutchAuction() {
  return useContract({
    abi: DutchAuctionABI,
    address: DUTCH_AUCTION_ADDRESS,
  }).contract
}

export function useToken(token: Token) {
  return useContract({
    abi: ERC20ABI,
    address: token.address as `0x${string}`,
  }).contract
}
