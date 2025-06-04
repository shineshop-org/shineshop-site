'use client'

import React, { useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import { useStore } from '@/app/lib/store'
import { initialProducts, initialFAQArticles, initialSocialLinks, initialTOSContent } from '@/app/lib/initial-data'

export function Providers({ children }: { children: React.ReactNode }) {
	const { setProducts, setFaqArticles, setSocialLinks, setTosContent, products, language, setLanguage, theme } = useStore()
	
	// Initialize data on first load
	useEffect(() => {
		if (products.length === 0) {
			setProducts(initialProducts)
			setFaqArticles(initialFAQArticles)
			setSocialLinks(initialSocialLinks)
			setTosContent(initialTOSContent)
		}
		
		// Check if language was previously stored (if not in SSR)
		if (typeof window !== 'undefined') {
			try {
				const storedData = localStorage.getItem('shineshop-storage-v3')
				if (storedData) {
					const parsedData = JSON.parse(storedData)
					if (parsedData.language && parsedData.language !== language) {
						setLanguage(parsedData.language)
					}
				}
			} catch (error) {
				console.error('Failed to load language preference:', error)
			}
		}
	}, [products.length, setProducts, setFaqArticles, setSocialLinks, setTosContent, language, setLanguage])
	
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme={theme}
			enableSystem={false}
			storageKey="shineshop-theme"
		>
			{children}
		</ThemeProvider>
	)
} 