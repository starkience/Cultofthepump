import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCultTokens } from 'cotp/src/data/apiClients/cotpIndexerApi/cotpIndexerApiClient'
import { useCultMetadata, joinCultMetadataByAddress } from 'cotp/src/data/apiClients/cotpMetadataApi/cotpMetadataApiClient'
import { formatMarketCap } from 'cotp/src/utils/format'
import { useEnergy } from 'cotp/src/data/apiClients/cotpIndexerApi/cotpIndexerApiClient'

const M = "'JetBrains Mono', monospace"
const S = "'Newsreader', serif"

const C = {
  surface:    '#131313',
  surfaceHi:  '#191919',
  surfaceHigh:'#1f1f1f',
  surfaceTop: '#262626',
  primary:    '#9cff93',
  primaryDim: '#00ec3b',
  secondary:  '#ff725e',
  text:       '#ffffff',
  muted:      '#ababab',
}

type LeaderboardTab = 'volume' | 'believers' | 'graduation'

const GRADUATION_THRESHOLD_WEI = BigInt('101010') * BigInt('1000000000000000000')

const TABS: Record<LeaderboardTab, { label: string; orderBy: 'volume' | 'believers' | 'graduation'; col: string }> = {
  volume:     { label: 'Most Traded',    orderBy: 'volume',     col: 'Rituals'      },
  believers:  { label: 'Most Believers', orderBy: 'believers',  col: 'Believers'    },
  graduation: { label: 'Near Ascension', orderBy: 'graduation', col: 'To Ascension' },
}

const RANK_ICONS = ['visibility', 'skull', 'auto_awesome']

function formatAddress(a: string) { return `${a.slice(0, 6)}…${a.slice(-4)}` }

