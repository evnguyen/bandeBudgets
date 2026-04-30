'use client'

import { ColorPicker } from '@/components/settings/color-picker'
import { SettingsSection } from '@/components/settings/settings-section'
import { ThemePreview } from '@/components/settings/theme-preview'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/components/ui/page-loader'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useSettingsStore } from '@/lib/stores/settings-store'

export default function SettingsPage() {
	const settings = useSettingsStore(state => state.settings)
	const updatePrimaryColor = useSettingsStore(state => state.updatePrimaryColor)
	const updateSecondaryColor = useSettingsStore(state => state.updateSecondaryColor)
	const user = useAuthStore(state => state.user)
	const logout = useAuthStore(state => state.logout)

	const handleLogout = async () => {
		try {
			await logout()
		} catch (error) {
			console.error('Logout error:', error)
		}
	}

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

				<SettingsSection title="Primary Color" description="Choose the primary accent color for your budget app">
					<ColorPicker selected={settings.primaryColor} onSelect={updatePrimaryColor} variant="primary" />
				</SettingsSection>

				<SettingsSection title="Secondary Color" description="Choose the secondary accent color for your budget app">
					<ColorPicker selected={settings.secondaryColor} onSelect={updateSecondaryColor} variant="secondary" />
				</SettingsSection>

				<SettingsSection title="Account" description="Manage your account settings">
					<div className="space-y-4">
						<div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
							<div>
								<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</p>
								<p className="mt-0.5 text-sm font-medium">{user?.email}</p>
							</div>
						</div>
						<Button onClick={handleLogout} variant="destructive" className="w-full">
							Sign Out
						</Button>
					</div>
				</SettingsSection>
			</div>
		</main>
	)
}
