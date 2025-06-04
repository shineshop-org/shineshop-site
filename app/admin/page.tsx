'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import { useStore } from '@/app/lib/store'
import { useTranslation } from '@/app/hooks/use-translations'
import { Card, CardContent, CardHeader } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'
import { ADMIN_CREDENTIALS, setAuthCookie, getAuthCookie, verifySpecialToken, ADMIN_ACCESS_COOKIE } from '@/app/lib/auth'
import CryptoJS from 'crypto-js'

export default function AdminLoginPage() {
	const router = useRouter()
	const { isAdminAuthenticated, setAdminAuthenticated } = useStore()
	const { t } = useTranslation()
	const [authCode, setAuthCode] = useState('')
	const [error, setError] = useState('')
	const [hasAccessCookie, setHasAccessCookie] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	
	// Admin 2FA Secret - Use this in any authenticator app (Google Authenticator, Authy, etc.)
	// In a real application, this would be stored securely and not exposed in client-side code
	const ADMIN_2FA_SECRET = "SHIADMIN2024"
	
	// Kiểm tra cookie đặc biệt khi trang tải lên
	useEffect(() => {
		// Kiểm tra xem có cookie truy cập đặc biệt không
		const cookies = document.cookie.split(';')
		const hasAccess = cookies.some(cookie => {
			const [name] = cookie.trim().split('=')
			return name === ADMIN_ACCESS_COOKIE.name
		})
		
		setHasAccessCookie(hasAccess)
		
		// Nếu không có cookie đặc biệt, trả về 404
		if (!hasAccess) {
			// Trì hoãn một chút để đảm bảo hiệu ứng loading trước khi chuyển hướng
			setTimeout(() => {
				window.location.href = '/404'
			}, 100)
			return
		}
		
		// Nếu có cookie đặc biệt, tiếp tục kiểm tra cookie xác thực
		const authCookie = getAuthCookie()
		if (authCookie) {
			const isValidToken = verifySpecialToken(authCookie)
			if (isValidToken) {
				setAdminAuthenticated(true)
			}
		}
		
		setIsLoading(false)
	}, [setAdminAuthenticated])
	
	useEffect(() => {
		if (isAdminAuthenticated && hasAccessCookie && !isLoading) {
			router.push('/admin/dashboard')
		}
	}, [isAdminAuthenticated, router, hasAccessCookie, isLoading])
	
	const handleLogin = (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		
		// Simplified verification for demonstration purposes
		// In a real application, you would use a proper TOTP library to validate the code
		const time = Math.floor(Date.now() / 1000 / 30)
		const expectedCode = Math.abs(time * ADMIN_2FA_SECRET.length * 123456 % 1000000).toString().padStart(6, '0')
		
		if (authCode === expectedCode) {
			// Thiết lập cookie và xác thực
			setAuthCookie(ADMIN_CREDENTIALS.token)
			setAdminAuthenticated(true)
			router.push('/admin/dashboard')
		} else {
			setError('Mã xác thực không đúng hoặc đã hết hạn')
		}
	}
	
	// Nếu đang loading hoặc không có cookie đặc biệt, không hiển thị gì
	if (isLoading || !hasAccessCookie) {
		return null
	}
	
	return (
		<div className="min-h-[80vh] flex items-center justify-center">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center pb-1">
					<div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
						<Lock className="h-6 w-6 text-primary" />
					</div>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleLogin} className="space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Mã xác thực</label>
							<Input
								type="text"
								inputMode="numeric"
								pattern="[0-9]{6}"
								maxLength={6}
								value={authCode}
								onChange={(e) => setAuthCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
								placeholder="Nhập mã 6 số"
								required
								className="text-center font-mono text-lg tracking-wider"
							/>
						</div>
						{error && (
							<p className="text-sm text-destructive text-center">{error}</p>
						)}
						<Button type="submit" className="w-full">
							{t('login')}
						</Button>
					</form>
				</CardContent>
			</Card>
			<div className="fixed bottom-4 right-4 text-xs text-muted-foreground">
				Secret Key: {ADMIN_2FA_SECRET}
			</div>
		</div>
	)
} 