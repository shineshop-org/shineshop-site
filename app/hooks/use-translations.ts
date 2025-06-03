'use client'

import { useStore } from '@/app/lib/store'
import { translations } from '@/app/lib/translations'

export function useTranslation() {
	const language = useStore((state) => state.language)
	
	const t = (key: string): string => {
		if (translations[key]) {
			return translations[key][language]
		}
		return key
	}
	
	return { t, language }
} 