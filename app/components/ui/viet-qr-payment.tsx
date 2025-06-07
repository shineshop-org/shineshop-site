'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Copy, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'
import { 
	formatNumberWithThousandsSeparator, 
	copyToClipboard
} from '@/app/lib/utils'

interface VietQRPaymentProps {
	accountNumber: string
	bankName: string
	accountName?: string
	baseQrUrl?: string
}

export function VietQRPayment({ 
	accountNumber, 
	bankName, 
	accountName = 'SHINE SHOP',
	baseQrUrl = 'https://img.vietqr.io/image/970407-MS00T09331707449347-Djwd2Cb.jpg?accountName=SHINE%20SHOP&amount=0&addInfo=SHINE%20SHOP'
}: VietQRPaymentProps) {
	const [amount, setAmount] = useState('')
	const [formattedAmount, setFormattedAmount] = useState('')
	const [qrUrl, setQrUrl] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [copied, setCopied] = useState(false)
	const [copyButtonSuccess, setCopyButtonSuccess] = useState(false)
	
	const qrImageRef = useRef<HTMLImageElement>(null)

	// Handle amount input change
	const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const rawValue = e.target.value.replace(/\D/g, '')
		setAmount(rawValue)
		
		if (rawValue) {
			setFormattedAmount(formatNumberWithThousandsSeparator(parseInt(rawValue)))
		} else {
			setFormattedAmount('')
		}
	}

	// Copy account number to clipboard
	const handleCopyAccountNumber = async () => {
		const success = await copyToClipboard(accountNumber)
		if (success) {
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		}
	}

	// Copy QR code with image capture
	const handleCopyPaymentInfo = async () => {
		try {
			if (qrUrl) {
				const qrContainer = document.querySelector('.qr-container')
				
				if (!qrContainer) {
					console.error('QR container element not found')
					return
				}

				try {
					// Import html2canvas dynamically
					const html2canvasModule = await import('html2canvas')
					const html2canvas = html2canvasModule.default

					// Capture the container with all styling
					const capturedCanvas = await html2canvas(qrContainer as HTMLElement, {
						backgroundColor: null,
						scale: 2,
						logging: false,
						allowTaint: true,
						useCORS: true,
						onclone: (clonedDoc) => {
							const clonedContainer = clonedDoc.querySelector('.qr-container')
							if (clonedContainer) {
								const totalPaymentText = clonedContainer.querySelector('.payment-label')
								if (totalPaymentText) {
									totalPaymentText.setAttribute('style', 'color: #333; font-weight: normal; font-size: 0.875rem; margin-top: 0.125rem;')
									totalPaymentText.textContent = 'Tổng thanh toán:'
								}
								
								const amountText = clonedContainer.querySelector('.payment-amount')
								if (amountText) {
									amountText.setAttribute('style', 'color: #16a34a; font-weight: bold; font-size: 1.25rem;')
								}
							}
						}
					})

					try {
						// Try using the Clipboard API first
						if (navigator.clipboard && window.ClipboardItem) {
							const blob = await new Promise<Blob>((resolve, reject) => {
								capturedCanvas.toBlob((result) => {
									if (result) {
										resolve(result)
									} else {
										reject(new Error('Failed to create blob from canvas'))
									}
								}, 'image/png')
							})
							
							const clipboardData = new (window as any).ClipboardItem({
								'image/png': blob
							})
							
							await navigator.clipboard.write([clipboardData])
						} else {
							await copyToClipboard(qrUrl)
						}
						
						setCopyButtonSuccess(true)
						setTimeout(() => setCopyButtonSuccess(false), 2000)
					} catch (err) {
						console.error('Error copying with Clipboard API, falling back to URL copy:', err)
						await copyToClipboard(qrUrl)
						setCopyButtonSuccess(true)
						setTimeout(() => setCopyButtonSuccess(false), 2000)
					}
				} catch (error) {
					console.error('Error capturing QR container:', error)
					await copyToClipboard(qrUrl)
					setCopyButtonSuccess(true)
					setTimeout(() => setCopyButtonSuccess(false), 2000)
				}
			}
		} catch (error) {
			console.error('Failed to copy QR code:', error)
		}
	}

	// Update QR URL when amount changes
	useEffect(() => {
		if (amount) {
			setIsLoading(true)
			
			const timer = setTimeout(() => {
				const separator = baseQrUrl.includes('?') ? '&' : '?'
				const newQrUrl = `${baseQrUrl}${separator}amount=${amount}`
				setQrUrl(newQrUrl)
				setIsLoading(false)
			}, 500)
			
			return () => clearTimeout(timer)
		} else {
			const separator = baseQrUrl.includes('?') ? '&' : '?'
			setQrUrl(`${baseQrUrl}${separator}amount=0`)
		}
	}, [amount, baseQrUrl])

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			{/* QR Code and Amount Input */}
			<div className="flex flex-col items-center">
				<div className="w-full max-w-sm mb-4">
					{/* QR Code with gradient border and payment text */}
					<div className="relative rounded-lg overflow-hidden qr-container bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 p-[3px]">
						<div className="bg-background rounded-lg p-4 flex flex-col items-center">
							{/* QR Code with loading effect */}
							<div className="relative flex items-center justify-center">
								{qrUrl ? (
									<div className={`transition-opacity duration-300 ${isLoading ? 'opacity-30 blur-sm' : 'opacity-100'}`}>
										{qrUrl && qrUrl.trim() !== '' ? (
											<Image 
												ref={qrImageRef}
												src={qrUrl}
												alt="VietQR Payment Code"
												width={300}
												height={300}
												className="w-full h-auto"
												unoptimized
											/>
										) : (
											<div className="p-6 flex flex-col items-center justify-center bg-muted rounded-lg">
												<div className="w-16 h-16 border-4 border-muted-foreground/20 rounded-lg flex items-center justify-center mb-2">
													<span className="text-2xl">QR</span>
												</div>
												<p className="text-center text-muted-foreground text-sm">Nhập số tiền để tạo mã QR</p>
											</div>
										)}
									</div>
								) : (
									<div className="p-6 flex flex-col items-center justify-center bg-muted rounded-lg">
										<div className="w-16 h-16 border-4 border-muted-foreground/20 rounded-lg flex items-center justify-center mb-2">
											<span className="text-2xl">QR</span>
										</div>
										<p className="text-center text-muted-foreground text-sm">Nhập số tiền để tạo mã QR</p>
									</div>
								)}
								
								{/* Loading indicator */}
								{isLoading && (
									<div className="absolute inset-0 flex items-center justify-center">
										<div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
									</div>
								)}
							</div>
							
							{/* Payment text below QR code */}
							<div className="text-center mt-2">
								<p className="text-foreground text-sm font-normal payment-label">Tổng thanh toán:</p>
								<p className="text-green-600 text-xl font-bold payment-amount">{formattedAmount ? `${formattedAmount} VND` : '0 VND'}</p>
							</div>
						</div>
					</div>
				</div>
				
				{/* Amount Input with Copy Button */}
				<div className="w-full max-w-sm">
					<div className="flex items-center gap-2">
						<div className="relative flex-1">
							<Input
								type="text"
								value={formattedAmount}
								onChange={handleAmountChange}
								placeholder="0"
								className="pr-12"
							/>
							<span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
								VND
							</span>
						</div>
						<Button 
							onClick={handleCopyPaymentInfo}
							size="icon"
							variant={copyButtonSuccess ? 'default' : 'outline'}
							className={`transition-colors duration-300 ${
								copyButtonSuccess 
									? 'bg-green-600 hover:bg-green-700' 
									: ''
							}`}
						>
							{copyButtonSuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
						</Button>
					</div>
				</div>
			</div>
			
			{/* Payment Information */}
			<Card>
				<CardHeader>
					<CardTitle>Thông tin thanh toán</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<p className="text-muted-foreground text-sm mb-1">Ngân hàng</p>
						<p className="text-card-foreground">{bankName}</p>
					</div>
					
					<div>
						<p className="text-muted-foreground text-sm mb-1">Số tài khoản</p>
						<div 
							className="relative group"
							onClick={handleCopyAccountNumber}
						>
							<div className="bg-muted p-3 rounded-lg flex items-center justify-between cursor-pointer hover:bg-muted/80 transition-colors">
								<span className="font-mono text-card-foreground">{accountNumber}</span>
								<Copy className="h-4 w-4 text-muted-foreground" />
							</div>
							
							{/* Tooltip */}
							<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-popover rounded text-sm text-popover-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
								{copied ? 'Đã copy!' : 'Nhấn để copy'}
							</div>
						</div>
					</div>
					
					<div>
						<p className="text-muted-foreground text-sm mb-1">Chủ tài khoản</p>
						<div className="bg-muted p-3 rounded-lg">
							<p className="text-card-foreground font-medium">{accountName}</p>
						</div>
					</div>
					
					<div>
						<p className="text-muted-foreground text-sm mb-1">Số tiền</p>
						<div className="bg-muted p-3 rounded-lg">
							<p className="text-card-foreground font-medium">
								{formattedAmount ? `${formattedAmount} VND` : '0 VND'}
							</p>
						</div>
					</div>
					
					<div className="pt-4">
						<p className="text-muted-foreground text-sm">
							Quét mã QR bằng ứng dụng ngân hàng để thanh toán. Mã QR sẽ tự động cập nhật khi bạn thay đổi số tiền.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
