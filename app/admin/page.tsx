'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Shield } from 'lucide-react'
import { useStore } from '@/app/lib/store'
import { useTranslation } from '@/app/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { ADMIN_CREDENTIALS, createAuthToken, setAuthCookie, getAuthCookie, verifySpecialToken, generateHeaderInjectionScript } from '@/app/lib/auth'

export default function AdminLoginPage() {
	const router = useRouter()
	const { isAdminAuthenticated, setAdminAuthenticated } = useStore()
	const { t } = useTranslation()
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [showAdvanced, setShowAdvanced] = useState(false)
	const [specialToken, setSpecialToken] = useState('')
	
	// Kiểm tra xác thực từ cookie khi trang tải lên
	useEffect(() => {
		const authCookie = getAuthCookie()
		if (authCookie) {
			const isValidToken = verifySpecialToken(authCookie)
			if (isValidToken) {
				setAdminAuthenticated(true)
			}
		}
	}, [setAdminAuthenticated])
	
	useEffect(() => {
		if (isAdminAuthenticated) {
			router.push('/admin/dashboard')
		}
	}, [isAdminAuthenticated, router])
	
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
	
	const handleSpecialAccess = (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		
		if (specialToken === ADMIN_CREDENTIALS.token) {
			// Thiết lập cookie và xác thực
			setAuthCookie(specialToken)
			setAdminAuthenticated(true)
			router.push('/admin/dashboard')
		} else {
			setError('Token không hợp lệ')
		}
	}
	
	const handleCopyScript = () => {
		navigator.clipboard.writeText(generateHeaderInjectionScript())
		alert('Đã sao chép script vào clipboard!')
	}
	
	return (
		<div className="min-h-[80vh] flex items-center justify-center">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
						<Lock className="h-6 w-6 text-primary" />
					</div>
					<CardTitle className="text-2xl">{t('adminLogin')}</CardTitle>
					<CardDescription>Đăng nhập để quản lý nội dung website</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="standard" className="mt-4">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="standard">Đăng nhập</TabsTrigger>
							<TabsTrigger value="advanced">Nâng cao</TabsTrigger>
						</TabsList>
						
						<TabsContent value="standard">
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
						</TabsContent>
						
						<TabsContent value="advanced">
							<div className="space-y-4 mt-4">
								<div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
									<div className="flex gap-2 items-start">
										<Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
										<div>
											<h3 className="font-medium text-yellow-800 text-sm">Truy cập nâng cao</h3>
											<p className="text-yellow-700 text-xs mt-1">
												Phần này dành cho quản trị viên có token đặc biệt hoặc cần truy cập thông qua script.
											</p>
										</div>
									</div>
								</div>
								
								<form onSubmit={handleSpecialAccess}>
									<div className="space-y-2">
										<label className="text-sm font-medium">Token đặc biệt</label>
										<Input
											type="text"
											value={specialToken}
											onChange={(e) => setSpecialToken(e.target.value)}
											placeholder="Nhập token xác thực đặc biệt"
										/>
									</div>
									{error && (
										<p className="text-sm text-destructive mt-2">{error}</p>
									)}
									<Button type="submit" className="w-full mt-4">
										Xác thực bằng token
									</Button>
								</form>
								
								<div className="border-t pt-4 mt-4">
									<h3 className="text-sm font-medium mb-2">Script truy cập</h3>
									<p className="text-xs text-gray-500 mb-2">
										Sao chép script để truy cập trang admin thông qua console trình duyệt
									</p>
									<Button variant="outline" size="sm" onClick={handleCopyScript} className="w-full">
										Sao chép script
									</Button>
								</div>
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	)
} 