'use client'

import React, { useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import { useStore } from '@/app/lib/store'
import { initialProducts, initialFAQArticles, initialSocialLinks, initialTOSContent } from '@/app/lib/initial-data'

export function Providers({ children }: { children: React.ReactNode }) {
	const { setProducts, setFaqArticles, setSocialLinks, setTosContent, products } = useStore()
	
	// Initialize data on first load
	useEffect(() => {
		if (products.length === 0) {
			setProducts(initialProducts)
			setFaqArticles(initialFAQArticles)
			setSocialLinks(initialSocialLinks)
			setTosContent(initialTOSContent)
		}
	}, [products.length, setProducts, setFaqArticles, setSocialLinks, setTosContent])
	
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="light"
			enableSystem={false}
			disableTransitionOnChange
		>
			{children}
		</ThemeProvider>
	)
} 