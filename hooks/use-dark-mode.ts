'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export const useDarkMode = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';
  const toggle = () => setTheme(isDark ? 'light' : 'dark');

  return { isDark, toggle, mounted };
};
