import { create } from 'zustand';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { UserSettings, ThemeColor } from '@/lib/types';
import { db } from '@/lib/firebase';
import { COLLECTIONS, SETTINGS_DEBOUNCE_MS } from '@/lib/constants/firebase';
import { DEFAULT_THEME_COLOR } from '@/lib/theme-colors';
import { showNotification } from '@/lib/notifications';

interface SettingsState {
  settings: UserSettings | null;
  loading: boolean;
  loadSettings: (userId: string) => Promise<void>;
  updatePrimaryColor: (color: ThemeColor) => Promise<void>;
  updateSecondaryColor: (color: ThemeColor) => Promise<void>;
}

const buildDefault = (userId: string): UserSettings => ({
  userId,
  primaryColor: DEFAULT_THEME_COLOR,
  secondaryColor: DEFAULT_THEME_COLOR,
  updatedAt: Date.now(),
});

let saveTimer: ReturnType<typeof setTimeout> | null = null;

const debouncedSave = (settings: UserSettings) => {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      const ref = doc(db, COLLECTIONS.SETTINGS, settings.userId);
      await setDoc(ref, settings, { merge: true });
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification(
        'Failed to save theme. Changes saved locally.',
        'error',
      );
    }
  }, SETTINGS_DEBOUNCE_MS);
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  loading: false,

  loadSettings: async (userId) => {
    set({ loading: true });
    const defaults = buildDefault(userId);
    try {
      const ref = doc(db, COLLECTIONS.SETTINGS, userId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        set({ settings: snap.data() as UserSettings, loading: false });
        return;
      }
      await setDoc(ref, defaults);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    set({ settings: defaults, loading: false });
  },

  updatePrimaryColor: async (color) => {
    const current = get().settings;
    if (!current) return;
    const next: UserSettings = { ...current, primaryColor: color, updatedAt: Date.now() };
    set({ settings: next });
    debouncedSave(next);
  },

  updateSecondaryColor: async (color) => {
    const current = get().settings;
    if (!current) return;
    const next: UserSettings = { ...current, secondaryColor: color, updatedAt: Date.now() };
    set({ settings: next });
    debouncedSave(next);
  },
}));
