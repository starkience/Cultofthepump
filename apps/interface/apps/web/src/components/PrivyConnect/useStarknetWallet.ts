import { usePrivy } from '@privy-io/react-auth'
import { useEffect, useState } from 'react'

const SERVICE_URL = import.meta.env.VITE_PRIVY_WALLET_SERVICE_URL as string ?? 'http://localhost:3002'

export type StarknetWallet = {
  id:        string
  address:   string
  publicKey: string
  isNew:     boolean
}

export function useStarknetWallet() {
  const { ready, authenticated, getAccessToken } = usePrivy()
  const [wallet, setWallet]   = useState<StarknetWallet | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!ready || !authenticated) { setWallet(null); return }

    let cancelled = false
    setLoading(true)

    ;(async () => {
      try {
        const token = await getAccessToken()
        const res   = await fetch(`${SERVICE_URL}/api/wallet/starknet`, {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })
        if (!res.ok) throw new Error(`Wallet service ${res.status}`)
        const data = await res.json() as { isNew: boolean; wallet: Omit<StarknetWallet, 'isNew'> }
        if (!cancelled) setWallet({ ...data.wallet, isNew: data.isNew })
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [ready, authenticated, getAccessToken])

  return { wallet, loading, error }
}
