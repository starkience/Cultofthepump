import { NavIcon } from 'components/Logo/NavIcon'
import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Button, Flex, styled } from 'ui/src'
import { MessageDots } from 'ui/src/components/icons'
import { zIndices } from 'ui/src/theme'
import { HEADER_HEIGHT, SIDEBAR_WIDTH } from './utils/shared'
import { Web3Status } from 'components/Web3Status'

const AppHeader = styled(Flex, {
  width: '100%',
  top: 0,
  zIndex: zIndices.sticky,
  alignItems: 'center',
  pr: '$spacing20',
  mx: 'auto',
  backgroundColor: '$surface1',
  height: HEADER_HEIGHT,
  flexDirection: 'row',
  borderColor: '$borderColor',
  borderBottomWidth: 1,
  borderTopWidth: 0,
  borderRightWidth: 0,
  borderLeftWidth: 0,
  borderStyle: 'solid',

  '$platform-web': {
    position: 'fixed',
  },
})

const SideContainer = styled(Flex, {
  flexGrow: 1,
  flexShrink: 0,
  flexBasis: 0,
  flexDirection: 'row',
  alignItems: 'center',
  gap: '$gap16',
  height: HEADER_HEIGHT,
})

export const Header = memo(function Header() {
  return (
    <AppHeader>
      <Flex width={SIDEBAR_WIDTH} flexDirection="row" justifyContent="center">
        <Link to="/">
          <NavIcon />
        </Link>
      </Flex>

      <SideContainer justifyContent="flex-end">
        <Web3Status />
        <Button theme="tertiary_Button" icon={<MessageDots />} />
      </SideContainer>
    </AppHeader>
  )
})
