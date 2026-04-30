import { DEFAULT_THEME_COLOR } from '@/lib/constants/theme-colors'
import { UserSettings } from '@/lib/types'

export const buildDefaultSettings = (userId: string): UserSettings => {
	return {
		userId,
		primaryColor: DEFAULT_THEME_COLOR,
		secondaryColor: DEFAULT_THEME_COLOR,
		updatedAt: Date.now()
	}
}
