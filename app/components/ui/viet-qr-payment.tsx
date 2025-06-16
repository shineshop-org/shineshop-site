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
	accountNumber: initialAccountNumber, 
	bankName: initialBankName, 
	accountName = 'SHINE SHOP',
	baseQrUrl = 'https://img.vietqr.io/image/970407-MS00T09331707449347-Djwd2Cb.jpg?accountName=SHINE%20SHOP&amount=0&addInfo=SHINE%20SHOP'
}: VietQRPaymentProps) {
	const [amount, setAmount] = useState('')
	const [formattedAmount, setFormattedAmount] = useState('')
	const [qrUrl, setQrUrl] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [copied, setCopied] = useState(false)
	const [copyButtonSuccess, setCopyButtonSuccess] = useState(false)
	const [activeQrLink, setActiveQrLink] = useState(1)
	const [displayBankName, setDisplayBankName] = useState(initialBankName)
	const [displayAccountNumber, setDisplayAccountNumber] = useState(initialAccountNumber)
	
	const qrImageRef = useRef<HTMLImageElement>(null)

	// QR API links
	const qrLinks = [
		'https://img.vietqr.io/image/970407-MS00T09331707449347-Djwd2Cb.jpg?accountName=SHINE%20SHOP&amount=0&addInfo=SHINE%20SHOP',
		'https://img.vietqr.io/image/970422-598422222-M58hYc1.jpg?accountName=TRAN%20BAO%20NHU&amount=0',
		'https://img.vietqr.io/image/970422-598422222-nBCHiJH.jpg?accountName=TRAN%20BAO%20NHU&amount=0',
		''
	]

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
		const success = await copyToClipboard(displayAccountNumber)
		if (success) {
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		}
	}

	// Wrapper for QR code copying to avoid lint errors
	const handleCopyQR = () => {
		createAndDownloadQRImage(qrImageRef, qrUrl, formattedAmount)
			.then(() => {
				setCopyButtonSuccess(true)
				setTimeout(() => setCopyButtonSuccess(false), 2000)
			})
			.catch(err => {
				console.error('Error creating QR image:', err)
			})
	}
	
	// Helper function to create and download QR image
	const createAndDownloadQRImage = async (
		imageRef: React.RefObject<HTMLImageElement | null>,
		imageUrl: string, 
		amount: string
	): Promise<void> => {
		// Create canvas element
		const canvas = document.createElement('canvas')
		const ctx = canvas.getContext('2d')
		if (!ctx) {
			throw new Error('Unable to get 2d context')
		}
		
		// Set canvas size - match the dimensions of the QR code with gradient border
		const width = 345
		const height = 450
		canvas.width = width
		canvas.height = height
		
		// Create gradient background (rounded rectangle with gradient border)
		const gradient = ctx.createLinearGradient(0, 0, width, 0)
		gradient.addColorStop(0, '#06b6d4')    // cyan-500
		gradient.addColorStop(0.5, '#8b5cf6')  // purple-500
		gradient.addColorStop(1, '#ec4899')    // pink-500
		
		// Clear canvas with transparency
		ctx.clearRect(0, 0, width, height)
		
		// Draw rounded rectangle with gradient
		ctx.save()
		roundRect(ctx, 0, 0, width, height, 48)
		ctx.fillStyle = gradient
		ctx.fill()
		
		// Draw black background with slightly smaller rounded corners
		ctx.save()
		roundRect(ctx, 6, 6, width - 12, height - 12, 45)
		ctx.fillStyle = '#000000'
		ctx.fill()
		ctx.restore()
		
		// Draw QR code image if we have it
		if (imageRef.current && imageUrl) {
			// Create a promise to handle image loading
			return new Promise((resolve, reject) => {
				const qrImage = new window.Image()
				qrImage.crossOrigin = 'anonymous'
				
				qrImage.onload = () => {
					// Draw QR code centered
					const qrSize = 280
					const qrX = (width - qrSize) / 2
					const qrY = 24
					
					ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize)
					
					// Draw divider line
					ctx.beginPath()
					ctx.moveTo(24, height - 115)
					ctx.lineTo(width - 24, height - 115)
					ctx.strokeStyle = '#333333'
					ctx.lineWidth = 1
					ctx.stroke()
					
					// Draw "Tổng thanh toán:" text
					ctx.font = '600 17px system-ui, -apple-system, sans-serif'
					ctx.fillStyle = '#ffffff'
					ctx.textAlign = 'center'
					ctx.fillText('Tổng thanh toán:', width / 2, height - 82)
					
					// Draw amount
					ctx.font = '700 26px system-ui, -apple-system, sans-serif'
					ctx.fillStyle = '#10b981' // green-500
					ctx.textAlign = 'center'
					ctx.fillText(`${amount ? amount : '0'} VND`, width / 2, height - 50)
					
					// Try to copy to clipboard using canvas
					canvas.toBlob(async (blob) => {
						if (blob) {
							try {
								// Use Clipboard API if available
								if (navigator.clipboard && navigator.clipboard.write) {
									const clipboardItem = new window.ClipboardItem({ 'image/png': blob });
									await navigator.clipboard.write([clipboardItem]);
									resolve();
								} else {
									// Fallback to legacy clipboard API or other methods
									// This is a last resort as we prefer copying over downloading
									const url = URL.createObjectURL(blob);
									const tempTextArea = document.createElement('textarea');
									tempTextArea.value = url;
									document.body.appendChild(tempTextArea);
									tempTextArea.select();
									document.execCommand('copy');
									document.body.removeChild(tempTextArea);
									URL.revokeObjectURL(url);
									resolve();
								}
							} catch (error) {
								console.error('Failed to copy image to clipboard:', error);
								reject(error);
							}
						} else {
							reject(new Error('Failed to create blob from canvas'));
						}
					}, 'image/png');
				}
				
				qrImage.onerror = () => {
					reject(new Error('Failed to load QR image'))
				}
				
				qrImage.src = imageUrl
			})
		} else {
			throw new Error('QR image reference not available')
		}
	}
	
	// Helper function to draw rounded rectangles
	function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
		ctx.beginPath()
		ctx.moveTo(x + radius, y)
		ctx.lineTo(x + width - radius, y)
		ctx.arcTo(x + width, y, x + width, y + radius, radius)
		ctx.lineTo(x + width, y + height - radius)
		ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius)
		ctx.lineTo(x + radius, y + height)
		ctx.arcTo(x, y + height, x, y + height - radius, radius)
		ctx.lineTo(x, y + radius)
		ctx.arcTo(x, y, x + radius, y, radius)
		ctx.closePath()
	}

	// Change QR API Link
	const changeQrLink = (linkIndex: number) => {
		if (linkIndex === 4 && !qrLinks[3]) return; // Skip if link 4 is empty
		setActiveQrLink(linkIndex)
		
		// Update bank information based on selected QR slot
		if (linkIndex === 2 || linkIndex === 3) {
			setDisplayBankName('MB Bank - Ngân hàng TMCP Quân đội')
			setDisplayAccountNumber('598422222')
		} else {
			setDisplayBankName(initialBankName)
			setDisplayAccountNumber(initialAccountNumber)
		}
	}

	// Update QR URL when amount changes or QR link changes
	useEffect(() => {
		if (!qrLinks[activeQrLink - 1]) return;
		
		const currentBaseUrl = qrLinks[activeQrLink - 1];
		
		if (amount) {
			setIsLoading(true)
			
			const timer = setTimeout(() => {
				const separator = currentBaseUrl.includes('?') ? '&' : '?'
				const newQrUrl = `${currentBaseUrl}${separator}amount=${amount}`
				setQrUrl(newQrUrl)
				setIsLoading(false)
			}, 500)
			
			return () => clearTimeout(timer)
		} else {
			const separator = currentBaseUrl.includes('?') ? '&' : '?'
			setQrUrl(`${currentBaseUrl}${separator}amount=0`)
		}
	}, [amount, activeQrLink])

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
			{/* Payment Information */}
			<div className="flex flex-col h-full">
				{/* Bank Info Card */}
				<Card className="shadow-md flex-grow flex flex-col">
					<CardHeader className="pb-2 pt-6">
						<CardTitle className="text-xl font-semibold">Thông tin thanh toán</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col flex-grow justify-between space-y-4">
						<div className="space-y-4">
							{/* Bank Name */}
							<div className="p-2">
								<p className="text-sm text-muted-foreground mb-1">Ngân hàng</p>
								<p className="font-medium text-lg">{displayBankName}</p>
							</div>
							
							{/* Account Name */}
							<div className="p-2">
								<p className="text-sm text-muted-foreground mb-1">Tên tài khoản</p>
								<p className="font-medium text-lg">{accountName}</p>
							</div>
							
							{/* Account Number with Copy Button */}
							<div className="flex items-center justify-between p-2">
								<div className="flex-1">
									<p className="text-sm text-muted-foreground mb-1">Số tài khoản</p>
									<p className="font-medium text-lg">{displayAccountNumber}</p>
								</div>
								<Button 
									onClick={handleCopyAccountNumber} 
									variant={copied ? "default" : "outline"} 
									size="sm"
									className={copied ? "bg-green-500 hover:bg-green-600 rounded-lg aspect-square w-12 min-w-[48px] max-w-[48px] h-12 min-h-[48px] max-h-[48px] p-0 flex items-center justify-center" : "rounded-lg aspect-square w-12 min-w-[48px] max-w-[48px] h-12 min-h-[48px] max-h-[48px] p-0 flex items-center justify-center"}
								>
									{copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
								</Button>
							</div>
						</div>

						{/* Amount Input Field with Copy Button - now separated */}
						<div className="p-2 mt-auto">
							<p className="text-sm text-muted-foreground mb-1">Số tiền</p>
							<div className="flex gap-2 items-center">
								<Input
									type="text"
									placeholder="Nhập số tiền (VND)"
									value={formattedAmount}
									onChange={handleAmountChange}
									className="text-center h-12 text-base sm:text-lg"
									style={{ fontSize: '18px' }}
								/>
								<Button
									onClick={handleCopyQR}
									variant={copyButtonSuccess ? "default" : "outline"}
									size="sm"
									className={`rounded-lg aspect-square w-12 min-w-[48px] max-w-[48px] h-12 min-h-[48px] max-h-[48px] p-0 flex items-center justify-center ${copyButtonSuccess ? "bg-green-500 hover:bg-green-600" : ""}`}
								>
									{copyButtonSuccess ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
			
			{/* QR Code */}
			<div className="flex flex-col items-center h-full">
				{/* QR Code container with QR link selector buttons */}
				<div className="flex h-full">
					{/* QR Code with gradient border and payment text */}
					<div className="relative rounded-[48px] overflow-hidden qr-container bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 p-[6px] flex-grow" style={{ maxWidth: 'fit-content' }}>
						<div className="bg-black rounded-[42px] p-3 pb-1 flex flex-col items-center qr-bg h-full">
							{/* QR Code with loading effect - better sized and centered */}
							<div className="relative flex items-center justify-center flex-grow mb-1">
								{qrUrl ? (
									<div className={`transition-opacity duration-300 ${isLoading ? 'opacity-30 blur-sm' : 'opacity-100'}`}>
										{qrUrl && qrUrl.trim() !== '' ? (
											<div className="flex justify-center">
												<Image 
													ref={qrImageRef}
													src={qrUrl}
													alt="VietQR Payment Code"
													width={280}
													height={280}
													className="w-full max-w-[280px] h-auto rounded-[8px]"
													unoptimized
													crossOrigin="anonymous"
												/>
											</div>
										) : (
											<div className="p-6 sm:p-8 flex flex-col items-center justify-center bg-muted rounded-lg">
												<div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-muted-foreground/20 rounded-lg flex items-center justify-center mb-2">
													<span className="text-2xl sm:text-3xl">QR</span>
												</div>
												<p className="text-center text-muted-foreground text-sm sm:text-base">Nhập số tiền để tạo mã QR</p>
											</div>
										)}
									</div>
								) : (
									<div className="p-6 sm:p-8 flex flex-col items-center justify-center bg-muted rounded-lg">
										<div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-muted-foreground/20 rounded-lg flex items-center justify-center mb-2">
											<span className="text-2xl sm:text-3xl">QR</span>
										</div>
										<p className="text-center text-muted-foreground text-sm sm:text-base">Nhập số tiền để tạo mã QR</p>
									</div>
								)}
								
								{/* Loading indicator */}
								{isLoading && (
									<div className="absolute inset-0 flex items-center justify-center">
										<div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
									</div>
								)}
							</div>
							
							{/* Payment text below QR code - improved spacing */}
							<div className="text-center mt-1 pt-1 w-full">
								<div className="border-t border-gray-700 w-full payment-divider"></div>
								<p className="text-white text-base font-semibold payment-label mb-0 mt-2">Tổng thanh toán:</p>
								<p className="text-green-500 text-2xl font-bold payment-amount mt-0 mb-2">
								{formattedAmount ? `${formattedAmount} VND` : '0 VND'}
								</p>
							</div>
						</div>
					</div>
					
					{/* QR Link selector buttons */}
					<div className="flex flex-col gap-2 sm:gap-3 pl-3 sm:pl-4 justify-center">
						{[1, 2, 3, 4].map((num) => (
							<button
								key={num}
								onClick={() => changeQrLink(num)}
								disabled={num === 4 && !qrLinks[3]}
								className={`h-10 w-10 sm:h-14 sm:w-14 rounded-lg flex items-center justify-center border bg-background ${
									num === 4 && !qrLinks[3] ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
								} ${
									activeQrLink === num 
										? 'border-primary border-2' 
										: 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
								}`}
							>
								<span className="text-sm sm:text-base font-medium">{num}</span>
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
