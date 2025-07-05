'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/app/lib/store'
import { getLanguagePreference, setLanguagePreference } from '@/app/lib/cookies'

export function StoreProvider({ children }: { children: React.ReactNode }) {
	const { loadDataFromServer, isInitialized, language, setLanguage } = useStore()
	const [isLoading, setIsLoading] = useState(false)
	const [clientInitialized, setClientInitialized] = useState(false)
	
	// First effect for client-side initialization
	useEffect(() => {
		setClientInitialized(true)
		
		// Check for saved language preference and apply it, or default to Vietnamese
		const savedLang = getLanguagePreference()
		if (savedLang) {
			// console.log('StoreProvider: Applying saved language preference:', savedLang)
			setLanguage(savedLang)
		} else {
			// Default to Vietnamese if no preference is saved
			setLanguage('vi')
			setLanguagePreference('vi')
		}
	}, [setLanguage])
	
	// Second effect for data loading
	useEffect(() => {
		// Load data from server on mount, only if not already initialized
		if (!isInitialized && !isLoading) {
			setIsLoading(true)
			loadDataFromServer()
				.catch(error => {
					console.error('Error loading data from server:', error)
				})
				.finally(() => {
					setIsLoading(false)
				})
		}
		
		// Set up throttled visibility change handler
		let lastVisibilityChange = 0
		const visibilityThrottle = 10000 // 10 seconds
		
		const handleVisibilityChange = () => {
			// When page becomes visible again, check language preference
			if (!document.hidden) {
				const savedLang = getLanguagePreference()
				if (savedLang && savedLang !== language) {
					console.log('Visibility change: Applying saved language preference:', savedLang)
					setLanguage(savedLang)
				}
				
				// Only reload data when tab becomes visible and it's been at least 10 seconds since last reload
				const now = Date.now()
				if (!isLoading && now - lastVisibilityChange > visibilityThrottle) {
					lastVisibilityChange = now
					setIsLoading(true)
					loadDataFromServer()
						.catch(error => {
							console.error('Error loading data on visibility change:', error)
						})
						.finally(() => {
							setIsLoading(false)
						})
				}
			}
		}
		
		document.addEventListener('visibilitychange', handleVisibilityChange)
		
		// Cleanup
		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange)
		}
	}, [loadDataFromServer, isInitialized, isLoading, language, setLanguage])
	
	return <>{children}</>
} 