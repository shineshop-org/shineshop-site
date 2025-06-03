'use client'

import React, { useRef, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/app/components/ui/button'

export function ThemeSwitch() {
	const { theme, setTheme } = useTheme()
	const [isAnimating, setIsAnimating] = useState(false)
	const buttonRef = useRef<HTMLButtonElement>(null)

	const toggleTheme = () => {
		if (isAnimating) return

		const isDark = theme === 'dark'
		const newTheme = isDark ? 'light' : 'dark'
		
		// Get button position
		const button = buttonRef.current
		if (!button) return
		
		const rect = button.getBoundingClientRect()
		const x = rect.left + rect.width / 2
		const y = rect.top + rect.height / 2

		// Create transition overlay
		const overlay = document.createElement('div')
		overlay.className = `fixed inset-0 pointer-events-none z-[100]`
		overlay.style.cssText = `
			--x: ${x}px;
			--y: ${y}px;
		`

		// Create circle element
		const circle = document.createElement('div')
		circle.className = `absolute rounded-full ${isDark ? 'bg-white' : 'bg-black'}`
		circle.style.cssText = `
			left: var(--x);
			top: var(--y);
			width: 0;
			height: 0;
			transform: translate(-50%, -50%);
			transition: width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), 
						height 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		`

		overlay.appendChild(circle)
		document.body.appendChild(overlay)

		// Start animation
		setIsAnimating(true)

		// Trigger circle expansion
		requestAnimationFrame(() => {
			const maxDimension = Math.max(window.innerWidth, window.innerHeight) * 2
			circle.style.width = `${maxDimension}px`
			circle.style.height = `${maxDimension}px`
		})

		// Change theme at midpoint
		setTimeout(() => {
			setTheme(newTheme)
		}, 300)

		// Clean up after animation
		setTimeout(() => {
			overlay.remove()
			setIsAnimating(false)
		}, 600)
	}

	return (
		<Button
			ref={buttonRef}
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