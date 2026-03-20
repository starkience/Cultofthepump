import { Flex, styled } from 'ui/src'
import { Prompt } from 'ui/src/components/logos/Prompt'
import { Cotp } from 'ui/src/components/logos/Cotp'

const Container = styled(Flex, {
  name: 'Container', // for debugging
  alignItems: 'center',
  width: 'fit-content',
  gap: '$gap12',
  flexDirection: 'row',
})

export const NavIcon = () => (
  <Container>
    <Prompt color="$accent1" height={36} width="auto" />
    <Cotp color="$neutral1" height={24} width="auto" />
  </Container>
)
