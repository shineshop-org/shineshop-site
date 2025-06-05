'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, LockKeyhole } from 'lucide-react'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card'
import { useStore } from '@/app/lib/store'
import { useTranslation } from '@/app/hooks/use-translations'
import { ADMIN_CREDENTIALS, ADMIN_ACCESS_COOKIE } from '@/app/lib/auth'
import CryptoJS from 'crypto-js'

export default function AdminLogin() {
	const [username, setUsername] = useState<string>('')
	const [password, setPassword] = useState<string>('')
	const [error, setError] = useState<string>('')
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const router = useRouter()
	const { setAdminAuthenticated } = useStore()
	const { t } = useTranslation()
	
	// Kiểm tra môi trường
	const isDevelopment = process.env.NODE_ENV === 'development'
	
	useEffect(() => {
		// Trong môi trường development, tự động chuyển hướng đến dashboard
		// mà không cần xác thực
		if (isDevelopment) {
			// Thiết lập cookie giả lập để đánh dấu truy cập admin
			document.cookie = `${ADMIN_ACCESS_COOKIE.name}=dev-mode; path=/; max-age=86400;`
			
			// Chuyển hướng ngay đến dashboard
			setTimeout(() => {
				setAdminAuthenticated(true)
				router.push('/admin/dashboard')
			}, 500)
			return
		} else {
			// Trong môi trường production, chuyển hướng đến 404
			router.push('/404')
			return
		}
	}, [router, setAdminAuthenticated, isDevelopment])
	
	// Xử lý đăng nhập - chỉ giữ lại để tương thích với code cũ nhưng không còn được sử dụng
	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)
		setError('')
		
		try {
			// Auto-succeed trong development mode
			if (isDevelopment) {
				setAdminAuthenticated(true)
				router.push('/admin/dashboard')
				return
			}
			
			// Trong production, không cho phép đăng nhập
			throw new Error('Admin login disabled in production')
		} catch (error) {
			setError(t('invalidCredentials'))
			console.error('Login error:', error)
		} finally {
			setIsLoading(false)
		}
	}
	
	// Trong development mode, hiển thị giao diện đơn giản
	if (isDevelopment) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Shield className="h-5 w-5" />
							<span>{t('developmentMode')}</span>
						</CardTitle>
						<CardDescription>
							{t('redirectingToAdmin')}...
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		)
	}
	
	// Trong production, trang này không hiển thị (chuyển hướng đến 404)
	return null
} 