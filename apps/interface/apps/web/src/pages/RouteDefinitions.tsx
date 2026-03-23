import { lazy, ReactNode, useMemo } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isBrowserRouterEnabled } from 'utils/env'
// High-traffic pages (index and /swap) should not be lazy-loaded.
import Landing from 'pages/Landing'

const NotFound = lazy(() => import('pages/NotFound'))
const Summoner = lazy(() => import('pages/Summon'))
const TradePage = lazy(() => import('pages/Trade'))

// SEO titles and descriptions sourced from <TODO create a google doc for that>
// getTitle and getDescription are used as static metatags for SEO. Dynamic metatags should be set in the page component itself
const StaticTitlesAndDescriptions = {
  COTPTitle: 'Leftcurve',
  COTPDescription: 'Leftcurve is a cult factory on Starknet.',
  SummonerTitle: 'Create a cult on Starknet',
  SummonerDescription: 'Create your own cult on Starknet.',
  TradeTitle: 'Trade Starknet cults',
  TradeDescription: 'Browse live cults and inspect recent Starknet launch activity.',
}

export interface RouteDefinition {
  path: string
  nestedPaths: string[]
  getTitle: (path?: string) => string
  getDescription: (path?: string) => string
  getElement: () => ReactNode
}

// Assigns the defaults to the route definition.
function createRouteDefinition(route: Partial<RouteDefinition>): RouteDefinition {
  return {
    getElement: () => null,
    getTitle: () => StaticTitlesAndDescriptions.COTPTitle,
    getDescription: () => StaticTitlesAndDescriptions.COTPDescription,
    path: '/',
    nestedPaths: [],
    // overwrite the defaults
    ...route,
  }
}

export const routes: RouteDefinition[] = [
  createRouteDefinition({
    path: '/',
    getTitle: () => StaticTitlesAndDescriptions.COTPTitle,
    getDescription: () => StaticTitlesAndDescriptions.COTPDescription,
    getElement: () => <Landing />,
  }),
  createRouteDefinition({
    path: '/summon',
    getElement: () => <Summoner />,
    getTitle: () => StaticTitlesAndDescriptions.SummonerTitle,
    getDescription: () => StaticTitlesAndDescriptions.SummonerDescription,
  }),
  createRouteDefinition({
    path: '/trade',
    nestedPaths: [':address'],
    getElement: () => <TradePage />,
    getTitle: () => StaticTitlesAndDescriptions.TradeTitle,
    getDescription: () => StaticTitlesAndDescriptions.TradeDescription,
  }),
  createRouteDefinition({ path: '*', getElement: () => <Navigate to="/not-found" replace /> }),
  createRouteDefinition({ path: '/not-found', getElement: () => <NotFound /> }),
]
