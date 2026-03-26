// Ordering is intentional and must be preserved: sideEffects followed by functionality.
import 'sideEffects'

import { QueryClientProvider } from '@tanstack/react-query'
import App from 'pages/App'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Helmet, HelmetProvider } from 'react-helmet-async/lib/index'
import { Provider } from 'react-redux'
import { BrowserRouter as Router, useLocation } from 'react-router-dom'
import store from 'state'
import { TamaguiProvider } from 'theme/tamaguiProvider'
import { getCanonicalUrl } from 'utils/urlRoutes'
import { StarknetProvider } from 'components/Web3Provider/StarknetProvider'
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

const container = document.getElementById('root') as HTMLElement

createRoot(container).render(
  <StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <QueryClientProvider client={SharedQueryClient}>
          <PrivyWalletProvider>
            <Router>
              <StarknetProvider>
                <Updaters />
                <TamaguiProvider>
                  <App />
                </TamaguiProvider>
              </StarknetProvider>
            </Router>
          </PrivyWalletProvider>
        </QueryClientProvider>
      </Provider>
    </HelmetProvider>
  </StrictMode>,
)
