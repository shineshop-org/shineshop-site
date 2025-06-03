'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Copy, Check, CreditCard, Globe, DollarSign } from 'lucide-react'
import { useStore } from '@/app/lib/store'
import { useTranslation } from '@/app/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'

type PaymentMethod = 'vietqr' | 'wise' | 'paypal'

export default function PaymentPage() {
	const { paymentInfo } = useStore()
	const { t } = useTranslation()
	const [amount, setAmount] = useState('')
	const [copied, setCopied] = useState(false)
	const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('vietqr')
	
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
	
	const paymentMethods = [
		{
			id: 'vietqr' as PaymentMethod,
			name: 'VietQR',
			icon: CreditCard,
			color: 'text-blue-500'
		},
		{
			id: 'wise' as PaymentMethod,
			name: 'Wise',
			icon: Globe,
			color: 'text-green-500'
		},
		{
			id: 'paypal' as PaymentMethod,
			name: 'PayPal',
			icon: DollarSign,
			color: 'text-indigo-500'
		}
	]
	
	return (
		<div className="max-w-6xl mx-auto py-8">
			<div className="text-center mb-8">
				<h1 className="text-4xl font-bold">{t('payment')}</h1>
				<p className="text-muted-foreground mt-2">
					Choose your preferred payment method
				</p>
			</div>
			
			{/* Payment Method Selection */}
			<div className="flex justify-center gap-4 mb-8">
				{paymentMethods.map((method) => (
					<Button
						key={method.id}
						variant={selectedMethod === method.id ? 'default' : 'outline'}
						size="lg"
						onClick={() => setSelectedMethod(method.id)}
						className="flex items-center gap-2"
					>
						<method.icon className={`h-5 w-5 ${selectedMethod === method.id ? '' : method.color}`} />
						{method.name}
					</Button>
				))}
			</div>
			
			{/* VietQR Payment */}
			{selectedMethod === 'vietqr' && (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* QR Code Section */}
					<div>
						<Card>
							<CardHeader>
								<CardTitle>VietQR Payment</CardTitle>
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
			)}
			
			{/* Wise Payment */}
			{selectedMethod === 'wise' && (
				<div className="max-w-2xl mx-auto">
					<Card>
						<CardHeader>
							<CardTitle className="text-center">Wise Transfer</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="text-center p-8 bg-green-50 dark:bg-green-950 rounded-lg">
								<Globe className="h-16 w-16 text-green-500 mx-auto mb-4" />
								<h3 className="text-xl font-semibold mb-2">International Transfer via Wise</h3>
								<p className="text-muted-foreground mb-4">Fast, secure, and low-cost international transfers</p>
							</div>
							
							<div className="space-y-3">
								<div className="p-4 bg-secondary rounded-lg">
									<p className="text-sm text-muted-foreground mb-1">Email</p>
									<div className="flex justify-between items-center">
										<p className="font-medium">{paymentInfo.wiseEmail}</p>
										<Button
											onClick={() => handleCopy(paymentInfo.wiseEmail)}
											size="sm"
											variant="ghost"
										>
											<Copy className="h-4 w-4" />
										</Button>
									</div>
								</div>
								
								<div className="p-4 bg-secondary rounded-lg">
									<p className="text-sm text-muted-foreground mb-1">Currency</p>
									<p className="font-medium">USD, EUR, GBP accepted</p>
								</div>
								
								<div className="p-4 bg-secondary rounded-lg">
									<p className="text-sm text-muted-foreground mb-1">Processing Time</p>
									<p className="font-medium">Usually within 24 hours</p>
								</div>
							</div>
							
							<div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
								<p className="text-sm text-blue-800 dark:text-blue-200">
									<strong>Instructions:</strong> Send payment to the email above using Wise. Include your order number in the reference field.
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			)}
			
			{/* PayPal Payment */}
			{selectedMethod === 'paypal' && (
				<div className="max-w-2xl mx-auto">
					<Card>
						<CardHeader>
							<CardTitle className="text-center">PayPal Payment</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="text-center p-8 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
								<div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
									<span className="text-white text-4xl font-bold">PP</span>
								</div>
								<h3 className="text-xl font-semibold mb-2">Pay with PayPal</h3>
								<p className="text-muted-foreground mb-4">Secure payment protected by PayPal</p>
							</div>
							
							<div className="space-y-3">
								<div className="p-4 bg-secondary rounded-lg">
									<p className="text-sm text-muted-foreground mb-1">PayPal Email</p>
									<div className="flex justify-between items-center">
										<p className="font-medium">{paymentInfo.paypalEmail}</p>
										<Button
											onClick={() => handleCopy(paymentInfo.paypalEmail)}
											size="sm"
											variant="ghost"
										>
											<Copy className="h-4 w-4" />
										</Button>
									</div>
								</div>
								
								<div className="p-4 bg-secondary rounded-lg">
									<p className="text-sm text-muted-foreground mb-1">Payment Type</p>
									<p className="font-medium">Friends & Family or Goods & Services</p>
								</div>
								
								<div className="p-4 bg-secondary rounded-lg">
									<p className="text-sm text-muted-foreground mb-1">Accepted Currencies</p>
									<p className="font-medium">All major currencies</p>
								</div>
							</div>
							
							<Button className="w-full" size="lg">
								<DollarSign className="mr-2 h-5 w-5" />
								Send Payment via PayPal
							</Button>
							
							<div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
								<p className="text-sm text-purple-800 dark:text-purple-200">
									<strong>Note:</strong> Please include your order details in the PayPal note section. Buyer protection available.
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	)
} 