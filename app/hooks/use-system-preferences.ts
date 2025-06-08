'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/app/lib/store'
import { Language } from '@/app/lib/types'

export function useSystemPreferences() {
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

    // Detect system theme preference but respect user's selection if saved
    const detectTheme = () => {
      try {
        // Check if user has a saved theme preference
        const savedTheme = localStorage.getItem('theme-preference');
        
        // Only use system preference if no user preference exists
        if (!savedTheme) {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          setTheme(prefersDark ? 'dark' : 'light')
          
          // Set up listener for theme preference changes only if no saved preference
          const themeMedia = window.matchMedia('(prefers-color-scheme: dark)')
          const themeChangeHandler = (e: MediaQueryListEvent) => {
            // Only update if no saved preference exists
            if (!localStorage.getItem('theme-preference')) {
              setTheme(e.matches ? 'dark' : 'light')
            }
          }
          
          themeMedia.addEventListener('change', themeChangeHandler)
          return () => themeMedia.removeEventListener('change', themeChangeHandler)
        }
        
        return () => {};
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