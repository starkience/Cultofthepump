import JSBI from 'jsbi'

export enum ENTRYPOINT {
  BalanceOf = 'balance_of',
  CurrentPrice = 'current_price',
  Duration = 'duration',
  CurrentAuctionStart = 'current_auction_start',
  CurrentAuctionBounds = 'current_auction_bounds',
  CurrentAuctionBid = 'current_auction_bid',
}

export type Case = 'camel' | 'snake'
export const DEFAULT_CASE: Case = 'snake'

// exports for external consumption
export type BigintIsh = JSBI | string | number

export enum TradeType {
  EXACT_INPUT,
  EXACT_OUTPUT,
}

export enum Rounding {
  ROUND_DOWN,
  ROUND_HALF_UP,
  ROUND_UP,
}

export const MaxUint256 = JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
