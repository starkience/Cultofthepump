import { useCallback, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { BlockTag } from 'starknet'
import { useReadContract } from '@starknet-react/core'
import { useStarknetWallet } from 'components/PrivyConnect/useStarknetWallet'
import { usePrivyExecute } from 'hooks/usePrivyExecute'
import { useUserActivity } from 'cotp/src/data/apiClients/cotpIndexerApi/cotpIndexerApiClient'
import { STRK_SEPOLIA } from 'cotp/src/constants/tokens'
import { STAKING_ADDRESS, StakingABI, ERC20ABI } from 'cotp/src/constants/contracts'
import { formatWei, formatStrk } from 'cotp/src/utils/format'
// AVNU Sepolia swap API — called directly (no SDK needed)
const AVNU_API = 'https://sepolia.api.avnu.fi'
import type { UserTradeRecord } from 'cotp/src/data/apiClients/cotpIndexerApi/cotpIndexerApiClient'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:             '#0e0e0e',
  surface:        '#131313',
  surfaceHi:      '#1a1a1a',
  surfaceHighest: '#222222',
  primary:        '#9cff93',
  primaryDim:     'rgba(156,255,147,0.06)',
  primaryBorder:  'rgba(156,255,147,0.18)',
  secondary:      '#ff725e',
  secondaryDim:   'rgba(255,114,94,0.06)',
  secondaryBorder:'rgba(255,114,94,0.2)',
  text:           '#ffffff',
  muted:          '#ababab',
  dim:            'rgba(255,255,255,0.28)',
  border:         'rgba(255,255,255,0.05)',
  borderSubtle:   'rgba(156,255,147,0.07)',
}
const M = "'JetBrains Mono', monospace"
const H = 'Newsreader, Georgia, serif'

// Starknet Sepolia USDC
const USDC_SN_SEPOLIA = '0x0512feac6339ff7889822cb5aa2a86c848e9d392bb0e3e237c008674feed8343'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}
function formatUsdc(raw: bigint): string {
  const whole = raw / 1_000_000n
  const frac  = raw % 1_000_000n
  return `${whole}.${frac.toString().padStart(6, '0').slice(0, 2)}`
}

// ─── Staking row ──────────────────────────────────────────────────────────────
interface StakingRowProps {
  tokenAddress: string
  tokenSymbol:  string
  staker:       string
}
function StakingRow({ tokenAddress, tokenSymbol, staker }: StakingRowProps) {
  const { data: stakedRaw } = useReadContract({
    abi: StakingABI, address: STAKING_ADDRESS as `0x${string}`,
    functionName: 'staked_balance',
    args: [tokenAddress as `0x${string}`, staker as `0x${string}`],
    blockIdentifier: BlockTag.LATEST, refetchInterval: 30_000,
  })
  const { data: earnedRaw } = useReadContract({
    abi: StakingABI, address: STAKING_ADDRESS as `0x${string}`,
    functionName: 'earned',
    args: [tokenAddress as `0x${string}`, staker as `0x${string}`],
    blockIdentifier: BlockTag.LATEST, refetchInterval: 30_000,
  })
  const staked = (stakedRaw as bigint | undefined) ?? 0n
  const earned = (earnedRaw as bigint | undefined) ?? 0n
  if (staked === 0n) return null

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '12px 0', borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{ flex: 1 }}>
        <Link to={`/trade/${tokenAddress}`} style={{ fontFamily: M, fontSize: 12, fontWeight: 700, color: C.primary, textDecoration: 'none' }}>
          {tokenSymbol.toUpperCase()}
        </Link>
        <div style={{ fontFamily: M, fontSize: 11, color: C.muted, marginTop: 2 }}>
          {formatWei(staked.toString())} staked
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: M, fontSize: 12, fontWeight: 700, color: earned > 0n ? C.primary : C.muted }}>
          {formatStrk(earned.toString())}
        </div>
        <div style={{ fontFamily: M, fontSize: 10, color: C.dim }}>yield</div>
      </div>
    </div>
  )
}

