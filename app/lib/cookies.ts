import { Dispatch, SetStateAction } from 'react'
import { Language } from './types'
import { setCookie as setNextCookie, getCookie as getNextCookie } from 'cookies-next'

// Cookie names
export const LANGUAGE_COOKIE = 'user-language-preference'
export const THEME_COOKIE = 'user-theme-preference'

// Cookie options - 1 year expiry to ensure long persistence
const COOKIE_OPTIONS = {
  maxAge: 365 * 24 * 60 * 60, // 1 year (in seconds)
  path: '/',
  sameSite: 'strict' as const, // For better security
  secure: process.env.NODE_ENV === 'production' // Use secure cookies in production
}

// Helper function to get the language preference from cookies
export function getLanguagePreference(): Language | null {
  try {
    if (typeof window === 'undefined') return null
    
    // First check cookies-next
    const cookieValue = getNextCookie(LANGUAGE_COOKIE) as string
    if (cookieValue === 'vi' || cookieValue === 'en') {
      return cookieValue as Language
    }
    
    // Fallback to document.cookie parsing
    const cookies = document.cookie.split('; ')
    for (const cookie of cookies) {
      const [name, value] = cookie.split('=')
      if (name === LANGUAGE_COOKIE) {
        if (value === 'vi' || value === 'en') {
          return value as Language
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('Error getting language preference from cookie:', error)
    return null
  }
}

// Helper function to set the language preference in cookies
export function setLanguagePreference(language: Language): void {
  try {
    if (typeof window === 'undefined') return
    
    // Using cookies-next library
    setNextCookie(LANGUAGE_COOKIE, language, COOKIE_OPTIONS)
    
    // Also set using native method as backup
    document.cookie = `${LANGUAGE_COOKIE}=${language}; max-age=${COOKIE_OPTIONS.maxAge}; path=${COOKIE_OPTIONS.path}; samesite=${COOKIE_OPTIONS.sameSite}${COOKIE_OPTIONS.secure ? '; secure' : ''}`
    
    // Also set in localStorage as an additional backup
    localStorage.setItem(LANGUAGE_COOKIE, language)
  } catch (error) {
    console.error('Error setting language preference cookie:', error)
  }
}

// Helper function to get the theme preference from cookies
export function getThemePreference(): 'dark' | 'light' | 'system' | null {
  try {
    if (typeof window === 'undefined') return null
    
    // First check cookies-next
    const cookieValue = getNextCookie(THEME_COOKIE) as string
    if (cookieValue === 'dark' || cookieValue === 'light' || cookieValue === 'system') {
      return cookieValue as 'dark' | 'light' | 'system'
    }
    
    // Fallback to document.cookie parsing
    const cookies = document.cookie.split('; ')
    for (const cookie of cookies) {
      const [name, value] = cookie.split('=')
      if (name === THEME_COOKIE) {
        if (value === 'dark' || value === 'light' || value === 'system') {
          return value as 'dark' | 'light' | 'system'
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('Error getting theme preference from cookie:', error)
    return null
  }
}

// Helper function to set the theme preference in cookies
export function setThemePreference(theme: 'dark' | 'light' | 'system'): void {
  try {
    if (typeof window === 'undefined') return
    
    // Using cookies-next library
    setNextCookie(THEME_COOKIE, theme, COOKIE_OPTIONS)
    
    // Also set using native method as backup
    document.cookie = `${THEME_COOKIE}=${theme}; max-age=${COOKIE_OPTIONS.maxAge}; path=${COOKIE_OPTIONS.path}; samesite=${COOKIE_OPTIONS.sameSite}${COOKIE_OPTIONS.secure ? '; secure' : ''}`
    
    // Also set in localStorage as an additional backup
    localStorage.setItem(THEME_COOKIE, theme)
  } catch (error) {
    console.error('Error setting theme preference cookie:', error)
  }
} 