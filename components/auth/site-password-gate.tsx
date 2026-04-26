import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';
import { ReturnUrlInput } from './return-url-input';

const ACCESS_COOKIE = 'siteAccessGranted';
const ERROR_COOKIE = 'siteAccessError';

export async function SitePasswordGate({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(ACCESS_COOKIE);

  if (accessCookie?.value === '1') {
    return <>{children}</>;
  }

  const errorCookie = cookieStore.get(ERROR_COOKIE);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">{'Site Access Required'}</CardTitle>
          <CardDescription>{'Enter the site password to continue'}</CardDescription>
        </CardHeader>
        <CardContent>
          <form method="post" action="/api/site-password" className="space-y-4">
            <ReturnUrlInput />
            <div className="space-y-2">
              <Label htmlFor="site-password">{'Password'}</Label>
              <Input
                id="site-password"
                name="password"
                type="password"
                placeholder="Enter site password"
                required
                autoFocus
              />
              {errorCookie && (
                <p className="text-sm text-destructive">{'Incorrect password. Please try again.'}</p>
              )}
            </div>
            <Button type="submit" className="w-full">
              {'Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
