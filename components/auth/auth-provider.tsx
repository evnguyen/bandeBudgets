'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { useBudgetStore } from '@/lib/stores/budget-store';
import { useToast } from '@/hooks/use-toast';
import { setNotificationCallback } from '@/lib/notifications';
import { getMonthString } from '@/lib/dates';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const loadBudget = useBudgetStore((s) => s.loadBudget);
  const { toast } = useToast();

  useEffect(() => {
    setNotificationCallback((message, type) => {
      toast({
        description: message,
        variant: type === 'error' ? 'destructive' : 'default',
      });
    });
  }, [toast]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        await loadSettings(user.uid);
        await loadBudget(user.uid, getMonthString(new Date()));
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [setUser, setLoading, loadSettings, loadBudget]);

  return <>{children}</>;
};
