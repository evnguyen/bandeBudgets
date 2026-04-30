'use client'

import { Check } from 'lucide-react'
import type { ColorPickerProps } from '@/components/settings/types'
import { THEME_COLORS } from '@/lib/constants/theme-colors'

export const ColorPicker = ({ selected, onSelect, variant }: ColorPickerProps) => (
	<div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
		{THEME_COLORS.map(color => {
			const hsl = variant === 'primary' ? color.primary : color.secondary
			const isSelected = selected === color.value
			return (
				<button
					key={color.value}
					type="button"
					onClick={() => onSelect(color.value)}
					aria-label={`Select ${color.name}`}
					aria-pressed={isSelected}
					className="group flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					style={{
						borderColor: isSelected ? `hsl(${hsl})` : 'hsl(var(--border))'
					}}
				>
					<div
						className="flex h-10 w-10 items-center justify-center rounded-full transition-transform group-hover:scale-110"
						style={{ backgroundColor: `hsl(${hsl})` }}
					>
						{isSelected && <Check className="h-5 w-5 text-white" />}
					</div>
					<span className="text-xs font-medium">{color.name}</span>
				</button>
			)
		})}
	</div>
)
