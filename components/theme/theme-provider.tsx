'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { THEME_COLORS } from '@/lib/theme-colors';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettingsStore();

  useEffect(() => {
    if (!settings) return;

    const primaryColor = THEME_COLORS.find((c) => c.value === settings.primaryColor);
    const secondaryColor = THEME_COLORS.find((c) => c.value === settings.secondaryColor);

    if (primaryColor) {
      document.documentElement.style.setProperty('--primary', primaryColor.primary);
    }

    if (secondaryColor) {
      document.documentElement.style.setProperty('--secondary', secondaryColor.secondary);
    }
  }, [settings]);

  return <>{children}</>;
}
