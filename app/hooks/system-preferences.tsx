'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/app/lib/store'
import { Language } from '@/app/lib/types'

export function SystemPreferencesProvider() {
  const { setTheme, setLanguage } = useStore()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // If already initialized, don't run again
    if (initialized) return;

    // To prevent multiple initializations, set a session flag
    if (typeof window !== 'undefined' && sessionStorage.getItem('system-prefs-initialized')) {
      setInitialized(true);
      return;
    }

    // Detect system theme preference
    const detectTheme = () => {
      try {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setTheme(prefersDark ? 'dark' : 'light')
        
        // Set up listener for theme preference changes
        const themeMedia = window.matchMedia('(prefers-color-scheme: dark)')
        const themeChangeHandler = (e: MediaQueryListEvent) => {
          setTheme(e.matches ? 'dark' : 'light')
        }
        
        themeMedia.addEventListener('change', themeChangeHandler)
        return () => themeMedia.removeEventListener('change', themeChangeHandler)
      } catch (error) {
        console.error('Error detecting theme preference:', error);
        return () => {};
      }
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
        // Set up theme detection
        const cleanupTheme = detectTheme()
        
        // Set language based on browser settings
        const detectedLanguage = detectLanguage()
        setLanguage(detectedLanguage)
        
        // Mark as initialized
        setInitialized(true)
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('system-prefs-initialized', 'true');
        }
        
        return () => {
          cleanupTheme()
        }
      } catch (error) {
        console.error('Error initializing system preferences:', error);
        setInitialized(true);
      }
    }

    initialize()
  }, [initialized, setTheme, setLanguage])

  // This component doesn't render anything
  return null
} 