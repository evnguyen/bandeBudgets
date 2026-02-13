import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'
import { SitePasswordGate } from '@/components/auth/site-password-gate'
import { AuthProvider } from '@/components/auth/auth-provider'
import { AuthGuard } from '@/components/auth/auth-guard'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { Sidebar } from '@/components/layout/sidebar'
import { Toaster } from '@/components/ui/toaster'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'Budget App - Zero-Based Budgeting',
  description: 'Track your income and expenses with zero-based budgeting',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <SitePasswordGate>
          <AuthProvider>
            <ThemeProvider>
              <AuthGuard>
                <div className="flex min-h-screen">
                  <Sidebar />
                  {children}
                </div>
              </AuthGuard>
            </ThemeProvider>
          </AuthProvider>
        </SitePasswordGate>
        <Toaster />
      </body>
    </html>
  )
}
