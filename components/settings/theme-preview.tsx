'use client'

import { ColorRow } from '@/components/settings/color-row'
import type { ThemePreviewProps } from '@/components/settings/types'
import { THEME_COLORS } from '@/lib/constants/theme-colors'

export const ThemePreview = ({ settings }: ThemePreviewProps) => {
	const primary = THEME_COLORS.find(color => color.value === settings.primaryColor)
	const secondary = THEME_COLORS.find(color => color.value === settings.secondaryColor)

	if (!primary || !secondary) {
		return null
	}

	return (
		<div className="rounded-xl border border-border bg-card p-6 shadow-sm">
			<h3 className="mb-4 text-sm font-semibold">Theme Preview</h3>
			<div className="space-y-4">
				<ColorRow label="Primary" name={primary.name} hsl={primary.primary} />
				<ColorRow label="Secondary" name={secondary.name} hsl={secondary.secondary} />
				<div>
					<p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Combined Preview</p>
					<div className="rounded-lg p-4 shadow-sm" style={{ backgroundColor: `hsl(${primary.primary})` }}>
						<p className="mb-2 font-semibold text-white">Main Section</p>
						<div className="rounded p-3 text-white" style={{ backgroundColor: `hsl(${secondary.secondary})` }}>
							Accent Area
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
