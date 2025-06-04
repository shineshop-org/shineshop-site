'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/app/hooks/use-translations'
import { FileWarning } from 'lucide-react'

export default function NotFound() {
	const { t } = useTranslation()

	useEffect(() => {
		// Check if the current path is a 2FA path
		if (typeof window !== 'undefined') {
			const path = window.location.pathname
			if (path.startsWith('/service/2fa/')) {
				// For 2FA paths, redirect to the main page
				// The client-side code in the 2FA page will handle the code parameter
				window.location.href = '/service/2fa'
			}
		}
	}, [])

	return (
		<div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
			<FileWarning className="h-16 w-16 text-muted-foreground mb-4" />
			<h1 className="text-3xl font-bold">{t('pageNotFound')}</h1>
			<p className="text-muted-foreground mt-2 mb-6">
				{t('pageNotFoundDesc')}
			</p>
			<Link
				href="/"
				className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
			>
				{t('returnHome')}
			</Link>
		</div>
	)
} 