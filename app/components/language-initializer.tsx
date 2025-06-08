'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/app/lib/store'

export function LanguageInitializer() {
  const { language, setLanguage } = useStore()
  const [isInitialized, setIsInitialized] = useState(false)
  
  useEffect(() => {
    // Update the HTML lang attribute when language changes
    document.documentElement.lang = language === 'vi' ? 'vi' : 'en'

    // Detect user's location for language if not already initialized
    if (!isInitialized) {
      // Try to detect language based on browser settings first
      const detectLanguage = async () => {
        try {
          // Try to detect language based on navigator.language first
          if (typeof navigator !== 'undefined') {
            const browserLang = navigator.language.toLowerCase()
            if (browserLang.includes('vi')) {
              setLanguage('vi')
              setIsInitialized(true)
              return
            }
          }

          // Try to detect country from IP
          const response = await fetch('https://ipapi.co/json/')
          const data = await response.json()
          
          // Use Vietnamese for Vietnam, English for others
          const detectedLanguage = data.country_code === 'VN' ? 'vi' : 'en'
          setLanguage(detectedLanguage)
          setIsInitialized(true)
        } catch (error) {
          console.error('Error detecting user language:', error)
          setIsInitialized(true)
        }
      }

      detectLanguage()
    }
  }, [language, setLanguage, isInitialized])
  
  // This component doesn't render anything
  return null
} 