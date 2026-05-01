export const COOKIE_KEYS = {
	ACCESS_GRANTED: 'siteAccessGranted',
	ACCESS_ERROR: 'siteAccessError'
} as const

export const STORAGE_KEYS = {
	THEME: 'theme',
	AI_INSIGHTS_COOLDOWN: 'ai_insights_last_generated'
} as const

export const COOKIE_MAX_AGE = {
	ERROR: 60,
	ACCESS: 60 * 60 * 24 * 365
} as const
