import { Settings, Sparkles, Wallet } from 'lucide-react'

export const NAV_ITEMS = [
	{ label: 'Budget', href: '/', icon: Wallet },
	{ label: 'Insights', href: '/insights', icon: Sparkles },
	{ label: 'Settings', href: '/settings', icon: Settings }
] as const
