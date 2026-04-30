'use client'

import { LoginForm } from '@/components/auth/login-form'
import { AppNav } from '@/components/layout/app-nav'
import { PageLoader } from '@/components/ui/page-loader'
import { useAuthStore } from '@/lib/stores/auth-store'

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
	const user = useAuthStore(state => state.user)
	const loading = useAuthStore(state => state.loading)

	if (loading) {
		return <PageLoader fullScreen />
	}
	if (!user) {
		return <LoginForm />
	}

	return (
		<>
			<AppNav />
			{children}
		</>
	)
}
