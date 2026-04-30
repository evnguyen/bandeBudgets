'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Settings, Wallet } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { cn } from '@/lib/utils'

const navItems = [
	{ label: 'Budget', href: '/', icon: Wallet },
	{ label: 'Settings', href: '/settings', icon: Settings }
] as const

export const Sidebar = () => {
	const pathname = usePathname()
	const logout = useAuthStore(state => state.logout)

	const handleLogout = async () => {
		try {
			await logout()
		} catch (error) {
			console.error('Logout error:', error)
		}
	}

	return (
		<aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-border bg-card lg:flex">
			<div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-5">
				<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
					<Wallet className="h-4 w-4" />
				</div>
				<span className="text-base font-bold tracking-tight">Budget App</span>
			</div>

			<nav className="flex-1 overflow-y-auto p-3 pt-4">
				<ul className="space-y-0.5">
					{navItems.map(({ label, href, icon: Icon }) => {
						const isActive = pathname === href
						return (
							<li key={href}>
								<Link
									href={href}
									aria-current={isActive ? 'page' : undefined}
									className={cn(
										'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
										isActive
											? 'bg-primary/10 text-primary'
											: 'text-muted-foreground hover:bg-muted hover:text-foreground'
									)}
								>
									<Icon className="h-4 w-4 shrink-0" />
									{label}
								</Link>
							</li>
						)
					})}
				</ul>
			</nav>

			<div className="shrink-0 space-y-0.5 border-t border-border p-3">
				<button
					type="button"
					onClick={handleLogout}
					aria-label="Log out"
					className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					<LogOut className="h-4 w-4 shrink-0" />
					Logout
				</button>
			</div>
		</aside>
	)
}
