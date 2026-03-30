import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useAccount, useDisconnect } from '@starknet-react/core'
import { useStarknetWallet } from 'components/PrivyConnect/useStarknetWallet'
import { usePrivyExecute, type PrivyExecuteStatus } from 'hooks/usePrivyExecute'
import type { Call } from 'starknet'

const SERVICE_URL = (import.meta.env.VITE_PRIVY_WALLET_SERVICE_URL as string | undefined) ?? 'http://localhost:3002'

// ─── Types ────────────────────────────────────────────────────────────────────

type WalletMode = 'privy' | 'starknet' | null

interface WalletContextValue {
  // Connection state
  mode: WalletMode
  isConnected: boolean
  isLoading: boolean

  // Addresses
  /** The Privy embedded wallet address (execution wallet) — all txs go through this */
  privyAddress: string | null
  /** The external wallet address (ArgentX/Braavos) — null for Privy-only users */
  externalAddress: string | null
  /** Unified address: privyAddress (since all txs use the Privy wallet) */
  address: string | null

  // Gasless execution via Privy + AVNU paymaster
  execute: (calls: Call[]) => Promise<string>
  executeStatus: PrivyExecuteStatus
  executeTxHash: string | null
  executeError: Error | null
  executeReset: () => void

  // Auth token for API calls
  getAuthToken: () => Promise<string | null>

  // Which external wallet was used to login (e.g. 'argentX', 'braavos', 'MetaMask')
  connectorName: string | null

  // Actions
  setStarknetSession: (token: string, wallet: { id: string; address: string; publicKey: string }, connectorName?: string) => void
  disconnect: () => void
  openLoginModal: () => void

  // Login modal state
  loginModalOpen: boolean
  setLoginModalOpen: (open: boolean) => void

  // Is gas sponsored?
  isGasless: boolean
}

const WalletContext = createContext<WalletContextValue | null>(null)

// ─── Storage keys ─────────────────────────────────────────────────────────────

const MODE_KEY            = 'cotp_wallet_mode'
const SN_TOKEN_KEY        = 'cotp_sn_auth_token'
const SN_PRIVY_WALLET_KEY = 'cotp_sn_privy_wallet'
const CONNECTOR_NAME_KEY  = 'cotp_connector_name'

// ─── Provider ─────────────────────────────────────────────────────────────────

