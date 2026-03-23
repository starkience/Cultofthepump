import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Currency } from 'cotp/src/features/entities/currency'
import { CurrencyAmount } from 'cotp/src/features/entities/fractions/currencyAmount'

interface SetCultDataParams {
  name: string | null
  symbol: string | null
  manifesto: string | null
  snipingWei: string | null
}

interface SetAuctionPriceParams {
  price: string | null
}

interface SetCultVisualParams {
  url: string | null
}

interface SetStrkBalanceParams {
  balance: string | null
}

export interface SummonState {
  readonly auctionPrice: string | null
  readonly name: string | null
  readonly symbol: string | null
  readonly manifesto: string | null
  readonly snipingWei: string | null
  readonly visualUrl: string | null
  readonly strkBalance: string | null
}

const initialState: SummonState = {
  auctionPrice: null,
  name: null,
  symbol: null,
  manifesto: null,
  snipingWei: null,
  visualUrl: null,
  strkBalance: null,
}

const summonSlice = createSlice({
  name: 'summon',
  initialState,
  reducers: {
    setCultData(state, action: PayloadAction<SetCultDataParams>) {
      state.name = action.payload.name
      state.symbol = action.payload.symbol
      state.manifesto = action.payload.manifesto
      state.snipingWei = action.payload.snipingWei
    },
    setAuctionPrice(state, action: PayloadAction<SetAuctionPriceParams>) {
      state.auctionPrice = action.payload.price
    },
    setCultVisual(state, action: PayloadAction<SetCultVisualParams>) {
      state.visualUrl = action.payload.url
    },
    setStrkBalance(state, action: PayloadAction<SetStrkBalanceParams>) {
      state.strkBalance = action.payload.balance
    },
  },
})

export const { setCultData, setCultVisual, setAuctionPrice, setStrkBalance } = summonSlice.actions

export default summonSlice.reducer
