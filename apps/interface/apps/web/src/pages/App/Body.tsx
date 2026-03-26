import { RouteDefinition, routes } from 'pages/RouteDefinitions'
import { Suspense, lazy, memo, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { SpinningLoader } from 'ui/src'

// The Chrome is always loaded, but is lazy-loaded because it is not needed without user interaction.
// Annotating it with webpackPreload allows it to be ready when requested.
const AppChrome = lazy(() => import(/* webpackPreload: true */ './Chrome'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

export const Body = memo(function Body() {
  return (
    <>
      <ScrollToTop />

      <Suspense>
        <AppChrome />
      </Suspense>

      <Suspense fallback={<SpinningLoader />}>
        <Routes>
          {routes.map((route: RouteDefinition) =>
            <Route key={route.path} path={route.path} element={route.getElement()}>
              {route.nestedPaths.map((nestedPath) => (
                <Route
                  path={nestedPath}
                  element={route.getElement()}
                  key={`${route.path}/${nestedPath}`}
                />
              ))}
            </Route>
          )}
        </Routes>
      </Suspense>
    </>
  )
})
