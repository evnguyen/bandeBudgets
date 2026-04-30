import type { SectionHeaderProps } from './types'

export const SectionHeader = ({ label }: SectionHeaderProps) => (
	<div className="flex items-center gap-3">
		<div className="h-4 w-0.5 rounded-full bg-primary" />
		<h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</h2>
	</div>
)
