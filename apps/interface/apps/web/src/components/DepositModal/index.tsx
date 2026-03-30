import { useCallback, useEffect, useState } from 'react'
import { CallData } from 'starknet'
import { ModalShell } from 'components/ModalShell'
import { useWallet } from 'context/WalletContext'
import {
  bridgeEthereumToStarknet,
  formatUsdc,
  getEthUsdcBalance,
  parseUsdc,
  USDC_SN,
} from './bridge'
import EthereumIcon from 'assets/wallets/ethereum.svg?react'
import ArgentIcon from 'assets/wallets/argent-x.svg?react'
import BraavosIcon from 'assets/wallets/braavos.svg?react'
import UsdcIcon from 'assets/tokens/usdc.svg?react'

// ─── Pending deposit tracking ──────────────────────────────────────────────────
const PENDING_DEPOSIT_KEY = 'cotp_pending_deposit'

export interface PendingDeposit {
  amount: string     // human-readable e.g. "5.00"
  source: 'ethereum' | 'starknet'
  startedAt: number  // Date.now()
  burnTxHash?: string
}

export function getPendingDeposit(): PendingDeposit | null {
  try { return JSON.parse(localStorage.getItem(PENDING_DEPOSIT_KEY) ?? 'null') }
  catch { return null }
}

export function setPendingDeposit(d: PendingDeposit) {
  localStorage.setItem(PENDING_DEPOSIT_KEY, JSON.stringify(d))
}

export function clearPendingDeposit() {
  localStorage.removeItem(PENDING_DEPOSIT_KEY)
}

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

const STARKNET_RPC = import.meta.env.VITE_ALCHEMY_RPC_URL as string

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getSnUsdcBalance(address: string): Promise<bigint> {
  const res = await fetch(STARKNET_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1,
      method: 'starknet_call',
      params: [{
        contract_address: USDC_SN,
        entry_point_selector: '0x2e4263afad30923c891518314c3c95dbe830a16874e8abc5777a9a20b54c76e',
        calldata: [address],
      }, 'latest'],
    }),
  })
  const json = await res.json() as { result?: string[] }
  if (!json.result?.length) return 0n
  const low  = BigInt(json.result[0] ?? '0x0')
  const high = BigInt(json.result[1] ?? '0x0')
  return low + (high << 128n)
}

// ─── Deposit Modal ────────────────────────────────────────────────────────────
interface DepositModalProps {
  starknetAddress: string
  onClose: () => void
}

