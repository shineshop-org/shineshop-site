'use client'

import { useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/app/hooks/use-translations'
import { FileWarning } from 'lucide-react'

// Inner component to be wrapped in Suspense
function NotFoundInner() {
	const { t } = useTranslation()

	useEffect(() => {
		// Check if the current path is a 2FA path
		if (typeof window !== 'undefined') {
			const path = window.location.pathname
			if (path.startsWith('/service/2fa/')) {
				// Extract the code from the URL
				const segments = path.split('/')
				const code = segments[segments.length - 1]
				
				if (code && code !== '2fa') {
					// For 2FA paths, redirect to the main page with the code
					// This preserves the code in the URL
					console.log('Redirecting with code:', code)
					window.location.replace(`/service/2fa/#${code}`)
				} else {
					window.location.replace('/service/2fa')
				}
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

export default function NotFound() {
	return (
		<Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center">Loading...</div>}>
			<NotFoundInner />
		</Suspense>
	)
} 