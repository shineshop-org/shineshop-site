'use client'

import React, { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/app/components/ui/button'
import { useStore } from '@/app/lib/store'
import { setThemePreference } from '@/app/lib/cookies'

export function ThemeSwitch() {
	const { theme, setTheme } = useTheme()
	const storeSetTheme = useStore(state => state.setTheme)
	const [mounted, setMounted] = useState(false)
	
	// Mark component as mounted (client-side only)
	useEffect(() => {
		setMounted(true)
	}, [])
	
	// Sync next-themes with our store - only after component mounts
	useEffect(() => {
		if (!mounted) return
		
		if (theme === 'light' || theme === 'dark') {
			storeSetTheme(theme)
		}
	}, [theme, storeSetTheme, mounted])

	const toggleTheme = () => {
		if (!mounted) return
		
		const isDark = theme === 'dark'
		const newTheme = isDark ? 'light' : 'dark'
		
		// Add transition class to the html element
		document.documentElement.classList.add('theme-transition')
		
		// Save to cookie
		setThemePreference(newTheme)
		
		// Change theme immediately
		setTheme(newTheme)
		
		// Remove the transition class after animation completes
		setTimeout(() => {
			document.documentElement.classList.remove('theme-transition')
		}, 300)
	}

	// Show a placeholder during server rendering and hydration
	if (!mounted) {
		return (
			<Button
				variant="ghost"
				size="icon"
				className="rounded-full hover:bg-primary/10 dark:hover:bg-primary/20 hover:scale-110 transition-all duration-200"
			>
				<div className="h-5 w-5" />
				<span className="sr-only">Toggle theme</span>
			</Button>
		)
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggleTheme}
			className="rounded-full hover:bg-primary/10 dark:hover:bg-primary/20 hover:scale-110 transition-all duration-200"
		>
			<Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
			<Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
			<span className="sr-only">Toggle theme</span>
		</Button>
	)
} 