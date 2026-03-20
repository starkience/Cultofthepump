import { Flex, FlexProps, styled, Text, useSigilColors } from 'ui/src'
import { Close } from 'ui/src/components/icons'
import { opacify } from 'ui/src/theme'

const Card = styled(Flex, {
  flexDirection: 'column',
  backgroundColor: '$surface1',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: '$borderColor',
  overflow: 'hidden',
})

const CardHeader = styled(Flex, {
  px: '$padding12',
  py: '$padding8',
  backgroundColor: '$surface3',
  borderBottomWidth: 1,
  borderTopWidth: 0,
  borderLeftWidth: 0,
  borderRightWidth: 0,
  borderColor: '$borderColor',
  borderStyle: 'solid',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
})

const StyledClose = styled(Close, {
  size: '$icon.16',
  color: '$neutral2',
  cursor: 'pointer',

  hoverStyle: {
    color: '$neutral1',
  },
})

export interface WindowCardProps extends FlexProps {
  title: string
  onClose?(): void
}

export function WindowCard({ title, children, onClose, ...props }: React.PropsWithChildren<WindowCardProps>) {
  const colors = useSigilColors()

  return (
    <Card {...props} boxShadow={`0px 8px 12px 6px ${opacify(20, colors.surface3.val)}, 0px 4px 4px ${opacify(10, colors.surface3.val)};`}>
      <CardHeader>
        <Text variant="body2" fontWeight="$medium">{title}</Text>
        {!!onClose && <StyledClose onPress={onClose} />}
      </CardHeader>

      <Flex flex={1} p="$padding32">{children}</Flex>
    </Card>
  )
}