export function DepositModal({ starknetAddress, onClose }: DepositModalProps) {
  const { mode, externalAddress, getAuthToken, execute, connectorName } = useWallet()
  const walletReady = !!starknetAddress && starknetAddress !== '0x0'

  // Starknet wallet users deposit from their external SN wallet
  // EVM wallet users deposit from Ethereum via CCTP
  const isStarknetDeposit = mode === 'starknet' && !!externalAddress

  const [amount, setAmount]         = useState('')
  const [balance, setBalance]       = useState<bigint | null>(null)
  const [ethAddress, setEthAddress] = useState<string | null>(null)
  const [loading, setLoading]       = useState(false)
  const [step, setStep]             = useState<'idle' | 'approving' | 'transferring' | 'attesting' | 'done'>('idle')
  const [txHash, setTxHash]         = useState<string | null>(null)
  const [error, setError]           = useState<string | null>(null)

  const WALLET_SERVICE_URL = (import.meta as unknown as { env: Record<string, string> }).env.VITE_PRIVY_WALLET_SERVICE_URL ?? 'http://localhost:3002'

  // Fetch balance based on deposit mode
  useEffect(() => {
    if (isStarknetDeposit) {
      // Fetch USDC balance from the user's external Starknet wallet
      getSnUsdcBalance(externalAddress!).then(setBalance).catch(() => setBalance(null))
    } else {
      // Ethereum: request EVM accounts and fetch L1 USDC balance
      const provider = (window as unknown as { ethereum?: { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum
      if (!provider) { setError('No Ethereum wallet found.'); return }
      provider.request({ method: 'eth_requestAccounts', params: [] })
        .then((accounts) => {
          const addr = (accounts as string[])[0] ?? null
          setEthAddress(addr)
          setError(null)
          if (addr) return getEthUsdcBalance(addr).then(setBalance).catch(() => setBalance(null))
        })
        .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Wallet connection rejected'))
    }
  }, [isStarknetDeposit, externalAddress])

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
      if (isStarknetDeposit) {
        // ── Starknet → Privy wallet: simple USDC transfer via user's ArgentX/Braavos ──
        setStep('transferring')

        // Build transfer call from external wallet to Privy wallet
        // This goes through the user's browser wallet (ArgentX/Braavos signs it)
        const transferCall = {
          contractAddress: USDC_SN,
          entrypoint: 'transfer',
          calldata: CallData.compile({
            recipient: starknetAddress,
            amount: { low: parsedAmount, high: 0n },
          }),
        }

        // Send via the user's connected Starknet wallet (not the Privy paymaster)
        const win = window as unknown as Record<string, unknown>
        type SnWallet = { request: (p: { type: string; params?: unknown }) => Promise<unknown> }
        const wallet = (win.starknet_argentX ?? win.starknet_braavos ?? win.starknet) as SnWallet | undefined
        if (!wallet) throw new Error('Starknet wallet not found')

        const result = await wallet.request({
          type: 'wallet_addInvokeTransaction',
          params: { calls: [transferCall] },
        }) as { transaction_hash: string }

        setStep('done')
        setTxHash(result.transaction_hash)
      } else {
        // ── Ethereum → Privy wallet: CCTP bridge ──
        if (!ethAddress) throw new Error('No Ethereum wallet connected')
        setStep('approving')
        const burnTxHash = await bridgeEthereumToStarknet(ethAddress, starknetAddress, parsedAmount)

        // Track the pending deposit so Portfolio can show it
        setPendingDeposit({
          amount: Number(amount).toFixed(2),
          source: 'ethereum',
          startedAt: Date.now(),
          burnTxHash,
        })

        setStep('attesting')
        const token = await getAuthToken()
        const res = await fetch(`${WALLET_SERVICE_URL}/api/bridge/cctp-attest`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ burnTxHash }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({})) as { error?: string }
          throw new Error(err.error ?? `Attestation error ${res.status}`)
        }
        const data = await res.json() as { starknetTxHash: string }
        clearPendingDeposit()
        setStep('done')
        setTxHash(data.starknetTxHash)
      }
    } catch (e) {
      setStep('idle')
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [isStarknetDeposit, ethAddress, starknetAddress, parsedAmount, WALLET_SERVICE_URL, getAuthToken])

  // ── Done state ──
  if (txHash) {
    return (
      <ModalShell open={true} onClose={onClose}>
          <Header title="Deposit" onClose={onClose} />
          <div style={{ padding: '32px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 40 }}>✓</div>
            <div style={{ fontFamily: M, fontSize: 13, color: C.primary, fontWeight: 700 }}>
              {isStarknetDeposit ? 'USDC DEPOSITED' : 'USDC ARRIVED ON STARKNET'}
            </div>
            <div style={{ fontFamily: S, fontSize: 12, color: C.dim, lineHeight: 1.6, maxWidth: 280 }}>
              {isStarknetDeposit
                ? 'USDC transferred from your Starknet wallet to your Cult wallet.'
                : 'CCTP transfer complete. Your native USDC is now on Starknet Sepolia.'}
            </div>
            <div style={{
              fontFamily: M, fontSize: 10, color: C.muted,
              background: C.surfaceHi, border: `1px solid ${C.border}`,
              borderRadius: 4, padding: '6px 10px', wordBreak: 'break-all',
            }}>
              Tx: {txHash.slice(0, 10)}…{txHash.slice(-8)}
            </div>
            <button onClick={onClose} style={btnStyle(true)}>Close</button>
          </div>
      </ModalShell>
    )
  }

  return (
    <ModalShell open={true} onClose={onClose}>
        <Header title="Deposit" onClose={onClose} />

        {/* Source indicator */}
        <div style={{ display: 'flex', gap: 8, padding: '16px 20px 0' }}>
          <div style={{
            flex: 1,
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px',
            background: 'rgba(156,255,147,0.06)',
            border: `1px solid ${C.borderHi}`,
            borderRadius: 8,
          }}>
            {isStarknetDeposit
              ? (connectorName?.toLowerCase().includes('braavos')
                  ? <BraavosIcon style={{ width: 24, height: 24 }} />
                  : <ArgentIcon style={{ width: 24, height: 24 }} />)
              : <EthereumIcon style={{ width: 24, height: 24 }} />
            }
            <div>
              <div style={{ fontFamily: M, fontSize: 10, fontWeight: 700, color: C.primary, letterSpacing: '0.06em' }}>
                {isStarknetDeposit ? (connectorName ?? 'Starknet') : 'ETHEREUM'}
              </div>
              <div style={{ fontFamily: S, fontSize: 10, color: C.dim }}>
                {isStarknetDeposit ? 'Direct transfer · 1-2 seconds' : 'via CCTP · ≈ 5 mins'}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Asset */}
          <FieldBox label="Asset">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <UsdcIcon style={{ width: 24, height: 24, flexShrink: 0 }} />
              <span style={{ fontFamily: S, fontSize: 15, fontWeight: 600, color: C.text }}>USDC</span>
              <span style={{ marginLeft: 'auto', fontFamily: M, fontSize: 10, color: C.dim }}>USD Coin</span>
            </div>
          </FieldBox>

          {/* Amount */}
          <div style={{ background: C.surfaceHi, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: S, fontSize: 12, color: C.dim, flexShrink: 0 }}>Amount</span>
              <input
                type="number" min="0" step="0.01" placeholder="0.00"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(null) }}
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontFamily: M, fontSize: 15, fontWeight: 700, color: C.text, textAlign: 'right',
                }}
              />
              <UsdcIcon style={{ width: 16, height: 16, flexShrink: 0 }} />
              {balance !== null && (
                <button onClick={handleMax} style={{
                  fontFamily: M, fontSize: 10, fontWeight: 700,
                  color: C.primary, background: 'rgba(156,255,147,0.08)',
                  border: `1px solid ${C.borderHi}`, borderRadius: 4,
                  padding: '3px 8px', cursor: 'pointer', flexShrink: 0,
                }}>MAX</button>
              )}
            </div>
            <div style={{ borderTop: `1px solid ${C.border}`, padding: '6px 14px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: S, fontSize: 11, color: C.dim }}>Available</span>
              <span style={{ fontFamily: M, fontSize: 11, color: balanceFormatted ? C.text : C.dim }}>
                {balanceFormatted !== null ? `${balanceFormatted} USDC` : '—'}
              </span>
            </div>
          </div>

          {/* Summary */}
          <div style={{ background: C.surfaceHi, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SummaryRow label="You Receive" value={amount ? `≈ ${Number(amount).toFixed(2)} USDC` : '≈ 0.00 USDC'} accent={!!amount} />
            <SummaryRow label="Fee" value="Free" dim />
            <div style={{ height: 1, background: C.border }} />
            <SummaryRow label="Est. Arrival" value={isStarknetDeposit ? '1-2 seconds' : '≈ 5 mins'} />
          </div>

          {/* Step status */}
          {step === 'transferring' && (
            <StatusBanner text="Confirm the transfer in your Starknet wallet…" />
          )}
          {step === 'attesting' && (
            <StatusBanner text="Burn confirmed. Waiting for Circle attestation (~2 min)…" />
          )}

          {/* Wallet warning */}
          {!walletReady && (
            <div style={{
              fontFamily: S, fontSize: 11, color: '#f5a623',
              background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.25)',
              borderRadius: 6, padding: '8px 12px', lineHeight: 1.5,
            }}>
              Cult wallet not ready. Start the wallet service.
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
              {step === 'approving'    ? 'APPROVING…'           :
               step === 'transferring' ? 'TRANSFERRING…'        :
               step === 'attesting'    ? 'WAITING CIRCLE…'      :
               loading                 ? 'PROCESSING…'          :
               'DEPOSIT'}
            </button>
          </div>
        </div>
    </ModalShell>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBanner({ text }: { text: string }) {
  return (
    <div style={{
      fontFamily: S, fontSize: 11, color: C.primary,
      background: 'rgba(156,255,147,0.06)', border: `1px solid ${C.borderHi}`,
      borderRadius: 6, padding: '8px 12px', lineHeight: 1.5,
    }}>
      {text}
    </div>
  )
}

function Header({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 20px', borderBottom: `1px solid ${C.border}`,
    }}>
      <span style={{ fontFamily: M, fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: C.text }}>
        {title.toUpperCase()}
      </span>
      <button onClick={onClose} style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: C.dim, fontSize: 18, lineHeight: 1, padding: 2,
      }}>×</button>
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
      <span style={{ fontFamily: M, fontSize: 12, fontWeight: 600, color: accent ? C.primary : dim ? C.dim : C.text }}>{value}</span>
    </div>
  )
}

function btnStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1, fontFamily: M, fontSize: 11, fontWeight: 700,
    letterSpacing: '0.08em', textTransform: 'uppercase',
    padding: '11px 0', borderRadius: 8,
    border: active ? `1px solid ${C.primary}` : `1px solid ${C.border}`,
    background: active ? 'rgba(156,255,147,0.1)' : 'transparent',
    color: active ? C.primary : C.dim,
    cursor: active ? 'pointer' : 'default',
    transition: 'all 0.15s',
  }
}
