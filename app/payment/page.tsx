'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Copy, Check, CreditCard, Globe, DollarSign } from 'lucide-react'
import { useStore } from '@/app/lib/store'
import { useTranslation } from '@/app/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'
import { VietQRPayment } from '@/app/components/ui/viet-qr-payment'

type PaymentMethod = 'vietqr' | 'wise' | 'paypal'

// Bank BIN mapping
const BANK_BIN_MAP: Record<string, string> = {
	'MB': '970422',
	'MBBANK': '970422',
	'VCB': '970436',
	'VIETCOMBANK': '970436',
	'TCB': '970407',
	'TECHCOMBANK': '970407',
	'ACB': '970416',
	'VPB': '970432',
	'VPBANK': '970432',
	'BIDV': '970418',
	'VIB': '970441',
	'TPB': '970423',
	'TPBANK': '970423',
	'SACOMBANK': '970403',
	'STB': '970403',
}

export default function PaymentPage() {
	const { paymentInfo } = useStore()
	const { t } = useTranslation()
	const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('vietqr')
	const [copied, setCopied] = useState(false)

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
		<div className="max-w-6xl mx-auto py-8 page-transition">
			<div className="text-center mb-8">
				<h1 className="text-4xl font-bold jshine-gradient">{t('payment')}</h1>
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
				<VietQRPayment
					accountNumber={paymentInfo.accountNumber}
					bankName={paymentInfo.bankName}
					accountName={paymentInfo.accountName}
				/>
			)}
			
			{/* Wise Payment */}
			{selectedMethod === 'wise' && (
				<div className="max-w-6xl mx-auto">
					<Card>
						<CardHeader>
							<CardTitle className="text-center">Wise Transfer</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col md:flex-row gap-6">
								{/* QR Code on the left */}
								<div className="flex-1 flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
									<div className="relative w-48 h-48 mb-3">
										<Image
											src="/wise-qr.png"
											alt="Wise QR Code"
											fill
											className="object-contain"
											unoptimized
										/>
									</div>
									<p className="text-sm text-center text-muted-foreground">Scan QR code to transfer</p>
								</div>
								
								{/* Transfer Information on the right */}
								<div className="flex-1 space-y-4">
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
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}
			
			{/* PayPal Payment */}
			{selectedMethod === 'paypal' && (
				<div className="max-w-6xl mx-auto">
					<Card>
						<CardHeader>
							<CardTitle className="text-center">PayPal Payment</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col md:flex-row gap-6">
								{/* QR Code on the left */}
								<div className="flex-1 flex flex-col items-center justify-center p-4 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
									<div className="relative w-48 h-48 mb-3">
										<Image
											src="/paypal-qr.png"
											alt="PayPal QR Code"
											fill
											className="object-contain"
											unoptimized
										/>
									</div>
									<p className="text-sm text-center text-muted-foreground">Scan QR code to pay with PayPal</p>
								</div>
								
								{/* Transfer Information on the right */}
								<div className="flex-1 space-y-4">
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
									
									<div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
										<p className="text-sm text-purple-800 dark:text-purple-200">
											<strong>Note:</strong> Please include your order details in the PayPal note section. Buyer protection available.
										</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	)
} 