export function UnifiedWalletProvider({ children }: { children: ReactNode }) {
  const { authenticated, getAccessToken, logout: privyLogout } = usePrivy()
  const { address: snAddress, isConnected: snConnected } = useAccount()
  const { disconnect: snDisconnect } = useDisconnect()
  const { wallet: privyWallet, loading: privyWalletLoading } = useStarknetWallet()

  const [mode, setMode]                     = useState<WalletMode>(() => localStorage.getItem(MODE_KEY) as WalletMode)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [snToken, setSnToken]               = useState<string | null>(() => localStorage.getItem(SN_TOKEN_KEY))
  const [snPrivyWallet, setSnPrivyWallet]   = useState<{ id: string; address: string; publicKey: string } | null>(() => {
    try { return JSON.parse(localStorage.getItem(SN_PRIVY_WALLET_KEY) ?? 'null') } catch { return null }
  })
  const [connectorName, setConnectorName] = useState<string | null>(() => localStorage.getItem(CONNECTOR_NAME_KEY))

  const privyExecute = usePrivyExecute()

  // Persist mode
  useEffect(() => {
    if (mode) localStorage.setItem(MODE_KEY, mode)
    else localStorage.removeItem(MODE_KEY)
  }, [mode])

  // Auto-detect mode from state (only set if not already set)
  useEffect(() => {
    if (mode) return // don't override an active session
    if (authenticated) setMode('privy')
    else if (snToken) setMode('starknet')
  }, [authenticated, snToken, mode])

  // ── Set Starknet session (called after successful /api/auth/starknet-login) ──
  const setStarknetSession = useCallback((token: string, wallet: { id: string; address: string; publicKey: string }, name?: string) => {
    setSnToken(token)
    setSnPrivyWallet(wallet)
    setMode('starknet')
    setConnectorName(name ?? null)
    localStorage.setItem(SN_TOKEN_KEY, token)
    localStorage.setItem(SN_PRIVY_WALLET_KEY, JSON.stringify(wallet))
    if (name) localStorage.setItem(CONNECTOR_NAME_KEY, name)
    else localStorage.removeItem(CONNECTOR_NAME_KEY)
  }, [])

  // ── Auth token getter (returns Privy token or our JWT) ──
  const getAuthToken = useCallback(async (): Promise<string | null> => {
    if (mode === 'privy') return getAccessToken()
    if (mode === 'starknet') return snToken
    return null
  }, [mode, getAccessToken, snToken])

  // ── Execute state for JWT path ──
  const [jwtStatus, setJwtStatus] = useState<PrivyExecuteStatus>('idle')
  const [jwtTxHash, setJwtTxHash] = useState<string | null>(null)
  const [jwtError, setJwtError]   = useState<Error | null>(null)

  const jwtReset = useCallback(() => {
    setJwtStatus('idle'); setJwtTxHash(null); setJwtError(null)
  }, [])

  // Serialize calls safely — .populate() may produce BigInt values in calldata
  const serializeCalls = (calls: Call[]) => JSON.stringify({ calls }, (_key, value) =>
    typeof value === 'bigint' ? '0x' + value.toString(16) : value
  )

  const execute = useCallback(async (calls: Call[]): Promise<string> => {
    if (mode === 'privy') {
      return privyExecute.execute(calls)
    }
    if (mode === 'starknet' && snToken) {
      setJwtStatus('pending')
      setJwtTxHash(null)
      setJwtError(null)
      try {
        const res = await fetch(`${SERVICE_URL}/api/wallet/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${snToken}` },
          body: serializeCalls(calls),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({})) as { error?: string }
          throw new Error(err.error ?? `Service ${res.status}`)
        }
        const data = await res.json() as { transactionHash: string }
        setJwtTxHash(data.transactionHash)
        setJwtStatus('success')
        return data.transactionHash
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e))
        setJwtError(err)
        setJwtStatus('error')
        throw err
      }
    }
    throw new Error('Not connected')
  }, [mode, snToken, privyExecute])

  // ── Disconnect ──
  const disconnect = useCallback(() => {
    if (mode === 'privy') privyLogout()
    if (mode === 'starknet') snDisconnect()
    setMode(null)
    setSnToken(null)
    setSnPrivyWallet(null)
    setConnectorName(null)
    localStorage.removeItem(MODE_KEY)
    localStorage.removeItem(SN_TOKEN_KEY)
    localStorage.removeItem(SN_PRIVY_WALLET_KEY)
    localStorage.removeItem(CONNECTOR_NAME_KEY)
  }, [mode, privyLogout, snDisconnect])

  // ── Derived state ──
  const isConnected = mode === 'privy' ? authenticated : (mode === 'starknet' && !!snToken && !!snPrivyWallet)
  const isLoading   = mode === 'privy' ? privyWalletLoading : false

  const privyAddress = mode === 'privy'
    ? (privyWallet?.address ?? null)
    : (snPrivyWallet?.address ?? null)

  const externalAddress = mode === 'starknet' ? (snAddress ?? null) : null

  const value = useMemo<WalletContextValue>(() => ({
    mode,
    isConnected,
    isLoading,
    privyAddress,
    externalAddress,
    address: privyAddress,
    connectorName,
    execute,
    executeStatus: mode === 'starknet' ? jwtStatus : privyExecute.status,
    executeTxHash: mode === 'starknet' ? jwtTxHash : privyExecute.txHash,
    executeError:  mode === 'starknet' ? jwtError  : privyExecute.error,
    executeReset:  mode === 'starknet' ? jwtReset  : privyExecute.reset,
    getAuthToken,
    setStarknetSession,
    disconnect,
    openLoginModal: () => setLoginModalOpen(true),
    loginModalOpen,
    setLoginModalOpen,
    isGasless: true, // Always gasless — all txs via AVNU paymaster
  }), [mode, isConnected, isLoading, privyAddress, externalAddress, execute, privyExecute.status, privyExecute.txHash, privyExecute.error, privyExecute.reset, getAuthToken, setStarknetSession, disconnect, loginModalOpen])

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used inside UnifiedWalletProvider')
  return ctx
}
