'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Moon, Sun, HelpCircle } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useStore } from '@/app/lib/store'
import { Button } from '@/app/components/ui/button'
import { useTranslation } from '@/app/hooks/use-translations'

export function Navbar() {
	const { theme, setTheme } = useTheme()
	const { language, setLanguage } = useStore()
	const { t } = useTranslation()
	
	const toggleTheme = () => {
		setTheme(theme === 'dark' ? 'light' : 'dark')
	}
	
	const toggleLanguage = () => {
		setLanguage(language === 'en' ? 'vi' : 'en')
	}
	
	return (
		<nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4">
				<div className="flex h-16 items-center justify-between">
					{/* Logo */}
					<Link href="/" className="flex items-center space-x-2">
						<div className="h-8 w-8 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" />
						<span className="text-lg font-bold">Shine Shop</span>
					</Link>
					
					{/* Navigation items */}
					<div className="flex items-center space-x-4">
						{/* Language toggle */}
						<Button
							variant="ghost"
							size="sm"
							onClick={toggleLanguage}
							className="hidden sm:flex"
						>
							<span className="text-lg">{language === 'en' ? '🇺🇸' : '🇻🇳'}</span>
							<span className="ml-2">{language === 'en' ? 'EN' : 'VN'}</span>
						</Button>
						
						{/* Payment */}
						<Link href="/payment">
							<Button variant="ghost" size="sm">
								{t('payment')}
							</Button>
						</Link>
						
						{/* Contact */}
						<Link href="/social">
							<Button variant="ghost" size="sm">
								{t('contact')}
							</Button>
						</Link>
						
						{/* Tools */}
						<Link href="/service">
							<Button variant="ghost" size="sm">
								{t('tools')}
							</Button>
						</Link>
						
						{/* Theme toggle */}
						<Button
							variant="ghost"
							size="icon"
							onClick={toggleTheme}
							className="rounded-full"
						>
							<Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
							<Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
							<span className="sr-only">Toggle theme</span>
						</Button>
						
						{/* FAQ */}
						<Link href="/faq">
							<Button variant="ghost" size="icon" className="rounded-full">
								<HelpCircle className="h-5 w-5" />
								<span className="sr-only">FAQ</span>
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</nav>
	)
} 