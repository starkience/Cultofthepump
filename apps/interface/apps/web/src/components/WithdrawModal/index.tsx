import { useCallback, useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { ModalShell } from 'components/ModalShell'
import { CallData } from 'starknet'
import { usePrivyExecute } from 'hooks/usePrivyExecute'
import EthereumIcon from 'assets/wallets/ethereum.svg?react'
import StarknetIcon from 'assets/networks/starknet.svg?react'
import UsdcIcon from 'assets/tokens/usdc.svg?react'
import {
  USDC_SN,
  CCTP_TOKEN_MESSENGER_L2_SEPOLIA,
  CCTP_ETH_DOMAIN,
  CCTP_SN_DOMAIN,
  CCTP_MESSAGE_TRANSMITTER_L1_SEPOLIA,
  formatUsdc,
  parseUsdc,
} from 'components/DepositModal/bridge'

// ─── Theme (matches DepositModal) ────────────────────────────────────────────
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

type Chain = 'starknet' | 'ethereum'

const STARKNET_RPC = import.meta.env.VITE_ALCHEMY_RPC_URL as string
const IRIS_API = 'https://iris-api-sandbox.circle.com'

// ReceiveMessage function selector
const RECEIVE_MESSAGE = '0x57ecfd28'

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getSnUsdcBalance(address: string): Promise<bigint> {
  const res = await fetch(STARKNET_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1,
      method: 'starknet_call',
      params: [{
        contract_address: USDC_SN,
        entry_point_selector: '0x2e4263afad30923c891518314c3c95dbe830a16874e8abc5777a9a20b54c76e', // balance_of
        calldata: [address],
      }, 'latest'],
    }),
  })
  const json = await res.json() as { result?: string[] }
  if (!json.result?.length) return 0n
  // u256 = low + high*2^128
  const low  = BigInt(json.result[0] ?? '0x0')
  const high = BigInt(json.result[1] ?? '0x0')
  return low + (high << 128n)
}

function isValidStarknetAddress(addr: string): boolean {
  return /^0x[0-9a-fA-F]{1,64}$/.test(addr)
}

function isValidEthAddress(addr: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(addr)
}

// ─── Build calls ─────────────────────────────────────────────────────────────

function buildTransferCalls(recipient: string, amount: bigint) {
  return [{
    contractAddress: USDC_SN,
    entrypoint: 'transfer',
    calldata: CallData.compile({
      recipient,
      amount: { low: amount, high: 0n },
    }),
  }]
}

function buildCctpBurnCalls(amount: bigint, ethRecipient: string, maxFee: bigint) {
  const mintRecipient = '0x' + ethRecipient.replace('0x', '').padStart(64, '0')
  const destCaller    = '0x' + '0'.padStart(64, '0')
  return [
    // 1. Approve Token Messenger to spend USDC
    {
      contractAddress: USDC_SN,
      entrypoint: 'approve',
      calldata: CallData.compile({
        spender: CCTP_TOKEN_MESSENGER_L2_SEPOLIA,
        amount: { low: amount, high: 0n },
      }),
    },
    // 2. deposit_for_burn on Token Messenger
    {
      contractAddress: CCTP_TOKEN_MESSENGER_L2_SEPOLIA,
      entrypoint: 'deposit_for_burn',
      calldata: CallData.compile({
        amount:                   { low: amount, high: 0n },
        destination_domain:       CCTP_ETH_DOMAIN,
        mint_recipient:           mintRecipient,
        burn_token:               USDC_SN,
        destination_caller:       destCaller,
        max_fee:                  { low: maxFee, high: 0n },
        min_finality_threshold:   1000,
      }),
    },
  ]
}

async function pollAttestationL2(burnTxHash: string, serviceUrl: string, token: string): Promise<{ message: string; attestation: string }> {
  const res = await fetch(`${serviceUrl}/api/bridge/cctp-attest-l2`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ burnTxHash }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(err.error ?? `Attestation service error ${res.status}`)
  }
  return await res.json() as { message: string; attestation: string }
}

type EthProvider = { request: (args: { method: string; params: unknown[] }) => Promise<unknown> }

