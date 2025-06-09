'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/app/lib/store'
import { Language } from '@/app/lib/types'
import { useTheme } from 'next-themes'

export function useSystemPreferences() {
  const { setLanguage } = useStore()
  const { setTheme: setNextTheme } = useTheme()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // If already initialized, don't run again
    if (initialized) return;

    // To prevent multiple initializations, set a session flag
    if (typeof window !== 'undefined' && sessionStorage.getItem('system-prefs-initialized')) {
      setInitialized(true);
      return;
    }

    // Detect language based on browser settings, don't use IP detection
    const detectLanguage = (): Language => {
      try {
        // Try to detect language based on navigator.language first
        if (typeof navigator !== 'undefined') {
          const browserLang = navigator.language.toLowerCase()
          if (browserLang.includes('vi')) {
            return 'vi'
          }
        }
        
        // Default to Vietnamese if detection fails
        return 'vi'
      } catch (error) {
        console.error('Error detecting user language:', error)
        return 'vi' // Default to Vietnamese
      }
    }

    const initialize = async () => {
      try {
        // Let next-themes handle the theme (it already supports system theme)
        // No need to manually detect theme here
        
        // Set language based on browser settings
        const detectedLanguage = detectLanguage()
        setLanguage(detectedLanguage)
        
        // Mark as initialized
        setInitialized(true)
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('system-prefs-initialized', 'true');
        }
      } catch (error) {
        console.error('Error initializing system preferences:', error);
        setInitialized(true);
      }
    }

    initialize()
  }, [initialized, setNextTheme, setLanguage])

  // This component doesn't render anything
  return null
} 