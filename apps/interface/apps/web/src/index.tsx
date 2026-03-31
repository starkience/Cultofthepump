// Ordering is intentional and must be preserved: sideEffects followed by functionality.
import 'sideEffects'

import { QueryClientProvider } from '@tanstack/react-query'
import App from 'pages/App'
import { Component, StrictMode } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { Helmet, HelmetProvider } from 'react-helmet-async/lib/index'
import { Provider } from 'react-redux'
import { BrowserRouter as Router, useLocation } from 'react-router-dom'
import store from 'state'
import { TamaguiProvider } from 'theme/tamaguiProvider'
import { getCanonicalUrl } from 'utils/urlRoutes'
import { StarknetProvider } from 'components/Web3Provider/StarknetProvider'
import { UnifiedWalletProvider } from 'context/WalletContext'
import { PrivyWalletProvider } from 'components/PrivyConnect'
import { SharedQueryClient } from 'cotp/src/data/apiClients/SharedQueryClient'

function Updaters() {
  const location = useLocation()

  return (
    <>
      <Helmet>
        <link rel="canonical" href={getCanonicalUrl(location.pathname)} />
      </Helmet>
    </>
  )
}

// ─── Error boundary ──────────────────────────────────────────────────────────
class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AppErrorBoundary]', error, info.componentStack)
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', background: '#0e0e0e', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          <div style={{ maxWidth: 480, textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>:/</div>
            <h1 style={{ fontSize: 16, color: '#9cff93', letterSpacing: '0.12em', marginBottom: 12 }}>
              SOMETHING BROKE
            </h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 20 }}>
              {this.state.error.message}
            </p>
            <button
              onClick={() => { this.setState({ error: null }); window.location.reload() }}
              style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: '#0e0e0e', background: '#9cff93', border: 'none',
                padding: '10px 24px', cursor: 'pointer',
              }}
            >
              RELOAD
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const container = document.getElementById('root') as HTMLElement

createRoot(container).render(
  <StrictMode>
    <AppErrorBoundary>
      <HelmetProvider>
        <Provider store={store}>
          <QueryClientProvider client={SharedQueryClient}>
            <PrivyWalletProvider>
              <Router>
                <StarknetProvider>
                  <UnifiedWalletProvider>
                    <Updaters />
                    <TamaguiProvider>
                      <App />
                    </TamaguiProvider>
                  </UnifiedWalletProvider>
                </StarknetProvider>
              </Router>
            </PrivyWalletProvider>
          </QueryClientProvider>
        </Provider>
      </HelmetProvider>
    </AppErrorBoundary>
  </StrictMode>,
)
