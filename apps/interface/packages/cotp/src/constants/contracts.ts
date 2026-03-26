import Multicall from 'cotp/src/contracts/Multicall'
import DutchAuction from 'cotp/src/contracts/DutchAuction'
import ERC20 from 'cotp/src/contracts/ERC20'
import Swap from 'cotp/src/contracts/Swap'
import BondingCurve from 'cotp/src/contracts/BondingCurve'
import Staking from 'cotp/src/contracts/Staking'

export const MULTICALL_ADDRESS = '0x64c8d452ec94521590795c5402e457a1da1faf92995228d6ac78981abd03c67'

export const BOUNDING_CURVE_ADDRESS = '0x051edfc985b303c7517e1daadd972b8edbe4bfd8484edc6f9a810704c0931975'

export const SWAP_ADDRESS = '0x07a6c0500a1596c0a501156ba660c84c461a599053ab96319d61dfc2626a45b9'

export const FACTORY_ADDRESS = '0x0135abb443cbba9738fe63d55a06810fdf14b605ddc5262220a889411baede25'

export const DUTCH_AUCTION_ADDRESS = '0x019326451eb2955333d4238cd2bdd526a1af5cca842511e3246da61f9a1d859a'

export const STAKING_ADDRESS = '0x022db715ee9f9b7395e2a250b069a1f07f92b119cacb5bfd35c8cb77bfc7aa3e'

export const MulticallABI = Multicall.abi

export const DutchAuctionABI = DutchAuction.abi

export const ERC20ABI = ERC20.abi

export const SwapABI = Swap.abi

export const BondingCurveABI = BondingCurve.abi

export const StakingABI = Staking.abi
