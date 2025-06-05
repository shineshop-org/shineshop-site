'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/app/lib/store'

/**
 * Hook to ensure admin changes are properly synchronized with client display
 * 
 * This hook should be used in layout components to ensure data consistency
 * between admin edits and client display.
 */
export function useSyncAdminChanges() {
  const { syncDataToServer, setProducts } = useStore()
  const [lastRefreshTime, setLastRefreshTime] = useState(0)
  
  useEffect(() => {
    // On initial load, make sure storage is synced
    syncDataToServer()
    
    // Check localStorage data on mount and reload if needed
    const checkStorageData = () => {
      try {
        const storageData = localStorage.getItem('shineshop-storage-v3')
        if (storageData) {
          const parsedData = JSON.parse(storageData)
          if (parsedData.products && Array.isArray(parsedData.products)) {
            // Force update products from localStorage
            setProducts(parsedData.products)
          }
        }
      } catch (error) {
        console.error('Error syncing from localStorage:', error)
      }
    }
    
    // Do initial check
    checkStorageData()
    
    // Set up event listener for storage changes from other tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === 'shineshop-storage-v3' || 
        event.key === 'shineshop-backup'
      ) {
        console.log('Storage change detected, syncing data')
        
        // Check if enough time has passed since last refresh (to prevent too frequent refreshes)
        const currentTime = Date.now()
        if (currentTime - lastRefreshTime > 1000) { // 1 second cooldown
          checkStorageData()
          setLastRefreshTime(currentTime)
        }
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Also set up periodic check (every 10 seconds)
    const intervalId = setInterval(checkStorageData, 10000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(intervalId)
    }
  }, [syncDataToServer, setProducts, lastRefreshTime])
  
  return null
} 