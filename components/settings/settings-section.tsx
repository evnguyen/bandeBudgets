import type { SettingsSectionProps } from '@/components/settings/types'

export const SettingsSection = ({ title, description, children }: SettingsSectionProps) => (
	<div className="rounded-xl border border-border bg-card shadow-sm">
		<div className="border-b border-border px-6 py-4">
			<h2 className="text-sm font-semibold">{title}</h2>
			{description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
		</div>
		<div className="p-6">{children}</div>
	</div>
)
