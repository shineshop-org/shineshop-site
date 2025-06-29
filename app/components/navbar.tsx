'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { HelpCircle } from 'lucide-react'
import { useStore } from '@/app/lib/store'
import { Button } from '@/app/components/ui/button'
import { useTranslation } from '@/app/hooks/use-translations'
import { ThemeSwitch } from '@/app/components/theme-switch'
import { useTheme } from 'next-themes'
import { setLanguagePreference } from '@/app/lib/cookies'
import { MobileMenu } from '@/app/components/mobile-menu'

// Flag SVG Components
const VietnamFlag = () => (
	<svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect width="24" height="16" fill="#DA251D"/>
		<path d="M12 3L13.2 6.6H17L14 8.8L15.2 12.4L12 10.2L8.8 12.4L10 8.8L7 6.6H10.8L12 3Z" fill="#FFFF00"/>
	</svg>
)

const USFlag = () => (
	<svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect width="24" height="16" fill="#B22234"/>
		<rect y="1.23" width="24" height="1.23" fill="white"/>
		<rect y="3.69" width="24" height="1.23" fill="white"/>
		<rect y="6.15" width="24" height="1.23" fill="white"/>
		<rect y="8.62" width="24" height="1.23" fill="white"/>
		<rect y="11.08" width="24" height="1.23" fill="white"/>
		<rect y="13.54" width="24" height="1.23" fill="white"/>
		<rect width="9.6" height="8.62" fill="#3C3B6E"/>
	</svg>
)

