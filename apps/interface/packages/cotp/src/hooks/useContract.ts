import { useContract } from '@starknet-react/core'
import { BondingCurveABI, BOUNDING_CURVE_ADDRESS, ERC20ABI, DutchAuctionABI, DUTCH_AUCTION_ADDRESS, SwapABI, SWAP_ADDRESS } from 'cotp/src/constants/contracts'
import { Token } from 'cotp/src/features/entities/token'

export function useDutchAuction() {
  return useContract({
    abi: DutchAuctionABI,
    address: DUTCH_AUCTION_ADDRESS,
  }).contract
}

export function useSwap() {
  return useContract({
    abi: SwapABI,
    address: SWAP_ADDRESS,
  }).contract
}

export function useToken(token: Token) {
  return useContract({
    abi: ERC20ABI,
    address: token.address as `0x${string}`,
  }).contract
}

export function useTokenAt(address: string) {
  return useContract({
    abi: ERC20ABI,
    address: address as `0x${string}`,
  }).contract
}

export function useBondingCurve() {
  return useContract({
    abi: BondingCurveABI,
    address: BOUNDING_CURVE_ADDRESS as `0x${string}`,
  }).contract
}
