import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Calldata } from 'starknet'

export interface CompiledCall {
  contractAddress: string
  calldata: Calldata
  entrypoint: string
}

export interface PushTransactionParams {
  tx: Transaction
}

export interface SetCallsParams {
  calls: CompiledCall[]
}

export interface Transaction {
  readonly hash: string
}

export interface TransactionsState {
  readonly transactions: Transaction[]
  readonly calls: CompiledCall[]
}

const initialState: TransactionsState = {
  transactions: [],
  calls: [],
}

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    pushTransaction(state, action: PayloadAction<PushTransactionParams>) {
      state.transactions.push(action.payload.tx)
    },
    setCalls(state, action: PayloadAction<SetCallsParams>) {
      state.calls = action.payload.calls
    },
  },
})

export const { pushTransaction, setCalls } = transactionsSlice.actions

export default transactionsSlice.reducer
