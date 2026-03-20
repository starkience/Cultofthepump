import { memo } from 'react'
import { Flex, styled } from 'ui/src'
import { zIndices } from 'ui/src/theme'
import { HEADER_HEIGHT, SIDEBAR_WIDTH } from './utils/shared'
import { NavBar } from 'components/NavBar'

const AppSidebar = styled(Flex, {
  width: SIDEBAR_WIDTH,
  top: HEADER_HEIGHT,
  bottom: 0,
  zIndex: zIndices.sticky,
  alignItems: 'center',
  backgroundColor: '$surface1',
  borderColor: '$borderColor',
  borderBottomWidth: 0,
  borderTopWidth: 0,
  borderRightWidth: 1,
  borderLeftWidth: 0,
  borderStyle: 'solid',
  pt: '$padding16',

  '$platform-web': {
    position: 'fixed',
  },
})

export const Sidebar = memo(function Header() {
  return (
    <AppSidebar>
      <NavBar />
    </AppSidebar>
  )
})
