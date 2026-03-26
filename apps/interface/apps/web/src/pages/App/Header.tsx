import { memo, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useReadContract } from '@starknet-react/core'
import { BlockTag } from 'starknet'
import { HEADER_HEIGHT, SIDEBAR_WIDTH } from './utils/shared'
import { Connect2Button } from 'components/PrivyConnect'
import { DutchAuctionABI, DUTCH_AUCTION_ADDRESS } from 'cotp/src/constants/contracts'

const M = "'JetBrains Mono', monospace"

// ─── Auction Countdown ────────────────────────────────────────────────────────
function AuctionCountdown() {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000))

  const { data: startRaw } = useReadContract({
    abi: DutchAuctionABI,
    address: DUTCH_AUCTION_ADDRESS as `0x${string}`,
    functionName: 'start_timestamp',
    args: [],
    blockIdentifier: BlockTag.LATEST,
    refetchInterval: 15_000,
  })
  const { data: durationRaw } = useReadContract({
    abi: DutchAuctionABI,
    address: DUTCH_AUCTION_ADDRESS as `0x${string}`,
    functionName: 'duration',
    args: [],
    blockIdentifier: BlockTag.LATEST,
    refetchInterval: 60_000,
  })

  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000)
    return () => clearInterval(id)
  }, [])

  if (!startRaw || !durationRaw) return null

  const start    = Number(startRaw)
  const duration = Number(durationRaw)
  const end      = start + duration
  const remaining = end - now

  if (remaining <= 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff725e', display: 'inline-block', boxShadow: '0 0 5px #ff725e' }} />
        <span style={{ fontFamily: M, fontSize: 9, color: '#ff725e', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          AUCTION EXPIRED
        </span>
      </div>
    )
  }

  const h = Math.floor(remaining / 3600)
  const m = Math.floor((remaining % 3600) / 60)
  const s = remaining % 60
  const fmt = (n: number) => String(n).padStart(2, '0')
  const urgent = remaining < 300 // < 5 min

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: urgent ? '#ff725e' : '#9cff93',
        display: 'inline-block',
        boxShadow: urgent ? '0 0 5px #ff725e' : '0 0 5px #9cff93',
        animation: urgent ? 'header-blink 0.8s step-end infinite' : 'header-blink 3s ease-in-out infinite',
      }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
        <span style={{ fontFamily: M, fontSize: 7, color: 'rgba(156,255,147,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1 }}>
          NEXT AUCTION
        </span>
        <span style={{
          fontFamily: M, fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', lineHeight: 1,
          color: urgent ? '#ff725e' : '#9cff93',
          textShadow: urgent ? '0 0 8px #ff725e' : '0 0 6px rgba(156,255,147,0.5)',
        }}>
          {h > 0 ? `${fmt(h)}:` : ''}{fmt(m)}:{fmt(s)}
        </span>
      </div>
    </div>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────
export const Header = memo(function Header() {
  return (
    <>
      <style>{`@keyframes header-blink { 50% { opacity: 0; } }`}</style>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: HEADER_HEIGHT,
        background: 'rgba(13,13,13,0.95)',
        borderBottom: '1px solid rgba(156,255,147,0.08)',
        display: 'flex', alignItems: 'center',
        zIndex: 50, backdropFilter: 'blur(8px)',
      }}>
        {/* Logo */}
        <div style={{
          width: SIDEBAR_WIDTH, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRight: '1px solid rgba(156,255,147,0.05)', height: '100%',
        }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: M, fontSize: 14, fontWeight: 700, fontStyle: 'italic', color: '#9cff93', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              THE CULT
            </span>
          </Link>
        </div>

        {/* Right side */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 24, gap: 20 }}>
          <AuctionCountdown />
          <div style={{ width: 1, height: 24, background: 'rgba(156,255,147,0.08)' }} />
          <Connect2Button />
        </div>
      </header>
    </>
  )
})
