import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { Flex, styled, Text } from 'ui/src'

const TAB_HEIGHT = 50

const StyledTab = styled(Flex, {
  flexDirection: 'row',
  gap: '$gap16',
  pl: 16,
  height: TAB_HEIGHT,
  alignItems: 'center',
  position: 'relative',
  cursor: 'pointer',
  width: '100%',

  variants: {
    disabled: {
      true: {
        cursor: 'default',
      },
      false: {
        backgroundColor: '$surface2',

        hoverStyle: {
          backgroundColor: '$surface3',
        },
      },
    },
  },
})

const TabLabel = styled(Text, {
  "$group-active": {
    color: "$neutral1",
  },

  "$group-inactive": {
    color: "$neutral2",
  },

  "$group-inactive-hover": {
    color: "$neutral1",
  },

  "$group-disabled": {
    color: "$neutral2",
    opacity: 0.5,
  },
})

const IconWrapper = styled(Text, {
  "$group-active": {
    color: "$accent1",
  },

  "$group-inactive": {
    color: "$neutral2",
  },

  "$group-inactive-hover": {
    color: "$neutral1",
  },

  "$group-disabled": {
    color: "$neutral2",
    opacity: 0.5,
  },
})

interface TabProps {
  label: string
  icon: () => JSX.Element
  path?: string
  isActive?: boolean
}

export function Tab({ label, icon, path, isActive = false  }: TabProps) {
  const status = useMemo(() => isActive ? 'active' : path ? 'inactive' : 'disabled', [isActive, path])

  return (
    <NavLink to={path ?? ''} style={{ textDecoration: 'none', width: '100%' }}>
      <StyledTab group={status} disabled={status == 'disabled'} containerType="normal">
        <IconWrapper>{icon()}</IconWrapper>
        <Flex flexDirection="row" alignItems="center" gap="$gap8">
          <TabLabel>{label}</TabLabel>
          {!path && <Text color="$accent1" fontWeight="$medium">SOON</Text>}
        </Flex>
      </StyledTab>
    </NavLink>
  )
}
