import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'
import { RitualFee } from 'components/RitualFee'
import { Balance } from 'components/Balance'
import {
  useIsValidSummonSteps,
  useAuctionPrice,
  useSetCultData,
  useCleanCultData,
  useSetCultVisual,
  useCultData,
} from 'state/summon/hooks'
import { SummonStepKey } from 'pages/Summon/types'
import { SIDED_STEPS } from 'pages/Summon/CardsHelpers'
import { useToken, useDutchAuction } from 'cotp/src/hooks/useContract'
import { STRK_SEPOLIA } from 'cotp/src/constants/tokens'
import { useBlock } from '@starknet-react/core'
import { useStarknetWallet } from 'components/PrivyConnect/useStarknetWallet'
import { useCalls } from 'state/transactions/hooks'
import { useOpenModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import { uint256 } from 'starknet'

// ─── Design tokens ─────────────────────────────────────────────────────────
const C = {
  bg:          '#0e0e0e',
  bgLow:       '#131313',
  bgMid:       '#191919',
  bgHigh:      '#1f1f1f',
  bgHighest:   '#262626',
  primary:     '#9cff93',
  primaryDim:  '#00ec3b',
  secondary:   '#ff725e',
  text:        '#ffffff',
  textMuted:   '#ababab',
  fontMono:    "'JetBrains Mono', monospace",
  fontHead:    "'Newsreader', serif",
  fontBody:    "'Space Grotesk', sans-serif",
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function parseStrkToWei(value: string): string | null {
  try {
    const n = Number(value)
    if (isNaN(n) || n <= 0) return null
    const [intPart, fracPart = ''] = value.split('.')
    const frac = fracPart.padEnd(18, '0').slice(0, 18)
    return (BigInt(intPart) * BigInt(10 ** 18) + BigInt(frac)).toString()
  } catch { return null }
}

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('http://localhost:8080/upload-image', { method: 'POST', body: formData })
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
  const { url } = await res.json()
  if (!url?.startsWith('https://')) throw new Error(`Unexpected response: ${url}`)
  return url
}

function isHttpUrl(url: string): boolean {
  return /^https?:\/\/.+/.test(url.trim())
}

// ─── Validation schema (same as CultData) ───────────────────────────────────
const schema = z.object({
  symbol:    z.string().min(1).max(6).regex(/^[A-Z0-9]+$/, 'Uppercase letters & numbers only'),
  name:      z.string().min(1).max(31),
  manifesto: z.string().max(260).optional(),
  sniping:   z.string().optional().refine(
    v => !v || (!isNaN(Number(v)) && Number(v) >= 0),
    'Must be a valid STRK amount'
  ),
})
type FormValues = z.infer<typeof schema>

// ─── Ritual Circle ──────────────────────────────────────────────────────────
function RitualCircle({ progress, label }: { progress: number; label: string }) {
  return (
    <div style={{ position: 'relative', width: 360, height: 360, flexShrink: 0 }}>
      {/* Outer spin ring */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        border: '1px solid rgba(156,255,147,0.2)',
        animation: 'spin-slow 20s linear infinite',
      }} />
      {/* Tick marks on outer ring */}
      {[0,45,90,135,180,225,270,315].map(deg => (
        <div key={deg} style={{
          position: 'absolute', top: '50%', left: '50%', width: 2, height: 8,
          background: 'rgba(156,255,147,0.3)',
          transformOrigin: '50% -172px',
          transform: `rotate(${deg}deg) translateX(-50%)`,
        }} />
      ))}

      {/* Middle ring with runes - counter spin */}
      <div style={{
        position: 'absolute', inset: 16, borderRadius: '50%',
        border: '1px solid rgba(156,255,147,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'spin-slow-reverse 30s linear infinite',
      }}>
        {(['Ψ','Ω','Δ','Σ'] as const).map((r, i) => {
          const positions = [
            { top: -8, left: '50%', transform: 'translateX(-50%)' },
            { right: -8, top: '50%', transform: 'translateY(-50%)' },
            { bottom: -8, left: '50%', transform: 'translateX(-50%)' },
            { left: -8, top: '50%', transform: 'translateY(-50%)' },
          ]
          return (
            <span key={r} style={{
              position: 'absolute', fontFamily: C.fontMono,
              fontSize: 11, color: 'rgba(156,255,147,0.4)',
              ...positions[i],
            }}>{r}</span>
          )
        })}
      </div>

      {/* Core fill */}
      <div style={{
        position: 'absolute', inset: 48, borderRadius: '50%',
        border: '10px solid rgba(156,255,147,0.05)',
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Liquid fill from bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: `${Math.max(2, progress * 100)}%`,
          background: 'rgba(156,255,147,0.15)',
          filter: 'drop-shadow(0 0 20px rgba(156,255,147,0.4))',
          transition: 'height 0.8s cubic-bezier(0.4,0,0.2,1)',
        }} />
        {/* Center text */}
        <div style={{ position: 'relative', textAlign: 'center', zIndex: 1 }}>
          <p style={{
            fontFamily: C.fontHead, fontStyle: 'italic', fontSize: 28,
            color: C.primary, margin: '0 0 4px 0',
            textShadow: `0 0 8px rgba(156,255,147,0.6)`,
          }}>{label}</p>
          <p style={{
            fontFamily: C.fontMono, fontSize: 9, color: 'rgba(156,255,147,0.6)',
            letterSpacing: '0.2em', margin: 0,
          }}>{Math.round(progress * 100)}% COMPLETE</p>
        </div>
      </div>

      {/* Scanning line */}
      <div style={{
        position: 'absolute', top: '10%', left: '10%', right: '10%',
        height: 1, background: 'rgba(156,255,147,0.3)',
        filter: 'blur(1px)',
        animation: 'scan-bounce 4s ease-in-out infinite',
      }} />
    </div>
  )
}

