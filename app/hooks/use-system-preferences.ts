'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/app/lib/store'
import { Language } from '@/app/lib/types'
import { useTheme } from 'next-themes'
import { getLanguagePreference, getThemePreference, setLanguagePreference, setThemePreference } from '../lib/cookies'

export function useSystemPreferences() {
  const { language, setLanguage } = useStore()
  const { theme, setTheme } = useTheme()
  const [initialized, setInitialized] = useState(false)

  // First useEffect only for mounting detection - runs on client only
  useEffect(() => {
    setInitialized(true)
  }, [])

  // Second useEffect for actual preferences setting - only runs after hydration
  useEffect(() => {
    if (!initialized) return

    const setupPreferences = async () => {
      try {
        // Check cookie preferences first
        const savedLanguage = getLanguagePreference()
        const savedTheme = getThemePreference()
        
        // Handle theme preferences
        if (savedTheme) {
          setTheme(savedTheme)
        }
        
        // Handle language preferences - ALWAYS respect saved preference
        if (savedLanguage) {
          // Only set language if there's a saved preference
          setLanguage(savedLanguage)
        } else {
          // Default to Vietnamese if no preference exists
          setLanguage('vi')
          // Store this default preference in cookies
          setLanguagePreference('vi')
        }
      } catch (error) {
        console.error('Error setting user preferences:', error)
      }
    }
    
    // Initial setup - always run this on first client render
    setupPreferences()
    
    // Set up handler for page visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // When page becomes visible again, ensure we're using saved preferences
        const savedLang = getLanguagePreference()
        if (savedLang) {
          setLanguage(savedLang)
        }
      }
    }
    
    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Set up cookie-saving when theme changes
    const handleThemeChange = (e: any) => {
      if (e?.detail?.theme && (e.detail.theme === 'dark' || e.detail.theme === 'light' || e.detail.theme === 'system')) {
        setThemePreference(e.detail.theme)
      }
    }
    
    document.addEventListener('themeChange', handleThemeChange)
    return () => {
      document.removeEventListener('themeChange', handleThemeChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [initialized, setTheme, setLanguage])

  return null
} 