// ─── Portfolio page ───────────────────────────────────────────────────────────
export default function Portfolio() {
  const { wallet, loading: walletLoading } = useStarknetWallet()
  const address = wallet?.address

  const { data: strkRaw } = useReadContract({
    abi: ERC20ABI, address: STRK_SEPOLIA.address as `0x${string}`,
    functionName: 'balance_of', args: address ? [address] : undefined,
    enabled: Boolean(address), blockIdentifier: BlockTag.LATEST, refetchInterval: 15_000,
  })
  const { data: usdcRaw } = useReadContract({
    abi: ERC20ABI, address: USDC_SN_SEPOLIA as `0x${string}`,
    functionName: 'balance_of', args: address ? [address] : undefined,
    enabled: Boolean(address), blockIdentifier: BlockTag.LATEST, refetchInterval: 15_000,
  })
  const strkBalance = (strkRaw as bigint | undefined) ?? 0n
  const usdcBalance = (usdcRaw as bigint | undefined) ?? 0n

  const { data: trades = [], isLoading: tradesLoading } = useUserActivity(address, 100)

  const cultHoldings = useMemo(() => {
    const map = new Map<string, {
      symbol: string; name: string; address: string
      buyTokens: bigint; sellTokens: bigint
      strkIn: bigint; strkOut: bigint
    }>()
    for (const t of trades) {
      if (!t.tokenContractAddress) continue
      const existing = map.get(t.tokenContractAddress) ?? {
        symbol: t.tokenSymbol, name: t.tokenName, address: t.tokenContractAddress,
        buyTokens: 0n, sellTokens: 0n, strkIn: 0n, strkOut: 0n,
      }
      const tq = BigInt(t.tokenQty || '0')
      const sq = BigInt(t.strkQty  || '0')
      if (t.side === 0) { existing.buyTokens += tq; existing.strkIn  += sq }
      else              { existing.sellTokens += tq; existing.strkOut += sq }
      map.set(t.tokenContractAddress, existing)
    }
    return [...map.values()].filter(h => h.buyTokens > h.sellTokens)
  }, [trades])

  const uniqueCults = useMemo(() => {
    const seen = new Map<string, string>()
    for (const t of trades) {
      if (t.tokenContractAddress && !seen.has(t.tokenContractAddress))
        seen.set(t.tokenContractAddress, t.tokenSymbol)
    }
    return [...seen.entries()].map(([addr, symbol]) => ({ addr, symbol }))
  }, [trades])

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 60px' }}>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 40 }}>
        <h1 style={{ fontFamily: M, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: C.primary, margin: 0 }}>
          PORTFOLIO
        </h1>
        {address && (
          <span style={{ fontFamily: M, fontSize: 11, color: C.dim, letterSpacing: '0.06em' }}>
            {shortAddr(address)}
          </span>
        )}
      </div>

      {walletLoading ? (
        <LoadingRows />
      ) : !address ? (
        <EmptyState message="Sign in to view your portfolio." subtext="The ritual awaits." />
      ) : (
        <>
          {/* ── Wallet cards ────────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
            <StatCard
              label="USDC Balance"
              value={formatUsdc(usdcBalance)}
              unit="USDC"
              accent={C.primary}
              icon="monetization_on"
            />
            <StatCard
              label="STRK Balance"
              value={formatWei(strkBalance.toString())}
              unit="STRK"
              accent="rgba(72,72,72,0.8)"
              dim
            />
            <StatCard
              label="Active Network"
              value="Sepolia"
              unit="testnet"
              accent={C.secondary}
              dim
              small
            />
          </div>

          {/* ── My Cults + Conviction ───────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, marginBottom: 24 }}>

            {/* My Cults */}
            <div>
              <SectionHeading title="My Cults" accentColor={C.primary} />
              <Panel minHeight={192}>
                {tradesLoading ? (
                  <LoadingRows />
                ) : cultHoldings.length === 0 ? (
                  <EmptyState message="No active cult positions." subtext="Start believing." />
                ) : (
                  <>
                    <TableHeader cols="1fr 140px 140px" labels={['CULT', 'HOLDING', 'NET STRK']} />
                    {cultHoldings.map(h => {
                      const net      = h.buyTokens - h.sellTokens
                      const strkNet  = h.strkIn - h.strkOut
                      const isCost   = strkNet >= 0n
                      return (
                        <div key={h.address} style={{
                          display: 'grid', gridTemplateColumns: '1fr 140px 140px',
                          padding: '11px 0', borderBottom: `1px solid ${C.border}`, alignItems: 'center',
                        }}>
                          <div>
                            <Link to={`/trade/${h.address}`} style={{ fontFamily: M, fontSize: 12, fontWeight: 700, color: C.primary, textDecoration: 'none' }}>
                              {h.symbol.toUpperCase()}
                            </Link>
                            <span style={{ fontSize: 11, color: C.muted, marginLeft: 8 }}>{h.name}</span>
                          </div>
                          <span style={{ fontFamily: M, fontSize: 12, color: C.text }}>{formatWei(net.toString())}</span>
                          <span style={{ fontFamily: M, fontSize: 12, color: isCost ? C.secondary : C.primary }}>
                            {isCost ? '−' : '+'}{formatWei((isCost ? strkNet : -strkNet).toString())} STRK
                          </span>
                        </div>
                      )
                    })}
                  </>
                )}
              </Panel>
            </div>

            {/* Conviction */}
            <div>
              <SectionHeading title="Conviction" accentColor={C.secondary} />
              <Panel minHeight={192}>
                {tradesLoading ? (
                  <LoadingRows />
                ) : uniqueCults.length === 0 ? (
                  <EmptyState
                    message="Stake tokens to earn yield from trading fees."
                    subtext="Initialize staking."
                    wide
                  />
                ) : (
                  <>
                    {uniqueCults.map(({ addr, symbol }) => (
                      <StakingRow key={addr} tokenAddress={addr} tokenSymbol={symbol} staker={address!} />
                    ))}
                  </>
                )}
              </Panel>
            </div>
          </div>

          {/* ── Swap USDC → STRK ──────────────────────────────────────── */}
          <SwapPanel address={address} usdcBalance={usdcBalance} />

          {/* ── Transaction Log ─────────────────────────────────────────── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
              <SectionHeading title="Transaction Log" accentColor="rgba(255,255,255,0.2)" />
              <span style={{ fontFamily: M, fontSize: 9, color: C.dim, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                Last {Math.min(trades.length, 50)} Rituals
              </span>
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              {/* Table header row */}
              <div style={{
                display: 'grid', gridTemplateColumns: '80px 1fr 150px 150px 100px',
                padding: '10px 16px',
                background: C.surfaceHi,
                borderBottom: `1px solid ${C.border}`,
              }}>
                {['TYPE', 'CULT', 'TOKENS', 'STRK', 'BLOCK'].map(h => (
                  <span key={h} style={{ fontFamily: M, fontSize: 9, color: C.dim, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                    {h}
                  </span>
                ))}
              </div>

              {/* Rows */}
              {tradesLoading ? (
                <div style={{ padding: '20px 16px' }}><LoadingRows /></div>
              ) : trades.length === 0 ? (
                <div style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <EmptyState message="No transactions yet." subtext="" />
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  {trades.slice(0, 50).map((t: UserTradeRecord) => {
                    const isBuy = t.side === 0
                    return (
                      <div key={t.id} style={{
                        display: 'grid', gridTemplateColumns: '80px 1fr 150px 150px 100px',
                        padding: '9px 16px', borderBottom: `1px solid ${C.border}`, alignItems: 'center',
                        background: isBuy ? C.primaryDim : 'transparent',
                      }}>
                        <span style={{
                          fontFamily: M, fontSize: 10, fontWeight: 700,
                          color: isBuy ? C.primary : C.secondary,
                          background: isBuy ? 'rgba(156,255,147,0.08)' : 'rgba(255,114,94,0.08)',
                          border: `1px solid ${isBuy ? C.primaryBorder : C.secondaryBorder}`,
                          padding: '2px 7px', display: 'inline-block',
                        }}>
                          {isBuy ? 'BELIEVE' : 'SIN'}
                        </span>
                        <div style={{ overflow: 'hidden' }}>
                          {t.tokenContractAddress ? (
                            <Link to={`/trade/${t.tokenContractAddress}`} style={{ fontFamily: M, fontSize: 11, fontWeight: 700, color: C.primary, textDecoration: 'none' }}>
                              {t.tokenSymbol}
                            </Link>
                          ) : (
                            <span style={{ fontFamily: M, fontSize: 11, color: C.muted }}>—</span>
                          )}
                        </div>
                        <span style={{ fontFamily: M, fontSize: 11, color: C.text }}>{formatWei(t.tokenQty)}</span>
                        <span style={{ fontFamily: M, fontSize: 11, color: C.text }}>{formatWei(t.strkQty)} STRK</span>
                        <span style={{ fontFamily: M, fontSize: 11, color: C.muted }}>#{t.blockNumber}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Swap USDC → STRK ─────────────────────────────────────────────────────────

function parseUsdcInput(val: string): bigint | null {
  try {
    const num = parseFloat(val)
    if (!num || num <= 0 || isNaN(num)) return null
    const [int, frac = ''] = val.split('.')
    return BigInt(int) * 1_000_000n + BigInt(frac.padEnd(6, '0').slice(0, 6))
  } catch { return null }
}

function SwapPanel({ address, usdcBalance }: { address: string; usdcBalance: bigint }) {
  const [amount, setAmount]   = useState('')
  const [quote, setQuote]     = useState<string | null>(null)
  const [quoting, setQuoting] = useState(false)
  const [swapStatus, setSwapStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [swapError, setSwapError]   = useState<string | null>(null)
  const [swapTx, setSwapTx]         = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const { execute } = usePrivyExecute()

  const parsedAmount = useMemo(() => parseUsdcInput(amount), [amount])

  const fetchQuote = useCallback(async (sellAmount: bigint) => {
    setQuoting(true)
    setQuote(null)
    try {
      const params = new URLSearchParams({
        sellTokenAddress: USDC_SN_SEPOLIA,
        buyTokenAddress:  STRK_SEPOLIA.address,
        sellAmount:       `0x${sellAmount.toString(16)}`,
        takerAddress:     address,
        size:             '1',
      })
      const res = await fetch(`${AVNU_API}/swap/v2/quotes?${params}`)
      if (!res.ok) throw new Error(`Quote ${res.status}`)
      const quotes = await res.json() as Array<{ quoteId: string; buyAmount: string }>
      if (quotes.length > 0) {
        setQuote(formatWei(BigInt(quotes[0].buyAmount).toString()))
      }
    } catch {
      setQuote(null)
    } finally {
      setQuoting(false)
    }
  }, [address])

  const onAmountChange = useCallback((val: string) => {
    setAmount(val)
    setSwapStatus('idle')
    setSwapError(null)
    setSwapTx(null)
    clearTimeout(debounceRef.current)
    const parsed = parseUsdcInput(val)
    if (!parsed) { setQuote(null); return }
    debounceRef.current = setTimeout(() => void fetchQuote(parsed), 400)
  }, [fetchQuote])

  const handleSwap = useCallback(async () => {
    if (!parsedAmount || swapStatus === 'pending') return
    setSwapStatus('pending')
    setSwapError(null)
    try {
      // 1. Get fresh quote
      const params = new URLSearchParams({
        sellTokenAddress: USDC_SN_SEPOLIA,
        buyTokenAddress:  STRK_SEPOLIA.address,
        sellAmount:       `0x${parsedAmount.toString(16)}`,
        takerAddress:     address,
        size:             '1',
      })
      const qRes = await fetch(`${AVNU_API}/swap/v2/quotes?${params}`)
      if (!qRes.ok) throw new Error(`Quote ${qRes.status}`)
      const quotes = await qRes.json() as Array<{ quoteId: string; buyAmount: string }>
      if (!quotes.length) throw new Error('No swap route found')

      // 2. Build swap calls from quote
      const bRes = await fetch(`${AVNU_API}/swap/v2/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId:      quotes[0].quoteId,
          takerAddress: address,
          slippage:     0.01, // 1%
        }),
      })
      if (!bRes.ok) throw new Error(`Build ${bRes.status}`)
      const build = await bRes.json() as { calldata: Array<{ contractAddress: string; entrypoint: string; calldata: string[] }> }

      // 3. Execute via privy paymaster
      const txHash = await execute(build.calldata)
      setSwapTx(txHash)
      setSwapStatus('success')
      setAmount('')
      setQuote(null)
    } catch (e) {
      setSwapError(e instanceof Error ? e.message : 'Swap failed')
      setSwapStatus('error')
    }
  }, [parsedAmount, address, execute, swapStatus])

  const exceedsBalance = parsedAmount ? parsedAmount > usdcBalance : false
  const canSwap = parsedAmount && !exceedsBalance && quote && swapStatus !== 'pending'

  return (
    <div style={{ marginBottom: 24 }}>
      <SectionHeading title="Swap USDC for STRK" accentColor={C.primary} />
      <div style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        padding: '24px 24px',
      }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', marginBottom: 16 }}>
          {/* Amount input */}
          <div style={{ flex: 1 }}>
            <label style={{ fontFamily: M, fontSize: 9, color: C.dim, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              USDC AMOUNT
            </label>
            <div style={{
              display: 'flex', alignItems: 'center',
              background: C.surfaceHi, border: `1px solid ${C.border}`,
              padding: '10px 14px',
            }}>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={e => onAmountChange(e.target.value)}
                placeholder="0.00"
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontFamily: M, fontSize: 18, fontWeight: 700, color: C.text,
                  width: '100%',
                }}
              />
              <span style={{ fontFamily: M, fontSize: 11, color: C.dim, marginLeft: 8 }}>USDC</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontFamily: M, fontSize: 9, color: exceedsBalance ? C.secondary : C.dim }}>
                {exceedsBalance ? 'Exceeds balance' : `Balance: ${formatUsdc(usdcBalance)} USDC`}
              </span>
              {usdcBalance > 0n && (
                <button
                  onClick={() => onAmountChange((Number(usdcBalance) / 1e6).toString())}
                  style={{
                    fontFamily: M, fontSize: 9, color: C.primary, background: 'transparent',
                    border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em',
                  }}
                >
                  MAX
                </button>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div style={{ paddingBottom: 24, color: C.dim, fontFamily: M, fontSize: 16 }}>→</div>

          {/* Output preview */}
          <div style={{ flex: 1 }}>
            <label style={{ fontFamily: M, fontSize: 9, color: C.dim, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              YOU RECEIVE
            </label>
            <div style={{
              display: 'flex', alignItems: 'center',
              background: C.surfaceHi, border: `1px solid ${C.border}`,
              padding: '10px 14px', minHeight: 44,
            }}>
              <span style={{ fontFamily: M, fontSize: 18, fontWeight: 700, color: quote ? C.primary : C.dim, flex: 1 }}>
                {quoting ? '…' : quote ?? '—'}
              </span>
              <span style={{ fontFamily: M, fontSize: 11, color: C.dim, marginLeft: 8 }}>STRK</span>
            </div>
            <div style={{ marginTop: 6 }}>
              <span style={{ fontFamily: M, fontSize: 9, color: C.dim }}>via AVNU aggregator</span>
            </div>
          </div>
        </div>

        {/* Swap button */}
        <button
          onClick={handleSwap}
          disabled={!canSwap}
          style={{
            width: '100%', padding: '12px 0',
            background: canSwap ? C.primary : C.surfaceHi,
            color: canSwap ? '#0e0e0e' : C.dim,
            border: `1px solid ${canSwap ? C.primary : C.border}`,
            fontFamily: M, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            cursor: canSwap ? 'pointer' : 'default',
            transition: 'all 0.15s ease',
          }}
        >
          {swapStatus === 'pending' ? 'SWAPPING…' : 'SWAP USDC → STRK'}
        </button>

        {/* Status */}
        {swapStatus === 'success' && swapTx && (
          <div style={{ marginTop: 12, fontFamily: M, fontSize: 10, color: C.primary }}>
            Swap submitted! Tx: {swapTx.slice(0, 10)}…{swapTx.slice(-6)}
          </div>
        )}
        {swapStatus === 'error' && swapError && (
          <div style={{ marginTop: 12, fontFamily: M, fontSize: 10, color: C.secondary }}>
            {swapError}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label, value, unit, accent, dim, small, icon,
}: {
  label: string; value: string; unit: string
  accent: string; dim?: boolean; small?: boolean; icon?: string
}) {
  return (
    <div style={{
      background:  C.surface,
      borderLeft:  `2px solid ${accent}`,
      padding:     '20px 20px 20px 22px',
      position:    'relative',
      overflow:    'hidden',
      boxShadow:   accent === C.primary ? `0 0 15px rgba(156,255,147,0.06)` : 'none',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <span style={{ fontFamily: M, fontSize: 9, color: C.dim, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          {label}
        </span>
        {icon && (
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: accent, opacity: 0.7 }}>{icon}</span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{
          fontFamily: M, fontSize: small ? 20 : 32, fontWeight: 700,
          color: dim ? C.muted : C.text, lineHeight: 1, textTransform: small ? 'uppercase' : undefined,
          letterSpacing: small ? '0.02em' : undefined,
        }}>
          {value}
        </span>
        <span style={{ fontFamily: M, fontSize: 10, color: dim ? 'rgba(255,255,255,0.2)' : `${accent}99`, letterSpacing: '0.12em' }}>
          {unit}
        </span>
      </div>
    </div>
  )
}

function SectionHeading({ title, accentColor }: { title: string; accentColor: string }) {
  return (
    <div style={{
      paddingLeft: 14, borderLeft: `2px solid ${accentColor}`,
      marginBottom: 16,
    }}>
      <h3 style={{
        fontFamily: H, fontStyle: 'italic', fontWeight: 700,
        fontSize: 18, color: C.text, margin: 0, lineHeight: 1.2,
      }}>
        {title}
      </h3>
    </div>
  )
}

function Panel({ children, minHeight }: { children: React.ReactNode; minHeight?: number }) {
  return (
    <div style={{
      background: C.surface,
      border:     `1px solid ${C.border}`,
      padding:    '18px 20px',
      minHeight,
    }}>
      {children}
    </div>
  )
}

function TableHeader({ cols, labels }: { cols: string; labels: string[] }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: cols,
      paddingBottom: 10, borderBottom: `1px solid ${C.border}`, marginBottom: 4,
    }}>
      {labels.map(l => (
        <span key={l} style={{ fontFamily: M, fontSize: 9, color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {l}
        </span>
      ))}
    </div>
  )
}

function EmptyState({ message, subtext, wide }: { message: string; subtext: string; wide?: boolean }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: wide ? '28px 24px' : '24px 0', textAlign: 'center',
    }}>
      <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 14 }} />
      <span style={{ fontFamily: M, fontSize: 10, color: C.dim, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
        {message}
      </span>
      {subtext && (
        <span style={{ fontFamily: H, fontStyle: 'italic', fontSize: 13, color: `${C.primary}60`, marginTop: 6 }}>
          {subtext}
        </span>
      )}
    </div>
  )
}

function LoadingRows() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          height: 36,
          background: `linear-gradient(90deg, ${C.surfaceHi} 25%, ${C.surfaceHighest} 50%, ${C.surfaceHi} 75%)`,
          backgroundSize: '400% 100%',
          animation: 'shimmer 1.4s ease infinite',
          opacity: 1 - i * 0.2,
        }} />
      ))}
      <style>{`@keyframes shimmer { 0%{background-position:100% 0} 100%{background-position:-100% 0} }`}</style>
    </div>
  )
}