export default function LeaderboardPage() {
  const [tab, setTab] = useState<LeaderboardTab>('volume')
  const { orderBy, col } = TABS[tab]

  const cultTokens  = useCultTokens({ params: { orderBy, limit: 20 }, refetchInterval: 10_000 })
  const cultMetadata = useCultMetadata({ refetchInterval: 10_000 })
  const { data: energy } = useEnergy()

  const joined = useMemo(
    () => joinCultMetadataByAddress(cultTokens.data || [], cultMetadata.data || []),
    [cultTokens.data, cultMetadata.data]
  )

  const topEntry = joined[0]

  return (
    <>
      <style>{`
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        .prophet-row:hover { background: #1f1f1f !important; }
        .tab-btn:hover { color: #9cff93 !important; }
        button:focus-visible { outline: 2px solid #9cff93; outline-offset: 2px; }
        a:focus-visible { outline: 2px solid #9cff93; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: 1000, padding: '0 0 80px 0', color: C.text }}>

        {/* ── Page Header ── */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 32 }}>
            <div style={{ paddingLeft: 20, borderLeft: `4px solid ${C.primary}` }}>
              <h1 style={{
                fontFamily: S, fontSize: 'clamp(2rem,4vw,3rem)',
                fontStyle: 'italic', fontWeight: 700,
                color: C.text, margin: '0 0 8px 0', letterSpacing: '-0.02em',
              }}>
                Hall of Prophets
              </h1>
              <p style={{ fontFamily: M, fontSize: 11, color: C.muted, margin: 0 }}>
                The leaderboard of the chosen. Those who summoned cults from the void.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%', background: C.primary,
                display: 'inline-block', animation: 'blink 2s ease-in-out infinite',
                boxShadow: `0 0 6px ${C.primary}`,
              }} />
              <span style={{ fontFamily: M, fontSize: 10, color: `${C.primary}99`, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                LIVE RANKING
              </span>
            </div>
          </div>

          {/* Energy stats row */}
          {energy && (
            <div style={{
              display: 'flex', gap: 32, flexWrap: 'wrap',
              padding: '16px 24px',
              background: C.surface,
              border: `1px solid rgba(156,255,147,0.06)`,
              marginBottom: 32,
            }}>
              {/* Energy bar */}
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: M, fontSize: 9, color: `${C.primary}88`, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Cult Energy</span>
                  <span style={{ fontFamily: M, fontSize: 9, color: C.primary, fontWeight: 700 }}>{energy.score}/100</span>
                </div>
                <div style={{ height: 3, background: C.surfaceTop, width: '100%' }}>
                  <div style={{
                    height: '100%', width: `${energy.score}%`,
                    background: C.primary, boxShadow: `0 0 6px ${C.primary}`,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
                {[
                  { label: 'Total Believers', value: energy.uniqueBelievers?.toLocaleString() ?? '—' },
                  { label: 'Recent Rituals',  value: energy.recentTrades?.toLocaleString()    ?? '—' },
                  { label: 'Active Cults',    value: energy.activeCults?.toLocaleString()      ?? '—' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <span style={{ display: 'block', fontFamily: M, fontSize: 9, color: `${C.primary}55`, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                      {label}
                    </span>
                    <span style={{ display: 'block', fontFamily: S, fontSize: '1.5rem', fontStyle: 'italic', color: C.primary, lineHeight: 1 }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Leaderboard Table ── */}
        <div style={{ background: C.surface, border: `1px solid rgba(156,255,147,0.06)` }}>

          {/* Tab bar */}
          <div style={{
            display: 'flex',
            background: C.surfaceHi,
            borderBottom: `1px solid rgba(156,255,147,0.06)`,
          }}>
            {(Object.keys(TABS) as LeaderboardTab[]).map((t) => (
              <button
                key={t}
                className="tab-btn"
                onClick={() => setTab(t)}
                style={{
                  padding: '12px 20px',
                  background: 'none', border: 'none',
                  borderBottom: tab === t ? `2px solid ${C.primary}` : '2px solid transparent',
                  color: tab === t ? C.primary : C.muted,
                  fontFamily: M, fontSize: 10,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  cursor: 'pointer', marginBottom: -1,
                  transition: 'color 0.1s',
                }}
              >
                {TABS[t].label}
              </button>
            ))}
          </div>

          {/* Column headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '60px 1fr 120px 160px 100px',
            gap: 16, padding: '10px 24px',
            background: C.surfaceHi,
            borderBottom: `1px solid rgba(156,255,147,0.06)`,
          }}>
            {['Rank', 'Cult', 'Mkt Cap', 'Conviction', col].map((h) => (
              <span key={h} style={{ fontFamily: M, fontSize: 9, color: `${C.primary}55`, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {cultTokens.isLoading ? (
            <div style={{ padding: '40px 24px', fontFamily: M, fontSize: 11, color: C.muted }}>
              [INIT] Syncing with Starknet node...
              <span style={{ display: 'inline-block', width: 6, height: 12, background: C.primary, verticalAlign: 'middle', marginLeft: 6, animation: 'blink 1s step-end infinite' }} />
            </div>
          ) : joined.length === 0 ? (
            <div style={{ padding: '40px 24px', fontFamily: M, fontSize: 11, color: C.muted }}>
              [SYSTEM] No cults to rank yet.
            </div>
          ) : (
            joined.map(({ token, metadata }, index) => {
              const rank = index + 1
              const isTop3 = rank <= 3
              const pct = Math.min(100, Number(
                (BigInt(token.currentMarketCap || '0') * 10000n) / GRADUATION_THRESHOLD_WEI
              ) / 100)
              const metric = tab === 'graduation'
                ? `${pct.toFixed(1)}%`
                : tab === 'believers'
                ? `${(token.believerCount ?? 0).toLocaleString()}`
                : `${(token.tradeCount ?? 0).toLocaleString()}`

              return (
                <Link
                  key={token.contractAddress}
                  to={`/trade/${token.contractAddress}`}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <div
                    className="prophet-row"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '60px 1fr 120px 160px 100px',
                      gap: 16, padding: '14px 24px', alignItems: 'center',
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      background: 'transparent', transition: 'background 0.1s',
                      opacity: rank > 5 ? Math.max(0.55, 1 - (rank - 5) * 0.04) : 1,
                      animation: `fadeIn 0.2s ease both`,
                      animationDelay: `${Math.min(index * 0.02, 0.4)}s`,
                    }}
                  >
                    {/* Rank */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: isTop3 ? 16 : 13,
                          color: isTop3 ? C.primary : `${C.primary}33`,
                          fontVariationSettings: isTop3 ? "'FILL' 1" : "'FILL' 0",
                        }}
                      >
                        {isTop3 ? RANK_ICONS[rank - 1] : 'pentagon'}
                      </span>
                      <span style={{ fontFamily: M, fontSize: 12, fontWeight: 700, color: isTop3 ? C.primary : C.muted }}>
                        {String(rank).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Cult identity */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <div style={{
                        width: 36, height: 36, flexShrink: 0,
                        background: C.surfaceHigh,
                        border: `1px solid ${C.primary}20`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden',
                      }}>
                        {metadata?.imageUrl
                          ? <img src={metadata.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                          : <span style={{ fontFamily: M, fontSize: 10, color: C.primary, fontWeight: 700 }}>
                              {(metadata?.symbol || token.symbol || '?').slice(0, 3)}
                            </span>
                        }
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontFamily: S, fontSize: '1.05rem', fontStyle: 'italic',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: C.text,
                        }}>
                          {metadata?.name || token.name}
                        </div>
                        <div style={{ fontFamily: M, fontSize: 10, color: C.primary, letterSpacing: '0.04em', marginTop: 2 }}>
                          ${metadata?.symbol || token.symbol}
                          <span style={{ color: C.muted, marginLeft: 6 }}>{formatAddress(token.contractAddress)}</span>
                          {token.graduated && (
                            <span style={{ color: C.primaryDim, marginLeft: 8, letterSpacing: '0.1em' }}>✦ ASCENDED</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Market cap */}
                    <div style={{ fontFamily: S, fontStyle: 'italic', fontSize: '1.05rem', color: C.primary }}>
                      {formatMarketCap(token.currentMarketCap)}
                    </div>

                    {/* Ascension progress bar */}
                    <div>
                      <div style={{ height: 3, width: '100%', background: C.surfaceTop }}>
                        <div style={{
                          height: '100%',
                          background: isTop3 ? C.primary : `${C.primary}80`,
                          width: `${Math.max(0.5, pct)}%`,
                          boxShadow: isTop3 ? `0 0 6px ${C.primary}` : 'none',
                          transition: 'width 0.6s ease',
                        }} />
                      </div>
                      <span style={{ fontFamily: M, fontSize: 9, color: `${C.primary}66`, marginTop: 4, display: 'block', textTransform: 'uppercase' }}>
                        {pct.toFixed(1)}% to ascension
                      </span>
                    </div>

                    {/* Metric */}
                    <div style={{ textAlign: 'right', fontFamily: S, fontStyle: 'italic', fontSize: '1.2rem', color: C.text }}>
                      {metric}
                    </div>
                  </div>
                </Link>
              )
            })
          )}

          {/* Table footer */}
          <div style={{
            padding: '8px 24px',
            background: '#000000',
            borderTop: `1px solid rgba(156,255,147,0.05)`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontFamily: M, fontSize: 9, color: `${C.primary}44`, textTransform: 'uppercase' }}>
              SHOWING {joined.length} CULTS — STARKNET-01
            </span>
            <span style={{ fontFamily: M, fontSize: 9, color: `${C.primary}44` }}>
              {new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'medium', timeZone: 'UTC' }).format(new Date())} UTC
            </span>
          </div>
        </div>

        {/* ── Spotlight ── */}
        {topEntry && (
          <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 24, marginTop: 40 }}>

            {/* Top cult card */}
            <div style={{
              background: C.surfaceHigh, padding: '2rem',
              borderLeft: `4px solid ${C.primary}`,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', right: -32, bottom: -32, opacity: 0.03,
                fontFamily: 'Material Symbols Outlined', fontSize: 180, lineHeight: 1,
                pointerEvents: 'none', userSelect: 'none' as const,
              }}>
                visibility
              </div>
              <span style={{
                display: 'inline-block', padding: '2px 8px',
                background: C.primary, color: '#006413',
                fontFamily: M, fontSize: 9, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16,
              }}>
                ASCENDING CULT
              </span>
              <h3 style={{ fontFamily: S, fontSize: '2rem', fontStyle: 'italic', margin: '0 0 12px', color: C.text }}>
                {topEntry.metadata?.name || topEntry.token.name}
                <span style={{ fontFamily: M, fontSize: '0.875rem', color: C.primary, marginLeft: 12 }}>
                  ${topEntry.metadata?.symbol || topEntry.token.symbol}
                </span>
              </h3>
              <p style={{ fontFamily: M, fontSize: 11, color: C.muted, lineHeight: 1.7, marginBottom: 24 }}>
                {topEntry.token.tradeCount ?? 0} rituals performed — {topEntry.token.believerCount ?? 0} believers bound.
                Their conviction remains unshakable.
              </p>
              <Link to={`/trade/${topEntry.token.contractAddress}`} style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '8px 24px',
                  background: C.primary, color: '#006413',
                  fontFamily: M, fontWeight: 700, fontSize: 10,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  border: 'none', cursor: 'pointer',
                }}>
                  ENTER RITUAL
                </button>
              </Link>
            </div>

            {/* Shadow realm */}
            <div style={{
              background: C.surfaceHi,
              border: `1px solid rgba(255,114,94,0.1)`,
              padding: '2rem',
              display: 'flex', flexDirection: 'column',
              justifyContent: 'center', alignItems: 'center', textAlign: 'center',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: C.secondary, marginBottom: 16 }}>
                error
              </span>
              <h3 style={{ fontFamily: S, fontSize: '1.75rem', fontStyle: 'italic', color: C.secondary, margin: '0 0 8px' }}>
                Shadow Realm
              </h3>
              <p style={{ fontFamily: M, fontSize: 9, color: `${C.secondary}88`, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                Restricted access protocol
              </p>
              <p style={{ fontFamily: M, fontSize: 11, color: C.muted, lineHeight: 1.7, margin: 0 }}>
                Cults that stagnate without ritual are cast into the void of zero liquidity.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
