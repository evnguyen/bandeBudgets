'use client';

import { UserSettings } from '@/lib/types';
import { THEME_COLORS } from '@/lib/theme-colors';

interface ThemePreviewProps {
  settings: UserSettings;
}

export const ThemePreview = ({ settings }: ThemePreviewProps) => {
  const primary = THEME_COLORS.find((c) => c.value === settings.primaryColor);
  const secondary = THEME_COLORS.find((c) => c.value === settings.secondaryColor);

  if (!primary || !secondary) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold">Theme Preview</h3>
      <div className="space-y-4">
        <ColorRow label="Primary" name={primary.name} hsl={primary.primary} />
        <ColorRow
          label="Secondary"
          name={secondary.name}
          hsl={secondary.secondary}
        />
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Combined Preview
          </p>
          <div
            className="rounded-lg p-4 shadow-sm"
            style={{ backgroundColor: `hsl(${primary.primary})` }}
          >
            <p className="mb-2 font-semibold text-white">Main Section</p>
            <div
              className="rounded p-3 text-white"
              style={{ backgroundColor: `hsl(${secondary.secondary})` }}
            >
              Accent Area
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ColorRowProps {
  label: string;
  name: string;
  hsl: string;
}

const ColorRow = ({ label, name, hsl }: ColorRowProps) => (
  <div>
    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {label} Color
    </p>
    <div className="flex gap-3">
      <div
        className="h-16 w-24 rounded-lg border border-border shadow-sm"
        style={{ backgroundColor: `hsl(${hsl})` }}
      />
      <div className="flex flex-col justify-center">
        <p className="font-medium">{name}</p>
        <p className="text-sm text-muted-foreground">hsl({hsl})</p>
      </div>
    </div>
  </div>
);
