'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export const useDarkMode = () => {
	const { resolvedTheme, setTheme } = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	const isDark = mounted && resolvedTheme === 'dark'
	const toggle = () => setTheme(isDark ? 'light' : 'dark')

	return { isDark, toggle, mounted }
}
