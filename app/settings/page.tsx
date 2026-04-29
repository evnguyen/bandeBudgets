'use client';

import { useSettingsStore } from '@/lib/stores/settings-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { THEME_COLORS } from '@/lib/theme-colors';
import { Button } from '@/components/ui/button';
import { ThemeColor } from '@/lib/types';
import { Check } from 'lucide-react';
import { ThemePreview } from '@/components/settings/theme-preview';

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-sm font-semibold">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { settings, updatePrimaryColor, updateSecondaryColor } = useSettingsStore();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!settings) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">{'Loading settings...'}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{'Settings'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {'Customize your budget app experience'}
          </p>
        </div>

        <ThemePreview settings={settings} />

        <SettingsSection
          title="Primary Color"
          description="Choose the primary accent color for your budget app"
        >
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {THEME_COLORS.map((color) => {
              const isSelected = settings.primaryColor === color.value;
              return (
                <button
                  key={color.value}
                  onClick={() => updatePrimaryColor(color.value as ThemeColor)}
                  className="group flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all hover:shadow-md"
                  style={{
                    borderColor: isSelected ? `hsl(${color.primary})` : 'hsl(var(--border))',
                  }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `hsl(${color.primary})` }}
                  >
                    {isSelected && <Check className="h-5 w-5 text-white" />}
                  </div>
                  <span className="text-xs font-medium">{color.name}</span>
                </button>
              );
            })}
          </div>
        </SettingsSection>

        <SettingsSection
          title="Secondary Color"
          description="Choose the secondary accent color for your budget app"
        >
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {THEME_COLORS.map((color) => {
              const isSelected = settings.secondaryColor === color.value;
              return (
                <button
                  key={color.value}
                  onClick={() => updateSecondaryColor(color.value as ThemeColor)}
                  className="group flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all hover:shadow-md"
                  style={{
                    borderColor: isSelected ? `hsl(${color.secondary})` : 'hsl(var(--border))',
                  }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `hsl(${color.secondary})` }}
                  >
                    {isSelected && <Check className="h-5 w-5 text-white" />}
                  </div>
                  <span className="text-xs font-medium">{color.name}</span>
                </button>
              );
            })}
          </div>
        </SettingsSection>

        <SettingsSection title="Account" description="Manage your account settings">
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {'Email'}
                </p>
                <p className="mt-0.5 text-sm font-medium">{user?.email}</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="destructive" className="w-full">
              {'Sign Out'}
            </Button>
          </div>
        </SettingsSection>
      </div>
    </main>
  );
}
