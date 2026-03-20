// TODO: remove this eslint disable
/* eslint-disable import/no-unused-modules */

import { useCallback } from 'react'
import {
  ApplicationModal,
  CloseModalParams,
  OpenModalParams,
  setCloseModal,
  setOpenModal,
} from 'state/application/reducer'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { InterfaceState } from 'state/webReducer'

export function useModalIsOpen(modal: ApplicationModal): boolean {
  const openModal = useAppSelector((state: InterfaceState) => state.application.openModal?.name)
  return openModal === modal
}

export function useCloseModal(modal?: CloseModalParams) {
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setCloseModal(modal)), [dispatch, modal])
}

export function useOpenModal(modal: OpenModalParams): () => void {
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setOpenModal(modal)), [dispatch, modal])
}
