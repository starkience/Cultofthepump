import { memo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { HEADER_HEIGHT, SIDEBAR_WIDTH } from './utils/shared'

const M = "'JetBrains Mono', monospace"

const NAV_ITEMS = [
  { label: 'Rituals',   icon: 'swap_calls',    path: '/trade'     },
  { label: 'Summon',    icon: 'rocket_launch', path: '/summon'    },
  { label: 'The Pulse', icon: 'query_stats',   path: '/feed'      },
  { label: 'Portfolio', icon: 'account_balance_wallet', path: '/portfolio' },
]

export const Sidebar = memo(function Sidebar() {
  const { pathname } = useLocation()

  return (
    <>
      <style>{`
        .nav-link-item { display: flex; align-items: center; gap: 14px; padding: 12px 24px;
          background: transparent; border-left: 2px solid transparent;
          color: rgba(156,255,147,0.3); font-family: 'JetBrains Mono', monospace;
          font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em;
          transition: color 0.1s, background 0.1s; text-decoration: none; }
        .nav-link-item:hover { color: #9cff93; background: rgba(156,255,147,0.03); }
        .nav-link-item.active { background: #191919; border-left-color: #9cff93; padding-left: 22px; color: #9cff93; }
        .nav-link-item:focus-visible { outline: 2px solid #9cff93; outline-offset: -2px; }
        @media (prefers-reduced-motion: reduce) {
          .nav-link-item { transition: none; }
        }
      `}</style>
    <aside style={{
      position: 'fixed',
      left: 0,
      top: HEADER_HEIGHT,
      width: SIDEBAR_WIDTH,
      height: `calc(100vh - ${HEADER_HEIGHT}px)`,
      background: '#131313',
      borderRight: '1px solid rgba(156,255,147,0.05)',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: 32,
      zIndex: 40,
    }}>
      {/* Nav items */}
      <nav style={{ flex: 1 }}>
        {NAV_ITEMS.map(({ label, icon, path }) => {
          const active = pathname === path || (path !== '/' && pathname.startsWith(path))
          return (
            <NavLink
              key={path}
              to={path}
              aria-current={active ? 'page' : undefined}
              className={`nav-link-item${active ? ' active' : ''}`}
            >
              <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
    </>
  )
})
