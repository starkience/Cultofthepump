import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { addAddressPadding, BlockTag, uint256 } from 'starknet'
import { useCultMetadata } from 'cotp/src/data/apiClients/cotpMetadataApi/cotpMetadataApiClient'
import { useCultTokens, useCultTrades, useBelievers, useTokenMetrics } from 'cotp/src/data/apiClients/cotpIndexerApi/cotpIndexerApiClient'
import { useBondingCurve, useSwap, useToken, useTokenAt } from 'cotp/src/hooks/useContract'
import { STRK_SEPOLIA } from 'cotp/src/constants/tokens'
import { SWAP_ADDRESS, SwapABI, ERC20ABI, STAKING_ADDRESS, StakingABI } from 'cotp/src/constants/contracts'
import { useCalls } from 'state/transactions/hooks'
import { useOpenModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import { useReadContract } from '@starknet-react/core'
import { useWallet } from 'context/WalletContext'
import { formatStrk, formatWei, formatPrice, computePrice, formatMarketCap } from 'cotp/src/utils/format'
import { PriceChart } from 'components/PriceChart'
import Landing from 'pages/Landing'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:              '#0e0e0e',
  surface:         '#131313',
  surfaceContainer:'#191919',
  surfaceHigh:     '#1f1f1f',
  surfaceHighest:  '#262626',
  surfaceLowest:   '#000000',
  primary:         '#9cff93',
  primaryGlow:     'rgba(156,255,147,0.3)',
  secondary:       '#ff725e',
  outlineVariant:  'rgba(72,72,72,0.15)',
  text:            '#ffffff',
  textMuted:       '#ababab',
}

const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" }
const headline: React.CSSProperties = { fontFamily: 'Newsreader, Georgia, serif' }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatAddress(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}

function timeAgo(blockNumber: number): string {
  // approximate: Starknet Sepolia ~30s blocks
  return `${blockNumber} blk`
}

function parseTokenAmount(value: string, decimals = 18): bigint | null {
  try {
    if (!value || isNaN(Number(value)) || Number(value) <= 0) return null
    const [intPart, fracPart = ''] = value.split('.')
    const frac = fracPart.padEnd(decimals, '0').slice(0, decimals)
    return BigInt(intPart) * BigInt(10 ** decimals) + BigInt(frac)
  } catch { return null }
}

function computeStakingApr(totalVolume: string, currentMarketCap: string, ageDays: number): string | null {
  try {
    const vol = BigInt(totalVolume || '0'); const mcap = BigInt(currentMarketCap || '0')
    if (vol === 0n || mcap === 0n) return null
    const annualFees = (vol * 100n * 36500n * 1_000_000n) / (10000n * BigInt(Math.max(1, Math.round(ageDays))))
    const apr = Number(annualFees / mcap) / 1_000_000
    if (!isFinite(apr) || apr <= 0) return null
    return apr > 9999 ? '>9999%' : `${apr.toFixed(1)}%`
  } catch { return null }
}

// ─── Shared input style ───────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: C.primary,
  fontSize: '1.5rem',
  ...mono,
  width: '100%',
  padding: 0,
}

