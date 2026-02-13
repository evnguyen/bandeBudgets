'use client';

import { useAuthStore } from '@/lib/stores/auth-store';
import { LoginForm } from './login-form';
import { AppNav } from '@/components/layout/app-nav';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">{'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <>
      <AppNav />
      {children}
    </>
  );
}
