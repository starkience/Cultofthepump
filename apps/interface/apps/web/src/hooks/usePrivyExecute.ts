import { usePrivy } from '@privy-io/react-auth'
import { useCallback, useState } from 'react'
import type { Call } from 'starknet'

const SERVICE_URL = (import.meta.env.VITE_PRIVY_WALLET_SERVICE_URL as string | undefined) ?? 'http://localhost:3002'

export type PrivyExecuteStatus = 'idle' | 'pending' | 'success' | 'error'

/**
 * Sends transactions via the privy-wallet service backed by AVNU paymaster.
 * Replaces starknet-react's useSendTransaction for all user-initiated txs.
 */
export function usePrivyExecute() {
  const { getAccessToken } = usePrivy()
  const [status, setStatus]   = useState<PrivyExecuteStatus>('idle')
  const [txHash, setTxHash]   = useState<string | null>(null)
  const [error,  setError]    = useState<Error | null>(null)

  const execute = useCallback(async (calls: Call[]): Promise<string> => {
    setStatus('pending')
    setTxHash(null)
    setError(null)
    try {
      const token = await getAccessToken()
      const res = await fetch(`${SERVICE_URL}/api/wallet/execute`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ calls }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(err.error ?? `Wallet service ${res.status}`)
      }
      const data = await res.json() as { transactionHash: string }
      setTxHash(data.transactionHash)
      setStatus('success')
      return data.transactionHash
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      setError(err)
      setStatus('error')
      throw err
    }
  }, [getAccessToken])

  const reset = useCallback(() => {
    setStatus('idle')
    setTxHash(null)
    setError(null)
  }, [])

  return { execute, status, txHash, error, reset }
}
