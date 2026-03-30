import { useCallback, useEffect, useState } from 'react'
import { useConnect } from '@starknet-react/core'
import { ModalShell } from 'components/ModalShell'
import { useWallet } from 'context/WalletContext'
import { getL2Connections } from 'connections'
import MetaMaskIcon from 'assets/wallets/metamask.svg?react'
import PhantomIcon from 'assets/wallets/phantom.svg?react'
import EthereumIcon from 'assets/wallets/ethereum.svg?react'

const M = "'JetBrains Mono', monospace"
const S = "'Newsreader', Georgia, serif"
const SERVICE_URL = (import.meta.env.VITE_PRIVY_WALLET_SERVICE_URL as string | undefined) ?? 'http://localhost:3002'

const C = {
  bg:        '#0d0d0d',
  surface:   '#141414',
  surfaceHi: '#1a1a1a',
  border:    'rgba(156,255,147,0.08)',
  borderHi:  'rgba(156,255,147,0.2)',
  primary:   '#9cff93',
  dim:       'rgba(255,255,255,0.35)',
  text:      '#fff',
  red:       '#ff725e',
}

// ─── Login typed data for Starknet wallets ────────────────────────────────────
function buildLoginTypedData(address: string, nonce: string) {
  return {
    types: {
      StarknetDomain: [
        { name: 'name',     type: 'shortstring' },
        { name: 'version',  type: 'shortstring' },
        { name: 'chainId',  type: 'shortstring' },
        { name: 'revision', type: 'shortstring' },
      ],
      Login: [
        { name: 'wallet', type: 'felt' },
        { name: 'nonce',  type: 'shortstring' },
      ],
    },
    primaryType: 'Login' as const,
    domain: { name: 'CultOfThePump', version: '1', chainId: 'SN_SEPOLIA', revision: '1' },
    message: { wallet: address, nonce },
  }
}

// ─── EVM wallet detection ─────────────────────────────────────────────────────
type EthProvider = { request: (args: { method: string; params?: unknown[] }) => Promise<unknown>; isMetaMask?: boolean; isPhantom?: boolean }

function getEvmWallets(): { name: string; icon: React.ReactNode; getProvider: () => EthProvider | null }[] {
  const wallets: { name: string; icon: React.ReactNode; getProvider: () => EthProvider | null }[] = []
  const win = window as unknown as {
    ethereum?: EthProvider & { providers?: EthProvider[] }
    phantom?: { ethereum?: EthProvider }
  }

  // MetaMask (could be in providers array if multiple injected)
  const mmProvider = win.ethereum?.providers?.find(p => p.isMetaMask) ?? (win.ethereum?.isMetaMask ? win.ethereum : null)
  if (mmProvider) {
    wallets.push({ name: 'MetaMask', icon: <MetaMaskIcon style={{ width: 24, height: 24 }} />, getProvider: () => mmProvider })
  }

  // Phantom EVM
  if (win.phantom?.ethereum) {
    wallets.push({ name: 'Phantom', icon: <PhantomIcon style={{ width: 24, height: 24 }} />, getProvider: () => win.phantom!.ethereum! })
  }

  // Fallback: generic injected wallet (only if we didn't find specific ones)
  if (wallets.length === 0 && win.ethereum) {
    wallets.push({ name: 'Browser Wallet', icon: <EthereumIcon style={{ width: 24, height: 24 }} />, getProvider: () => win.ethereum! })
  }

  return wallets
}

// ─── LoginModal ───────────────────────────────────────────────────────────────

