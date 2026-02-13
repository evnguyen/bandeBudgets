'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';

// Site-wide password - replace with your own
const SITE_PASSWORD = process.env.NEXT_PUBLIC_SITE_PASSWORD || 'demo123';

export function SitePasswordGate({ children }: { children: React.ReactNode }) {
  const { siteAccessGranted, grantSiteAccess, checkSiteAccess } = useAuthStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user already has access
    const hasAccess = checkSiteAccess();
    setIsChecking(false);
  }, [checkSiteAccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password === SITE_PASSWORD) {
      grantSiteAccess();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">{'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!siteAccessGranted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">{'Site Access Required'}</CardTitle>
            <CardDescription>
              {'Enter the site password to continue'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-password">{'Password'}</Label>
                <Input
                  id="site-password"
                  type="password"
                  placeholder="Enter site password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={error ? 'border-destructive' : ''}
                  autoFocus
                />
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>
              <Button type="submit" className="w-full">
                {'Continue'}
              </Button>
            </form>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              {'For demo purposes, the password is: demo123'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
