'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { useBudgetStore } from '@/lib/stores/budget-store';
import { useToast } from '@/hooks/use-toast';
import { setNotificationCallback } from '@/lib/notifications';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();
  const { loadSettings } = useSettingsStore();
  const { loadBudget } = useBudgetStore();
  const { toast } = useToast();

  // Setup notification callback for Zustand stores
  useEffect(() => {
    setNotificationCallback((message: string, type: 'error' | 'success') => {
      toast({
        description: message,
        variant: type === 'error' ? 'destructive' : 'default',
      });
    });
  }, [toast]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        // Load user settings and current month budget
        await loadSettings(user.uid);
        await loadBudget(user.uid, currentMonth);
      }
    });

    return () => unsubscribe();
  }, [setUser, setLoading, loadSettings, loadBudget]);

  return <>{children}</>;
}