// ─── Terminal Output ─────────────────────────────────────────────────────────
function TerminalOutput({ lines }: { lines: Array<{ text: string; value?: string; color?: string }> }) {
  const [cursor, setCursor] = useState(true)

  useEffect(() => {
    const t = setInterval(() => setCursor(c => !c), 530)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{
      width: '100%', background: C.bgLow,
      borderLeft: `2px solid rgba(156,255,147,0.3)`,
      padding: '14px 16px',
      fontFamily: C.fontMono, fontSize: 10, lineHeight: 1.8,
      color: 'rgba(156,255,147,0.7)',
    }}>
      {lines.map((l, i) => (
        <div key={i}>
          <span style={{ opacity: 0.5 }}>&gt; </span>
          <span>{l.text}</span>
          {l.value && <span style={{ color: l.color ?? C.primary, marginLeft: 4 }}>{l.value}</span>}
        </div>
      ))}
      <div>
        <span style={{ opacity: 0.5 }}>&gt; </span>
        <span style={{
          display: 'inline-block', width: 7, height: 14,
          background: C.primary, verticalAlign: 'middle',
          opacity: cursor ? 1 : 0, transition: 'opacity 0.1s',
        }} />
      </div>
    </div>
  )
}

// ─── Field ───────────────────────────────────────────────────────────────────
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        fontFamily: C.fontMono, fontSize: 10, textTransform: 'uppercase',
        letterSpacing: '0.15em', color: 'rgba(156,255,147,0.6)',
        display: 'block', marginBottom: 8,
      }}>{label}</label>
      {children}
      {error && (
        <p style={{ fontFamily: C.fontMono, fontSize: 9, color: C.secondary, margin: '4px 0 0 0' }}>{error}</p>
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'transparent',
  border: 'none', borderBottom: `2px solid rgba(156,255,147,0.3)`,
  color: C.primary, fontFamily: C.fontMono, fontSize: 15,
  padding: '10px 0', outline: 'none', boxSizing: 'border-box',
}

// ─── Image Upload Section ────────────────────────────────────────────────────
type UploadState = 'idle' | 'uploading' | 'done' | 'error'

function ImageUploadField({ onStatusChange }: { onStatusChange: (status: UploadState) => void }) {
  const setCultVisual = useSetCultVisual()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const [hovered, setHovered] = useState(false)

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setUploadError(null)
    const blobUrl = URL.createObjectURL(file)
    setPreview(blobUrl)
    setUploadState('uploading')
    onStatusChange('uploading')
    try {
      const hosted = await uploadImage(file)
      URL.revokeObjectURL(blobUrl)
      setPreview(hosted)
      setCultVisual(hosted)
      setUploadState('done')
      onStatusChange('done')
    } catch {
      setUploadState('error')
      onStatusChange('error')
      setUploadError('Upload failed. Paste a URL below instead.')
      setCultVisual(blobUrl)
    }
  }, [setCultVisual, onStatusChange])

  const handleUrlInput = useCallback((val: string) => {
    setUrlInput(val)
    if (isHttpUrl(val)) {
      setPreview(val.trim())
      setCultVisual(val.trim())
      setUploadState('done')
      onStatusChange('done')
    } else {
      setCultVisual(null)
    }
  }, [setCultVisual, onStatusChange])

  const reset = useCallback(() => {
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
    setPreview(null)
    setUrlInput('')
    setUploadState('idle')
    setUploadError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setCultVisual(null)
    onStatusChange('idle')
  }, [preview, setCultVisual, onStatusChange])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {preview ? (
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{
            width: 80, height: 80, flexShrink: 0,
            border: `1px solid ${uploadState === 'done' ? C.primary : C.secondary}`,
            overflow: 'hidden',
          }}>
            <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1 }}>
            {uploadState === 'uploading' && (
              <p style={{ fontFamily: C.fontMono, fontSize: 10, color: C.textMuted, margin: '0 0 8px 0' }}>
                [UPLOADING] Transmitting sigil to catbox.moe...
              </p>
            )}
            {uploadState === 'done' && (
              <p style={{ fontFamily: C.fontMono, fontSize: 10, color: C.primary, margin: '0 0 8px 0' }}>
                [OK] Sigil uploaded and stored.
              </p>
            )}
            {uploadState === 'error' && (
              <p style={{ fontFamily: C.fontMono, fontSize: 10, color: C.secondary, margin: '0 0 8px 0' }}>
                {uploadError}
              </p>
            )}
            <button
              type="button"
              onClick={reset}
              style={{
                background: 'transparent', border: `1px solid rgba(72,72,72,0.5)`,
                color: C.textMuted, fontFamily: C.fontMono, fontSize: 9,
                letterSpacing: '0.1em', padding: '4px 12px', cursor: 'pointer',
              }}
            >RESET SIGIL</button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            width: '100%', height: 80,
            background: 'transparent',
            border: `1px dashed ${hovered ? C.primary : 'rgba(156,255,147,0.2)'}`,
            color: hovered ? C.primary : 'rgba(156,255,147,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s, background 0.15s',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>upload</span>
          <span style={{ fontFamily: C.fontMono, fontSize: 10, letterSpacing: '0.1em' }}>
            UPLOAD SIGIL IMAGE
          </span>
        </button>
      )}

      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={urlInput}
          onChange={e => handleUrlInput(e.target.value)}
          placeholder="Or paste image URL…"
          style={{ ...inputStyle, fontSize: 12 }}
        />
        {urlInput && isHttpUrl(urlInput) && (
          <span className="material-symbols-outlined" style={{
            position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
            color: C.primary, fontSize: 16,
          }}>check_circle</span>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/png,image/jpeg,image/gif"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </div>
  )
}

