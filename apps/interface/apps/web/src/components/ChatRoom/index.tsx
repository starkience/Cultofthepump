import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useStarknetWallet } from 'components/PrivyConnect/useStarknetWallet'
import { useGlobalFeed, useCultTokens } from 'cotp/src/data/apiClients/cotpIndexerApi/cotpIndexerApiClient'
import { formatStrk } from 'cotp/src/utils/format'

// ─── WS URL ───────────────────────────────────────────────────────────────────
const WS_URL = (() => {
  const base = (import.meta.env.VITE_COTP_METADATA_API_URL as string | undefined) || 'http://127.0.0.1:8080'
  return base.replace(/^https?/, (p) => (p === 'https' ? 'wss' : 'ws')) + '/ws/chat'
})()

// ─── Design tokens ────────────────────────────────────────────────────────────
const M = "'JetBrains Mono', monospace"

const C = {
  surface:    '#131313',
  surfaceHi:  '#191919',
  primary:    '#9cff93',
  secondary:  '#ff725e',
  text:       '#ffffff',
  muted:      '#ababab',
}

// ─── Username wordlists ───────────────────────────────────────────────────────
const PREFIXES = [
  'Cursed','Hollow','Void','Ashen','Eldritch','Crimson','Shadow','Ancient',
  'Fallen','Sacred','Arcane','Obsidian','Spectral','Veiled','Twisted',
  'Forsaken','Howling','Infernal','Abyssal','Blighted','Withered','Nameless',
  'Dreaming','Silent','Eternal',
]
const SUFFIXES = [
  'Prophet','Cultist','Acolyte','Oracle','Sorcerer','Warlock','Necromancer',
  'Heretic','Apostle','Seeker','Harbinger','Wraith','Shade','Sentinel',
  'Hexer','Summoner','Vessel','Disciple','Conjurer','Ritualist','Invoker',
  'Shaman','Lich',
]
function randomName() {
  return PREFIXES[Math.floor(Math.random() * PREFIXES.length)] +
         SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)]
}

// ─── Cult tag color ───────────────────────────────────────────────────────────
const TAG_PALETTE = [
  '#9cff93','#ff725e','#7eb8ff','#f5c842','#c084fc',
  '#fb923c','#34d399','#f472b6','#a3e635','#38bdf8',
]
function cultColor(address: string) {
  let h = 0
  for (let i = 0; i < address.length; i++) h = (h * 31 + address.charCodeAt(i)) >>> 0
  return TAG_PALETTE[h % TAG_PALETTE.length]
}

function fmtAddr(addr: string) { return `${addr.slice(0, 6)}…${addr.slice(-4)}` }
function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChatMsg {
  id: string; username: string; cultTag: string; cultColor: string; text: string; ts: number
}
type Entry =
  | { kind: 'chat' } & ChatMsg
  | { kind: 'feed'; id: string; isBuy: boolean; symbol: string; traderId: string; strkQty: string; graduated: boolean; ts: number }

// ─── Identity ─────────────────────────────────────────────────────────────────
function useIdentity(cults: { symbol: string; contractAddress: string }[]) {
  const { wallet: _chatWallet } = useStarknetWallet()
  const address = _chatWallet?.address
  const { data: feed } = useGlobalFeed(200)

  return useCallback((): Pick<ChatMsg, 'username' | 'cultTag' | 'cultColor'> => {
    let username = localStorage.getItem('chat_username')
    if (!username) { username = randomName(); localStorage.setItem('chat_username', username) }

    let cultTag = ''; let color = C.primary
    if (address && feed?.length && cults.length) {
      const counts: Record<string, number> = {}
      for (const item of feed)
        if (item.traderId?.toLowerCase() === address.toLowerCase())
          counts[item.tokenAddress] = (counts[item.tokenAddress] ?? 0) + 1
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
      if (top) {
        const c = cults.find(c => c.contractAddress.toLowerCase() === top[0].toLowerCase())
        if (c) { cultTag = c.symbol; color = cultColor(c.contractAddress) }
      }
    }
    if (!cultTag && cults.length) {
      let idx = 0
      if (address) { let h = 0; for (const ch of address) h = (h * 31 + ch.charCodeAt(0)) >>> 0; idx = h % cults.length }
      else idx = Math.floor(Math.random() * cults.length)
      cultTag = cults[idx].symbol; color = cultColor(cults[idx].contractAddress)
    }
    return { username, cultTag, cultColor: color }
  }, [address, feed, cults])
}

