'use client'

import { useEffect } from 'react'
import { useStore } from '@/app/lib/store'

/**
 * Hook to ensure admin changes are properly synchronized with client display
 * 
 * This hook should be used in layout components to ensure data consistency
 * between admin edits and client display.
 */
export function useSyncAdminChanges() {
  const { syncDataToServer } = useStore()
  
  useEffect(() => {
    // On initial load, make sure storage is synced
    syncDataToServer()
    
    // Set up event listener for storage changes from other tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === 'shineshop-storage-v3' || 
        event.key === 'shineshop-backup'
      ) {
        // When storage changes in other tabs, sync local state
        window.location.reload()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [syncDataToServer])
  
  return null
} 