// ─── BuySell (Believe/Sin) Panel ──────────────────────────────────────────────
function BelieveSinPanel({ tokenAddress, tokenSymbol }: { tokenAddress: string; tokenSymbol: string }) {
  const [tab, setTab] = useState<'buy' | 'sell'>('buy')
  const [amountInput, setAmountInput] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const { address: connectedAddress } = useWallet()
  const swap = useSwap()
  const strk = useToken(STRK_SEPOLIA)
  const cult = useTokenAt(tokenAddress)
  const bondingCurve = useBondingCurve()

  const { data: liveMarketCapRaw } = useReadContract({
    abi: SwapABI,
    address: SWAP_ADDRESS as `0x${string}`,
    functionName: 'market_caps',
    args: [tokenAddress as `0x${string}`],
    blockIdentifier: BlockTag.LATEST,
    refetchInterval: 10_000,
  })
  const liveMarketCap = (liveMarketCapRaw as bigint | undefined) ?? 0n

  const { data: strkBalanceRaw } = useReadContract({
    abi: ERC20ABI, address: STRK_SEPOLIA.address as `0x${string}`,
    functionName: 'balance_of', args: connectedAddress ? [connectedAddress] : undefined,
    enabled: Boolean(connectedAddress), blockIdentifier: BlockTag.LATEST, refetchInterval: 15_000,
  })
  const { data: tokenBalanceRaw } = useReadContract({
    abi: ERC20ABI, address: tokenAddress as `0x${string}`,
    functionName: 'balance_of', args: connectedAddress ? [connectedAddress] : undefined,
    enabled: Boolean(connectedAddress), blockIdentifier: BlockTag.LATEST, refetchInterval: 15_000,
  })
  const strkBalance = (strkBalanceRaw as bigint | undefined) ?? 0n
  const tokenBalance = (tokenBalanceRaw as bigint | undefined) ?? 0n

  const [, setCalls] = useCalls()
  const openTransactionModal = useOpenModal({ name: ApplicationModal.TRANSACTION })
  const parsedAmount = useMemo(() => parseTokenAmount(amountInput), [amountInput])
  const isBuy = tab === 'buy'

  useEffect(() => {
    if (!parsedAmount || !bondingCurve || liveMarketCap === undefined) { setPreview(null); return }
    let cancelled = false
    setPreviewLoading(true)
    const fetchPreview = async () => {
      try {
        if (isBuy) {
          const fee = parsedAmount / 100n
          const result = await bondingCurve.call('buy', [liveMarketCap, parsedAmount - fee])
          if (!cancelled) {
            const tokens = Array.isArray(result) ? result[0] : result
            setPreview(`~${formatWei(tokens.toString())} ${tokenSymbol}`)
          }
        } else {
          const result = await bondingCurve.call('sell', [liveMarketCap, parsedAmount])
          if (!cancelled) {
            const strkOut = Array.isArray(result) ? result[0] : result
            setPreview(`~${formatStrk(((BigInt(strkOut.toString()) * 99n) / 100n).toString())} STRK`)
          }
        }
      } catch { if (!cancelled) setPreview(null) }
      finally { if (!cancelled) setPreviewLoading(false) }
    }
    void fetchPreview()
    return () => { cancelled = true }
  }, [parsedAmount, isBuy, bondingCurve, tokenSymbol, liveMarketCap])

  const handleTrade = useCallback(() => {
    if (!parsedAmount || !swap || !strk || !cult) return
    const tokenDispatcher = { contract_address: tokenAddress }
    const calls = isBuy
      ? [strk.populate('approve', [SWAP_ADDRESS, parsedAmount]), swap.populate('buy', [parsedAmount, tokenDispatcher])]
      : [cult.populate('approve', [SWAP_ADDRESS, parsedAmount]), swap.populate('sell', [parsedAmount, tokenDispatcher])]
    setCalls(calls)
    openTransactionModal()
  }, [isBuy, parsedAmount, swap, strk, cult, tokenAddress, setCalls, openTransactionModal])

  const balanceDisplay = isBuy
    ? `BALANCE: ${formatStrk(strkBalance.toString())} STRK`
    : `BALANCE: ${formatWei(tokenBalance.toString())} ${tokenSymbol}`
  const isDisabled = !connectedAddress || !parsedAmount

  return (
    <div style={{
      backgroundColor: C.surfaceHigh, padding: '2rem',
      border: `1px solid ${C.primary}33`, position: 'relative',
    }}>
      {/* Corner accents */}
      <div style={{ position: 'absolute', top: -1, right: -1, width: 48, height: 48, borderTop: `2px solid ${C.primary}66`, borderRight: `2px solid ${C.primary}66` }} />
      <div style={{ position: 'absolute', bottom: -1, left: -1, width: 48, height: 48, borderBottom: `2px solid ${C.primary}66`, borderLeft: `2px solid ${C.primary}66` }} />

      {/* BELIEVE / SIN tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '2rem' }}>
        <button
          onClick={() => { setTab('buy'); setAmountInput(''); setPreview(null) }}
          style={{
            flex: 1, padding: '0.75rem',
            backgroundColor: isBuy ? C.primary : 'transparent',
            color: isBuy ? '#006413' : C.secondary,
            border: isBuy ? 'none' : `1px solid ${C.secondary}`,
            ...mono, fontSize: 13, fontWeight: 900,
            letterSpacing: '0.1em', cursor: 'pointer',
            boxShadow: isBuy ? `0 0 15px ${C.primaryGlow}` : 'none',
          }}
        >BELIEVE</button>
        <button
          onClick={() => { setTab('sell'); setAmountInput(''); setPreview(null) }}
          style={{
            flex: 1, padding: '0.75rem',
            backgroundColor: !isBuy ? C.secondary : 'transparent',
            color: !isBuy ? '#000' : C.secondary,
            border: !isBuy ? 'none' : `1px solid ${C.secondary}`,
            ...mono, fontSize: 13, fontWeight: 900,
            letterSpacing: '0.1em', cursor: 'pointer',
          }}
        >SIN</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Input */}
        <div>
          <label style={{ display: 'block', fontSize: 10, color: C.primary + '99', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, ...mono }}>
            {isBuy ? 'Sacrifice Amount (STRK)' : `${tokenSymbol} to Sell`}
          </label>
          <div style={{
            backgroundColor: C.surfaceContainer,
            borderBottom: `2px solid ${C.primary}`,
            padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <input
              style={inputStyle}
              type="text"
              placeholder="0.0"
              value={amountInput}
              onChange={(e) => { setAmountInput(e.target.value); setPreview(null) }}
            />
            <button
              type="button"
              aria-label="Set max amount"
              style={{ fontSize: 10, color: C.primary + '66', ...mono, whiteSpace: 'nowrap', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
              onClick={() => {
                const maxWei = isBuy ? strkBalance : tokenBalance
                if (maxWei > 0n) setAmountInput((Number(maxWei) / 1e18).toFixed(6).replace(/\.?0+$/, ''))
              }}
            >{balanceDisplay}</button>
          </div>
        </div>

        {/* Arrow */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <span className="material-symbols-outlined" style={{ color: C.primary + '66', fontSize: 32 }}>keyboard_double_arrow_down</span>
        </div>

        {/* Output */}
        <div>
          <label style={{ display: 'block', fontSize: 10, color: C.primary + '99', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, ...mono }}>
            {isBuy ? `Manifestation ($${tokenSymbol})` : 'STRK Received'}
          </label>
          <div style={{
            backgroundColor: C.surfaceContainer,
            borderBottom: `2px solid ${C.outlineVariant}`,
            padding: '1rem',
          }}>
            <span style={{ fontSize: '1.5rem', color: C.text, ...mono }}>
              {previewLoading ? 'estimating...' : preview ?? '—'}
            </span>
          </div>
        </div>

        {/* Fees */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, ...mono, color: C.textMuted, textTransform: 'uppercase' }}>
            <span>Altar Fee</span><span style={{ color: C.text }}>1%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, ...mono, color: C.textMuted, textTransform: 'uppercase' }}>
            <span>Protocol</span><span style={{ color: C.primary }}>Bonding Curve</span>
          </div>
        </div>

        {/* Execute button */}
        <button
          onClick={handleTrade}
          disabled={isDisabled}
          style={{
            width: '100%', padding: '1.25rem',
            backgroundColor: isDisabled ? C.surfaceHigh : C.primary,
            color: isDisabled ? C.textMuted : '#006413',
            border: isDisabled ? `1px solid ${C.primary}33` : 'none',
            ...headline, fontStyle: 'italic', fontSize: '1.5rem', fontWeight: 900,
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            boxShadow: isDisabled ? 'none' : `0 0 20px ${C.primaryGlow}`,
            letterSpacing: '-0.01em',
          }}
        >
          EXECUTE RITUAL
        </button>

        {!connectedAddress && (
          <p style={{ fontSize: 10, color: C.textMuted, textAlign: 'center', margin: 0, ...mono }}>
            CONNECT WALLET TO TRADE
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Staking (Conviction) Panel ───────────────────────────────────────────────
function ConvictionPanel({ tokenAddress, tokenSymbol, totalVolume, currentMarketCap, ageDays }: {
  tokenAddress: string; tokenSymbol: string
  totalVolume?: string; currentMarketCap?: string; ageDays?: number
}) {
  const [tab, setTab] = useState<'stake' | 'unstake'>('stake')
  const [amountInput, setAmountInput] = useState('')

  const { address: connectedAddress } = useWallet()
  const cult = useTokenAt(tokenAddress)
  const [, setCalls] = useCalls()
  const openTransactionModal = useOpenModal({ name: ApplicationModal.TRANSACTION })

  const enabled = Boolean(STAKING_ADDRESS && connectedAddress)

  const { data: stakedRaw }      = useReadContract({ abi: StakingABI, address: STAKING_ADDRESS as `0x${string}`, functionName: 'staked_balance', args: enabled ? [tokenAddress as `0x${string}`, connectedAddress as `0x${string}`] : undefined, enabled, blockIdentifier: BlockTag.LATEST, refetchInterval: 15_000 })
  const { data: earnedRaw }      = useReadContract({ abi: StakingABI, address: STAKING_ADDRESS as `0x${string}`, functionName: 'earned',         args: enabled ? [tokenAddress as `0x${string}`, connectedAddress as `0x${string}`] : undefined, enabled, blockIdentifier: BlockTag.LATEST, refetchInterval: 15_000 })
  const { data: totalStakedRaw } = useReadContract({ abi: StakingABI, address: STAKING_ADDRESS as `0x${string}`, functionName: 'total_staked',   args: [tokenAddress as `0x${string}`], enabled: Boolean(STAKING_ADDRESS), blockIdentifier: BlockTag.LATEST, refetchInterval: 15_000 })
  const { data: walletBalRaw }   = useReadContract({ abi: ERC20ABI,   address: tokenAddress as `0x${string}`,   functionName: 'balance_of',      args: connectedAddress ? [connectedAddress] : undefined, enabled: Boolean(connectedAddress), blockIdentifier: BlockTag.LATEST, refetchInterval: 15_000 })

  const stakedBalance = (stakedRaw as bigint | undefined) ?? 0n
  const earned        = (earnedRaw as bigint | undefined) ?? 0n
  const totalStaked   = (totalStakedRaw as bigint | undefined) ?? 0n
  const walletBalance = (walletBalRaw as bigint | undefined) ?? 0n

  const poolShare = useMemo(() => {
    if (totalStaked === 0n || stakedBalance === 0n) return '0.00'
    return ((Number(stakedBalance) / Number(totalStaked)) * 100).toFixed(2)
  }, [stakedBalance, totalStaked])

  const parsedAmount = useMemo(() => {
    try {
      if (!amountInput || isNaN(Number(amountInput)) || Number(amountInput) <= 0) return null
      const [intPart, fracPart = ''] = amountInput.split('.')
      const frac = fracPart.padEnd(18, '0').slice(0, 18)
      return BigInt(intPart) * BigInt(10 ** 18) + BigInt(frac)
    } catch { return null }
  }, [amountInput])

  const handleAction = useCallback(() => {
    if (!parsedAmount || !cult || !STAKING_ADDRESS) return
    const { low, high } = uint256.bnToUint256(parsedAmount)
    const amountCalldata = [low.toString(), high.toString()]
    const calls = tab === 'stake'
      ? [cult.populate('approve', [STAKING_ADDRESS, { low, high }]), { contractAddress: STAKING_ADDRESS, entrypoint: 'stake', calldata: [tokenAddress, ...amountCalldata] }]
      : [{ contractAddress: STAKING_ADDRESS, entrypoint: 'unstake', calldata: [tokenAddress, ...amountCalldata] }]
    setCalls(calls)
    openTransactionModal()
  }, [tab, parsedAmount, cult, tokenAddress, setCalls, openTransactionModal])

  const handleClaim = useCallback(() => {
    if (!STAKING_ADDRESS) return
    setCalls([{ contractAddress: STAKING_ADDRESS, entrypoint: 'claim', calldata: [tokenAddress] }])
    openTransactionModal()
  }, [tokenAddress, setCalls, openTransactionModal])

  if (!STAKING_ADDRESS) return null

  const isStake = tab === 'stake'
  const maxBalance = isStake ? walletBalance : stakedBalance
  const apr = (totalVolume && currentMarketCap && ageDays != null)
    ? computeStakingApr(totalVolume, currentMarketCap, ageDays)
    : null
  const isDisabled = !connectedAddress || !parsedAmount

  return (
    <div style={{
      backgroundColor: C.surfaceHigh, padding: '2rem',
      border: `1px solid ${C.primary}33`, position: 'relative',
    }}>
      {/* Corner accents */}
      <div style={{ position: 'absolute', top: -1, right: -1, width: 48, height: 48, borderTop: `2px solid ${C.primary}66`, borderRight: `2px solid ${C.primary}66` }} />
      <div style={{ position: 'absolute', bottom: -1, left: -1, width: 48, height: 48, borderBottom: `2px solid ${C.primary}66`, borderLeft: `2px solid ${C.primary}66` }} />

      {/* STAKE / UNSTAKE tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '2rem' }}>
        {(['stake', 'unstake'] as const).map((t) => (
          <button key={t} onClick={() => { setTab(t); setAmountInput('') }} style={{
            flex: 1, padding: '0.75rem',
            backgroundColor: tab === t ? C.primary : 'transparent',
            color: tab === t ? '#006413' : C.textMuted,
            border: tab === t ? 'none' : `1px solid ${C.outlineVariant}`,
            ...mono, fontSize: 13, fontWeight: 900,
            letterSpacing: '0.1em', cursor: 'pointer',
            boxShadow: tab === t ? `0 0 15px ${C.primaryGlow}` : 'none',
          }}>{t === 'stake' ? 'STAKE' : 'UNSTAKE'}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'Your Stake',    value: formatWei(stakedBalance.toString()), suffix: tokenSymbol },
            { label: 'Pool Share',    value: `${poolShare}%`,                     suffix: '' },
            { label: 'Claimable',     value: formatStrk(earned.toString()),       suffix: 'STRK', accent: true },
            { label: apr ? 'Est. APR' : 'Total Staked',
              value: apr ?? formatWei(totalStaked.toString()),
              suffix: apr ? '' : tokenSymbol, accent: Boolean(apr) },
          ].map(({ label, value, suffix, accent }) => (
            <div key={label} style={{ padding: '0.75rem', backgroundColor: C.surfaceContainer, borderBottom: `1px solid ${C.outlineVariant}` }}>
              <p style={{ fontSize: 10, ...mono, color: C.textMuted, textTransform: 'uppercase', margin: '0 0 4px', letterSpacing: '0.06em' }}>{label}</p>
              <p style={{ fontSize: '1rem', ...mono, color: accent ? C.primary : C.text, margin: 0, textShadow: accent ? `0 0 6px ${C.primary}` : 'none' }}>
                {value}{suffix ? <span style={{ fontSize: 10 }}> {suffix}</span> : null}
              </p>
            </div>
          ))}
        </div>

        {/* Amount input */}
        <div>
          <label style={{ display: 'block', fontSize: 10, color: C.primary + '99', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, ...mono }}>
            {isStake ? `${tokenSymbol} to Seal` : `${tokenSymbol} to Release`}
          </label>
          <div style={{ backgroundColor: C.surfaceContainer, borderBottom: `2px solid ${C.primary}`, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <input style={inputStyle} type="text" placeholder="0.0" value={amountInput} onChange={(e) => setAmountInput(e.target.value)} />
            <button type="button" aria-label="Set max amount"
              style={{ fontSize: 10, color: C.primary + '66', ...mono, whiteSpace: 'nowrap', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
              onClick={() => { if (maxBalance > 0n) setAmountInput((Number(maxBalance) / 1e18).toFixed(6).replace(/\.?0+$/, '')) }}
            >MAX: {formatWei(maxBalance.toString())}</button>
          </div>
        </div>

        {/* Claim button */}
        {earned > 0n && (
          <button onClick={handleClaim} disabled={!connectedAddress} style={{
            width: '100%', padding: '0.75rem', backgroundColor: C.primary, color: '#006413',
            border: 'none', ...mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', cursor: 'pointer',
          }}>
            CLAIM {formatStrk(earned.toString())} STRK
          </button>
        )}

        {/* Execute button */}
        <button onClick={handleAction} disabled={isDisabled} style={{
          width: '100%', padding: '1.25rem',
          backgroundColor: isDisabled ? C.surfaceHigh : C.primary,
          color: isDisabled ? C.textMuted : '#006413',
          border: isDisabled ? `1px solid ${C.primary}33` : 'none',
          ...headline, fontStyle: 'italic', fontSize: '1.5rem', fontWeight: 900,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          boxShadow: isDisabled ? 'none' : `0 0 20px ${C.primaryGlow}`,
          letterSpacing: '-0.01em',
        }}>
          {isStake ? 'SEAL CONVICTION' : 'RELEASE CONVICTION'}
        </button>

        {!connectedAddress && (
          <p style={{ fontSize: 10, color: C.textMuted, textAlign: 'center', margin: 0, ...mono }}>
            CONNECT WALLET TO STAKE
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Main trade detail ────────────────────────────────────────────────────────
function TradeDetail({ address }: { address: string }) {
  const cultTokens   = useCultTokens({ params: { address, limit: 1 }, refetchInterval: 10_000 })
  const cultMetadata = useCultMetadata({ params: { address }, refetchInterval: 10_000 })
  const token   = cultTokens.data?.[0] ?? null
  const metadata = cultMetadata.data?.[0] ?? null

  const trades = useCultTrades({ params: { tokenId: token?.id ?? '', limit: 20 }, enabled: Boolean(token?.id) })
  const believers = useBelievers(token?.id)
  const { data: metrics } = useTokenMetrics({ params: { address } })

  const currentPrice = metrics ? computePrice(metrics.lastTradeStrk, metrics.lastTradeTokens) : null

  return (
    <div style={{ width: '100%', maxWidth: 1600, padding: '2rem', ...mono }}>

      {/* Back link */}
      <Link to="/trade" style={{ textDecoration: 'none' }}>
        <span style={{ fontSize: 11, color: C.primary + '88', textTransform: 'uppercase', letterSpacing: '0.08em' }}>← BACK TO CULTS</span>
      </Link>

      {!token ? (
        <div style={{ marginTop: '2rem', padding: '2rem', backgroundColor: C.surface, border: `1px solid ${C.outlineVariant}`, color: C.textMuted, fontSize: 12 }}>
          {cultTokens.isLoading ? 'SYNCING WITH NODE...' : 'CULT NOT FOUND — ADDRESS INVALID OR NOT YET INDEXED.'}
        </div>
      ) : (
        <>
          {/* ── Page header ──────────────────────────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', margin: '1.5rem 0 2rem' }}>
            <div>
              <h1 style={{
                ...headline, fontStyle: 'italic', fontWeight: 700,
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                margin: 0, letterSpacing: '-0.02em',
                textShadow: `0 0 10px ${C.primaryGlow}`,
                color: C.primary,
              }}>
                ${(metadata?.symbol || token.symbol).toUpperCase()} RITUAL CHAMBER
              </h1>
              <p style={{ margin: '0.5rem 0 0', fontSize: 10, color: C.primary + '88', display: 'flex', alignItems: 'center', gap: 8, textTransform: 'uppercase' }}>
                <span style={{ width: 8, height: 8, backgroundColor: C.primary, borderRadius: '50%', animation: 'pulse 2s infinite', display: 'inline-block' }} />
                SYSTEM STATUS: {token.graduated ? 'ASCENDED_TO_EKUBO' : 'DIVINE_COMMUNION_ACTIVE'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '2.5rem', textAlign: 'right' }}>
              <div>
                <p style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', margin: '0 0 4px' }}>Current Value</p>
                <p style={{ fontSize: '1.25rem', color: C.primary, margin: 0 }}>
                  {currentPrice ? `${formatPrice(currentPrice)} STRK` : '—'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', margin: '0 0 4px' }}>Market Cap</p>
                <p style={{ fontSize: '1.25rem', color: C.primary, margin: 0 }}>
                  {metrics ? formatMarketCap(metrics.currentMarketCap) : '—'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', margin: '0 0 4px' }}>Sacrifice Vol</p>
                <p style={{ fontSize: '1.25rem', color: C.text, margin: 0 }}>
                  {metrics ? formatMarketCap(metrics.totalVolume) : '—'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', margin: '0 0 4px' }}>Believers</p>
                <p style={{ fontSize: '1.25rem', color: C.primary, margin: 0 }}>
                  {believers.data?.believerCount ?? 0}
                </p>
              </div>
            </div>
          </div>

          {/* ── Main 12-column grid ───────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'stretch' }}>

            {/* Left — chart + rituals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}>

              {/* Chart wrapper */}
              <div style={{
                backgroundColor: C.surfaceLowest,
                border: `1px solid ${C.outlineVariant}`,
                padding: 4, position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.08, pointerEvents: 'none', background: 'radial-gradient(circle at 50% 50%, #9cff93 0%, transparent 70%)' }} />
                <PriceChart tokenId={token.id} height={420} />
              </div>

              {/* Token info strip */}
              <div style={{ backgroundColor: C.surface, border: `1px solid ${C.outlineVariant}`, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                {metadata?.imageUrl && (
                  <img src={metadata.imageUrl} style={{ width: 48, height: 48, objectFit: 'cover', flexShrink: 0 }} alt="" />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ ...headline, fontStyle: 'italic', fontSize: '1.25rem' }}>
                    {metadata?.name || token.name}
                    <span style={{ fontSize: '0.875rem', color: C.primary, marginLeft: 8 }}>${metadata?.symbol || token.symbol}</span>
                    {token.graduated && <span style={{ fontSize: 10, color: C.primary, marginLeft: 12, textTransform: 'uppercase', border: `1px solid ${C.primary}`, padding: '2px 6px' }}>✦ ASCENDED</span>}
                  </div>
                  <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>
                    <span>Contract: {formatAddress(token.contractAddress)}</span>
                    <span style={{ marginLeft: 16 }}>Creator: </span>
                    <Link to={`/profile/${token.createdBy}`} style={{ color: C.primary, textDecoration: 'none' }}>{formatAddress(token.createdBy)} →</Link>
                  </div>
                  {metadata?.manifesto && (
                    <p style={{ fontSize: 11, color: C.textMuted, marginTop: 6, marginBottom: 0, maxWidth: 600 }}>{metadata.manifesto.slice(0, 120)}{metadata.manifesto.length > 120 ? '…' : ''}</p>
                  )}
                </div>
                {!token.graduated && metrics && (
                  <div style={{ minWidth: 180 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.textMuted, marginBottom: 4, textTransform: 'uppercase' }}>
                      <span>Ascension</span>
                      <span style={{ color: C.primary }}>
                        {(Math.min(100, Number((BigInt(metrics.currentMarketCap || '0') * 10000n) / (BigInt('101010') * BigInt('1000000000000000000'))) / 100)).toFixed(1)}%
                      </span>
                    </div>
                    <div style={{ height: 3, backgroundColor: C.surfaceHighest }}>
                      <div style={{ height: '100%', backgroundColor: C.primary, width: `${Math.min(100, Number((BigInt(metrics.currentMarketCap || '0') * 10000n) / (BigInt('101010') * BigInt('1000000000000000000'))) / 100)}%` }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Rituals */}
              <div style={{ backgroundColor: C.surface, border: `1px solid ${C.outlineVariant}`, padding: '1.5rem', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ ...headline, fontStyle: 'italic', fontSize: '1.5rem', margin: 0 }}>RECENT RITUALS</h3>
                  <span style={{ fontSize: 10, color: C.primary + '66', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live Stream</span>
                </div>

                {/* Table header */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr', gap: 16, paddingBottom: 8, borderBottom: `1px solid ${C.outlineVariant}`, marginBottom: 8 }}>
                  {['Essence', 'Block', 'Magnitude', 'STRK'].map((h) => (
                    <span key={h} style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</span>
                  ))}
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {trades.isLoading ? (
                    <div style={{ padding: '1rem', fontSize: 11, color: C.textMuted }}>SYNCING RITUAL STREAM...</div>
                  ) : trades.data?.length ? (
                    trades.data.map((trade) => (
                      <div key={trade.id} style={{
                        display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr', gap: 16,
                        padding: '0.75rem 0', borderBottom: `1px solid rgba(255,255,255,0.03)`,
                        alignItems: 'center',
                      }}>
                        <span style={{ fontWeight: 900, color: trade.side === 0 ? C.primary : C.secondary, textShadow: trade.side === 0 ? `0 0 8px ${C.primaryGlow}` : `0 0 8px rgba(255,114,94,0.4)`, fontSize: 12 }}>
                          {trade.side === 0 ? 'BELIEF' : 'SIN'}
                          {trade.kind === 1 && <span style={{ fontSize: 9, color: C.primary, marginLeft: 4 }}>✦ EKUBO</span>}
                        </span>
                        <span style={{ fontSize: 11, color: C.textMuted }}>{trade.blockNumber}</span>
                        <span style={{ fontSize: 12 }}>{formatWei(trade.tokenQty)} ${token.symbol}</span>
                        <span style={{ fontSize: 11, color: C.textMuted }}>{formatStrk(trade.strkQty)}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '1rem', fontSize: 11, color: C.textMuted }}>NO RITUALS PERFORMED YET.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Right — trading + staking */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <BelieveSinPanel tokenAddress={address} tokenSymbol={token.symbol} />
              <ConvictionPanel
                tokenAddress={address} tokenSymbol={token.symbol}
                totalVolume={metrics?.totalVolume} currentMarketCap={metrics?.currentMarketCap}
                ageDays={token.ageDays}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function TradePage() {
  const { address } = useParams()
  const normalizedAddress = useMemo(() => {
    if (!address) return null
    try { return addAddressPadding(address) } catch { return address }
  }, [address])

  if (!normalizedAddress) return <Landing showHero={false} />
  return <TradeDetail address={normalizedAddress} />
}
