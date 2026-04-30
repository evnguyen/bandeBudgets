'use client'

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { useState } from 'react'
import { DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { auth } from '@/lib/firebase'
import { mapAuthError } from '@/lib/utils/auth-errors'

type AuthFunction = typeof signInWithEmailAndPassword

export const LoginForm = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const submit = async (authFn: AuthFunction, event: React.FormEvent) => {
		event.preventDefault()
		setError('')
		setLoading(true)
		try {
			await authFn(auth, email, password)
		} catch (authError) {
			setError(mapAuthError(authError))
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1 text-center">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
						<DollarSign className="h-6 w-6" />
					</div>
					<CardTitle className="text-2xl font-bold">Budget App</CardTitle>
					<CardDescription>Sign in to your account or create a new one</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="login" className="w-full">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="login">Login</TabsTrigger>
							<TabsTrigger value="signup">Sign Up</TabsTrigger>
						</TabsList>

						<TabsContent value="login">
							<form onSubmit={event => submit(signInWithEmailAndPassword, event)} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="login-email">Email</Label>
									<Input
										id="login-email"
										type="email"
										placeholder="you@example.com"
										value={email}
										onChange={event => setEmail(event.target.value)}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="login-password">Password</Label>
									<Input
										id="login-password"
										type="password"
										placeholder="Enter your password"
										value={password}
										onChange={event => setPassword(event.target.value)}
										required
									/>
								</div>
								{error && <p className="text-sm text-destructive">{error}</p>}
								<Button type="submit" className="w-full" disabled={loading}>
									{loading ? 'Signing in...' : 'Sign In'}
								</Button>
							</form>
						</TabsContent>

						<TabsContent value="signup">
							<form onSubmit={event => submit(createUserWithEmailAndPassword, event)} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="signup-email">Email</Label>
									<Input
										id="signup-email"
										type="email"
										placeholder="you@example.com"
										value={email}
										onChange={event => setEmail(event.target.value)}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="signup-password">Password</Label>
									<Input
										id="signup-password"
										type="password"
										placeholder="Create a password (min 6 characters)"
										value={password}
										onChange={event => setPassword(event.target.value)}
										required
										minLength={6}
									/>
								</div>
								{error && <p className="text-sm text-destructive">{error}</p>}
								<Button type="submit" className="w-full" disabled={loading}>
									{loading ? 'Creating account...' : 'Create Account'}
								</Button>
							</form>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	)
}
