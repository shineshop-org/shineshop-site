'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/app/lib/store'

export function LanguageInitializer() {
  const { language, setLanguage } = useStore()
  const [isInitialized, setIsInitialized] = useState(false)
  
  useEffect(() => {
    // Update the HTML lang attribute when language changes
    document.documentElement.lang = language === 'vi' ? 'vi' : 'en'

    // Only run detection once, and only if not already detected by system preferences
    if (!isInitialized && typeof window !== 'undefined' && !sessionStorage.getItem('system-prefs-initialized')) {
      // Mark as initialized
      setIsInitialized(true);
      sessionStorage.setItem('language-initialized', 'true');
      
      // Try to detect language based on browser settings only
      const detectLanguage = () => {
        try {
          // Try to detect language based on navigator.language first
          if (typeof navigator !== 'undefined') {
            const browserLang = navigator.language.toLowerCase()
            if (browserLang.includes('vi')) {
              setLanguage('vi')
              return
            } else {
              setLanguage('en')
            }
          }
        } catch (error) {
          console.error('Error detecting user language:', error)
          // Default to Vietnamese on error
          setLanguage('vi')
        }
      }

      // Only run detection if not already done
      if (!sessionStorage.getItem('language-initialized')) {
        detectLanguage()
      }
    }
  }, [language, setLanguage, isInitialized])
  
  // This component doesn't render anything
  return null
} 