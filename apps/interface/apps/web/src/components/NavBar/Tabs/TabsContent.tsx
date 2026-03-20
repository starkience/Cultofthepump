import { useLocation } from 'react-router-dom'
import { Crown, Rage, Stake, Summon, Trade } from 'ui/src/components/icons'

export type TabsSection = {
  title: string
  icon: () => JSX.Element
  href?: string
  isActive?: boolean
}

export const useTabsContent = (): TabsSection[] => {
  const { pathname } = useLocation()

  return [
    {
      title: 'Trade',
      href: '/trade',
      isActive: pathname.startsWith('/trade'),
      icon: () => <Trade size={20} />,
    },
    {
      title: 'Summon Cult',
      href: '/summon',
      isActive: pathname.startsWith('/summon'),
      icon: () => <Summon size={28} />,
    },
    {
      title: 'Leaderboard',
      href: '/leaderboard',
      isActive: pathname.startsWith('/trade'),
      icon: () => <Crown size={22} />,
    },
    {
      title: 'Stake',
      icon: () => <Stake size={22} />,
    },
    {
      title: '$RAGE',
      icon: () => <Rage size={28} />,
    }
  ]
}
