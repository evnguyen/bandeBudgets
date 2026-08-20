import { ThemeProvider } from 'next-themes'
import type { Metadata } from 'next'
import { Fraunces, Geist, Geist_Mono } from 'next/font/google'
import '@/app/globals.css'
import { AuthGuard } from '@/components/auth/auth-guard'
import { AuthProvider } from '@/components/auth/auth-provider'
import { SitePasswordGate } from '@/components/auth/site-password-gate'
import { Sidebar } from '@/components/layout/sidebar'
import { Toaster } from '@/components/ui/toaster'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' })

export const metadata: Metadata = {
	title: 'B&E Budgets ',
	description: 'Track your income and expenses with zero-based budgeting'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable} ${fraunces.variable}`}>
			<body className="font-sans antialiased">
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
					<SitePasswordGate>
						<AuthProvider>
							<AuthGuard>
								<div className="flex min-h-screen flex-col lg:flex-row">
									<Sidebar />
									{children}
								</div>
							</AuthGuard>
						</AuthProvider>
					</SitePasswordGate>
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	)
}
