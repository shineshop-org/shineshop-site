'use client'

import React, { useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import { useStore } from '@/app/lib/store'
import { initialProducts, initialFAQArticles, initialSocialLinks, initialTOSContent } from '@/app/lib/initial-data'
import { useSyncAdminChanges } from '@/app/hooks/use-sync-admin-changes'
import { useSyncStoreData } from '@/app/hooks/use-sync-store-data'

export function Providers({ children }: { children: React.ReactNode }) {
	const { setProducts, setFaqArticles, setSocialLinks, setTosContent, products, language, setLanguage, theme } = useStore()
	
	// Ensure admin changes are synchronized
	useSyncAdminChanges()
	
	// Ensure consistency between initial data and store
	useSyncStoreData()
	
	// Initialize data on first load
	useEffect(() => {
		// Check localStorage first before using initial data
		if (typeof window !== 'undefined') {
			try {
				const storedData = localStorage.getItem('shineshop-storage-v3')
				if (storedData) {
					const parsedData = JSON.parse(storedData)
					
					// Prioritize localStorage data over initialProducts
					if (parsedData.products && Array.isArray(parsedData.products) && parsedData.products.length > 0) {
						setProducts(parsedData.products)
					} else if (products.length === 0) {
						setProducts(initialProducts)
					}
					
					// Set other data from localStorage if available
					if (parsedData.faqArticles && Array.isArray(parsedData.faqArticles) && parsedData.faqArticles.length > 0) {
						setFaqArticles(parsedData.faqArticles)
					} else {
						setFaqArticles(initialFAQArticles)
					}
					
					if (parsedData.socialLinks && Array.isArray(parsedData.socialLinks) && parsedData.socialLinks.length > 0) {
						setSocialLinks(parsedData.socialLinks)
					} else {
						setSocialLinks(initialSocialLinks)
					}
					
					if (parsedData.tosContent) {
						setTosContent(parsedData.tosContent)
					} else {
						setTosContent(initialTOSContent)
					}
					
					// Set language preference
					if (parsedData.language && parsedData.language !== language) {
						setLanguage(parsedData.language)
					}
				} else {
					// No localStorage data found, use initial data
					if (products.length === 0) {
						setProducts(initialProducts)
						setFaqArticles(initialFAQArticles)
						setSocialLinks(initialSocialLinks)
						setTosContent(initialTOSContent)
					}
				}
			} catch (error) {
				console.error('Failed to load data from localStorage:', error)
				// Fallback to initial data if localStorage fails
				if (products.length === 0) {
					setProducts(initialProducts)
					setFaqArticles(initialFAQArticles)
					setSocialLinks(initialSocialLinks)
					setTosContent(initialTOSContent)
				}
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