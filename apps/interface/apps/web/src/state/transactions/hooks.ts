import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { CompiledCall, pushTransaction, setCalls, Transaction } from './reducer'

export function useLastTransaction() {
  return useAppSelector((state) => state.transactions.transactions.length
    ? state.transactions.transactions[state.transactions.transactions.length - 1]
    : null
  )
}

export function usePushTransaction() {
  const dispatch = useAppDispatch()

  return useCallback((tx: Transaction) => {
    dispatch(pushTransaction({ tx }))
  }, [dispatch])
}

export function useCalls(): [CompiledCall[], (calls: CompiledCall[]) => void] {
  const calls = useAppSelector((state) => state.transactions.calls)

  const dispatch = useAppDispatch()
  const setCalls_ = useCallback((calls: CompiledCall[]) => {
    dispatch(setCalls({ calls }))
  }, [dispatch])

  return [calls, setCalls_] as const
}
