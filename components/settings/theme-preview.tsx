'use client';

import { UserSettings } from '@/lib/types';
import { THEME_COLORS } from '@/lib/theme-colors';
import { Card } from '@/components/ui/card';

export function ThemePreview({ settings }: { settings: UserSettings }) {
  const primaryColor = THEME_COLORS.find((c) => c.value === settings.primaryColor);
  const secondaryColor = THEME_COLORS.find((c) => c.value === settings.secondaryColor);

  if (!primaryColor || !secondaryColor) return null;

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold">{'Theme Preview'}</h3>
      <div className="space-y-4">
        {/* Primary Color Preview */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {'Primary Color'}
          </p>
          <div className="flex gap-3">
            <div
              className="h-16 w-24 rounded-lg shadow-sm border border-border"
              style={{ backgroundColor: `hsl(${primaryColor.primary})` }}
            />
            <div className="flex flex-col justify-center">
              <p className="font-medium">{primaryColor.name}</p>
              <p className="text-sm text-muted-foreground">{`hsl(${primaryColor.primary})`}</p>
            </div>
          </div>
        </div>

        {/* Secondary Color Preview */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {'Secondary Color'}
          </p>
          <div className="flex gap-3">
            <div
              className="h-16 w-24 rounded-lg shadow-sm border border-border"
              style={{ backgroundColor: `hsl(${secondaryColor.secondary})` }}
            />
            <div className="flex flex-col justify-center">
              <p className="font-medium">{secondaryColor.name}</p>
              <p className="text-sm text-muted-foreground">{`hsl(${secondaryColor.secondary})`}</p>
            </div>
          </div>
        </div>

        {/* Combined Preview */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {'Combined Preview'}
          </p>
          <div
            className="rounded-lg p-4 shadow-sm"
            style={{ backgroundColor: `hsl(${primaryColor.primary})` }}
          >
            <p className="font-semibold mb-2" style={{ color: 'white' }}>
              {'Main Section'}
            </p>
            <div
              className="rounded p-3"
              style={{ backgroundColor: `hsl(${secondaryColor.secondary})` }}
            >
              <p style={{ color: 'white' }}>{'Accent Area'}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
