'use client'

import { Moon, Sun } from 'lucide-react'
import { ColorPicker } from '@/components/settings/color-picker'
import { SettingsSection } from '@/components/settings/settings-section'
import { ThemePreview } from '@/components/settings/theme-preview'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/components/ui/page-loader'
import { useDarkMode } from '@/hooks/use-dark-mode'
import { useSettingsStore } from '@/lib/stores/settings-store'

export default function SettingsPage() {
	const settings = useSettingsStore(state => state.settings)
	const updatePrimaryColor = useSettingsStore(state => state.updatePrimaryColor)
	const updateSecondaryColor = useSettingsStore(state => state.updateSecondaryColor)
	const { isDark, toggle, mounted } = useDarkMode()

	if (!settings) {
		return <PageLoader label="Loading settings..." />
	}

	return (
		<main className="flex-1">
			<div className="mx-auto max-w-2xl space-y-6 p-4 md:p-8">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Settings</h1>
					<p className="mt-1 text-sm text-muted-foreground">Customize your budget app experience</p>
				</div>

				<ThemePreview settings={settings} />

				<SettingsSection title="Appearance" description="Switch between light and dark mode">
					{mounted && (
						<Button variant="outline" onClick={toggle} className="flex items-center gap-2">
							{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
							{isDark ? 'Switch to light mode' : 'Switch to dark mode'}
						</Button>
					)}
				</SettingsSection>

				<SettingsSection title="Primary Color" description="Choose the primary accent color for your budget app">
					<ColorPicker selected={settings.primaryColor} onSelect={updatePrimaryColor} variant="primary" />
				</SettingsSection>

				<SettingsSection title="Secondary Color" description="Choose the secondary accent color for your budget app">
					<ColorPicker selected={settings.secondaryColor} onSelect={updateSecondaryColor} variant="secondary" />
				</SettingsSection>
			</div>
		</main>
	)
}
