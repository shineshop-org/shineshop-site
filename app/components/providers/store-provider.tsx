'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/app/lib/store'

export function StoreProvider({ children }: { children: React.ReactNode }) {
	const { loadDataFromServer, isInitialized } = useStore()
	const [isLoading, setIsLoading] = useState(false)
	
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
			// Only reload data when tab becomes visible and it's been at least 10 seconds since last reload
			if (!document.hidden && !isLoading) {
				const now = Date.now()
				if (now - lastVisibilityChange > visibilityThrottle) {
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
	}, [loadDataFromServer, isInitialized, isLoading])
	
	return <>{children}</>
} 