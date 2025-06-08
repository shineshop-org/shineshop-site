'use client'

import { useSystemPreferences } from '@/app/hooks/use-system-preferences'

export function SystemPreferencesProvider() {
  // Use the hook to set theme and language based on system preferences
  useSystemPreferences()
  
  // This component doesn't render anything
  return null
} 