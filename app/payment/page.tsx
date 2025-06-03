'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Copy, Check } from 'lucide-react'
import { useStore } from '@/app/lib/store'
import { useTranslation } from '@/app/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'

export default function PaymentPage() {
	const { paymentInfo } = useStore()
	const { t } = useTranslation()
	const [amount, setAmount] = useState('')
	const [copied, setCopied] = useState(false)
	
	// Generate VietQR URL
	const generateQRUrl = () => {
		const baseUrl = 'https://img.vietqr.io/image'
		const bankId = paymentInfo.bankName.toLowerCase()
		const accountNo = paymentInfo.accountNumber
		const template = paymentInfo.qrTemplate
		const amountParam = amount ? `&amount=${amount}` : ''
		const addInfo = encodeURIComponent('Thanh toan Shine Shop')
		
		return `${baseUrl}/${bankId}-${accountNo}-${template}.jpg?accountName=${encodeURIComponent(paymentInfo.accountName)}${amountParam}&addInfo=${addInfo}`
	}
	
	const handleCopy = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch (err) {
			console.error('Failed to copy:', err)
		}
	}
	
	return (
		<div className="max-w-6xl mx-auto py-8">
			<div className="text-center mb-8">
				<h1 className="text-4xl font-bold">{t('payment')}</h1>
				<p className="text-muted-foreground mt-2">
					Scan QR code or use bank account information below
				</p>
			</div>
			
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* QR Code Section */}
				<div>
					<Card>
						<CardHeader>
							<CardTitle>QR Payment</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* QR Code */}
							<div className="relative aspect-square max-w-sm mx-auto rounded-lg overflow-hidden p-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500">
								<div className="absolute inset-1 bg-white rounded">
									<Image
										src={generateQRUrl()}
										alt="Payment QR Code"
										width={400}
										height={400}
										className="w-full h-full object-contain"
									/>
								</div>
							</div>
							
							{/* Amount Input */}
							<div className="space-y-2">
								<label className="text-sm font-medium">{t('enterAmount')}</label>
								<div className="flex gap-2">
									<Input
										type="number"
										placeholder="0"
										value={amount}
										onChange={(e) => setAmount(e.target.value)}
										className="flex-1"
									/>
									<Button
										onClick={() => handleCopy(amount || '0')}
										size="icon"
										variant={copied ? 'default' : 'outline'}
										className={`transition-colors ${copied ? 'bg-green-500 hover:bg-green-600' : ''}`}
									>
										{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
				
				{/* Bank Account Info */}
				<div>
					<Card>
						<CardHeader>
							<CardTitle>{t('bankAccountInfo')}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-3">
								<div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
									<div>
										<p className="text-sm text-muted-foreground">Bank Name</p>
										<p className="font-medium">{paymentInfo.bankName}</p>
									</div>
									<Button
										onClick={() => handleCopy(paymentInfo.bankName)}
										size="sm"
										variant="ghost"
									>
										<Copy className="h-4 w-4" />
									</Button>
								</div>
								
								<div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
									<div>
										<p className="text-sm text-muted-foreground">Account Number</p>
										<p className="font-medium">{paymentInfo.accountNumber}</p>
									</div>
									<Button
										onClick={() => handleCopy(paymentInfo.accountNumber)}
										size="sm"
										variant="ghost"
									>
										<Copy className="h-4 w-4" />
									</Button>
								</div>
								
								<div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
									<div>
										<p className="text-sm text-muted-foreground">Account Name</p>
										<p className="font-medium">{paymentInfo.accountName}</p>
									</div>
									<Button
										onClick={() => handleCopy(paymentInfo.accountName)}
										size="sm"
										variant="ghost"
									>
										<Copy className="h-4 w-4" />
									</Button>
								</div>
								
								{amount && (
									<div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
										<div>
											<p className="text-sm text-muted-foreground">Transfer Amount</p>
											<p className="font-medium text-lg">{Number(amount).toLocaleString('vi-VN')} VND</p>
										</div>
										<Button
											onClick={() => handleCopy(amount)}
											size="sm"
											variant="ghost"
										>
											<Copy className="h-4 w-4" />
										</Button>
									</div>
								)}
							</div>
							
							<div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
								<p className="text-sm text-amber-800 dark:text-amber-200">
									<strong>Note:</strong> Please include your order number or contact information in the transfer description.
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
} 