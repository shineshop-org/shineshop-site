'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/app/lib/store'
import { translations } from '@/app/lib/translations'
import { getLanguagePreference, setLanguagePreference } from '@/app/lib/cookies'

export function useTranslation() {
	const language = useStore((state) => state.language)
	const setLanguage = useStore((state) => state.setLanguage)
	const [mounted, setMounted] = useState(false)
	
	// Ensure language from cookie is used when component mounts
	useEffect(() => {
		setMounted(true)
		
		// On client-side, check for cookie and update store if needed
		const savedLang = getLanguagePreference()
		if (savedLang) {
			// Always apply the saved language preference
			if (savedLang !== language) {
				console.log(`Updating language from cookie: ${savedLang}`)
				setLanguage(savedLang)
			}
		} else {
			// If no saved preference, set it to Vietnamese
			if (language !== 'vi') {
				console.log('No language preference found, setting to Vietnamese')
				setLanguage('vi')
				setLanguagePreference('vi')
			}
		}
	}, [setLanguage, language])
	
	const t = (key: string): string => {
		if (translations[key]) {
			return translations[key][language]
		}
		return key
	}
	
	return { t, language }
} 