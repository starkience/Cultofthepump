import { useLocation } from 'react-router-dom'
import { Crown, MessageDots, Summon, Trade } from 'ui/src/components/icons'

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
      title: 'The Pulse',
      href: '/feed',
      isActive: pathname.startsWith('/feed'),
      icon: () => <MessageDots size={20} />,
    },
    {
      title: 'Leaderboard',
      href: '/leaderboard',
      isActive: pathname.startsWith('/leaderboard'),
      icon: () => <Crown size={22} />,
    }
  ]
}
