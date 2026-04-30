import type { EmptyStateProps } from './types'

export const EmptyState = ({ icon, title, description }: EmptyStateProps) => (
	<div className="rounded-xl border border-dashed border-border p-10 text-center">
		<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">{icon}</div>
		<p className="text-sm font-medium">{title}</p>
		<p className="mt-1 text-xs text-muted-foreground">{description}</p>
	</div>
)
