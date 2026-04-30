'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Menu, Moon, Settings, Sun, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useDarkMode } from '@/hooks/use-dark-mode'
import { useAuthStore } from '@/lib/stores/auth-store'
import { cn } from '@/lib/utils'

const navItems = [
	{ label: 'Budget', href: '/', icon: Wallet },
	{ label: 'Settings', href: '/settings', icon: Settings }
] as const

export const AppNav = () => {
	const pathname = usePathname()
	const logout = useAuthStore(state => state.logout)
	const { isDark, toggle, mounted } = useDarkMode()
	const [open, setOpen] = useState(false)

	const handleLogout = async () => {
		try {
			await logout()
		} catch (error) {
			console.error('Logout error:', error)
		}
	}

	return (
		<nav className="border-b bg-background lg:hidden">
			<div className="flex h-14 items-center justify-between px-4">
				<div className="flex items-center gap-2">
					<Sheet open={open} onOpenChange={setOpen}>
						<SheetTrigger asChild>
							<Button variant="ghost" size="icon" aria-label="Open menu">
								<Menu className="h-5 w-5" />
							</Button>
						</SheetTrigger>
						<SheetContent side="left" className="w-64 p-4">
							<div className="mb-6">
								<h2 className="text-xl font-bold text-primary">Budget App</h2>
							</div>
							<nav className="space-y-1">
								{navItems.map(({ label, href, icon: Icon }) => {
									const isActive = pathname === href
									return (
										<Link
											key={href}
											href={href}
											onClick={() => setOpen(false)}
											aria-current={isActive ? 'page' : undefined}
											className={cn(
												'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
												isActive
													? 'bg-primary/10 text-primary'
													: 'text-muted-foreground hover:bg-muted hover:text-foreground'
											)}
										>
											<Icon className="h-5 w-5" />
											{label}
										</Link>
									)
								})}
							</nav>
							<div className="mt-6 space-y-1 border-t pt-4">
								{mounted && (
									<button
										type="button"
										onClick={toggle}
										aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
										className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
									>
										{isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
										{isDark ? 'Light mode' : 'Dark mode'}
									</button>
								)}
								<button
									type="button"
									onClick={handleLogout}
									aria-label="Log out"
									className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
								>
									<LogOut className="h-5 w-5" />
									Logout
								</button>
							</div>
						</SheetContent>
					</Sheet>
					<Link href="/" className="flex items-center gap-2 text-lg font-bold">
						<Wallet className="h-5 w-5 text-primary" />
						Budget App
					</Link>
				</div>
				<div className="flex items-center gap-1">
					{mounted && (
						<Button
							variant="ghost"
							size="icon"
							onClick={toggle}
							aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
						>
							{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
						</Button>
					)}
					<Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
						<LogOut className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</nav>
	)
}
