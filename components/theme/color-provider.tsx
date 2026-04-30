'use client'

import { useEffect } from 'react'
import { THEME_COLORS } from '@/lib/constants/theme-colors'
import { useSettingsStore } from '@/lib/stores/settings-store'

export const ColorProvider = ({ children }: { children: React.ReactNode }) => {
	const settings = useSettingsStore(state => state.settings)

	useEffect(() => {
		if (!settings) {
			return
		}
		const primary = THEME_COLORS.find(color => color.value === settings.primaryColor)
		const secondary = THEME_COLORS.find(color => color.value === settings.secondaryColor)
		if (primary) {
			document.documentElement.style.setProperty('--primary', primary.primary)
		}
		if (secondary) {
			document.documentElement.style.setProperty('--secondary', secondary.secondary)
		}
	}, [settings])

	return <>{children}</>
}
