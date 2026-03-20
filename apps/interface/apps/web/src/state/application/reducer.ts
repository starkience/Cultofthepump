import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export enum ApplicationModal {
  CONNECT_WALLET,
  WALLET_OVERVIEW,
  TRANSACTION,
}

export type OpenModalParams = { name: ApplicationModal; initialState?: undefined }

export type CloseModalParams = ApplicationModal

export interface ApplicationState {
  readonly openModal: OpenModalParams | null
}

const initialState: ApplicationState = {
  openModal: null,
}

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    setOpenModal(state, action: PayloadAction<OpenModalParams>) {
      state.openModal = action.payload
    },
    setCloseModal(state, action: PayloadAction<CloseModalParams | undefined>) {
      const { payload } = action
      if (!payload || (state.openModal?.name as any) === payload) {
        state.openModal = null
      }
    },
  },
})

export const { setOpenModal, setCloseModal } = applicationSlice.actions

export default applicationSlice.reducer