async function relayOnEthereum(message: string, attestation: string): Promise<string> {
  const provider = (window as unknown as { ethereum?: EthProvider }).ethereum
  if (!provider) throw new Error('No Ethereum wallet found for L1 relay')

  // ABI-encode receiveMessage(bytes,bytes)
  const msgBytes = message.replace('0x', '')
  const attBytes = attestation.replace('0x', '')

  // Dynamic encoding: offset_msg(32) + offset_att(32) + msg_len(32) + msg_data + att_len(32) + att_data
  const msgLen   = (msgBytes.length / 2).toString(16).padStart(64, '0')
  const attLen   = (attBytes.length / 2).toString(16).padStart(64, '0')
  const msgPad   = msgBytes.padEnd(Math.ceil(msgBytes.length / 64) * 64, '0')
  const attPad   = attBytes.padEnd(Math.ceil(attBytes.length / 64) * 64, '0')

  const msgOffset = (64).toString(16).padStart(64, '0') // 0x40 = 64 bytes
  const attOffset = (64 + 32 + msgPad.length / 2).toString(16).padStart(64, '0')

  const data = `${RECEIVE_MESSAGE}${msgOffset}${attOffset}${msgLen}${msgPad}${attLen}${attPad}`

  const accounts = await provider.request({ method: 'eth_requestAccounts', params: [] }) as string[]
  const txHash = await provider.request({
    method: 'eth_sendTransaction',
    params: [{ from: accounts[0], to: CCTP_MESSAGE_TRANSMITTER_L1_SEPOLIA, data: `0x${data}` }],
  }) as string
  return txHash
}

// ─── Withdraw Modal ──────────────────────────────────────────────────────────
interface WithdrawModalProps {
  starknetAddress: string
  onClose: () => void
}