export function LoginModal() {
  const { setLoginModalOpen, setStarknetSession } = useWallet()
  const { connectAsync, connectors } = useConnect()
  const [step, setStep]   = useState<'choose' | 'connecting' | 'signing' | 'error'>('choose')
  const [error, setError] = useState<string | null>(null)
  const [evmWallets, setEvmWallets] = useState<ReturnType<typeof getEvmWallets>>([])

  useEffect(() => { setEvmWallets(getEvmWallets()) }, [])

  const close = useCallback(() => {
    setLoginModalOpen(false)
    setStep('choose')
    setError(null)
  }, [setLoginModalOpen])

  // ── Starknet wallet login ──
  const handleStarknetWallet = useCallback(async (connectorIdx: number) => {
    setStep('connecting')
    setError(null)
    try {
      const connector = connectors[connectorIdx]
      if (!connector) throw new Error('Connector not available')
      await connectAsync({ connector })

      // Get the address from the connector (works for argentX, braavos, etc.)
      // The connector stores _wallet internally after connect()
      type ConnectorWithWallet = { _wallet?: { request: (p: { type: string; params?: unknown }) => Promise<unknown> } }
      const cw = connector as unknown as ConnectorWithWallet
      if (!cw._wallet) throw new Error('Wallet connected but provider not found')

      const accounts = await cw._wallet.request({ type: 'wallet_requestAccounts' }) as string[]
      const address  = accounts?.[0]
      if (!address) throw new Error('No account returned from wallet')

      setStep('signing')
      const nonce = `${Date.now()}`
      const td    = buildLoginTypedData(address, nonce)

      // Sign typed data via SNIP wallet_signTypedData
      const sig = await cw._wallet.request({
        type: 'wallet_signTypedData',
        params: td,
      }) as string[]
      if (!sig) throw new Error('Signature rejected')

      const res = await fetch(`${SERVICE_URL}/api/auth/starknet-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature: sig, nonce }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(err.error ?? `Auth failed ${res.status}`)
      }
      const data = await res.json() as { token: string; wallet: { id: string; address: string; publicKey: string } }

      // Get the wallet name from the connections list
      const l2 = getL2Connections()
      const walletName = l2[connectorIdx]?.getName() ?? String((connector as Record<string, unknown>).id ?? 'Starknet')
      setStarknetSession(data.token, data.wallet, walletName)
      close()
    } catch (e) {
      handleError(e)
    }
  }, [connectors, connectAsync, setStarknetSession, close])

  // ── EVM wallet login ──
  const handleEvmWallet = useCallback(async (walletIdx: number) => {
    setStep('connecting')
    setError(null)
    try {
      const wallet = evmWallets[walletIdx]
      if (!wallet) throw new Error('Wallet not available')
      const provider = wallet.getProvider()
      if (!provider) throw new Error('Provider not found')

      const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[]
      const address = accounts[0]
      if (!address) throw new Error('No account returned')

      setStep('signing')
      const nonce = `${Date.now()}`
      const message = `Sign in to Cult of the Pump\n\nWallet: ${address}\nNonce: ${nonce}`
      const signature = await provider.request({
        method: 'personal_sign',
        params: [message, address],
      }) as string

      const res = await fetch(`${SERVICE_URL}/api/auth/evm-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature, nonce }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(err.error ?? `Auth failed ${res.status}`)
      }
      const data = await res.json() as { token: string; wallet: { id: string; address: string; publicKey: string } }

      // EVM login uses the same session mechanism as Starknet — JWT + Privy wallet
      const walletName = evmWallets[walletIdx]?.name ?? 'Ethereum'
      setStarknetSession(data.token, data.wallet, walletName)
      close()
    } catch (e) {
      handleError(e)
    }
  }, [evmWallets, setStarknetSession, close])

  function handleError(e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('reject') || msg.includes('abort') || msg.includes('User abort') || msg.includes('denied')) {
      setStep('choose')
    } else {
      setError(msg)
      setStep('error')
    }
  }

  const l2conns = getL2Connections().filter(c => c.shouldDisplay())

  return (
    <ModalShell open={true} onClose={close}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 12px', borderBottom: `1px solid ${C.border}`,
        }}>
          <div>
            <div style={{ fontFamily: S, fontStyle: 'italic', fontSize: 18, color: C.primary, marginBottom: 2 }}>
              Connect
            </div>
            <div style={{ fontFamily: M, fontSize: 9, color: C.dim, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Sepolia Testnet
            </div>
          </div>
          <button onClick={close} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: C.dim, fontSize: 20, lineHeight: 1, padding: 4,
          }}>×</button>
        </div>

        <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 6 }}>

          {/* Status banners */}
          {step === 'connecting' && <StatusBanner text="Connecting to wallet…" color={C.primary} />}
          {step === 'signing' && <StatusBanner text="Sign the login message in your wallet…" color={C.primary} />}
          {step === 'error' && (
            <div style={{
              background: 'rgba(255,114,94,0.08)', border: '1px solid rgba(255,114,94,0.2)',
              borderRadius: 8, padding: '12px', textAlign: 'center', marginBottom: 8,
            }}>
              <div style={{ fontFamily: M, fontSize: 10, color: C.red, marginBottom: 8 }}>{error}</div>
              <button onClick={() => setStep('choose')} style={{
                fontFamily: M, fontSize: 9, color: C.primary, background: 'transparent',
                border: `1px solid ${C.borderHi}`, borderRadius: 4, padding: '4px 12px', cursor: 'pointer',
              }}>Try Again</button>
            </div>
          )}

          {step === 'choose' && (
            <>
              {/* Starknet wallets */}
              <SectionLabel>Starknet</SectionLabel>
              {l2conns.slice(0, 2).map((conn, idx) => (
                <WalletButton
                  key={conn.type}
                  label={conn.getName()}
                  icon={<conn.getIcon style={{ width: 24, height: 24 }} />}
                  onClick={() => {
                    if (conn.overrideActivate?.()) return
                    void handleStarknetWallet(idx)
                  }}
                />
              ))}

              {/* EVM wallets */}
              <SectionLabel style={{ marginTop: 8 }}>Ethereum</SectionLabel>
              {evmWallets.map((w, idx) => (
                <WalletButton
                  key={w.name}
                  label={w.name}
                  icon={w.icon}
                  onClick={() => void handleEvmWallet(idx)}
                />
              ))}
              {evmWallets.length === 0 && (
                <div style={{ fontFamily: M, fontSize: 10, color: C.dim, textAlign: 'center', padding: '8px 0' }}>
                  No Ethereum wallet detected
                </div>
              )}
            </>
          )}
        </div>
    </ModalShell>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      fontFamily: M, fontSize: 9, color: C.dim,
      letterSpacing: '0.15em', textTransform: 'uppercase',
      padding: '4px 0', ...style,
    }}>
      {children}
    </div>
  )
}

