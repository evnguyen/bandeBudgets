'use client';

import { useSettingsStore } from '@/lib/stores/settings-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { THEME_COLORS } from '@/lib/theme-colors';
import { Button } from '@/components/ui/button';
import { ThemeColor } from '@/lib/types';
import { Check } from 'lucide-react';
import { ThemePreview } from '@/components/settings/theme-preview';
import { PageLoader } from '@/components/ui/page-loader';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const SettingsSection = ({ title, description, children }: SettingsSectionProps) => (
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

interface ColorPickerProps {
  selected: ThemeColor;
  onSelect: (color: ThemeColor) => void;
  variant: 'primary' | 'secondary';
}

const ColorPicker = ({ selected, onSelect, variant }: ColorPickerProps) => (
  <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
    {THEME_COLORS.map((color) => {
      const hsl = variant === 'primary' ? color.primary : color.secondary;
      const isSelected = selected === color.value;
      return (
        <button
          key={color.value}
          type="button"
          onClick={() => onSelect(color.value)}
          aria-label={`Select ${color.name}`}
          aria-pressed={isSelected}
          className="group flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{
            borderColor: isSelected ? `hsl(${hsl})` : 'hsl(var(--border))',
          }}
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full transition-transform group-hover:scale-110"
            style={{ backgroundColor: `hsl(${hsl})` }}
          >
            {isSelected && <Check className="h-5 w-5 text-white" />}
          </div>
          <span className="text-xs font-medium">{color.name}</span>
        </button>
      );
    })}
  </div>
);

export default function SettingsPage() {
  const settings = useSettingsStore((s) => s.settings);
  const updatePrimaryColor = useSettingsStore((s) => s.updatePrimaryColor);
  const updateSecondaryColor = useSettingsStore((s) => s.updateSecondaryColor);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!settings) return <PageLoader label="Loading settings..." />;

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Customize your budget app experience
          </p>
        </div>

        <ThemePreview settings={settings} />

        <SettingsSection
          title="Primary Color"
          description="Choose the primary accent color for your budget app"
        >
          <ColorPicker
            selected={settings.primaryColor}
            onSelect={updatePrimaryColor}
            variant="primary"
          />
        </SettingsSection>

        <SettingsSection
          title="Secondary Color"
          description="Choose the secondary accent color for your budget app"
        >
          <ColorPicker
            selected={settings.secondaryColor}
            onSelect={updateSecondaryColor}
            variant="secondary"
          />
        </SettingsSection>

        <SettingsSection title="Account" description="Manage your account settings">
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email
                </p>
                <p className="mt-0.5 text-sm font-medium">{user?.email}</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="destructive" className="w-full">
              Sign Out
            </Button>
          </div>
        </SettingsSection>
      </div>
    </main>
  );
}
