'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import { useStore } from '@/app/lib/store'
import { useTranslation } from '@/app/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'

// Simple admin credentials (in production, use proper authentication)
const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'shineshop2024'

export default function AdminLoginPage() {
	const router = useRouter()
	const { isAdminAuthenticated, setAdminAuthenticated } = useStore()
	const { t } = useTranslation()
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	
	useEffect(() => {
		if (isAdminAuthenticated) {
			router.push('/admin/dashboard')
		}
	}, [isAdminAuthenticated, router])
	
	const handleLogin = (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		
		if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
			setAdminAuthenticated(true)
			router.push('/admin/dashboard')
		} else {
			setError('Invalid username or password')
		}
	}
	
	return (
		<div className="min-h-[80vh] flex items-center justify-center">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
						<Lock className="h-6 w-6 text-primary" />
					</div>
					<CardTitle className="text-2xl">{t('adminLogin')}</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleLogin} className="space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">{t('username')}</label>
							<Input
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder="Enter username"
								required
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">{t('password')}</label>
							<Input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Enter password"
								required
							/>
						</div>
						{error && (
							<p className="text-sm text-destructive">{error}</p>
						)}
						<Button type="submit" className="w-full">
							{t('login')}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	)
} 