function StatusBanner({ text, color }: { text: string; color: string }) {
  return (
    <div style={{
      background: `${color}0a`, border: `1px solid ${color}30`,
      borderRadius: 8, padding: '14px 16px', textAlign: 'center', marginBottom: 8,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: color, animation: 'pulse-dot 1.2s ease-in-out infinite',
      }} />
      <span style={{ fontFamily: M, fontSize: 11, color }}>{text}</span>
      <style>{`@keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </div>
  )
}

function WalletButton({ label, icon, onClick }: {
  label: string; icon: React.ReactNode; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        width: '100%', padding: '12px 14px',
        background: C.surfaceHi, border: `1px solid ${C.border}`,
        borderRadius: 10, cursor: 'pointer',
        transition: 'all 0.15s cubic-bezier(0.4,0,0.2,1)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(156,255,147,0.06)'
        e.currentTarget.style.borderColor = C.borderHi
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(156,255,147,0.08)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = C.surfaceHi
        e.currentTarget.style.borderColor = C.border
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
      onMouseDown={e => {
        e.currentTarget.style.transform = 'translateY(1px) scale(0.98)'
        e.currentTarget.style.boxShadow = 'none'
      }}
      onMouseUp={e => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(156,255,147,0.08)'
      }}
    >
      <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <span style={{ fontFamily: M, fontSize: 12, fontWeight: 600, color: C.text, flex: 1, textAlign: 'left' }}>
        {label}
      </span>
      <span style={{
        fontFamily: M, fontSize: 8, fontWeight: 700, color: C.primary,
        background: 'rgba(156,255,147,0.08)', border: `1px solid ${C.borderHi}`,
        borderRadius: 4, padding: '2px 6px', letterSpacing: '0.1em',
      }}>
        GASLESS
      </span>
    </button>
  )
}
