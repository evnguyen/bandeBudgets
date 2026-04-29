import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';

import './globals.css';
import { SitePasswordGate } from '@/components/auth/site-password-gate';
import { AuthProvider } from '@/components/auth/auth-provider';
import { AuthGuard } from '@/components/auth/auth-guard';
import { ColorProvider } from '@/components/theme/color-provider';
import { Sidebar } from '@/components/layout/sidebar';
import { Toaster } from '@/components/ui/toaster';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  title: 'Budget App - Zero-Based Budgeting',
  description: 'Track your income and expenses with zero-based budgeting',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable}`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SitePasswordGate>
            <AuthProvider>
              <ColorProvider>
                <AuthGuard>
                  <div className="flex min-h-screen flex-col lg:flex-row">
                    <Sidebar />
                    {children}
                  </div>
                </AuthGuard>
              </ColorProvider>
            </AuthProvider>
          </SitePasswordGate>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
