'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Tracks navigation events to prevent reload loops during page transitions
 */
export function NavigationTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Update the last navigation time whenever path or search params change
    try {
      const currentTime = Date.now().toString()
      sessionStorage.setItem('last-page-navigation', currentTime)
      console.log(`Navigation tracked: ${pathname}${searchParams ? '?' + searchParams.toString() : ''}`)
    } catch (err) {
      console.warn('Failed to update navigation timestamp:', err)
    }
  }, [pathname, searchParams])
  
  // No visible UI
  return null
} 