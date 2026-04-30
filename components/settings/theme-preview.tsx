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
					<div className="rounded-lg border border-border bg-background p-4">
						<div className="mb-3 flex items-center gap-2">
							<div className="h-3 w-3 rounded-full" style={{ backgroundColor: `hsl(${primary.primary})` }} />
							<span className="text-xs font-semibold text-foreground">Budget Overview</span>
						</div>
						<div className="grid grid-cols-2 gap-2">
							<div className="rounded-md bg-card p-3 shadow-sm">
								<p className="mb-1 text-xs text-muted-foreground">Income</p>
								<p className="text-sm font-bold" style={{ color: `hsl(${primary.primary})` }}>
									$3,200
								</p>
							</div>
							<div className="rounded-md bg-card p-3 shadow-sm">
								<p className="mb-1 text-xs text-muted-foreground">Expenses</p>
								<p className="text-sm font-bold" style={{ color: `hsl(${secondary.secondary})` }}>
									$2,100
								</p>
							</div>
						</div>
						<div className="mt-2 rounded-md bg-card p-3 shadow-sm">
							<div className="mb-2 flex items-center justify-between">
								<p className="text-xs text-muted-foreground">Left to Budget</p>
								<p className="text-xs font-bold" style={{ color: `hsl(${primary.primary})` }}>
									$1,100
								</p>
							</div>
							<div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
								<div className="h-full w-2/3 rounded-full" style={{ backgroundColor: `hsl(${primary.primary})` }} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
