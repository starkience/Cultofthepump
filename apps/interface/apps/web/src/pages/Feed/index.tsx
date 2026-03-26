import { ChatRoom } from 'components/ChatRoom'
import { HEADER_HEIGHT } from 'pages/App/utils/shared'

const M = "'JetBrains Mono', monospace"
const S = "'Newsreader', serif"
const C = { primary: '#9cff93', text: '#ffffff', muted: '#ababab' }

// PAGE_TOP = AppBody paddingTop; 40 = AppBody paddingBottom
const PAGE_TOP = HEADER_HEIGHT + 32
const BODY_PB = 40

export default function FeedPage() {
  return (
    <div style={{
      width: '100%', maxWidth: 1000,
      height: `calc(100vh - ${PAGE_TOP + BODY_PB}px)`,
      display: 'flex', flexDirection: 'column',
    }}>

      {/* Header */}
      <div style={{ flexShrink: 0, marginBottom: 28 }}>
        <div style={{ paddingLeft: 20, borderLeft: `4px solid ${C.primary}` }}>
          <h1 style={{
            fontFamily: S, fontSize: 'clamp(2rem,4vw,3rem)',
            fontStyle: 'italic', fontWeight: 700, color: C.text,
            margin: '0 0 8px', letterSpacing: '-0.02em',
          }}>
            The Pulse
          </h1>
          <p style={{ fontFamily: M, fontSize: 10, color: C.muted, margin: 0 }}>
            Live rituals, sins, and congregation chat — all in one stream.
          </p>
        </div>
      </div>

      {/* Full-height chat with feed mixed in */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        background: '#131313',
        border: `1px solid rgba(156,255,147,0.06)`,
        overflow: 'hidden',
        marginBottom: 20,
        minHeight: 0,
      }}>
        <ChatRoom showFeed={true} />
      </div>
    </div>
  )
}
