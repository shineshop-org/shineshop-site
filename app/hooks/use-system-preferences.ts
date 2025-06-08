'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/app/lib/store'
import { Language } from '@/app/lib/types'

export function useSystemPreferences() {
  const { setTheme, setLanguage } = useStore()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (initialized) return

    // Detect system theme preference
    const detectTheme = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
      
      // Set up listener for theme preference changes
      const themeMedia = window.matchMedia('(prefers-color-scheme: dark)')
      const themeChangeHandler = (e: MediaQueryListEvent) => {
        setTheme(e.matches ? 'dark' : 'light')
      }
      
      themeMedia.addEventListener('change', themeChangeHandler)
      return () => themeMedia.removeEventListener('change', themeChangeHandler)
    }

    // Detect language based on location
    const detectLanguage = async (): Promise<Language> => {
      try {
        // Try to detect language based on navigator.language first
        if (typeof navigator !== 'undefined') {
          const browserLang = navigator.language.toLowerCase()
          if (browserLang.includes('vi')) {
            return 'vi'
          }
        }

        // Try to detect country from IP
        const response = await fetch('https://ipapi.co/json/')
        const data = await response.json()
        
        // Use Vietnamese for Vietnam, English for others
        return data.country_code === 'VN' ? 'vi' : 'en'
      } catch (error) {
        console.error('Error detecting user language:', error)
        return 'vi' // Default to Vietnamese
      }
    }

    const initialize = async () => {
      // Set up theme detection
      const cleanupTheme = detectTheme()
      
      // Set language based on location
      const detectedLanguage = await detectLanguage()
      setLanguage(detectedLanguage)
      
      setInitialized(true)
      
      return () => {
        cleanupTheme()
      }
    }

    initialize()
  }, [initialized, setTheme, setLanguage])

  return { initialized }
} 