export function Navbar() {
	const { language, setLanguage } = useStore()
	const { t } = useTranslation()
	const { theme, resolvedTheme } = useTheme()
	
	// Use state to track after initial client render
	const [mounted, setMounted] = useState(false)
	
	// Effect runs only on the client after hydration is complete
	useEffect(() => {
		setMounted(true)
	}, [])
	
	// Use the theme directly from next-themes, but only on the client after mounting
	const isDarkTheme = mounted ? resolvedTheme === 'dark' : false
	
	const toggleLanguage = () => {
		if (!mounted) return

		const newLanguage = language === 'en' ? 'vi' : 'en'
		
		// Save to cookie first
		try {
			setLanguagePreference(newLanguage)
			// Log for debugging
			console.log(`Language toggle: changed to ${newLanguage}, cookie set`)
		} catch (e) {
			console.error('Error setting language cookie:', e)
		}
		
		// Then update the store
		setLanguage(newLanguage)
	}
	
	// Custom navigation function to handle direct navigation
	const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
		e.preventDefault() // Prevent default link behavior
		window.location.href = path // Use direct navigation
	}
	
	// Render a language toggle placeholder during server rendering
	const renderLanguageToggle = () => {
		if (!mounted) {
			return (
				<Button
					variant="outline"
					size="sm"
					className="flex items-center gap-2 px-3 py-1.5 h-9 w-20 rounded-full border-2 hover:border-primary transition-all duration-200 hover:scale-105"
				>
					<div className="flex items-center gap-2 justify-center w-full">
						<div className="w-6 h-4" />
						<span className="font-medium">--</span>
					</div>
				</Button>
			);
		}
		
		return (
			<Button
				variant="outline"
				size="sm"
				onClick={toggleLanguage}
				className="flex items-center gap-2 px-3 py-1.5 h-9 w-20 rounded-full border-2 hover:border-primary transition-all duration-200 hover:scale-105"
			>
				<div className="flex items-center gap-2 justify-center w-full">
					{language === 'en' ? (
						<>
							<USFlag />
							<span className="font-medium">EN</span>
						</>
					) : (
						<>
							<VietnamFlag />
							<span className="font-medium">VN</span>
						</>
					)}
				</div>
			</Button>
		);
	};
	
	return (
		<nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200">
			<div className="container mx-auto px-4">
				<div className="flex h-16 items-center justify-between">
					{/* Logo */}
					<Link href="/store/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
						{/* Wide logo for large screens */}
						<div className="hidden lg:block relative h-10 w-32">
							{/* Preload both logos */}
							<link rel="preload" as="image" href="/logo-wide-dark-mode.png" />
							<link rel="preload" as="image" href="/logo-wide-light-mode.png" />
							
							{/* Use a container div with set dimensions and actual logos rendered only client-side */}
							<div suppressHydrationWarning className="w-32 h-10 relative">
								{mounted && (
									<>
										<img
											src="/logo-wide-light-mode.png"
											alt="Shine Shop"
											className={`absolute top-0 left-0 h-10 w-auto transition-opacity duration-300 ${isDarkTheme ? 'opacity-0' : 'opacity-100'}`}
											style={{ objectFit: 'contain' }}
										/>
										<img
											src="/logo-wide-dark-mode.png"
											alt="Shine Shop"
											className={`absolute top-0 left-0 h-10 w-auto transition-opacity duration-300 ${isDarkTheme ? 'opacity-100' : 'opacity-0'}`}
											style={{ objectFit: 'contain' }}
										/>
									</>
								)}
							</div>
						</div>
						
						{/* Square logo for small screens */}
						<div className="lg:hidden relative h-10 w-10">
							{/* Preload both logos */}
							<link rel="preload" as="image" href="/logo-dark-mode.png" />
							<link rel="preload" as="image" href="/logo-light-mode.png" />
							
							{/* Use a container div with set dimensions and actual logos rendered only client-side */}
							<div suppressHydrationWarning className="w-10 h-10 relative">
								{mounted && (
									<>
										<img
											src="/logo-light-mode.png"
											alt="Shine Shop"
											className={`absolute top-0 left-0 h-10 w-auto transition-opacity duration-300 ${isDarkTheme ? 'opacity-0' : 'opacity-100'}`}
											style={{ objectFit: 'contain' }}
										/>
										<img
											src="/logo-dark-mode.png"
											alt="Shine Shop"
											className={`absolute top-0 left-0 h-10 w-auto transition-opacity duration-300 ${isDarkTheme ? 'opacity-100' : 'opacity-0'}`}
											style={{ objectFit: 'contain' }}
										/>
									</>
								)}
							</div>
						</div>
						
						{/* Fallback text - display it until mounted for SSR */}
						{!mounted && <span className="text-lg font-bold">Shine Shop</span>}
					</Link>
					
					{/* Navigation items */}
					<div className="flex items-center space-x-4">
						{/* Mobile menu - visible only on small screens */}
						<div className="lg:hidden">
							<MobileMenu />
						</div>

						{/* Desktop navigation - hidden on small screens */}
						<div className="hidden lg:flex items-center space-x-4">
							{/* Language toggle - Enhanced with fixed width */}
							<div className="flex items-center">
								{renderLanguageToggle()}
							</div>
							
							{/* Payment */}
							<a href="/payment/" onClick={(e) => handleNavigation(e, '/payment/')}>
								<Button variant="ghost" size="sm" className="hover:bg-primary/10 dark:hover:bg-primary/20">
									{t('payment')}
								</Button>
							</a>
							
							{/* Contact */}
							<a href="/social/" onClick={(e) => handleNavigation(e, '/social/')}>
								<Button variant="ghost" size="sm" className="hover:bg-primary/10 dark:hover:bg-primary/20">
									{t('contact')}
								</Button>
							</a>
							
							{/* Tools */}
							<a href="/service/" onClick={(e) => handleNavigation(e, '/service/')}>
								<Button variant="ghost" size="sm" className="hover:bg-primary/10 dark:hover:bg-primary/20">
									{t('tools')}
								</Button>
							</a>
							
							{/* Theme toggle */}
							<ThemeSwitch />
							
							{/* FAQ */}
							<a href="/faq/" onClick={(e) => handleNavigation(e, '/faq/')}>
								<Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 dark:hover:bg-primary/20 hover:scale-110 transition-all duration-200">
									<HelpCircle className="h-5 w-5" />
									<span className="sr-only">FAQ</span>
								</Button>
							</a>
						</div>
					</div>
				</div>
			</div>
		</nav>
	)
} 