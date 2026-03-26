import { PrivyProvider, usePrivy } from '@privy-io/react-auth'
import { type ReactNode, useCallback, useState } from 'react'
import { DepositModal } from 'components/DepositModal'
import { useStarknetWallet } from './useStarknetWallet'

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID as string

// ─── Provider ─────────────────────────────────────────────────────────────────

export function PrivyWalletProvider({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ['google', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#9cff93',
        },
        embeddedWallets: {
          createOnLogin: 'off',
        },
      }}
    >
      {children}
    </PrivyProvider>
  )
}

// ─── Connect2 + Deposit Button ────────────────────────────────────────────────

const M = "'JetBrains Mono', monospace"

export function Connect2Button() {
  const { ready, authenticated, login, logout } = usePrivy()
  const [showDeposit, setShowDeposit] = useState(false)
  const { wallet: starknetWallet, loading: walletLoading } = useStarknetWallet()

  const handleConnect = useCallback(() => {
    if (!authenticated) login()
  }, [authenticated, login])

  const starknetAddress = starknetWallet?.address ?? '0x0'
  const walletReady     = !!starknetWallet?.address

  if (!ready) {
    return (
      <button
        disabled
        style={{ ...connectBtnStyle, opacity: 0.4, cursor: 'default' }}
      >
        LOADING…
      </button>
    )
  }

  if (!authenticated) {
    return (
      <button onClick={handleConnect} style={connectBtnStyle}>
        CONNECT
      </button>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={handleConnect} style={connectBtnStyle}>
          CONNECT
        </button>
        <button
          onClick={() => setShowDeposit(true)}
          style={depositBtnStyle}
        >
          {walletLoading ? 'PREPARING…' : 'DEPOSIT'}
        </button>
        {/* Disconnect */}
        <button
          onClick={() => logout()}
          title="Disconnect"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(156,255,147,0.3)',
            fontFamily: M,
            fontSize: 14,
            lineHeight: 1,
            padding: '4px 4px',
            cursor: 'pointer',
          }}
        >
          ×
        </button>
      </div>

      {showDeposit && (
        <DepositModal
          starknetAddress={starknetAddress}
          onClose={() => setShowDeposit(false)}
        />
      )}
    </>
  )
}

// ─── Button styles (matching design system) ──────────────────────────────────

const connectBtnStyle: React.CSSProperties = {
  fontFamily: M,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#0e0e0e',
  background: '#ffffff',
  border: 'none',
  padding: '8px 20px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'background 0.15s ease',
}

const depositBtnStyle: React.CSSProperties = {
  fontFamily: M,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#9cff93',
  background: '#201f1f',
  border: 'none',
  padding: '8px 20px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'background 0.15s ease',
}
