'use client'

import { useEffect } from 'react'
import { useStore } from '@/app/lib/store'

export function LanguageInitializer() {
  const { language } = useStore()
  
  useEffect(() => {
    // Update the HTML lang attribute when language changes
    document.documentElement.lang = language === 'vi' ? 'vi' : 'en'
  }, [language])
  
  // This component doesn't render anything
  return null
} 