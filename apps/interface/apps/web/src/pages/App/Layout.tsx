import { Body } from 'pages/App/Body'
import { Header } from 'pages/App/Header'
import { Sidebar } from 'pages/App/Sidebar'
import { Footer } from 'pages/App/Footer'
import { HEADER_HEIGHT, MAX_WIDTH, SIDEBAR_WIDTH } from 'pages/App/utils/shared'
import { View } from 'tamagui'
import { Flex, styled } from 'ui/src'

const AppContainer = styled(View, {
  minHeight: '100vh',
})

const AppBody = styled(Flex, {
  width: '100%',
  minHeight: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  alignItems: 'center',
  flex: 1,
  pl: SIDEBAR_WIDTH,
  pt: HEADER_HEIGHT,

  // Media query in Tamagui
  $sm: {
    pl: 10,
    pr: 10,
  },
})

export function AppLayout() {
  return (
    <AppContainer>
      <Header />

      <Sidebar />

      <AppBody>
        <Body />
      </AppBody>

      <Footer />
    </AppContainer>
  )
}
