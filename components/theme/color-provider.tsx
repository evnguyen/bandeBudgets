'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { THEME_COLORS } from '@/lib/theme-colors';

export const ColorProvider = ({ children }: { children: React.ReactNode }) => {
  const settings = useSettingsStore((s) => s.settings);

  useEffect(() => {
    if (!settings) return;
    const primary = THEME_COLORS.find((c) => c.value === settings.primaryColor);
    const secondary = THEME_COLORS.find((c) => c.value === settings.secondaryColor);
    if (primary) {
      document.documentElement.style.setProperty('--primary', primary.primary);
    }
    if (secondary) {
      document.documentElement.style.setProperty('--secondary', secondary.secondary);
    }
  }, [settings]);

  return <>{children}</>;
};
