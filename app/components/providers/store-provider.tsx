'use client'

import { useEffect } from 'react'
import { useStore } from '@/app/lib/store'

export function StoreProvider({ children }: { children: React.ReactNode }) {
	const { loadDataFromServer, isInitialized } = useStore()
	
	useEffect(() => {
		// Load data from server on mount
		if (!isInitialized) {
			loadDataFromServer()
		}
		
		// Set up interval to periodically sync with server (every 30 seconds)
		const interval = setInterval(() => {
			// Reload data from server to get updates from other sessions
			loadDataFromServer()
		}, 30000)
		
		// Handle visibility change - reload when tab becomes visible
		const handleVisibilityChange = () => {
			if (!document.hidden) {
				loadDataFromServer()
			}
		}
		
		document.addEventListener('visibilitychange', handleVisibilityChange)
		
		// Cleanup
		return () => {
			clearInterval(interval)
			document.removeEventListener('visibilitychange', handleVisibilityChange)
		}
	}, [loadDataFromServer, isInitialized])
	
	return <>{children}</>
} 