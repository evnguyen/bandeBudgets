'use client';

import { useSettingsStore } from '@/lib/stores/settings-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { THEME_COLORS } from '@/lib/theme-colors';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ThemeColor } from '@/lib/types';
import { Check } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ThemePreview } from '@/components/settings/theme-preview';

export default function SettingsPage() {
  const { settings, updatePrimaryColor, updateSecondaryColor } = useSettingsStore();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!settings) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">{'Loading settings...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">{'Settings'}</h1>
        <p className="text-muted-foreground">{'Customize your budget app experience'}</p>
      </div>

      <ThemePreview settings={settings} />

      <Card>
        <CardHeader>
          <CardTitle>{'Primary Color'}</CardTitle>
          <CardDescription>
            {'Choose the primary color for your budget app'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {THEME_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => updatePrimaryColor(color.value as ThemeColor)}
                className="group relative flex flex-col items-center gap-2 rounded-lg border-2 border-border p-4 transition-all hover:border-primary hover:shadow-md"
                style={{
                  borderColor:
                    settings.primaryColor === color.value
                      ? `hsl(${color.primary})`
                      : undefined,
                }}
              >
                <div
                  className="h-12 w-12 rounded-full transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `hsl(${color.primary})` }}
                >
                  {settings.primaryColor === color.value && (
                    <div className="flex h-full items-center justify-center">
                      <Check className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium">{color.name}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{'Secondary Color'}</CardTitle>
          <CardDescription>
            {'Choose the secondary accent color for your budget app'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {THEME_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => updateSecondaryColor(color.value as ThemeColor)}
                className="group relative flex flex-col items-center gap-2 rounded-lg border-2 border-border p-4 transition-all hover:border-primary hover:shadow-md"
                style={{
                  borderColor:
                    settings.secondaryColor === color.value
                      ? `hsl(${color.secondary})`
                      : undefined,
                }}
              >
                <div
                  className="h-12 w-12 rounded-full transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `hsl(${color.secondary})` }}
                >
                  {settings.secondaryColor === color.value && (
                    <div className="flex h-full items-center justify-center">
                      <Check className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium">{color.name}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{'Account'}</CardTitle>
          <CardDescription>{'Manage your account settings'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label className="text-base font-medium">{'Email'}</Label>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="destructive" className="w-full">
            {'Sign Out'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