export function WithdrawModal({ starknetAddress, onClose }: WithdrawModalProps) {
  const { getAccessToken } = usePrivy()
  const { execute } = usePrivyExecute()

  const [chain, setChain]         = useState<Chain>('starknet')
  const [target, setTarget]       = useState('')
  const [amount, setAmount]       = useState('')
  const [balance, setBalance]     = useState<bigint | null>(null)
  const [loading, setLoading]     = useState(false)
  const [step, setStep]           = useState<'idle' | 'transferring' | 'burning' | 'attesting' | 'relaying' | 'done'>('idle')
  const [txHash, setTxHash]       = useState<string | null>(null)
  const [error, setError]         = useState<string | null>(null)

  const WALLET_SERVICE_URL = (import.meta as unknown as { env: Record<string, string> }).env.VITE_PRIVY_WALLET_SERVICE_URL ?? 'http://localhost:3002'

  // Fetch Starknet USDC balance
  useEffect(() => {
    if (!starknetAddress || starknetAddress === '0x0') return
    getSnUsdcBalance(starknetAddress).then(setBalance).catch(() => setBalance(null))
  }, [starknetAddress])

  const balanceFormatted = balance !== null ? formatUsdc(balance) : null
  const parsedAmount     = amount ? parseUsdc(amount) : 0n
  const validTarget      = chain === 'starknet' ? isValidStarknetAddress(target) : isValidEthAddress(target)
  const canWithdraw      = parsedAmount > 0n && validTarget && balance !== null && parsedAmount <= balance && !loading

  const handleMax = useCallback(() => {
    if (balance !== null) setAmount(formatUsdc(balance))
  }, [balance])

  const handleWithdraw = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (chain === 'starknet') {
        setStep('transferring')
        const calls = buildTransferCalls(target, parsedAmount)
        const hash = await execute(calls)
        setStep('done')
        setTxHash(hash)
      } else {
        // Ethereum bridge: burn on SN, attest, relay on L1
        setStep('burning')
        const calls = buildCctpBurnCalls(parsedAmount, target, 0n) // testnet fee = 0
        const snTxHash = await execute(calls)

        setStep('attesting')
        const token = await getAccessToken()
        const { message, attestation } = await pollAttestationL2(snTxHash, WALLET_SERVICE_URL, token!)

        setStep('relaying')
        const ethTxHash = await relayOnEthereum(message, attestation)
        setStep('done')
        setTxHash(ethTxHash)
      }
    } catch (e) {
      setStep('idle')
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [chain, target, parsedAmount, execute, WALLET_SERVICE_URL, getAccessToken])

  // ── Done state ──────────────────────────────────────────────────────
  if (txHash) {
    return (
      <ModalShell open={true} onClose={onClose}>
          <Header title="Withdraw" onClose={onClose} />
          <div style={{ padding: '32px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 40 }}>✓</div>
            <div style={{ fontFamily: M, fontSize: 13, color: C.primary, fontWeight: 700 }}>
              {chain === 'starknet' ? 'USDC TRANSFERRED' : 'USDC BRIDGED TO ETHEREUM'}
            </div>
            <div style={{ fontFamily: S, fontSize: 12, color: C.dim, lineHeight: 1.6, maxWidth: 280 }}>
              {chain === 'starknet'
                ? 'Your USDC has been sent to the target Starknet address.'
                : 'CCTP bridge complete. USDC has been minted on Ethereum.'}
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

  // ── Main form ───────────────────────────────────────────────────────
  return (
    <ModalShell open={true} onClose={onClose}>
        <Header title="Withdraw" onClose={onClose} />

        {/* Chain selector */}
        <div style={{ display: 'flex', gap: 8, padding: '16px 20px 0' }}>
          {([
            { id: 'starknet'  as Chain, label: 'STARKNET',  icon: <StarknetIcon style={{ width: 22, height: 22 }} /> },
            { id: 'ethereum'  as Chain, label: 'ETHEREUM',  icon: <EthereumIcon style={{ width: 22, height: 22 }} /> },
          ]).map(c => (
            <button
              key={c.id}
              onClick={() => { setChain(c.id); setTarget(''); setAmount(''); setError(null) }}
              style={{
                flex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '12px 8px',
                background: chain === c.id ? 'rgba(156,255,147,0.06)' : 'transparent',
                border: `1px solid ${chain === c.id ? C.borderHi : C.border}`,
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {c.icon}
              <span style={{ fontFamily: M, fontSize: 10, fontWeight: 700, color: chain === c.id ? C.primary : C.dim, letterSpacing: '0.06em' }}>
                {c.label}
              </span>
            </button>
          ))}
        </div>

        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Destination address */}
          <FieldBox label={chain === 'starknet' ? 'Starknet Address' : 'Ethereum Address'}>
            <input
              type="text"
              placeholder={chain === 'starknet' ? '0x0123…abcd' : '0x0123…abcd'}
              value={target}
              onChange={e => { setTarget(e.target.value); setError(null) }}
              style={{
                width: '100%', background: 'transparent', border: 'none', outline: 'none',
                fontFamily: M, fontSize: 12, color: C.text, padding: 0,
              }}
            />
            {target && !validTarget && (
              <span style={{ fontFamily: S, fontSize: 10, color: C.red, marginTop: 2 }}>
                Invalid {chain === 'starknet' ? 'Starknet' : 'Ethereum'} address
              </span>
            )}
          </FieldBox>

          {/* Amount */}
          <div style={{ background: C.surfaceHi, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: S, fontSize: 12, color: C.dim, flexShrink: 0 }}>Amount</span>
              <input
                type="number" min="0" step="0.01" placeholder="0.00"
                value={amount}
                onChange={e => { setAmount(e.target.value); setError(null) }}
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
                }}>
                  MAX
                </button>
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
            <SummaryRow label="Recipient Receives" value={amount ? `≈ ${Number(amount).toFixed(2)} USDC` : '≈ 0.00 USDC'} accent={!!amount} />
            <SummaryRow label="Fee" value="Free" dim />
            <div style={{ height: 1, background: C.border }} />
            <SummaryRow label="Method" value={chain === 'starknet' ? 'Direct transfer' : 'CCTP v2 bridge'} />
            <SummaryRow label="Est. Time" value={chain === 'starknet' ? '1-2 seconds' : '≈ 5 mins'} />
          </div>

          {/* Step status */}
          {step === 'attesting' && (
            <div style={{
              fontFamily: S, fontSize: 11, color: C.primary,
              background: 'rgba(156,255,147,0.06)', border: `1px solid ${C.borderHi}`,
              borderRadius: 6, padding: '8px 12px', lineHeight: 1.5,
            }}>
              Burn confirmed. Waiting for Circle attestation (~2 min)…
            </div>
          )}
          {step === 'relaying' && (
            <div style={{
              fontFamily: S, fontSize: 11, color: C.primary,
              background: 'rgba(156,255,147,0.06)', border: `1px solid ${C.borderHi}`,
              borderRadius: 6, padding: '8px 12px', lineHeight: 1.5,
            }}>
              Attestation received. Please confirm the L1 relay in your Ethereum wallet…
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
              onClick={handleWithdraw}
              disabled={!canWithdraw}
              style={btnStyle(canWithdraw)}
            >
              {step === 'transferring' ? 'SENDING…'          :
               step === 'burning'     ? 'BURNING USDC…'      :
               step === 'attesting'   ? 'WAITING CIRCLE…'    :
               step === 'relaying'    ? 'RELAY ON L1…'       :
               loading                ? 'PROCESSING…'        :
               chain === 'ethereum'   ? 'BRIDGE TO ETHEREUM' :
               'WITHDRAW'}
            </button>
          </div>
        </div>
    </ModalShell>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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
