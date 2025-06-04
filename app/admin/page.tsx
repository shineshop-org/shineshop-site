'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import { useStore } from '@/app/lib/store'
import { useTranslation } from '@/app/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'
import { ADMIN_CREDENTIALS, createAuthToken, setAuthCookie, getAuthCookie, verifySpecialToken, ADMIN_ACCESS_COOKIE } from '@/app/lib/auth'

export default function AdminLoginPage() {
	const router = useRouter()
	const { isAdminAuthenticated, setAdminAuthenticated } = useStore()
	const { t } = useTranslation()
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [hasAccessCookie, setHasAccessCookie] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	
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
		
		if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
			// Tạo token và thiết lập cookie
			const token = createAuthToken(username)
			setAuthCookie(ADMIN_CREDENTIALS.token)
			setAdminAuthenticated(true)
			router.push('/admin/dashboard')
		} else {
			setError('Tên đăng nhập hoặc mật khẩu không đúng')
		}
	}
	
	// Nếu đang loading hoặc không có cookie đặc biệt, không hiển thị gì
	if (isLoading || !hasAccessCookie) {
		return null
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
					<form onSubmit={handleLogin} className="space-y-4 mt-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">{t('username')}</label>
							<Input
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder="Nhập tên đăng nhập"
								required
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">{t('password')}</label>
							<Input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Nhập mật khẩu"
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