'use client'

import React, { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/app/components/ui/button'
import { useStore } from '@/app/lib/store'

export function ThemeSwitch() {
	const { theme, setTheme } = useTheme()
	const storeSetTheme = useStore(state => state.setTheme)
	const [isAnimating, setIsAnimating] = useState(false)
	
	// Sync next-themes with our store
	useEffect(() => {
		if (theme === 'light' || theme === 'dark') {
			storeSetTheme(theme)
		}
	}, [theme, storeSetTheme])

	const toggleTheme = () => {
		if (isAnimating) return
		
		const isDark = theme === 'dark'
		const newTheme = isDark ? 'light' : 'dark'
		
		// Start animation
		setIsAnimating(true)
		
		// Add transition class to the html element
		document.documentElement.classList.add('theme-transition')
		
		// Change theme after a small delay to allow animation to start
		setTimeout(() => {
			setTheme(newTheme)
			
			// Remove the transition class after the animation completes
			setTimeout(() => {
				document.documentElement.classList.remove('theme-transition')
				setIsAnimating(false)
			}, 1000)
		}, 50)
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggleTheme}
			className="rounded-full hover:bg-primary/10 dark:hover:bg-primary/20 hover:scale-110 transition-all duration-200"
			disabled={isAnimating}
		>
			<Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
			<Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
			<span className="sr-only">Toggle theme</span>
		</Button>
	)
} 