import type { ReactNode } from 'react'
import type { ThemeColor, UserSettings } from '@/lib/types'

export type ColorVariant = 'primary' | 'secondary'

export interface ThemePreviewProps {
	settings: UserSettings
}

export interface ColorRowProps {
	label: string
	name: string
	hsl: string
}

export interface SettingsSectionProps {
	title: string
	description?: string
	children: ReactNode
}

export interface ColorPickerProps {
	selected: ThemeColor
	onSelect: (color: ThemeColor) => void
	variant: ColorVariant
}
