import { create } from 'zustand';
import { UserSettings, ThemeColor } from '@/lib/types';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { THEME_COLORS } from '@/lib/theme-colors';
import { showNotification } from '@/lib/notifications';

interface SettingsState {
  settings: UserSettings | null;
  loading: boolean;
  
  // Actions
  loadSettings: (userId: string) => Promise<void>;
  updatePrimaryColor: (color: ThemeColor) => Promise<void>;
  updateSecondaryColor: (color: ThemeColor) => Promise<void>;
  applyTheme: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  loading: false,
  
  loadSettings: async (userId: string) => {
    set({ loading: true });

    const defaultSettings: UserSettings = {
      userId,
      primaryColor: 'blue',
      secondaryColor: 'blue',
      currency: 'USD',
      updatedAt: Date.now(),
    };

    try {
      const settingsRef = doc(db, 'settings', userId);
      const settingsSnap = await getDoc(settingsRef);
      
      if (settingsSnap.exists()) {
        const settings = settingsSnap.data() as UserSettings;
        set({ settings, loading: false });
        get().applyTheme();
        return;
      }

      // Persist defaults to Firebase
      await setDoc(settingsRef, defaultSettings);
    } catch (error) {
      console.error('Error loading settings from Firebase, using defaults:', error);
    }

    // Fallback: apply defaults locally
    set({ settings: defaultSettings, loading: false });
    get().applyTheme();
  },
  
  updatePrimaryColor: async (color: ThemeColor) => {
    const state = get();
    if (!state.settings) return;
    
    const updatedSettings: UserSettings = {
      ...state.settings,
      primaryColor: color,
      updatedAt: Date.now(),
    };
    
    // Apply locally first
    set({ settings: updatedSettings });
    get().applyTheme();

    try {
      const settingsRef = doc(db, 'settings', state.settings.userId);
      await setDoc(settingsRef, updatedSettings, { merge: true });
      console.log('Primary color saved to Firebase:', color);
    } catch (error) {
      console.error('Error persisting primary color to Firebase:', error);
      showNotification('Failed to save theme color to Firebase. Changes saved locally.', 'error');
    }
  },
  
  updateSecondaryColor: async (color: ThemeColor) => {
    const state = get();
    if (!state.settings) return;
    
    const updatedSettings: UserSettings = {
      ...state.settings,
      secondaryColor: color,
      updatedAt: Date.now(),
    };
    
    // Apply locally first
    set({ settings: updatedSettings });
    get().applyTheme();

    try {
      const settingsRef = doc(db, 'settings', state.settings.userId);
      await setDoc(settingsRef, updatedSettings, { merge: true });
      console.log('Secondary color saved to Firebase:', color);
    } catch (error) {
      console.error('Error persisting secondary color to Firebase:', error);
      showNotification('Failed to save theme color to Firebase. Changes saved locally.', 'error');
    }
  },
  
  applyTheme: () => {
    const state = get();
    if (!state.settings || typeof window === 'undefined') return;
    
    const primaryConfig = THEME_COLORS.find(
      (c) => c.value === state.settings!.primaryColor
    );
    const secondaryConfig = THEME_COLORS.find(
      (c) => c.value === state.settings!.secondaryColor
    );
    
    if (primaryConfig) {
      document.documentElement.style.setProperty('--primary', primaryConfig.primary);
    }
    
    if (secondaryConfig) {
      document.documentElement.style.setProperty('--secondary', secondaryConfig.secondary);
    }
  },
}));

