import { useConnect } from '@starknet-react/core'
import { styled, Flex, Text } from 'ui/src'
import { Connection, L2Connection } from 'connections'

const StyledOption = styled(Flex, {
  flexDirection: 'row',
  p: '$padding16',
  cursor: 'pointer',
  width: '100%',
  alignItems: 'center',
  backgroundColor: '$surface2',

  hoverStyle: {
    backgroundColor: '$surface3',
  }
})

interface OptionProps {
  connection: Connection
  activate: () => void
}

function Option({ connection, activate }: OptionProps) {
  const Icon = connection.getIcon

  return (
    <StyledOption gap={16} onPress={activate}>
      <Icon width={32} height={32} />
      <Text>{connection.getName()}</Text>
    </StyledOption>
  )
}

interface L2OptionProps {
  connection: L2Connection
}

export function L2Option({ connection }: L2OptionProps) {
  // wallet activation
  const { connect } = useConnect()
  const activate = () => connect({ connector: connection.connector })

  return <Option connection={connection} activate={activate} />
}