// ─── ChatRoom ─────────────────────────────────────────────────────────────────
interface Props {
  showFeed?: boolean
}

export function ChatRoom({ showFeed = false }: Props) {
  const [chatMsgs, setChatMsgs]   = useState<ChatMsg[]>([])
  const [input, setInput]         = useState('')
  const [connected, setConnected] = useState(false)
  const wsRef     = useRef<WebSocket | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const seenRef   = useRef<Set<string>>(new Set())

  const cultTokens = useCultTokens({ params: { orderBy: 'believers', limit: 50 }, refetchInterval: 60_000 })
  const cults = useMemo(() =>
    (cultTokens.data ?? []).map(t => ({ symbol: t.symbol, contractAddress: t.contractAddress })),
    [cultTokens.data]
  )

  const { data: feedData } = useGlobalFeed(showFeed ? 60 : 0)

  const feedEntries = useMemo((): Entry[] => {
    if (!showFeed || !feedData) return []
    const now = Date.now()
    return feedData.map((item, i) => {
      let ts: number
      if (item.timestampMs != null) {
        const raw = Number(item.timestampMs)
        // Normalize: if value looks like Unix seconds (<1e12) convert to ms
        ts = raw < 1e12 ? raw * 1000 : raw
      } else {
        // feedData is ordered newest-first; estimate from position
        ts = now - i * 30_000
      }
      return {
        kind:      'feed' as const,
        id:        `feed-${item.id}`,
        isBuy:     item.side === 0,
        symbol:    item.tokenSymbol,
        traderId:  item.traderId,
        strkQty:   item.strkQty,
        graduated: item.tokenGraduated,
        ts,
      }
    })
  }, [showFeed, feedData])

  const entries = useMemo((): Entry[] => {
    const all: Entry[] = [
      ...chatMsgs.map(m => ({ kind: 'chat' as const, ...m })),
      ...feedEntries,
    ]
    return all.sort((a, b) => a.ts - b.ts)
  }, [chatMsgs, feedEntries])

  const getIdentity = useIdentity(cults)

  // Scroll to bottom on mount and when new entries arrive (if already near bottom)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120
    if (nearBottom || entries.length <= 5) el.scrollTop = el.scrollHeight
  }, [entries.length])

  // WebSocket with exponential backoff
  useEffect(() => {
    let ws: WebSocket
    let retry: ReturnType<typeof setTimeout>
    let attempt = 0

    function connect() {
      try { ws = new WebSocket(WS_URL) } catch { return }
      wsRef.current = ws
      ws.onopen  = () => { setConnected(true); attempt = 0 }
      ws.onclose = () => {
        setConnected(false)
        retry = setTimeout(connect, Math.min(1000 * 2 ** attempt++, 30_000))
      }
      ws.onerror = () => ws.close()
      ws.onmessage = (e) => {
        try {
          const msg: ChatMsg = JSON.parse(e.data)
          if (seenRef.current.has(msg.id)) return
          seenRef.current.add(msg.id)
          setChatMsgs(prev => [...prev.slice(-299), msg])
        } catch { /* ignore */ }
      }
    }
    connect()
    return () => { clearTimeout(retry); ws?.close() }
  }, [])

  const send = useCallback(() => {
    const text = input.trim()
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    const { username, cultTag, cultColor: color } = getIdentity()
    const msg: ChatMsg = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      username, cultTag, cultColor: color, text, ts: Date.now(),
    }
    wsRef.current.send(JSON.stringify(msg))
    setInput('')
  }, [input, getIdentity])

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>

      {/* Message list */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0, overflow: 'hidden' }}>
        {/* Fade gradient overlay — fades top edge */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 48,
          pointerEvents: 'none', zIndex: 2,
          background: `linear-gradient(to bottom, ${C.surface} 0%, transparent 100%)`,
        }} />

        <div ref={scrollRef} style={{ height: '100%', overflowY: 'scroll', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 4 }}>
          <div>
            {entries.map((entry) => {
              if (entry.kind === 'chat') {
                return (
                  <div key={entry.id} style={{
                    display: 'flex', gap: 8, padding: '6px 14px',
                    alignItems: 'flex-start',
                  }}>
                    <span style={{ fontFamily: M, fontSize: 8, color: 'rgba(171,171,171,0.25)', flexShrink: 0, paddingTop: 1, minWidth: 48 }}>
                      {fmtTime(entry.ts)}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                      <span style={{ fontFamily: M, fontSize: 10, color: C.text, fontWeight: 700 }}>{entry.username}</span>
                      {entry.cultTag && (
                        <span style={{
                          fontFamily: M, fontSize: 7, fontWeight: 700,
                          color: entry.cultColor,
                          border: `1px solid ${entry.cultColor}40`,
                          background: `${entry.cultColor}0d`,
                          padding: '1px 4px', letterSpacing: '0.04em',
                        }}>
                          ${entry.cultTag}
                        </span>
                      )}
                    </div>
                    <span style={{ fontFamily: M, fontSize: 10, color: `${C.text}bb`, lineHeight: 1.5, wordBreak: 'break-word', flex: 1 }}>
                      {entry.text}
                    </span>
                  </div>
                )
              }

              // Feed log line
              const color = entry.isBuy ? C.primary : C.secondary
              const tag   = entry.isBuy ? '[RITUAL]' : '[SIN]'
              const verb  = entry.isBuy ? 'believed in' : 'sinned against'
              return (
                <div key={entry.id} style={{
                  display: 'flex', gap: 8, padding: '4px 14px',
                  alignItems: 'center',
                  background: `${color}05`,
                }}>
                  <span style={{ fontFamily: M, fontSize: 8, color: 'rgba(171,171,171,0.25)', flexShrink: 0, minWidth: 48 }}>
                    {fmtTime(entry.ts)}
                  </span>
                  <span style={{ fontFamily: M, fontSize: 9, color, fontWeight: 700, flexShrink: 0 }}>{tag}</span>
                  <span style={{ fontFamily: M, fontSize: 9, color: 'rgba(171,171,171,0.45)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {fmtAddr(entry.traderId)}{' '}
                    <span style={{ color: 'rgba(171,171,171,0.3)' }}>{verb}</span>{' '}
                    <span style={{ color, fontWeight: 700 }}>${entry.symbol}</span>{' '}
                    <span style={{ color: 'rgba(171,171,171,0.25)' }}>{formatStrk(entry.strkQty)} STRK</span>
                    {entry.graduated && <span style={{ color: C.primary, marginLeft: 4 }}>✦</span>}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Input */}
      <div style={{
        display: 'flex', flexShrink: 0,
        borderTop: `1px solid rgba(156,255,147,0.06)`,
        background: C.surfaceHi,
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder={connected ? 'Speak your prophecy…' : 'Connecting…'}
          aria-label="Chat message"
          name="chat-message"
          autoComplete="off"
          maxLength={300}
          style={{
            flex: 1, background: 'transparent',
            border: 'none', outline: 'none',
            color: C.text, fontFamily: M, fontSize: 11,
            padding: '12px 14px', transition: 'opacity 0.2s',
            opacity: connected ? 1 : 0.4,
          }}
        />
        <button
          onClick={send}
          aria-label="Send message"
          disabled={!connected || !input.trim()}
          style={{
            padding: '12px 16px', background: 'transparent', border: 'none',
            borderLeft: `1px solid rgba(156,255,147,0.06)`,
            color: connected && input.trim() ? C.primary : `${C.primary}20`,
            fontFamily: M, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em',
            cursor: connected && input.trim() ? 'pointer' : 'default',
            transition: 'background 0.1s, color 0.1s', flexShrink: 0,
          }}
          onMouseEnter={e => { if (connected && input.trim()) e.currentTarget.style.background = C.primary; e.currentTarget.style.color = '#006413' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = connected && input.trim() ? C.primary : `${C.primary}20` }}
        >
          TRANSMIT
        </button>
      </div>
    </div>
  )
}
