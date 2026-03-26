import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCultMetadata, joinCultMetadataByAddress } from 'cotp/src/data/apiClients/cotpMetadataApi/cotpMetadataApiClient'
import { useCultTokens } from 'cotp/src/data/apiClients/cotpIndexerApi/cotpIndexerApiClient'
import { formatMarketCap } from 'cotp/src/utils/format'
import { ChatRoom } from 'components/ChatRoom'
import { useEnergy } from 'cotp/src/data/apiClients/cotpIndexerApi/cotpIndexerApiClient'
import { HEADER_HEIGHT } from 'pages/App/utils/shared'

const GRADUATION_THRESHOLD_WEI = BigInt('101010') * BigInt('1000000000000000000')

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

const M = "'JetBrains Mono', monospace"
const S = "'Newsreader', serif"
const B = "'Space Grotesk', sans-serif"

const C = {
  surface:    '#131313',
  surfaceHi:  '#191919',
  surfaceTop: '#1f1f1f',
  primary:    '#9cff93',
  secondary:  '#ff725e',
  text:       '#ffffff',
  muted:      '#ababab',
}

type SortMode = 'newest' | 'volume' | 'graduation' | 'believers'

type LeaderboardTab = 'volume' | 'believers' | 'graduation'
const LB_TABS: Record<LeaderboardTab, { label: string; orderBy: 'volume' | 'believers' | 'graduation'; col: string }> = {
  volume:     { label: 'Most Traded',    orderBy: 'volume',     col: 'Rituals'      },
  believers:  { label: 'Most Believers', orderBy: 'believers',  col: 'Believers'    },
  graduation: { label: 'Near Ascension', orderBy: 'graduation', col: 'To Ascension' },
}
const RANK_ICONS = ['visibility', 'skull', 'auto_awesome']
function fmtAddr(a: string) { return `${a.slice(0, 6)}…${a.slice(-4)}` }

