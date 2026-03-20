import { Flex, styled } from 'ui/src'
import { useTabsContent } from './Tabs/TabsContent'
import { Tab } from './Tabs/Tab'

export const Nav = styled(Flex, {
  width: '100%',
  alignItems: 'flex-start',
  gap: '$gap12',
})

export function NavBar() {
  const tabsContent = useTabsContent()

  return (
    <Nav mt="$padding16" px="$padding16">
      {tabsContent.map(({ title, href, icon, isActive }, index) => (
        <Tab key={`${title}_${index}`} label={title} isActive={isActive} path={href} icon={icon} />
      ))}
    </Nav>
  )
}