// ─── Main Summon Page ────────────────────────────────────────────────────────
export default function CultCreatorPage() {
  const { wallet: _privyWallet } = useStarknetWallet()
  const address = _privyWallet?.address
  const isValidStep = useIsValidSummonSteps()
  const auctionPrice = useAuctionPrice()
  const setCultData = useSetCultData()
  const cleanCultData = useCleanCultData()
  const { name: currentName, symbol: currentSymbol } = useCultData()

  const ALL_STEPS = [...SIDED_STEPS.left, ...SIDED_STEPS.right]
  const validCount  = ALL_STEPS.filter(s => isValidStep(s.key)).length
  const isAllValid  = validCount === ALL_STEPS.length
  const progress    = isAllValid ? 1 : validCount / ALL_STEPS.length

  // Image upload status for terminal
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')

  // Form
  const { control, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { symbol: '', name: '', manifesto: '', sniping: '' },
    mode: 'onChange',
    shouldFocusError: false,
  })
  const values = watch()

  useEffect(() => {
    if (schema.safeParse(values).success) {
      const snipingWei = values.sniping ? parseStrkToWei(values.sniping) : null
      setCultData(values.name, values.symbol, values.manifesto ?? '', snipingWei)
    } else {
      cleanCultData()
    }
  }, [values.symbol, values.name, values.manifesto, values.sniping])

  // Calls + submit
  const dutchAuction = useDutchAuction()
  const strk = useToken(STRK_SEPOLIA)
  const [, setCalls] = useCalls()
  const openTransactionModal = useOpenModal({ name: ApplicationModal.TRANSACTION })
  const { data: block } = useBlock({ blockIdentifier: 'pending' as any })
  const { snipingWei } = useCultData()

  const calls = useMemo(() => {
    if (!isAllValid || !strk || !dutchAuction || !block) return undefined
    const snipBig = BigInt(snipingWei ?? '0')
    // Always include create_auction to reset the window — the auction may have expired
    // between page load and submission. Use the fetched auctionPrice as start_price.
    const startPrice = BigInt(auctionPrice ?? '10000000000000000000') // fallback 10 STRK
    const totalApprove = (startPrice + snipBig).toString()
    return [
      dutchAuction.populate('create_auction', [(block.timestamp - 10).toString(), { low: startPrice.toString(), high: '0' }]),
      strk.populate('approve', [dutchAuction.address, totalApprove]),
      dutchAuction.populate('bid', [currentName ?? '', currentSymbol ?? '', { low: snipBig.toString(), high: '0' }]),
    ]
  }, [isAllValid, auctionPrice, dutchAuction, strk, currentName, currentSymbol, snipingWei, block])

  const onSubmit = useCallback(() => {
    if (calls) { setCalls(calls); openTransactionModal() }
  }, [calls, setCalls, openTransactionModal])

  // Dynamic terminal lines
  const terminalLines = useMemo(() => {
    const lines: Array<{ text: string; value?: string; color?: string }> = []
    lines.push({
      text: 'AUTHENTICATING_BELIEVER...',
      value: address ? 'OK' : 'AWAITING_CONNECTION',
      color: address ? C.primary : C.secondary,
    })
    if (values.symbol && values.name) {
      lines.push({
        text: `SCANNING_SOUL_COEFFICIENT...`,
        value: (0.800 + Math.sin(values.symbol.charCodeAt(0) / 10) * 0.199).toFixed(3),
      })
    } else {
      lines.push({ text: 'SCANNING_SOUL_COEFFICIENT...', value: 'WAITING_FOR_SIGIL', color: C.textMuted })
    }
    if (uploadStatus === 'done') {
      lines.push({ text: 'SIGIL_ENCODED...', value: 'TRANSMITTED' })
    } else if (uploadStatus === 'uploading') {
      lines.push({ text: 'TRANSMITTING_SIGIL...', value: 'IN_PROGRESS', color: C.textMuted })
    } else {
      lines.push({ text: 'PREPARING_SACRIFICIAL_VESSEL...', value: 'WAITING_FOR_SIGIL', color: C.textMuted })
    }
    if (auctionPrice) {
      const strk = (Number(auctionPrice) / 1e18).toFixed(4)
      lines.push({ text: 'COMPUTING_RITUAL_FEE...', value: `${strk} STRK` })
    } else {
      lines.push({ text: 'COMPUTING_RITUAL_FEE...', value: 'NO_ACTIVE_AUCTION', color: C.secondary })
    }
    if (isAllValid) {
      lines.push({ text: 'SYSTEM_READY...', value: 'INITIATE_SACRIFICE', color: '#00ec3b' })
    }
    return lines
  }, [address, values.symbol, values.name, uploadStatus, auctionPrice, isAllValid])

  const circleLabel = isAllValid ? 'Ready' : validCount > 0 ? 'Initiating' : 'Dormant'
  const feeStrk = auctionPrice ? `${(Number(auctionPrice) / 1e18).toFixed(4)} STRK` : '— STRK'

  return (
    <>
      <style>{`
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        @keyframes spin-slow-reverse { to { transform: rotate(-360deg); } }
        @keyframes scan-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(200px); opacity: 0.1; }
        }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .summon-input::placeholder { color: rgba(156,255,147,0.2); }
        .summon-input:focus-visible { border-bottom-color: #9cff93 !important; outline: none; }
        .summon-textarea { resize: none; }
        .summon-textarea::placeholder { color: rgba(156,255,147,0.2); }
        .summon-textarea:focus-visible { border-bottom-color: #9cff93 !important; outline: none; }
        button:focus-visible { outline: 2px solid #9cff93; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* Hidden state managers — must stay mounted */}
      <div style={{ display: 'none' }}>
        <RitualFee />
        <Balance />
      </div>

      <div style={{ width: '100%', maxWidth: 1200, padding: '0 0 80px 0' }}>
        {/* Decorative background blob */}
        <div style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(156,255,147,0.03) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 64, alignItems: 'center',
          position: 'relative', zIndex: 1,
        }}>

          {/* ── Left: Ritual Circle + Terminal ── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
            <RitualCircle progress={progress} label={circleLabel} />
            <TerminalOutput lines={terminalLines} />

            {/* Decorative runes */}
            <div style={{
              width: '100%', display: 'flex', justifyContent: 'flex-end',
              fontFamily: C.fontMono, color: 'rgba(156,255,147,0.08)',
              flexDirection: 'column', alignItems: 'flex-end',
            }}>
              <span style={{ fontSize: 32 }}>XV</span>
              <span style={{ fontSize: 8, letterSpacing: '0.8em', textTransform: 'uppercase' }}>Hierarchy_Confirmed</span>
            </div>
          </div>

          {/* ── Right: Form ── */}
          <div>
            {/* Page header */}
            <div style={{ marginBottom: 40 }}>
              <h1 style={{
                fontFamily: C.fontHead, fontSize: 'clamp(2rem,4vw,3rem)',
                fontStyle: 'italic', fontWeight: 700, color: C.text,
                margin: '0 0 8px', letterSpacing: '-0.02em',
              }}>
                Summoning <span style={{ color: C.primary }}>Ritual</span>
              </h1>
              <p style={{
                fontFamily: C.fontBody, fontSize: 14, color: C.textMuted,
                maxWidth: 420, lineHeight: 1.6, margin: 0,
              }}>
                Breathe life into the digital void. Your manifesto will be etched onto the Starknet ledger for eternity.
              </p>
            </div>

            {/* Warning banner */}
            <div style={{
              background: 'rgba(255,114,94,0.08)',
              borderLeft: `2px solid ${C.secondary}`,
              padding: '14px 16px',
              display: 'flex', gap: 12, alignItems: 'flex-start',
              marginBottom: 32,
            }}>
              <span className="material-symbols-outlined" style={{
                color: C.secondary, fontSize: 18, flexShrink: 0,
                fontVariationSettings: "'FILL' 1",
              }}>warning</span>
              <div>
                <p style={{ fontFamily: C.fontMono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.secondary, fontWeight: 700, margin: '0 0 4px 0' }}>
                  Sin Detection Active
                </p>
                <p style={{ fontFamily: C.fontBody, fontSize: 12, color: 'rgba(255,114,94,0.8)', margin: 0 }}>
                  Selling is a Sin. Only Believers can Summon. Traitors will be purged from the registry.
                </p>
              </div>
            </div>

            <form onSubmit={e => { e.preventDefault(); onSubmit() }} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

              {/* Sigil + Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
                <Field label="The Sigil" error={errors.symbol?.message}>
                  <Controller name="symbol" control={control} render={({ field }) => (
                    <input
                      {...field}
                      className="summon-input"
                      placeholder="$SYMBOL"
                      style={{ ...inputStyle }}
                      onChange={e => field.onChange(e.target.value.toUpperCase())}
                    />
                  )} />
                </Field>
                <Field label="The Cult Name" error={errors.name?.message}>
                  <Controller name="name" control={control} render={({ field }) => (
                    <input {...field} className="summon-input" placeholder="ENTER NAME" style={{ ...inputStyle }} />
                  )} />
                </Field>
              </div>

              {/* Manifesto */}
              <Field label="The Manifesto" error={errors.manifesto?.message}>
                <Controller name="manifesto" control={control} render={({ field }) => (
                  <textarea
                    {...field}
                    className="summon-textarea"
                    placeholder="DESCRIBE YOUR ASCENSION…"
                    rows={4}
                    style={{
                      ...inputStyle, resize: 'none',
                      fontFamily: C.fontMono, lineHeight: 1.6,
                    }}
                  />
                )} />
                <div style={{
                  display: 'flex', justifyContent: 'flex-end',
                  fontFamily: C.fontMono, fontSize: 9, color: C.textMuted, marginTop: 4,
                }}>
                  {(values.manifesto?.length ?? 0)}/260
                </div>
              </Field>

              {/* Sigil Visual */}
              <Field label="The Sacred Sigil (Image)">
                <ImageUploadField onStatusChange={setUploadStatus} />
              </Field>

              {/* Creator pre-buy */}
              <Field label="Creator Pre-Buy (Optional)" error={errors.sniping?.message}>
                <Controller name="sniping" control={control} render={({ field }) => (
                  <input
                    {...field}
                    className="summon-input"
                    placeholder="0 STRK — buy tokens at launch before anyone else"
                    type="number"
                    min="0"
                    step="any"
                    style={{ ...inputStyle, fontSize: 13 }}
                  />
                )} />
              </Field>

              {/* Required sacrifice */}
              <div style={{
                background: C.bgHigh,
                border: `1px solid rgba(72,72,72,0.15)`,
                padding: 20,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <p style={{ fontFamily: C.fontMono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.primary, margin: '0 0 4px 0' }}>Required Sacrifice</p>
                    <p style={{ fontFamily: C.fontBody, fontSize: 12, color: C.textMuted, margin: 0 }}>
                      {auctionPrice ? 'Starknet Dutch auction fee — decaying live' : 'No active auction running'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontFamily: C.fontMono, fontSize: 22, color: C.primary,
                      textShadow: auctionPrice ? `0 0 10px rgba(156,255,147,0.4)` : 'none',
                    }}>{feeStrk}</span>
                  </div>
                </div>
                {/* Auction progress bar */}
                <div style={{ height: 2, background: C.bgHighest, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: auctionPrice ? '35%' : '0%',
                    background: C.primary,
                    boxShadow: `0 0 6px ${C.primary}`,
                    transition: 'width 1s linear',
                  }} />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!isAllValid}
                style={{
                  width: '100%',
                  background: isAllValid ? C.primary : 'rgba(156,255,147,0.1)',
                  border: isAllValid ? 'none' : `1px solid rgba(156,255,147,0.2)`,
                  color: isAllValid ? '#006413' : 'rgba(156,255,147,0.3)',
                  padding: '20px 0',
                  fontFamily: C.fontHead, fontStyle: 'italic', fontWeight: 700, fontSize: 22,
                  cursor: isAllValid ? 'pointer' : 'not-allowed',
                  boxShadow: isAllValid ? `0 0 30px rgba(156,255,147,0.3)` : 'none',
                  transition: 'background 0.2s, box-shadow 0.2s, color 0.2s, border-color 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  if (isAllValid) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 50px rgba(156,255,147,0.5)'
                }}
                onMouseLeave={e => {
                  if (isAllValid) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 30px rgba(156,255,147,0.3)'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 22, fontVariationSettings: "'FILL' 1" }}>auto_fix_high</span>
                {isAllValid ? 'INITIATE SACRIFICE & SUMMON' : `COMPLETE RITUAL (${validCount}/${ALL_STEPS.length})`}
              </button>

              {/* Step checklist */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {ALL_STEPS.map(step => {
                  const valid = isValidStep(step.key)
                  return (
                    <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="material-symbols-outlined" style={{
                        fontSize: 14,
                        color: valid ? C.primary : 'rgba(171,171,171,0.3)',
                        fontVariationSettings: valid ? "'FILL' 1" : "'FILL' 0",
                      }}>
                        {valid ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span style={{ fontFamily: C.fontMono, fontSize: 9, color: valid ? C.primary : C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {step.rune.name}
                      </span>
                    </div>
                  )
                })}
              </div>

            </form>
          </div>
        </div>
      </div>
    </>
  )
}
