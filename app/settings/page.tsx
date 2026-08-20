'use client'

import { Moon, Sun } from 'lucide-react'
import { SettingsSection } from '@/components/settings/settings-section'
import { Button } from '@/components/ui/button'
import { useDarkMode } from '@/hooks/use-dark-mode'

export default function SettingsPage() {
	const { isDark, toggle, mounted } = useDarkMode()

	return (
		<main className="flex-1">
			<div className="mx-auto max-w-2xl space-y-6 p-4 md:p-8">
				<div>
					<h1 className="font-serif text-2xl font-semibold tracking-tight">Settings</h1>
					<p className="mt-1 text-sm text-muted-foreground">Customize your budget app experience</p>
				</div>

				<SettingsSection title="Appearance" description="Switch between light and dark mode">
					{mounted && (
						<Button variant="outline" onClick={toggle} className="flex items-center gap-2">
							{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
							{isDark ? 'Switch to light mode' : 'Switch to dark mode'}
						</Button>
					)}
				</SettingsSection>
			</div>
		</main>
	)
}
