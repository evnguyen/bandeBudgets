import type { ColorRowProps } from '@/components/settings/types'

export const ColorRow = ({ label, name, hsl }: ColorRowProps) => (
	<div>
		<p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label} Color</p>
		<div className="flex gap-3">
			<div className="h-16 w-24 rounded-lg border border-border shadow-sm" style={{ backgroundColor: `hsl(${hsl})` }} />
			<div className="flex flex-col justify-center">
				<p className="font-medium">{name}</p>
				<p className="text-sm text-muted-foreground">hsl({hsl})</p>
			</div>
		</div>
	</div>
)
