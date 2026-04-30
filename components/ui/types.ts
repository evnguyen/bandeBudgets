import type { ReactNode } from 'react'

export interface PageLoaderProps {
	label?: string
	fullScreen?: boolean
}

export interface SectionHeaderProps {
	label: string
}

export interface EmptyStateProps {
	icon: ReactNode
	title: string
	description: string
}
