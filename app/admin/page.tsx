'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/app/lib/store'
import { ADMIN_ACCESS_COOKIE } from '@/app/lib/auth'

export default function AdminLogin() {
	const router = useRouter()
	const { setAdminAuthenticated } = useStore()
	
	// Kiểm tra môi trường
	const isDevelopment = process.env.NODE_ENV === 'development'
	
	useEffect(() => {
		// Trong môi trường development, chuyển hướng đến dashboard
		if (isDevelopment) {
			// Tự động xác thực và chuyển hướng đến dashboard
			setAdminAuthenticated(true)
			router.push('/admin/dashboard')
		} else {
			// Trong môi trường production, chuyển hướng đến 404
			router.push('/404')
		}
	}, [router, setAdminAuthenticated, isDevelopment])
	
	// Trang này chỉ hiển thị trong quá trình chuyển hướng
	return null
} 