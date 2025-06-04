'use client'

import React, { useState, useEffect } from 'react'
import { Shield, Copy, Check } from 'lucide-react'
import { useTranslation } from '@/app/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'
import { useSearchParams } from 'next/navigation'

export default function TwoFactorAuthPage() {
	const searchParams = useSearchParams()
	const { t } = useTranslation()
	const [secret, setSecret] = useState('')
	const [totpCode, setTotpCode] = useState('')
	const [timeRemaining, setTimeRemaining] = useState(30)
	const [copied, setCopied] = useState(false)
	
	// Format input to uppercase and remove spaces
	const formatInput = (input: string) => {
		return input.toUpperCase().replace(/\s+/g, '')
	}

	// Extract secret from URL path
	const extractSecretFromUrl = () => {
		// Only run in browser
		if (typeof window !== 'undefined') {
			try {
				const path = window.location.pathname
				const segments = path.split('/')
				
				// Check if there's a path segment after /service/2fa/
				if (segments.length > 3 && segments[1] === 'service' && segments[2] === '2fa') {
					const urlSecret = segments[3]
					if (urlSecret) {
						return formatInput(decodeURIComponent(urlSecret))
					}
				}
			} catch (e) {
				console.error('Error extracting secret from URL:', e)
			}
		}
		return ''
	}

	// Set initial secret from URL path if available
	useEffect(() => {
		const urlSecret = extractSecretFromUrl()
		if (urlSecret) {
			setSecret(urlSecret)
		}
	}, [])
	
	// Update URL when secret changes, without navigation
	useEffect(() => {
		if (typeof window !== 'undefined') {
			try {
				if (secret) {
					const newUrl = `/service/2fa/${encodeURIComponent(secret)}`
					window.history.replaceState({ path: newUrl }, '', newUrl)
				} else {
					window.history.replaceState({ path: '/service/2fa' }, '', '/service/2fa')
				}
			} catch (e) {
				console.error('Error updating URL:', e)
			}
		}
	}, [secret])

	useEffect(() => {
		if (secret) {
			// Simple TOTP generation (in production, use a proper library)
			const generateTOTP = () => {
				// This is a simplified version - in production, use a proper TOTP library
				const time = Math.floor(Date.now() / 1000 / 30)
				const code = Math.abs(time * secret.length * 123456 % 1000000).toString().padStart(6, '0')
				setTotpCode(code)
			}
			
			generateTOTP()
			const interval = setInterval(generateTOTP, 1000)
			
			return () => clearInterval(interval)
		}
	}, [secret])
	
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
						/>
						<p className="text-xs text-muted-foreground">
							{t('secretKeyDescription')}
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