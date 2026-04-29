'use client';

import { useAuthStore } from '@/lib/stores/auth-store';
import { LoginForm } from './login-form';
import { AppNav } from '@/components/layout/app-nav';
import { PageLoader } from '@/components/ui/page-loader';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  if (loading) return <PageLoader fullScreen />;
  if (!user) return <LoginForm />;

  return (
    <>
      <AppNav />
      {children}
    </>
  );
};
