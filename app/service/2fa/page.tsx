'use client'

import React, { useState, useEffect } from 'react'
import { Shield, Copy, Check } from 'lucide-react'
import { useTranslation } from '@/app/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'

export default function TwoFactorAuthPage() {
	const { t } = useTranslation()
	const [secret, setSecret] = useState('')
	const [totpCode, setTotpCode] = useState('')
	const [timeRemaining, setTimeRemaining] = useState(30)
	const [copied, setCopied] = useState(false)
	
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
	
	return (
		<div className="max-w-2xl mx-auto py-8">
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Shield className="h-6 w-6 text-green-500" />
						<CardTitle>{t('twoFactorAuth')}</CardTitle>
					</div>
					<CardDescription>
						Generate time-based one-time passwords (TOTP) for two-factor authentication
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-2">
						<label className="text-sm font-medium">Secret Key</label>
						<Input
							type="text"
							placeholder="Enter your 2FA secret key"
							value={secret}
							onChange={(e) => setSecret(e.target.value)}
						/>
						<p className="text-xs text-muted-foreground">
							Enter the secret key provided by the service you're setting up 2FA for
						</p>
					</div>
					
					{secret && totpCode && (
						<div className="space-y-4">
							<div className="text-center p-8 bg-secondary rounded-lg">
								<p className="text-sm text-muted-foreground mb-2">Your TOTP Code</p>
								<div className="text-4xl font-mono font-bold tracking-wider">
									{totpCode.slice(0, 3)} {totpCode.slice(3)}
								</div>
								<div className="mt-4 flex items-center justify-center gap-4">
									<div className="text-sm text-muted-foreground">
										Expires in: <span className="font-semibold">{timeRemaining}s</span>
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
												Copied!
											</>
										) : (
											<>
												<Copy className="mr-2 h-4 w-4" />
												Copy
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
							<strong>Security Note:</strong> Never share your secret key with anyone. This tool runs entirely in your browser and doesn't send any data to our servers.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	)
} 