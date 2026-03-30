import { PrivyProvider } from '@privy-io/react-auth'
import { type ReactNode, useRef, useState } from 'react'
import { DepositModal } from 'components/DepositModal'
import { WithdrawModal } from 'components/WithdrawModal'
import { LoginModal } from 'components/LoginModal'
import { useWallet } from 'context/WalletContext'

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID as string

// ─── Provider ─────────────────────────────────────────────────────────────────

export function PrivyWalletProvider({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ['wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#9cff93',
          showWalletLoginFirst: true,
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

// ─── Interactive button component ─────────────────────────────────────────────

const M = "'JetBrains Mono', monospace"

interface HeaderBtnProps {
  label: string
  color: string
  bg: string
  hoverBg: string
  hoverColor: string
  onClick: () => void
  disabled?: boolean
}

function HeaderBtn({ label, color, bg, hoverBg, hoverColor, onClick, disabled }: HeaderBtnProps) {
  const ref = useRef<HTMLButtonElement>(null)

  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => {
        if (ref.current) {
          ref.current.style.background = hoverBg
          ref.current.style.color = hoverColor
          ref.current.style.transform = 'translateY(-1px)'
          ref.current.style.boxShadow = `0 4px 12px ${hoverBg}40`
        }
      }}
      onMouseLeave={() => {
        if (ref.current) {
          ref.current.style.background = bg
          ref.current.style.color = color
          ref.current.style.transform = 'translateY(0)'
          ref.current.style.boxShadow = 'none'
        }
      }}
      onMouseDown={() => {
        if (ref.current) {
          ref.current.style.transform = 'translateY(1px) scale(0.97)'
          ref.current.style.boxShadow = 'none'
        }
      }}
      onMouseUp={() => {
        if (ref.current) {
          ref.current.style.transform = 'translateY(-1px)'
          ref.current.style.boxShadow = `0 4px 12px ${hoverBg}40`
        }
      }}
      style={{
        fontFamily: M,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase' as const,
        color,
        background: bg,
        border: 'none',
        padding: '8px 20px',
        cursor: disabled ? 'default' : 'pointer',
        whiteSpace: 'nowrap' as const,
        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: 'translateY(0)',
        boxShadow: 'none',
        opacity: disabled ? 0.4 : 1,
        position: 'relative' as const,
        overflow: 'hidden',
      }}
    >
      {label}
    </button>
  )
}

// ─── Connect2Button ──────────────────────────────────────────────────────────

export function Connect2Button() {
  const {
    isConnected, isLoading, address, externalAddress, mode,
    disconnect, openLoginModal, loginModalOpen, setLoginModalOpen,
  } = useWallet()

  const [showDeposit, setShowDeposit]   = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)

  const displayAddress = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : null

  if (!isConnected && !isLoading) {
    return (
      <>
        <HeaderBtn
          label="CONNECT"
          color="#0e0e0e"
          bg="#ffffff"
          hoverBg="#9cff93"
          hoverColor="#0e0e0e"
          onClick={openLoginModal}
        />
        {loginModalOpen && <LoginModal />}
      </>
    )
  }

  if (isLoading) {
    return (
      <HeaderBtn
        label="LOADING…"
        color="#0e0e0e"
        bg="#ffffff"
        hoverBg="#ffffff"
        hoverColor="#0e0e0e"
        onClick={() => {}}
        disabled
      />
    )
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Address pill */}
        <div style={{
          fontFamily: M, fontSize: 11, fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          color: '#fff', background: '#201f1f',
          padding: '8px 16px',
          display: 'flex', alignItems: 'center', gap: 8,
          whiteSpace: 'nowrap',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#9cff93', display: 'inline-block',
            boxShadow: '0 0 6px rgba(156,255,147,0.5)',
            animation: 'pulse-dot 2s ease-in-out infinite',
          }} />
          {displayAddress ?? 'CONNECTED'}
          {mode === 'starknet' && externalAddress && (
            <span style={{ fontSize: 9, color: 'rgba(156,255,147,0.4)', marginLeft: 2 }}>
              ↔ {externalAddress.slice(0, 4)}…
            </span>
          )}
        </div>

        <HeaderBtn
          label="DEPOSIT"
          color="#9cff93"
          bg="#201f1f"
          hoverBg="#9cff93"
          hoverColor="#0e0e0e"
          onClick={() => setShowDeposit(true)}
        />

        <HeaderBtn
          label="WITHDRAW"
          color="#ffffff"
          bg="#201f1f"
          hoverBg="#ffffff"
          hoverColor="#0e0e0e"
          onClick={() => setShowWithdraw(true)}
        />

        {/* Disconnect */}
        <button
          onClick={disconnect}
          title="Disconnect"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(156,255,147,0.25)',
            fontFamily: M,
            fontSize: 14,
            lineHeight: 1,
            padding: '4px 4px',
            cursor: 'pointer',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ff725e' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(156,255,147,0.25)' }}
        >
          ×
        </button>
      </div>

      <style>{`@keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>

      {loginModalOpen && <LoginModal />}

      {showDeposit && address && (
        <DepositModal starknetAddress={address} onClose={() => setShowDeposit(false)} />
      )}
      {showWithdraw && address && (
        <WithdrawModal starknetAddress={address} onClose={() => setShowWithdraw(false)} />
      )}
    </>
  )
}
