import debounce from 'debounce'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { create } from 'zustand'
import { COLLECTIONS, SETTINGS_DEBOUNCE_MS } from '@/lib/constants/firebase'
import { db } from '@/lib/firebase'
import { showNotification } from '@/lib/notifications'
import { ThemeColor, UserSettings } from '@/lib/types'
import { buildDefaultSettings } from '@/lib/utils/settings'

interface SettingsState {
	settings: UserSettings | null
	loading: boolean
	loadSettings: (userId: string) => Promise<void>
	updatePrimaryColor: (color: ThemeColor) => Promise<void>
	updateSecondaryColor: (color: ThemeColor) => Promise<void>
}

const persistSettings = async (settings: UserSettings) => {
	try {
		const ref = doc(db, COLLECTIONS.SETTINGS, settings.userId)
		await setDoc(ref, settings, { merge: true })
	} catch (error) {
		console.error('Error saving settings:', error)
		showNotification('Failed to save theme. Changes saved locally.', 'error')
	}
}

const debouncedPersist = debounce(persistSettings, SETTINGS_DEBOUNCE_MS)

export const useSettingsStore = create<SettingsState>((set, get) => ({
	settings: null,
	loading: false,

	loadSettings: async userId => {
		set({ loading: true })
		const defaults = buildDefaultSettings(userId)
		try {
			const ref = doc(db, COLLECTIONS.SETTINGS, userId)
			const snapshot = await getDoc(ref)
			if (snapshot.exists()) {
				set({ settings: snapshot.data() as UserSettings, loading: false })
				return
			}
			await setDoc(ref, defaults)
		} catch (error) {
			console.error('Error loading settings:', error)
		}
		set({ settings: defaults, loading: false })
	},

	updatePrimaryColor: async color => {
		const current = get().settings
		if (!current) {
			return
		}
		const next: UserSettings = { ...current, primaryColor: color, updatedAt: Date.now() }
		set({ settings: next })
		debouncedPersist(next)
	},

	updateSecondaryColor: async color => {
		const current = get().settings
		if (!current) {
			return
		}
		const next: UserSettings = { ...current, secondaryColor: color, updatedAt: Date.now() }
		set({ settings: next })
		debouncedPersist(next)
	}
}))
