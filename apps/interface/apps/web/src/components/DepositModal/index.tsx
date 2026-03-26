import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePrivy } from '@privy-io/react-auth'
import {
  bridgeEthereumToStarknet,
  formatUsdc,
  getEthUsdcBalance,
  parseUsdc,
} from './bridge'

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  bg:        '#0d0d0d',
  surface:   '#141414',
  surfaceHi: '#1a1a1a',
  border:    'rgba(156,255,147,0.08)',
  borderHi:  'rgba(156,255,147,0.2)',
  primary:   '#9cff93',
  muted:     'rgba(156,255,147,0.4)',
  dim:       'rgba(255,255,255,0.35)',
  text:      '#fff',
  red:       '#ff725e',
}
const M = "'JetBrains Mono', monospace"
const S = "'Inter', 'Helvetica Neue', sans-serif"

type Chain = 'ethereum'

const CHAINS: { id: Chain; label: string; icon: string; time: string }[] = [
  { id: 'ethereum', label: 'Ethereum', icon: '⟠', time: '≈ 5 mins' },
]

// ─── Deposit Modal ────────────────────────────────────────────────────────────
interface DepositModalProps {
  starknetAddress: string
  onClose: () => void
}

export function DepositModal({ starknetAddress, onClose }: DepositModalProps) {
  const { getAccessToken } = usePrivy()
  const walletReady = !!starknetAddress && starknetAddress !== '0x0'

  const [chain, setChain]         = useState<Chain>('ethereum')
  const [amount, setAmount]       = useState('')
  const [balance, setBalance]     = useState<bigint | null>(null)
  const [ethAddress, setEthAddress] = useState<string | null>(null)
  const [loading, setLoading]     = useState(false)
  const [step, setStep]           = useState<'idle' | 'approving' | 'confirming' | 'burning' | 'attesting' | 'done'>('idle')
  const [txHash, setTxHash]       = useState<string | null>(null)
  const [error, setError]         = useState<string | null>(null)

  const WALLET_SERVICE_URL = (import.meta as unknown as { env: Record<string, string> }).env.VITE_PRIVY_WALLET_SERVICE_URL ?? 'http://localhost:3002'

  // When Ethereum tab is selected, request EVM accounts directly from
  // window.ethereum (Phantom EVM / MetaMask) — bypasses Privy linked accounts
  // so it works regardless of how the user authenticated.
  useEffect(() => {
    if (chain !== 'ethereum') { setEthAddress(null); setBalance(null); return }

    const provider = (window as unknown as { ethereum?: { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum
    if (!provider) { setError('No Ethereum wallet found. Install MetaMask or Phantom (EVM).'); return }

    provider.request({ method: 'eth_requestAccounts', params: [] })
      .then((accounts) => {
        const addr = (accounts as string[])[0] ?? null
        setEthAddress(addr)
        setError(null)
        if (addr) {
          return getEthUsdcBalance(addr).then(setBalance).catch(() => setBalance(null))
        }
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Wallet connection rejected')
      })
  }, [chain])

  const balanceFormatted = balance !== null ? formatUsdc(balance) : null
  const parsedAmount     = amount ? parseUsdc(amount) : 0n
  const canDeposit       = parsedAmount > 0n && balance !== null && parsedAmount <= balance

  const handleMax = useCallback(() => {
    if (balance !== null) setAmount(formatUsdc(balance))
  }, [balance])

  const handleDeposit = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (!ethAddress) throw new Error('No Ethereum wallet connected')

      // Step 1+2: approve + depositForBurn on Ethereum
      setStep('approving')
      const burnTxHash = await bridgeEthereumToStarknet(ethAddress, starknetAddress, parsedAmount)

      // Step 3: wait for Circle attestation + relay to Starknet
      setStep('attesting')
      const token = await getAccessToken()
      const res = await fetch(`${WALLET_SERVICE_URL}/api/bridge/cctp-attest`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body:    JSON.stringify({ burnTxHash }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(err.error ?? `Attestation service error ${res.status}`)
      }
      const data = await res.json() as { starknetTxHash: string }
      setStep('done')
      setTxHash(data.starknetTxHash)
    } catch (e) {
      setStep('idle')
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [chain, ethAddress, starknetAddress, parsedAmount, WALLET_SERVICE_URL, getAccessToken])

  if (txHash) {
    return (
      <Backdrop onClose={onClose}>
        <Panel>
          <Header title="Deposit" onClose={onClose} />
          <div style={{ padding: '32px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 40 }}>✓</div>
            <div style={{ fontFamily: M, fontSize: 13, color: C.primary, fontWeight: 700 }}>USDC ARRIVED ON STARKNET</div>
            <div style={{ fontFamily: S, fontSize: 12, color: C.dim, lineHeight: 1.6, maxWidth: 280 }}>
              CCTP transfer complete. Your native USDC is now on Starknet Sepolia.
            </div>
            <div style={{
              fontFamily: M, fontSize: 10, color: C.muted,
              background: C.surfaceHi, border: `1px solid ${C.border}`,
              borderRadius: 4, padding: '6px 10px', wordBreak: 'break-all',
            }}>
              Starknet tx: {txHash.slice(0, 10)}…{txHash.slice(-8)}
            </div>
            <button onClick={onClose} style={btnStyle(true)}>Close</button>
          </div>
        </Panel>
      </Backdrop>
    )
  }

  return (
    <Backdrop onClose={onClose}>
      <Panel>
        <Header title="Deposit" onClose={onClose} />

        {/* Source chain */}
        <div style={{ display: 'flex', gap: 8, padding: '16px 20px 0' }}>
          <div style={{
            flex: 1,
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px',
            background: 'rgba(156,255,147,0.06)',
            border: `1px solid ${C.borderHi}`,
            borderRadius: 8,
          }}>
            <span style={{ fontSize: 22, lineHeight: 1 }}>⟠</span>
            <div>
              <div style={{ fontFamily: M, fontSize: 10, fontWeight: 700, color: C.primary, letterSpacing: '0.06em' }}>ETHEREUM</div>
              <div style={{ fontFamily: S, fontSize: 10, color: C.dim }}>via CCTP · ≈ 5 mins</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Asset */}
          <FieldBox label="Asset">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'linear-gradient(135deg, #2775CA, #4AABFE)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>$</div>
              <span style={{ fontFamily: S, fontSize: 15, fontWeight: 600, color: C.text }}>USDC</span>
              <span style={{ marginLeft: 'auto', fontFamily: M, fontSize: 10, color: C.dim }}>USD Coin</span>
            </div>
          </FieldBox>

          {/* Amount */}
          <div style={{ background: C.surfaceHi, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: S, fontSize: 12, color: C.dim, flexShrink: 0 }}>Amount</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(null) }}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontFamily: M,
                  fontSize: 15,
                  fontWeight: 700,
                  color: C.text,
                  textAlign: 'right',
                }}
              />
              <span style={{ fontFamily: M, fontSize: 10, color: C.dim }}>USDC</span>
              {chain === 'ethereum' && balance !== null && (
                <button
                  onClick={handleMax}
                  style={{
                    fontFamily: M, fontSize: 10, fontWeight: 700,
                    color: C.primary, background: 'rgba(156,255,147,0.08)',
                    border: `1px solid ${C.borderHi}`, borderRadius: 4,
                    padding: '3px 8px', cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  MAX
                </button>
              )}
            </div>
            {chain === 'ethereum' && (
              <div style={{
                borderTop: `1px solid ${C.border}`,
                padding: '6px 14px',
                display: 'flex', justifyContent: 'space-between',
              }}>
                <span style={{ fontFamily: S, fontSize: 11, color: C.dim }}>Available</span>
                <span style={{ fontFamily: M, fontSize: 11, color: balanceFormatted ? C.text : C.dim }}>
                  {balanceFormatted !== null ? `${balanceFormatted} USDC` : '—'}
                </span>
              </div>
            )}
          </div>

          {/* Summary */}
          <div style={{ background: C.surfaceHi, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SummaryRow label="You Receive" value={amount ? `≈ ${Number(amount).toFixed(2)} USDC` : '≈ 0.00 USDC'} accent={!!amount} />
            <SummaryRow label="Bridge Cost" value="0.00 USDC" dim />
            <div style={{ height: 1, background: C.border }} />
            <SummaryRow label="Est. Arrival" value={CHAINS.find(c => c.id === chain)?.time ?? '—'} />
          </div>

          {/* CCTP step status */}
          {step === 'attesting' && (
            <div style={{
              fontFamily: S, fontSize: 11, color: C.primary,
              background: 'rgba(156,255,147,0.06)', border: `1px solid ${C.borderHi}`,
              borderRadius: 6, padding: '8px 12px', lineHeight: 1.5,
            }}>
              Burn confirmed. Waiting for Circle attestation (~2 min)…
            </div>
          )}

          {/* Wallet service warning */}
          {!walletReady && (
            <div style={{
              fontFamily: S, fontSize: 11, color: '#f5a623',
              background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.25)',
              borderRadius: 6, padding: '8px 12px', lineHeight: 1.5,
            }}>
              ⚠ Starknet wallet not ready. Start the wallet service:<br />
              <code style={{ fontFamily: M, fontSize: 10 }}>cd services/privy-wallet && npm run dev</code>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              fontFamily: S, fontSize: 11, color: C.red,
              background: 'rgba(255,114,94,0.08)', border: '1px solid rgba(255,114,94,0.2)',
              borderRadius: 6, padding: '8px 12px', lineHeight: 1.5,
            }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={btnStyle(false)}>Cancel</button>
            <button
              onClick={handleDeposit}
              disabled={!walletReady || !canDeposit || loading}
              style={btnStyle(walletReady && canDeposit && !loading)}
            >
              {step === 'approving'   ? 'APPROVING…'            :
               step === 'confirming' ? 'CONFIRMING APPROVE…'  :
               step === 'burning'    ? 'BURNING USDC…'        :
               step === 'attesting'  ? 'WAITING FOR CIRCLE…'  :
               loading               ? 'BRIDGING…'            :
               'DEPOSIT FUNDS'}
            </button>
          </div>
        </div>
      </Panel>
    </Backdrop>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Backdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      {children}
    </div>,
    document.body,
  )
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: 380,
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
      }}
    >
      {children}
    </div>
  )
}

function Header({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 20px',
      borderBottom: `1px solid ${C.border}`,
    }}>
      <span style={{ fontFamily: M, fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: C.text }}>
        {title.toUpperCase()}
      </span>
      <button
        onClick={onClose}
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: C.dim, fontSize: 18, lineHeight: 1, padding: 2,
        }}
      >
        ×
      </button>
    </div>
  )
}

function FieldBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ background: C.surfaceHi, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontFamily: S, fontSize: 10, color: C.dim, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
      {children}
    </div>
  )
}

function SummaryRow({ label, value, accent, dim }: { label: string; value: string; accent?: boolean; dim?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontFamily: S, fontSize: 12, color: C.dim }}>{label}</span>
      <span style={{ fontFamily: M, fontSize: 12, fontWeight: 600, color: accent ? C.primary : dim ? C.dim : C.text }}>
        {value}
      </span>
    </div>
  )
}

function btnStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    fontFamily: M,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '11px 0',
    borderRadius: 8,
    border: active ? `1px solid ${C.primary}` : `1px solid ${C.border}`,
    background: active ? 'rgba(156,255,147,0.1)' : 'transparent',
    color: active ? C.primary : C.dim,
    cursor: active ? 'pointer' : 'default',
    transition: 'all 0.15s',
  }
}
