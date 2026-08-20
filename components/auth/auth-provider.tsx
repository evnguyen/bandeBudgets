'use client'

import { onAuthStateChanged } from 'firebase/auth'
import { useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { auth } from '@/lib/firebase'
import { setNotificationCallback } from '@/lib/notifications'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useBudgetStore } from '@/lib/stores/budget-store'
import { getMonthString } from '@/lib/utils/dates'

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const setUser = useAuthStore(state => state.setUser)
	const setLoading = useAuthStore(state => state.setLoading)
	const loadBudget = useBudgetStore(state => state.loadBudget)
	const { toast } = useToast()

	useEffect(() => {
		setNotificationCallback((message, type) => {
			toast({
				description: message,
				variant: type === 'error' ? 'destructive' : 'default'
			})
		})
	}, [toast])

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async user => {
			setUser(user)
			if (!user) {
				setLoading(false)
				return
			}
			try {
				await loadBudget(user.uid, getMonthString(new Date()))
			} finally {
				setLoading(false)
			}
		})
		return () => unsubscribe()
	}, [setUser, setLoading, loadBudget])

	return <>{children}</>
}
