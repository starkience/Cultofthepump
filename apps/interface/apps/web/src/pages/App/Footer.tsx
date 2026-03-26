import { useGlobalFeed, useEnergy } from 'cotp/src/data/apiClients/cotpIndexerApi/cotpIndexerApiClient'
import { formatStrk, formatWei } from 'cotp/src/utils/format'
import { SIDEBAR_WIDTH, HEADER_HEIGHT } from 'pages/App/utils/shared'

const C = {
  bg:       '#000000',
  primary:  '#9cff93',
  secondary:'#ff725e',
  textMuted:'#ababab',
  fontMono: "'JetBrains Mono', monospace",
}

function fmt(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function fmtTime(): string {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function Footer() {
  const { data: feed } = useGlobalFeed(40)
  const { data: energy } = useEnergy()

  const items = feed ?? []

  // Build ticker entries from real feed data
  const entries = items.map(item => {
    const isBuy     = item.side === 0
    const isAscended = item.tokenGraduated
    const strkAmt   = formatStrk(item.strkQty)
    const tag       = isBuy ? '[RITUAL]' : '[SINNER]'
    const action    = isBuy ? 'BELIEF_ACCEPTED' : 'TOKEN_LIQUIDATED'
    const color     = isBuy ? C.primary : C.secondary

    return { tag, action, color, symbol: item.tokenSymbol, trader: fmt(item.traderId), strk: strkAmt, isAscended }
  })

  // Duplicate for seamless infinite loop
  const doubled = [...entries, ...entries]

  if (!entries.length) return (
    <div style={{
      position: 'fixed', bottom: 0, left: SIDEBAR_WIDTH, right: 0, height: 40,
      background: C.bg, borderTop: '1px solid rgba(156,255,147,0.05)',
      display: 'flex', alignItems: 'center', paddingLeft: 16, zIndex: 50,
    }}>
      <span style={{ fontFamily: C.fontMono, fontSize: 10, color: 'rgba(156,255,147,0.3)' }}>
        [SYSTEM] Listening for rituals...
        <span style={{ display: 'inline-block', width: 6, height: 12, background: C.primary, verticalAlign: 'middle', marginLeft: 6, animation: 'pulse-cursor 1s step-end infinite' }} />
      </span>
    </div>
  )

  const speed = Math.max(40, entries.length * 5) // ~5s per item, minimum 40s

  return (
    <>
      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes pulse-cursor { 50% { opacity: 0; } }
      `}</style>

      <div style={{
        position: 'fixed', bottom: 0, left: SIDEBAR_WIDTH, right: 0, height: 40,
        background: C.bg,
        borderTop: '1px solid rgba(156,255,147,0.05)',
        overflow: 'hidden',
        zIndex: 50,
        display: 'flex', alignItems: 'center',
      }}>
        {/* Left label */}
        <div style={{
          flexShrink: 0, paddingLeft: 12, paddingRight: 12,
          borderRight: '1px solid rgba(156,255,147,0.08)',
          height: '100%', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.primary, display: 'inline-block', animation: 'pulse-cursor 2s ease-in-out infinite' }} />
          <span style={{ fontFamily: C.fontMono, fontSize: 9, color: 'rgba(156,255,147,0.5)', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
            THE PULSE
          </span>
          {energy && (
            <span style={{ fontFamily: C.fontMono, fontSize: 9, color: 'rgba(156,255,147,0.3)', whiteSpace: 'nowrap' }}>
              [{energy.score}/100]
            </span>
          )}
        </div>

        {/* Scrolling ticker */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 0,
            animation: `ticker-scroll ${speed}s linear infinite`,
            willChange: 'transform',
            whiteSpace: 'nowrap',
          }}>
            {doubled.map((item, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, paddingRight: 32 }}>
                <span style={{ fontFamily: C.fontMono, fontSize: 10, color: item.color, opacity: 0.7 }}>
                  {item.tag}
                </span>
                <span style={{ fontFamily: C.fontMono, fontSize: 10, color: 'rgba(171,171,171,0.5)' }}>—</span>
                <span style={{ fontFamily: C.fontMono, fontSize: 10, color: C.textMuted }}>
                  {item.action}:
                </span>
                <span style={{ fontFamily: C.fontMono, fontSize: 10, color: item.color, fontWeight: 700 }}>
                  ${item.symbol}
                </span>
                <span style={{ fontFamily: C.fontMono, fontSize: 10, color: 'rgba(171,171,171,0.3)' }}>
                  {item.strk}
                </span>
                {item.isAscended && (
                  <span style={{ fontSize: 10, color: C.primary }}>✦</span>
                )}
                <span style={{ color: 'rgba(156,255,147,0.1)', fontSize: 10, paddingLeft: 16 }}>|</span>
              </span>
            ))}
          </div>
        </div>

        {/* Right: live stats */}
        {energy && (
          <div style={{
            flexShrink: 0, paddingLeft: 12, paddingRight: 16,
            borderLeft: '1px solid rgba(156,255,147,0.08)',
            height: '100%', display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <span style={{ fontFamily: C.fontMono, fontSize: 9, color: 'rgba(156,255,147,0.4)', whiteSpace: 'nowrap' }}>
              {energy.recentTrades} RITUALS
            </span>
            <span style={{ fontFamily: C.fontMono, fontSize: 9, color: 'rgba(156,255,147,0.4)', whiteSpace: 'nowrap' }}>
              {energy.uniqueBelievers} BELIEVERS
            </span>
          </div>
        )}
      </div>
    </>
  )
}