export default function Landing() {
  const [search, setSearch] = useState('')
  const [sort, setSort]     = useState<SortMode>('newest')
  const [lbTab, setLbTab]   = useState<LeaderboardTab>('volume')

  const cultTokens  = useCultTokens({ params: { orderBy: sort }, refetchInterval: 10_000 })
  const cultMetadata = useCultMetadata({ refetchInterval: 10_000 })
  const { data: energy } = useEnergy()

  const lbTokens = useCultTokens({ params: { orderBy: LB_TABS[lbTab].orderBy, limit: 10 }, refetchInterval: 10_000 })

  const joined = useMemo(
    () => joinCultMetadataByAddress(cultTokens.data || [], cultMetadata.data || []),
    [cultTokens.data, cultMetadata.data]
  )

  const lbJoined = useMemo(
    () => joinCultMetadataByAddress(lbTokens.data || [], cultMetadata.data || []),
    [lbTokens.data, cultMetadata.data]
  )

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) return joined
    return joined.filter(({ token, metadata }) =>
      [token.name, token.symbol, metadata?.name, metadata?.symbol, metadata?.manifesto]
        .filter(Boolean).join(' ').toLowerCase().includes(needle)
    )
  }, [joined, search])

  const filterButtons: { label: string; mode: SortMode }[] = [
    { label: 'NEWEST',         mode: 'newest'     },
    { label: 'MOST BELIEVED',  mode: 'believers'  },
    { label: 'NEAR ASCENSION', mode: 'graduation' },
    { label: 'MOST SINS',      mode: 'volume'     },
  ]

  return (
    <>
      <style>{`
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        .ritual-card:hover { border-color: rgba(156,255,147,0.25) !important; }
        .ritual-card:hover .join-btn { background: #9cff93 !important; color: #006413 !important; box-shadow: 0 0 14px #9cff93 !important; }
        .filter-btn:hover { background: #1f1f1f !important; color: #9cff93 !important; }
        .prophet-row:hover { background: #1f1f1f !important; }
        input:focus-visible { border-bottom-color: #9cff93 !important; outline: 2px solid transparent; }
        button:focus-visible { outline: 2px solid #9cff93; outline-offset: 2px; }
        a:focus-visible { outline: 2px solid #9cff93; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* ── 2-col outer layout ── */}
      <div style={{ width: '100%', display: 'flex', alignItems: 'flex-start', paddingLeft: 24 }}>

        {/* ══ LEFT: token grid ══ */}
        <div style={{ flex: 1, minWidth: 0, paddingBottom: 32, paddingRight: 364 }}>

          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
            <div>
              <span style={{ display: 'block', fontFamily: M, fontSize: 9, color: `${C.primary}66`, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 4 }}>
                Live Initiations
              </span>
              <h1 style={{ fontFamily: S, fontSize: 'clamp(2rem,4vw,3rem)', fontStyle: 'italic', fontWeight: 700, color: C.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                Current Rituals
              </h1>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for a Cult…"
                aria-label="Search for a cult"
                name="cult-search"
                autoComplete="off"
                spellCheck={false}
                style={{
                  background: 'transparent', border: 'none',
                  borderBottom: `2px solid rgba(156,255,147,0.25)`,
                  color: C.primary, fontFamily: M, fontSize: 11,
                  padding: '7px 32px 7px 10px', outline: 'none', width: 220,
                }}
              />
              <span aria-hidden="true" className="material-symbols-outlined" style={{
                position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                color: `${C.primary}44`, fontSize: 15, pointerEvents: 'none',
              }}>search</span>
            </div>
          </div>

          {/* Filter bar */}
          <div style={{
            display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8,
            paddingBottom: 20, borderBottom: `1px solid rgba(72,72,72,0.12)`,
            marginBottom: 24,
          }}>
            {filterButtons.map(({ label, mode }) => (
              <button key={mode} className="filter-btn" onClick={() => setSort(mode)} style={{
                background: sort === mode ? C.primary : C.surfaceTop,
                border: sort === mode ? 'none' : `1px solid #484848`,
                color: sort === mode ? '#006413' : C.muted,
                fontFamily: M, fontSize: 9, letterSpacing: '0.12em', padding: '6px 16px',
                cursor: 'pointer', fontWeight: sort === mode ? 700 : 400,
                boxShadow: sort === mode ? `0 0 10px ${C.primary}` : 'none',
                transition: 'background 0.1s, color 0.1s, box-shadow 0.1s, border-color 0.1s',
              }}>{label}</button>
            ))}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.primary, display: 'inline-block', animation: 'blink 2s infinite', boxShadow: `0 0 5px ${C.primary}` }} />
              <span style={{ fontFamily: M, fontSize: 9, color: C.muted }}>
                {filtered.length} ACTIVE
              </span>
            </div>
          </div>

          {/* Card grid */}
          {cultTokens.isLoading || cultMetadata.isLoading ? (
            <div style={{ fontFamily: M, fontSize: 11, color: C.muted, padding: '32px 0' }}>
              [INIT] Loading congregational metadata...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '32px 0' }}>
              <p style={{ fontFamily: M, fontSize: 13, color: C.muted }}>No cults matched your search.</p>
              <Link to="/summon" style={{ textDecoration: 'none' }}>
                <button style={{
                  background: C.primary, color: '#006413', fontFamily: M, fontSize: 10,
                  letterSpacing: '0.15em', padding: '10px 24px', border: 'none', cursor: 'pointer', fontWeight: 700,
                }}>MANIFEST NEW CONGREGATION</button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {filtered.map(({ token, metadata }) => {
                const ascPct = Math.min(100, Math.max(0.5,
                  Number((BigInt(token.currentMarketCap || '0') * 10000n) / GRADUATION_THRESHOLD_WEI) / 100
                ))
                const name   = metadata?.name   || token.name
                const symbol = metadata?.symbol  || token.symbol
                const apr    = computeStakingApr(token.totalVolume, token.currentMarketCap, token.ageDays)

                return (
                  <Link key={token.contractAddress} to={`/trade/${token.contractAddress}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="ritual-card" style={{
                      background: C.surfaceTop,
                      border: `1px solid rgba(255,255,255,0.05)`,
                      padding: 20, cursor: 'pointer',
                      transition: 'border-color 0.15s',
                    }}>
                      {/* Top row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <div style={{
                          width: 52, height: 52, background: C.surfaceHi,
                          border: `1px solid rgba(156,255,147,0.08)`,
                          overflow: 'hidden', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {metadata?.imageUrl
                            ? <img src={metadata.imageUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'screen', opacity: 0.85 }} />
                            : <span style={{ fontFamily: M, fontSize: 9, color: C.primary }}>${symbol?.slice(0, 4)}</span>
                          }
                        </div>
                        <div style={{ textAlign: 'right', flex: 1, paddingLeft: 10 }}>
                          <p style={{ fontFamily: M, fontSize: 8, color: `${C.primary}55`, margin: '0 0 3px 0' }}>${symbol}</p>
                          <h3 style={{ fontFamily: S, fontSize: '1.1rem', fontStyle: 'italic', color: C.text, margin: 0, lineHeight: 1.1, wordBreak: 'break-word' }}>{name}</h3>
                          {token.graduated && (
                            <span style={{ fontFamily: M, fontSize: 8, color: '#006413', background: C.primary, padding: '1px 5px', marginTop: 3, display: 'inline-block' }}>✦ ASCENDED</span>
                          )}
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: M, fontSize: 8, marginBottom: 3 }}>
                          <span style={{ color: `${C.primary}55` }}>ASCENSION</span>
                          <span style={{ color: C.primary, fontWeight: 700 }}>{ascPct.toFixed(1)}%</span>
                        </div>
                        <div style={{ height: 1, background: '#262626', width: '100%' }}>
                          <div style={{ height: '100%', width: `${ascPct}%`, background: C.primary }} />
                        </div>
                      </div>

                      {/* Stats */}
                      <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6,
                        padding: '10px 0', borderTop: `1px solid rgba(72,72,72,0.12)`,
                        borderBottom: `1px solid rgba(72,72,72,0.12)`, marginBottom: 12,
                      }}>
                        {[
                          { label: 'Believers', value: (token.believerCount ?? token.tradeCount ?? 0).toLocaleString() },
                          { label: 'Mkt Cap',   value: formatMarketCap(token.currentMarketCap) },
                          { label: 'Stake APR', value: apr, glow: true },
                        ].map(({ label, value, glow }) => (
                          <div key={label}>
                            <p style={{ fontFamily: M, fontSize: 7, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 2px 0' }}>{label}</p>
                            <p style={{ fontFamily: M, fontSize: 11, margin: 0, color: value && glow ? '#00ec3b' : C.primary, textShadow: value && glow ? '0 0 5px #00ec3b' : 'none' }}>
                              {value ?? '—'}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: M, fontSize: 8, color: `${C.secondary}88` }}>{token.tradeCount ?? 0} RITUALS</span>
                        <div className="join-btn" style={{
                          border: `1px solid ${C.primary}`,
                          color: C.primary, fontFamily: M, fontSize: 8,
                          letterSpacing: '0.15em', padding: '4px 10px',
                          transition: 'border-color 0.15s, background 0.15s, color 0.15s, box-shadow 0.15s',
                        }}>
                          JOIN RITUAL
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}

              {/* Summon slot */}
              <Link to="/summon" style={{ textDecoration: 'none' }}>
                <div className="ritual-card" style={{
                  border: `2px dashed rgba(156,255,147,0.07)`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: 20, textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s',
                  height: '100%', boxSizing: 'border-box',
                }}>
                  <span className="material-symbols-outlined" style={{ color: `${C.primary}25`, fontSize: 36, marginBottom: 10 }}>add_circle</span>
                  <p style={{ fontFamily: S, fontSize: '1rem', fontStyle: 'italic', color: `${C.primary}44`, margin: '0 0 6px 0' }}>Manifest New Congregation</p>
                  <p style={{ fontFamily: M, fontSize: 8, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>Summon a new token</p>
                </div>
              </Link>
            </div>
          )}

          {/* ══ Hall of Prophets ══ */}
          <div style={{ marginTop: 56 }}>
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
              <div style={{ paddingLeft: 20, borderLeft: `4px solid ${C.primary}` }}>
                <span style={{ display: 'block', fontFamily: M, fontSize: 9, color: `${C.primary}66`, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 4 }}>
                  On-chain Rankings
                </span>
                <h2 style={{ fontFamily: S, fontSize: 'clamp(2rem,4vw,3rem)', fontStyle: 'italic', fontWeight: 700, color: C.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                  Hall of Prophets
                </h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.primary, display: 'inline-block', animation: 'blink 2s ease-in-out infinite', boxShadow: `0 0 6px ${C.primary}` }} />
                <span style={{ fontFamily: M, fontSize: 9, color: `${C.primary}99`, textTransform: 'uppercase', letterSpacing: '0.1em' }}>LIVE RANKING</span>
              </div>
            </div>

            {/* Energy stats */}
            {energy && (
              <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', padding: '14px 20px', background: C.surface, border: `1px solid rgba(156,255,147,0.06)`, marginBottom: 20 }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontFamily: M, fontSize: 9, color: `${C.primary}88`, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Cult Energy</span>
                    <span style={{ fontFamily: M, fontSize: 9, color: C.primary, fontWeight: 700 }}>{energy.score}/100</span>
                  </div>
                  <div style={{ height: 3, background: C.surfaceTop, width: '100%' }}>
                    <div style={{ height: '100%', width: `${energy.score}%`, background: C.primary, boxShadow: `0 0 6px ${C.primary}`, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Total Believers', value: energy.uniqueBelievers?.toLocaleString() ?? '—' },
                    { label: 'Recent Rituals',  value: energy.recentTrades?.toLocaleString()    ?? '—' },
                    { label: 'Active Cults',    value: energy.activeCults?.toLocaleString()      ?? '—' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <span style={{ display: 'block', fontFamily: M, fontSize: 8, color: `${C.primary}55`, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{label}</span>
                      <span style={{ display: 'block', fontFamily: S, fontSize: '1.3rem', fontStyle: 'italic', color: C.primary, lineHeight: 1 }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab bar + table */}
            <div style={{ background: C.surface, border: `1px solid rgba(156,255,147,0.06)` }}>
              <div style={{ display: 'flex', background: C.surfaceHi, borderBottom: `1px solid rgba(156,255,147,0.06)` }}>
                {(Object.keys(LB_TABS) as LeaderboardTab[]).map(t => (
                  <button key={t} onClick={() => setLbTab(t)} style={{
                    padding: '11px 18px', background: 'none', border: 'none',
                    borderBottom: lbTab === t ? `2px solid ${C.primary}` : '2px solid transparent',
                    color: lbTab === t ? C.primary : C.muted,
                    fontFamily: M, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em',
                    cursor: 'pointer', marginBottom: -1, transition: 'color 0.1s',
                  }}>{LB_TABS[t].label}</button>
                ))}
              </div>

              {/* Column headers */}
              <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr 110px 140px 90px', gap: 12, padding: '9px 20px', background: C.surfaceHi, borderBottom: `1px solid rgba(156,255,147,0.06)` }}>
                {['Rank', 'Cult', 'Mkt Cap', 'Conviction', LB_TABS[lbTab].col].map(h => (
                  <span key={h} style={{ fontFamily: M, fontSize: 8, color: `${C.primary}55`, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</span>
                ))}
              </div>

              {lbTokens.isLoading ? (
                <div style={{ padding: '32px 20px', fontFamily: M, fontSize: 11, color: C.muted }}>[INIT] Syncing...</div>
              ) : lbJoined.map(({ token, metadata }, index) => {
                const rank = index + 1
                const isTop3 = rank <= 3
                const pct = Math.min(100, Number((BigInt(token.currentMarketCap || '0') * 10000n) / GRADUATION_THRESHOLD_WEI) / 100)
                const metric = lbTab === 'graduation' ? `${pct.toFixed(1)}%`
                  : lbTab === 'believers' ? (token.believerCount ?? 0).toLocaleString()
                  : (token.tradeCount ?? 0).toLocaleString()
                const name = metadata?.name || token.name
                const symbol = metadata?.symbol || token.symbol

                return (
                  <Link key={token.contractAddress} to={`/trade/${token.contractAddress}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                    <div className="prophet-row" style={{
                      display: 'grid', gridTemplateColumns: '52px 1fr 110px 140px 90px',
                      gap: 12, padding: '12px 20px', alignItems: 'center',
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      background: 'transparent', transition: 'background 0.1s',
                      animation: 'fadeIn 0.2s ease both',
                      animationDelay: `${Math.min(index * 0.02, 0.4)}s`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: isTop3 ? 15 : 12, color: isTop3 ? C.primary : `${C.primary}33`, fontVariationSettings: isTop3 ? "'FILL' 1" : "'FILL' 0" }}>
                          {isTop3 ? RANK_ICONS[rank - 1] : 'pentagon'}
                        </span>
                        <span style={{ fontFamily: M, fontSize: 12, fontWeight: 700, color: isTop3 ? C.primary : C.muted }}>{String(rank).padStart(2, '0')}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <div style={{ width: 32, height: 32, flexShrink: 0, background: C.surfaceHi, border: `1px solid ${C.primary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {metadata?.imageUrl
                            ? <img src={metadata.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                            : <span style={{ fontFamily: M, fontSize: 9, color: C.primary }}>{(symbol || '?').slice(0, 3)}</span>
                          }
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontFamily: S, fontSize: '1rem', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: C.text }}>{name}</div>
                          <div style={{ fontFamily: M, fontSize: 9, color: C.primary, marginTop: 1 }}>
                            ${symbol}<span style={{ color: C.muted, marginLeft: 5 }}>{fmtAddr(token.contractAddress)}</span>
                            {token.graduated && <span style={{ color: '#00ec3b', marginLeft: 6 }}>✦ ASCENDED</span>}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontFamily: S, fontStyle: 'italic', fontSize: '1rem', color: C.primary }}>{formatMarketCap(token.currentMarketCap)}</div>

                      <div>
                        <div style={{ height: 3, width: '100%', background: C.surfaceTop }}>
                          <div style={{ height: '100%', background: isTop3 ? C.primary : `${C.primary}80`, width: `${Math.max(0.5, pct)}%`, boxShadow: isTop3 ? `0 0 6px ${C.primary}` : 'none', transition: 'width 0.6s ease' }} />
                        </div>
                        <span style={{ fontFamily: M, fontSize: 8, color: `${C.primary}55`, marginTop: 3, display: 'block' }}>{pct.toFixed(1)}% to ascension</span>
                      </div>

                      <div style={{ textAlign: 'right', fontFamily: S, fontStyle: 'italic', fontSize: '1.1rem', color: C.text }}>{metric}</div>
                    </div>
                  </Link>
                )
              })}

              <div style={{ padding: '7px 20px', background: '#000', borderTop: `1px solid rgba(156,255,147,0.05)`, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: M, fontSize: 9, color: `${C.primary}44`, textTransform: 'uppercase' }}>SHOWING {lbJoined.length} CULTS — STARKNET-01</span>
                <span style={{ fontFamily: M, fontSize: 9, color: `${C.primary}44` }}>{new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'medium', timeZone: 'UTC' }).format(new Date())} UTC</span>
              </div>
            </div>

            {/* ── Spotlight: Ascending Cult + Shadow Realm ── */}
            {lbJoined.length > 0 && (() => {
              const top = lbJoined[0]
              return (
                <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 20, marginTop: 20 }}>

                  {/* Ascending cult */}
                  <div style={{
                    background: C.surfaceTop, padding: '1.75rem',
                    borderLeft: `4px solid ${C.primary}`,
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <div style={{
                      position: 'absolute', right: -24, bottom: -24, opacity: 0.03,
                      fontFamily: 'Material Symbols Outlined', fontSize: 160, lineHeight: 1,
                      pointerEvents: 'none', userSelect: 'none',
                    }}>visibility</div>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px',
                      background: C.primary, color: '#006413',
                      fontFamily: M, fontSize: 9, fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14,
                    }}>ASCENDING CULT</span>
                    <h3 style={{ fontFamily: S, fontSize: '1.75rem', fontStyle: 'italic', margin: '0 0 10px', color: C.text }}>
                      {top.metadata?.name || top.token.name}
                      <span style={{ fontFamily: M, fontSize: '0.8rem', color: C.primary, marginLeft: 10 }}>
                        ${top.metadata?.symbol || top.token.symbol}
                      </span>
                    </h3>
                    <p style={{ fontFamily: M, fontSize: 10, color: C.muted, lineHeight: 1.7, marginBottom: 20 }}>
                      {top.token.tradeCount ?? 0} rituals performed — {top.token.believerCount ?? 0} believers bound.
                      Their conviction remains unshakable.
                    </p>
                    <Link to={`/trade/${top.token.contractAddress}`} style={{ textDecoration: 'none' }}>
                      <button style={{
                        padding: '8px 20px', background: C.primary, color: '#006413',
                        fontFamily: M, fontWeight: 700, fontSize: 9,
                        textTransform: 'uppercase', letterSpacing: '0.1em',
                        border: 'none', cursor: 'pointer',
                      }}>ENTER RITUAL</button>
                    </Link>
                  </div>

                  {/* Shadow Realm */}
                  <div style={{
                    background: C.surfaceHi,
                    border: `1px solid rgba(255,114,94,0.1)`,
                    padding: '1.75rem',
                    display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', alignItems: 'center', textAlign: 'center',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 36, color: C.secondary, marginBottom: 14 }}>error</span>
                    <h3 style={{ fontFamily: S, fontSize: '1.5rem', fontStyle: 'italic', color: C.secondary, margin: '0 0 6px' }}>Shadow Realm</h3>
                    <p style={{ fontFamily: M, fontSize: 8, color: `${C.secondary}88`, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
                      Restricted access protocol
                    </p>
                    <p style={{ fontFamily: M, fontSize: 10, color: C.muted, lineHeight: 1.7, margin: 0 }}>
                      Cults that stagnate without ritual are cast into the void of zero liquidity.
                    </p>
                  </div>
                </div>
              )
            })()}
          </div>

        </div>

        {/* ══ RIGHT: chat panel — fixed to viewport right edge ══ */}
        <div style={{
          position: 'fixed', right: 0, top: HEADER_HEIGHT + 32,
          width: 340,
          height: `calc(100vh - ${HEADER_HEIGHT + 32 + 40}px)`,
          background: C.surface,
          borderLeft: `1px solid rgba(156,255,147,0.06)`,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 30,
        }}>
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <ChatRoom showFeed={true} />
          </div>
        </div>
      </div>
    </>
  )
}
