'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Shield, Copy, Check } from 'lucide-react'
import { useTranslation } from '@/app/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'
import * as OTPAuth from 'otpauth'

export default function TwoFactorAuthPage() {
	const { t } = useTranslation()
	const [secret, setSecret] = useState('')
	const [totpCode, setTotpCode] = useState('')
	const [timeRemaining, setTimeRemaining] = useState(30)
	const [copied, setCopied] = useState(false)
	const [error, setError] = useState('')
	const initialLoadRef = useRef(true)
	
	// Format input to uppercase and remove spaces
	const formatInput = (input: string) => {
		return input.toUpperCase().replace(/\s+/g, '')
	}

	// Validate if the secret is a valid Base32 string
	const isValidBase32 = (input: string) => {
		// Base32 characters only include A-Z and 2-7
		const base32Regex = /^[A-Z2-7]+$/
		return base32Regex.test(input)
	}

	// Generate TOTP code using standard RFC 6238 implementation
	const generateTOTP = (secret: string) => {
		try {
			if (!isValidBase32(secret)) {
				setError('Invalid secret key format')
				return ''
			}
			
			// Create TOTP object with standard parameters
			const totp = new OTPAuth.TOTP({
				issuer: 'ShineShop',
				label: 'TOTP',
				algorithm: 'SHA1',
				digits: 6,
				period: 30,
				secret: OTPAuth.Secret.fromBase32(secret)
			})
			
			// Generate token
			return totp.generate()
		} catch (error) {
			console.error('Error generating TOTP:', error)
			setError('Error generating TOTP code')
			return ''
		}
	}

	// Extract secret from URL path or hash
	const extractSecretFromUrl = () => {
		// Only run in browser
		if (typeof window !== 'undefined') {
			try {
				// First, check for hash fragment (used in redirects from 404 page)
				const hash = window.location.hash
				if (hash && hash.length > 1) {
					const hashCode = hash.substring(1) // Remove the # character
					if (hashCode) {
						console.log('Found code in hash:', hashCode)
						const formatted = formatInput(decodeURIComponent(hashCode))
						// Validate the extracted secret
						if (isValidBase32(formatted)) {
							return formatted
						} else {
							setError('Invalid secret key format in URL')
							return ''
						}
					}
				}
				
				// Next, check the URL path
				const path = window.location.pathname
				
				// Check if we're on the 2FA page with a code in the path
				if (path.includes('/service/2fa/')) {
					// Extract everything after the last slash
					const segments = path.split('/')
					const lastSegment = segments[segments.length - 1]
					
					// Return formatted secret
					if (lastSegment && lastSegment !== '2fa') {
						console.log('Found code in URL path:', lastSegment)
						const formatted = formatInput(decodeURIComponent(lastSegment))
						// Validate the extracted secret
						if (isValidBase32(formatted)) {
							return formatted
						} else {
							setError('Invalid secret key format in URL')
							return ''
						}
					}
				}
			} catch (e) {
				console.error('Error extracting secret from URL:', e)
				setError('Error extracting secret from URL')
			}
		}
		return ''
	}

	// Set initial secret from URL path or hash if available
	useEffect(() => {
		const urlSecret = extractSecretFromUrl()
		console.log('URL Secret extracted:', urlSecret)
		
		if (urlSecret) {
			setSecret(urlSecret)
			initialLoadRef.current = false
			
			// Remove hash if present to clean up the URL
			if (window.location.hash && typeof window.history.replaceState === 'function') {
				const newUrl = `/service/2fa/${encodeURIComponent(urlSecret)}`
				window.history.replaceState({ path: newUrl }, '', newUrl)
			}
		}
	}, [])
	
	// Update URL only when secret is manually changed
	useEffect(() => {
		// Skip the first render if secret was loaded from URL
		if (initialLoadRef.current && secret) {
			initialLoadRef.current = false
			return
		}
		
		if (typeof window !== 'undefined') {
			try {
				if (secret) {
					const newUrl = `/service/2fa/${encodeURIComponent(secret)}`
					// Use history API to update URL without navigation
					window.history.replaceState({ path: newUrl }, '', newUrl)
				} else {
					// Only reset to base path if secret was explicitly cleared
					const currentPath = window.location.pathname
					if (currentPath !== '/service/2fa' && currentPath !== '/service/2fa/') {
						window.history.replaceState({ path: '/service/2fa' }, '', '/service/2fa')
					}
				}
			} catch (e) {
				console.error('Error updating URL:', e)
			}
		}
	}, [secret])

	// Update TOTP code periodically
	useEffect(() => {
		if (secret && isValidBase32(secret)) {
			// Generate initial code
			const code = generateTOTP(secret)
			if (code) setTotpCode(code)
			
			// Update code every second
			const interval = setInterval(() => {
				const code = generateTOTP(secret)
				if (code) setTotpCode(code)
			}, 1000)
			
			return () => clearInterval(interval)
		} else {
			setTotpCode('')
		}
	}, [secret])
	
	// Update countdown timer
	useEffect(() => {
		const timer = setInterval(() => {
			const seconds = 30 - (Math.floor(Date.now() / 1000) % 30)
			setTimeRemaining(seconds)
		}, 1000)
		
		return () => clearInterval(timer)
	}, [])
	
	const handleCopy = async () => {
		if (totpCode) {
			try {
				await navigator.clipboard.writeText(totpCode)
				setCopied(true)
				setTimeout(() => setCopied(false), 2000)
			} catch (err) {
				console.error('Failed to copy:', err)
			}
		}
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = formatInput(e.target.value)
		setSecret(value)
		
		// Reset error when input changes
		if (error) setError('')
		
		// Validate input is proper Base32
		if (value && !isValidBase32(value)) {
			setError('Invalid secret key format. Use only A-Z and 2-7 characters.')
		}
	}
	
	return (
		<div className="max-w-2xl mx-auto py-8">
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Shield className="h-6 w-6 text-green-500" />
						<CardTitle>{t('twoFactorAuth')}</CardTitle>
					</div>
					<CardDescription>
						{t('generateTotpDesc')}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-2">
						<label className="text-sm font-medium">{t('secretKey')}</label>
						<Input
							type="text"
							placeholder={t('enterSecretKey')}
							value={secret}
							onChange={handleInputChange}
							className={error ? "border-red-500" : ""}
						/>
						{error && (
							<p className="text-xs text-red-500">{error}</p>
						)}
						<p className="text-xs text-muted-foreground">
							{t('secretKeyDescription')}
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							Valid format: Base32 characters (A-Z, 2-7) without spaces or special characters.
						</p>
					</div>
					
					{secret && totpCode && (
						<div className="space-y-4">
							<div 
								className="text-center p-8 bg-secondary rounded-lg cursor-pointer"
								onClick={handleCopy}
								title={t('copy')}
							>
								<p className="text-sm text-muted-foreground mb-2">{t('totpCode')}</p>
								<div className="text-5xl font-mono font-bold tracking-wider">
									{totpCode.slice(0, 3)} {totpCode.slice(3)}
								</div>
								<div className="mt-4 flex items-center justify-center gap-4">
									<div className="text-sm text-muted-foreground">
										{t('expiresIn')}: <span className="font-semibold">{timeRemaining}{t('seconds')}</span>
									</div>
									<Button
										size="sm"
										variant={copied ? 'default' : 'outline'}
										onClick={handleCopy}
										className={copied ? 'bg-green-500 hover:bg-green-600' : ''}
									>
										{copied ? (
											<>
												<Check className="mr-2 h-4 w-4" />
												{t('copied')}
											</>
										) : (
											<>
												<Copy className="mr-2 h-4 w-4" />
												{t('copy')}
											</>
										)}
									</Button>
								</div>
							</div>
							
							<div className="relative">
								<div className="h-2 bg-secondary rounded-full overflow-hidden">
									<div
										className="h-full bg-primary transition-all duration-1000 ease-linear"
										style={{ width: `${(timeRemaining / 30) * 100}%` }}
									/>
								</div>
							</div>
						</div>
					)}
					
					<div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
						<p className="text-sm text-amber-800 dark:text-amber-200">
							<strong>{t('securityNote')}:</strong> {t('securityNoteText')}
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	)
} 