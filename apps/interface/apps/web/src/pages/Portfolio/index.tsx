import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { BlockTag } from 'starknet'
import { useReadContract } from '@starknet-react/core'
import { useWallet } from 'context/WalletContext'
import { useUserActivity, useCultTokens } from 'cotp/src/data/apiClients/cotpIndexerApi/cotpIndexerApiClient'
import type { CultTokenRecord } from 'cotp/src/data/apiClients/cotpIndexerApi/cotpIndexerApiClient'
import { STRK_SEPOLIA } from 'cotp/src/constants/tokens'
import { STAKING_ADDRESS, StakingABI, ERC20ABI } from 'cotp/src/constants/contracts'
import { formatWei, formatStrk } from 'cotp/src/utils/format'
import UsdcIcon from 'assets/tokens/usdc.svg?react'
import StrkIcon from 'assets/tokens/strk.svg?react'
import { getPendingDeposit, clearPendingDeposit, type PendingDeposit } from 'components/DepositModal'
import { AvnuSwapProvider, Amount, fromAddress, ChainId, sepoliaTokens } from 'starkzap'
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
  const { address, isConnected } = useWallet()
  const walletLoading = false

  // Local transaction log (swaps, deposits, withdrawals done in this session)
  const [localTxs, setLocalTxs] = useState<{ hash: string; type: string; detail: string; ts: number }[]>(() => {
    try { return JSON.parse(localStorage.getItem('cotp_local_txs') ?? '[]') } catch { return [] }
  })
  const addLocalTx = useCallback((tx: { hash: string; type: string; detail: string }) => {
    setLocalTxs(prev => {
      const updated = [{ ...tx, ts: Date.now() }, ...prev].slice(0, 50)
      localStorage.setItem('cotp_local_txs', JSON.stringify(updated))
      return updated
    })
  }, [])

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

  // ── Pending deposit tracking ──
  const [pendingDeposit, setPendingDepositState] = useState<PendingDeposit | null>(getPendingDeposit)

  // Poll localStorage for pending deposit changes (set by DepositModal)
  useEffect(() => {
    const id = setInterval(() => {
      const current = getPendingDeposit()
      setPendingDepositState(prev => {
        if (!current && !prev) return prev
        if (!current && prev) return null
        if (current && !prev) return current
        if (current && prev && current.startedAt !== prev.startedAt) return current
        return prev
      })
    }, 2000)
    return () => clearInterval(id)
  }, [])

  // Auto-clear pending deposit after 10 minutes (stale) or if balance increased
  const prevUsdcRef = useRef(usdcBalance)
  useEffect(() => {
    if (!pendingDeposit) return
    // If balance increased since deposit started, clear the notification
    if (usdcBalance > prevUsdcRef.current && prevUsdcRef.current >= 0n) {
      clearPendingDeposit()
      setPendingDepositState(null)
    }
    prevUsdcRef.current = usdcBalance
  }, [usdcBalance, pendingDeposit])

  useEffect(() => {
    if (!pendingDeposit) return
    if (Date.now() - pendingDeposit.startedAt > 10 * 60 * 1000) {
      clearPendingDeposit()
      setPendingDepositState(null)
    }
  }, [pendingDeposit])

  // ── Fetch all cult tokens + on-chain balances for the Privy wallet ──
  const cultTokens = useCultTokens({ params: { limit: 200, orderBy: 'volume' }, refetchInterval: 60_000 })
  const [tokenBalances, setTokenBalances] = useState<Map<string, bigint>>(new Map())

  useEffect(() => {
    if (!address || !cultTokens.data?.length) return
    let cancelled = false
    const STARKNET_RPC_URL = import.meta.env.VITE_ALCHEMY_RPC_URL as string
    const BALANCE_OF_SELECTOR = '0x2e4263afad30923c891518314c3c95dbe830a16874e8abc5777a9a20b54c76e'

    async function fetchBalances() {
      const balances = new Map<string, bigint>()
      // Batch in groups of 10 to avoid overwhelming the RPC
      const tokens = cultTokens.data!
      for (let i = 0; i < tokens.length; i += 10) {
        const batch = tokens.slice(i, i + 10)
        const results = await Promise.allSettled(
          batch.map(async (token) => {
            const res = await fetch(STARKNET_RPC_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0', id: 1,
                method: 'starknet_call',
                params: [{
                  contract_address: token.contractAddress,
                  entry_point_selector: BALANCE_OF_SELECTOR,
                  calldata: [address],
                }, 'latest'],
              }),
            })
            const json = await res.json() as { result?: string[] }
            if (!json.result?.length) return { addr: token.contractAddress, bal: 0n }
            const low  = BigInt(json.result[0] ?? '0x0')
            const high = BigInt(json.result[1] ?? '0x0')
            return { addr: token.contractAddress, bal: low + (high << 128n) }
          })
        )
        for (const r of results) {
          if (r.status === 'fulfilled' && r.value.bal > 0n) {
            balances.set(r.value.addr, r.value.bal)
          }
        }
      }
      if (!cancelled) setTokenBalances(balances)
    }
    void fetchBalances()
    const interval = setInterval(() => void fetchBalances(), 30_000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [address, cultTokens.data])

  // Combine indexer trade history with on-chain balances for a complete picture
  const { data: trades = [], isLoading: tradesLoading } = useUserActivity(address, 100)

  // Build cult holdings from on-chain balances (primary) + trade history (for STRK cost)
  const cultHoldings = useMemo(() => {
    const tokens = cultTokens.data ?? []
    const result: {
      symbol: string; name: string; address: string
      balance: bigint; strkSpent: bigint
    }[] = []

    // Get STRK cost from trade history
    const strkByToken = new Map<string, bigint>()
    for (const t of trades) {
      if (!t.tokenContractAddress) continue
      const prev = strkByToken.get(t.tokenContractAddress) ?? 0n
      const sq = BigInt(t.strkQty || '0')
      strkByToken.set(t.tokenContractAddress, t.side === 0 ? prev + sq : prev - sq)
    }

    for (const token of tokens) {
      const bal = tokenBalances.get(token.contractAddress)
      if (bal && bal > 0n) {
        result.push({
          symbol:   token.symbol,
          name:     token.name,
          address:  token.contractAddress,
          balance:  bal,
          strkSpent: strkByToken.get(token.contractAddress) ?? 0n,
        })
      }
    }

    return result
  }, [cultTokens.data, tokenBalances, trades])

  // Unique cults for staking panel (from on-chain balances)
  const uniqueCults = useMemo(() => {
    return cultHoldings.map(h => ({ addr: h.address, symbol: h.symbol }))
  }, [cultHoldings])

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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: pendingDeposit ? 12 : 40 }}>
            <StatCard
              label="USDC Balance"
              value={formatUsdc(usdcBalance)}
              unit="USDC"
              accent={C.primary}
              icon={<UsdcIcon style={{ width: 20, height: 20 }} />}
            />
            <StatCard
              label="STRK Balance"
              value={formatWei(strkBalance.toString())}
              unit="STRK"
              accent="rgba(72,72,72,0.8)"
              icon={<StrkIcon style={{ width: 20, height: 20 }} />}
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

          {/* ── Pending deposit notification ──────────────────────────── */}
          {pendingDeposit && <PendingDepositBanner deposit={pendingDeposit} />}

          {/* ── My Cults + Conviction ───────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, marginBottom: 24 }}>

            {/* My Cults */}
            <div>
              <SectionHeading title="My Cults" accentColor={C.primary} />
              <Panel minHeight={192}>
                {cultTokens.isLoading ? (
                  <LoadingRows />
                ) : cultHoldings.length === 0 ? (
                  <EmptyState message="No active cult positions." subtext="Start believing." />
                ) : (
                  <>
                    <TableHeader cols="1fr 140px 140px" labels={['CULT', 'BALANCE', 'COST']} />
                    {cultHoldings.map(h => {
                      const isCost = h.strkSpent > 0n
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
                          <span style={{ fontFamily: M, fontSize: 12, color: C.text }}>{formatWei(h.balance.toString())}</span>
                          <span style={{ fontFamily: M, fontSize: 12, color: isCost ? C.muted : C.dim }}>
                            {isCost ? formatWei(h.strkSpent.toString()) + ' STRK' : '—'}
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
          <SwapPanel address={address} usdcBalance={usdcBalance} strkBalance={strkBalance} onTx={addLocalTx} />

          {/* ── Transaction Log ─────────────────────────────────────────── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
              <SectionHeading title="Transaction Log" accentColor="rgba(255,255,255,0.2)" />
              <span style={{ fontFamily: M, fontSize: 9, color: C.dim, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                {localTxs.length + trades.length} transactions
              </span>
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              {/* Table header row */}
              <div style={{
                display: 'grid', gridTemplateColumns: '80px 1fr 1fr 100px',
                padding: '10px 16px',
                background: C.surfaceHi,
                borderBottom: `1px solid ${C.border}`,
              }}>
                {['TYPE', 'DETAIL', 'TIME', 'TX'].map(h => (
                  <span key={h} style={{ fontFamily: M, fontSize: 9, color: C.dim, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                    {h}
                  </span>
                ))}
              </div>

              {/* Local transactions (swaps, deposits, withdrawals) */}
              {localTxs.map(tx => (
                <div key={tx.hash} style={{
                  display: 'grid', gridTemplateColumns: '80px 1fr 1fr 100px',
                  padding: '9px 16px', borderBottom: `1px solid ${C.border}`, alignItems: 'center',
                }}>
                  <span style={{
                    fontFamily: M, fontSize: 10, fontWeight: 700,
                    color: '#7eb8ff',
                    background: 'rgba(126,184,255,0.08)',
                    border: '1px solid rgba(126,184,255,0.2)',
                    padding: '2px 7px', display: 'inline-block',
                  }}>
                    {tx.type}
                  </span>
                  <span style={{ fontFamily: M, fontSize: 11, color: C.text }}>{tx.detail}</span>
                  <span style={{ fontFamily: M, fontSize: 11, color: C.muted }}>
                    {new Date(tx.ts).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <a
                    href={`https://sepolia.voyager.online/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontFamily: M, fontSize: 10, color: C.primary, textDecoration: 'none' }}
                  >
                    {tx.hash.slice(0, 6)}…{tx.hash.slice(-4)} ↗
                  </a>
                </div>
              ))}

              {/* Indexer trades */}
              {tradesLoading ? (
                <div style={{ padding: '20px 16px' }}><LoadingRows /></div>
              ) : trades.length === 0 && localTxs.length === 0 ? (
                <div style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <EmptyState message="No transactions yet." subtext="" />
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  {trades.slice(0, 50).map((t: UserTradeRecord) => {
                    const isBuy = t.side === 0
                    return (
                      <div key={t.id} style={{
                        display: 'grid', gridTemplateColumns: '80px 1fr 1fr 100px',
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
                          <span style={{ fontFamily: M, fontSize: 10, color: C.dim, marginLeft: 8 }}>
                            {formatWei(t.tokenQty)} / {formatWei(t.strkQty)} STRK
                          </span>
                        </div>
                        <span style={{ fontFamily: M, fontSize: 11, color: C.muted }}>Block #{t.blockNumber}</span>
                        <a
                          href={`https://sepolia.voyager.online/block/${t.blockNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontFamily: M, fontSize: 10, color: C.muted, textDecoration: 'none' }}
                        >
                          #{t.blockNumber} ↗
                        </a>
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

// ─── Swap USDC ↔ STRK (via starkzap AvnuSwapProvider) ────────────────────────

const avnuSwap = new AvnuSwapProvider()
const USDC_ZAP = sepoliaTokens.USDC
const STRK_ZAP = sepoliaTokens.STRK

function parseTokenInput(val: string, decimals: number): bigint | null {
  try {
    const num = parseFloat(val)
    if (!num || num <= 0 || isNaN(num)) return null
    const [int, frac = ''] = val.split('.')
    return BigInt(int) * BigInt(10 ** decimals) + BigInt(frac.padEnd(decimals, '0').slice(0, decimals))
  } catch { return null }
}

function fmtBal(bal: bigint, dec: number): string {
  if (bal === 0n) return '0.00'
  const divisor = BigInt(10 ** dec)
  const whole = bal / divisor
  const frac  = (bal % divisor).toString().padStart(dec, '0').slice(0, 2)
  return `${whole}.${frac}`
}

type SwapDir = 'usdc-to-strk' | 'strk-to-usdc'

function SwapPanel({ address, usdcBalance, strkBalance, onTx }: {
  address: string; usdcBalance: bigint; strkBalance: bigint
  onTx: (tx: { hash: string; type: string; detail: string }) => void
}) {
  const [dir, setDir]       = useState<SwapDir>('usdc-to-strk')
  const [amount, setAmount] = useState('')
  const [quote, setQuote]   = useState<string | null>(null)
  const [quoting, setQuoting] = useState(false)
  const [swapStatus, setSwapStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [swapError, setSwapError]   = useState<string | null>(null)
  const [swapTx, setSwapTx]         = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const { execute } = useWallet()

  const sellDecimals = dir === 'usdc-to-strk' ? 6 : 18
  const buyDecimals  = dir === 'usdc-to-strk' ? 18 : 6
  const sellBalance  = dir === 'usdc-to-strk' ? usdcBalance : strkBalance
  const sellSymbol   = dir === 'usdc-to-strk' ? 'USDC' : 'STRK'
  const buySymbol    = dir === 'usdc-to-strk' ? 'STRK' : 'USDC'
  const SellIcon     = dir === 'usdc-to-strk' ? UsdcIcon : StrkIcon
  const BuyIcon      = dir === 'usdc-to-strk' ? StrkIcon : UsdcIcon

  const parsedAmount = useMemo(() => parseTokenInput(amount, sellDecimals), [amount, sellDecimals])

  const sellZapToken = dir === 'usdc-to-strk' ? USDC_ZAP : STRK_ZAP
  const buyZapToken  = dir === 'usdc-to-strk' ? STRK_ZAP : USDC_ZAP

  const fetchQuote = useCallback(async (sellAmount: bigint) => {
    setQuoting(true)
    setQuote(null)
    try {
      const q = await avnuSwap.getQuote({
        chainId:      ChainId.SEPOLIA,
        tokenIn:      sellZapToken,
        tokenOut:     buyZapToken,
        amountIn:     Amount.fromRaw(sellAmount, sellZapToken),
        takerAddress: fromAddress(address),
        slippageBps:  100n,
      })
      setQuote(fmtBal(q.amountOutBase, buyDecimals))
    } catch {
      setQuote(null)
    } finally {
      setQuoting(false)
    }
  }, [address, sellZapToken, buyZapToken, buyDecimals])

  const onAmountChange = useCallback((val: string) => {
    setAmount(val)
    setSwapStatus('idle')
    setSwapError(null)
    setSwapTx(null)
    clearTimeout(debounceRef.current)
    const parsed = parseTokenInput(val, sellDecimals)
    if (!parsed) { setQuote(null); return }
    debounceRef.current = setTimeout(() => void fetchQuote(parsed), 400)
  }, [fetchQuote, sellDecimals])

  const flipDirection = useCallback(() => {
    setDir(d => d === 'usdc-to-strk' ? 'strk-to-usdc' : 'usdc-to-strk')
    setAmount('')
    setQuote(null)
    setSwapStatus('idle')
    setSwapError(null)
    setSwapTx(null)
  }, [])

  const handleSwap = useCallback(async () => {
    if (!parsedAmount || swapStatus === 'pending') return
    setSwapStatus('pending')
    setSwapError(null)
    try {
      const prepared = await avnuSwap.prepareSwap({
        chainId:      ChainId.SEPOLIA,
        tokenIn:      sellZapToken,
        tokenOut:     buyZapToken,
        amountIn:     Amount.fromRaw(parsedAmount, sellZapToken),
        takerAddress: fromAddress(address),
        slippageBps:  100n,
      })

      const txHash = await execute(prepared.calls)
      setSwapTx(txHash)
      setSwapStatus('success')
      onTx({ hash: txHash, type: 'SWAP', detail: `${amount} ${sellSymbol} → ${buySymbol}` })
      setAmount('')
      setQuote(null)
    } catch (e) {
      setSwapError(e instanceof Error ? e.message : 'Swap failed')
      setSwapStatus('error')
    }
  }, [parsedAmount, address, execute, swapStatus, sellZapToken, buyZapToken])

  const exceedsBalance = parsedAmount ? parsedAmount > sellBalance : false
  const canSwap = parsedAmount && !exceedsBalance && quote && swapStatus !== 'pending'

  const boxStyle: React.CSSProperties = {
    background: C.surfaceHi,
    border: `1px solid ${C.border}`,
    padding: '14px 16px',
  }

  const tokenPillStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${C.border}`,
    padding: '5px 10px 5px 7px',
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <SectionHeading title="Swap" accentColor={C.primary} />
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: '20px' }}>

        {/* YOU PAY */}
        <div style={boxStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontFamily: M, fontSize: 9, color: C.dim, letterSpacing: '0.12em' }}>YOU PAY</span>
            <span style={{ fontFamily: M, fontSize: 9, color: C.dim }}>
              {fmtBal(sellBalance, sellDecimals)} {sellSymbol}
              {sellBalance > 0n && (
                <button onClick={() => onAmountChange(fmtBal(sellBalance, sellDecimals))} style={{
                  fontFamily: M, fontSize: 9, color: C.primary, background: 'transparent',
                  border: 'none', cursor: 'pointer', marginLeft: 6,
                }}>MAX</button>
              )}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="number" step="any" min="0" placeholder="0.00" value={amount}
              onChange={e => onAmountChange(e.target.value)}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontFamily: M, fontSize: 24, fontWeight: 700, color: C.text, width: '100%',
              }}
            />
            <div style={tokenPillStyle}>
              <SellIcon style={{ width: 20, height: 20 }} />
              <span style={{ fontFamily: M, fontSize: 12, fontWeight: 700, color: C.text }}>{sellSymbol}</span>
            </div>
          </div>
          {exceedsBalance && <span style={{ fontFamily: M, fontSize: 9, color: C.secondary, marginTop: 6, display: 'block' }}>Exceeds balance</span>}
        </div>

        {/* Flip button */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '-6px 0', position: 'relative', zIndex: 1 }}>
          <button onClick={flipDirection} style={{
            width: 32, height: 32,
            background: C.surface, border: `1px solid ${C.border}`,
            color: C.primary, fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = C.primary; e.currentTarget.style.color = '#0e0e0e'; e.currentTarget.style.transform = 'rotate(180deg)' }}
          onMouseLeave={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.color = C.primary; e.currentTarget.style.transform = 'rotate(0)' }}
          >↕</button>
        </div>

        {/* YOU RECEIVE */}
        <div style={{ ...boxStyle, marginBottom: 0 }}>
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontFamily: M, fontSize: 9, color: C.dim, letterSpacing: '0.12em' }}>YOU RECEIVE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: M, fontSize: 24, fontWeight: 700, color: quote ? C.primary : C.dim, flex: 1 }}>
              {quoting ? '…' : quote ?? '0.00'}
            </span>
            <div style={tokenPillStyle}>
              <BuyIcon style={{ width: 20, height: 20 }} />
              <span style={{ fontFamily: M, fontSize: 12, fontWeight: 700, color: C.text }}>{buySymbol}</span>
            </div>
          </div>
        </div>

        {/* AVNU attribution — outside the box */}
        <div style={{ fontFamily: M, fontSize: 9, color: C.dim, textAlign: 'center', margin: '10px 0 14px' }}>
          via AVNU aggregator
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
          {swapStatus === 'pending' ? 'SWAPPING…' : `SWAP ${sellSymbol} → ${buySymbol}`}
        </button>

        {swapStatus === 'success' && swapTx && (
          <a
            href={`https://sepolia.voyager.online/tx/${swapTx}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block', marginTop: 12, fontFamily: M, fontSize: 10, color: C.primary,
              textDecoration: 'none',
            }}
          >
            Swap submitted! Tx: {swapTx.slice(0, 10)}…{swapTx.slice(-6)} ↗
          </a>
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

// ─── Pending deposit banner ───────────────────────────────────────────────────

function PendingDepositBanner({ deposit }: { deposit: PendingDeposit }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - deposit.startedAt) / 1000)), 1000)
    return () => clearInterval(id)
  }, [deposit.startedAt])

  const isEthereum = deposit.source === 'ethereum'
  const estSeconds = isEthereum ? 300 : 2 // 5 min for CCTP, 2s for Starknet
  const progress   = Math.min(1, elapsed / estSeconds)
  const remaining  = Math.max(0, estSeconds - elapsed)

  const fmtRemaining = remaining > 60
    ? `${Math.floor(remaining / 60)}m ${remaining % 60}s`
    : `${remaining}s`

  return (
    <div style={{
      background: 'rgba(156,255,147,0.04)',
      border: `1px solid rgba(156,255,147,0.15)`,
      padding: '14px 18px',
      marginBottom: 28,
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      {/* Pulsing dot */}
      <div style={{
        width: 10, height: 10, borderRadius: '50%',
        background: C.primary, flexShrink: 0,
        animation: 'pulse-dot 1.2s ease-in-out infinite',
        boxShadow: '0 0 8px rgba(156,255,147,0.5)',
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontFamily: M, fontSize: 11, fontWeight: 700, color: C.primary }}>
            +{deposit.amount} USDC incoming
          </span>
          <span style={{ fontFamily: M, fontSize: 10, color: C.dim }}>
            {progress >= 1 ? 'Arriving any moment…' : `≈ ${fmtRemaining} remaining`}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', height: 3, background: 'rgba(156,255,147,0.1)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', background: C.primary,
            width: `${Math.max(5, progress * 100)}%`,
            transition: 'width 1s linear',
          }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontFamily: M, fontSize: 9, color: C.dim }}>
            {isEthereum ? 'Bridging via CCTP from Ethereum' : 'Transferring on Starknet'}
          </span>
          {deposit.burnTxHash && (
            <a
              href={`https://sepolia.etherscan.io/tx/${deposit.burnTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: M, fontSize: 9, color: C.primary, textDecoration: 'none' }}
            >
              Etherscan ↗
            </a>
          )}
        </div>
      </div>

      <style>{`@keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label, value, unit, accent, dim, small, icon,
}: {
  label: string; value: string; unit: string
  accent: string; dim?: boolean; small?: boolean; icon?: React.ReactNode
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
        {icon && <div style={{ opacity: 0.8 }}>{icon}</div>}
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
