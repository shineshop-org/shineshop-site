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
	const [activeQrLink, setActiveQrLink] = useState(1)
	
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
		const success = await copyToClipboard(accountNumber)
		if (success) {
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		}
	}

	// Copy QR code with image capture
	const handleCopyQR = async () => {
		try {
			const qrContainer = document.querySelector('.qr-container');
			
			if (!qrContainer) {
				console.error('QR container element not found');
				return;
			}
			
			try {
				// Import html2canvas dynamically
				const html2canvasModule = await import('html2canvas');
				const html2canvas = html2canvasModule.default;
				
				// Capture the container with all styling
				const capturedCanvas = await html2canvas(qrContainer as HTMLElement, {
					backgroundColor: '#000000',
					scale: 2,
					logging: false,
					allowTaint: true,
					useCORS: true,
					onclone: (clonedDoc) => {
						const clonedContainer = clonedDoc.querySelector('.qr-container');
						if (clonedContainer) {
							// Add extra styling to ensure gradient is visible
							clonedContainer.setAttribute('style', 'background: linear-gradient(to right, #06b6d4, #8b5cf6, #ec4899); padding: 3px; border-radius: 0.5rem; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);');
							
							const bgElement = clonedContainer.querySelector('.qr-bg');
							if (bgElement) {
								bgElement.setAttribute('style', 'background-color: #000000; border-radius: 0.375rem; padding: 16px 24px; display: flex; flex-direction: column; align-items: center;');
							}
							
							const totalPaymentText = clonedContainer.querySelector('.payment-label');
							if (totalPaymentText) {
								totalPaymentText.setAttribute('style', 'color: #ffffff; font-weight: 600; font-size: 1.125rem; margin-bottom: 0.25rem;');
								totalPaymentText.textContent = 'Tổng thanh toán:';
							}
							
							const amountText = clonedContainer.querySelector('.payment-amount');
							if (amountText) {
								amountText.setAttribute('style', 'color: #10b981; font-weight: 700; font-size: 1.75rem; margin-top: 0;');
							}
						}
					}
				});
				
				try {
					// Try using the Clipboard API first
					if (navigator.clipboard && window.ClipboardItem) {
						const blob = await new Promise<Blob>((resolve, reject) => {
							capturedCanvas.toBlob((result) => {
								if (result) {
									resolve(result);
								} else {
									reject(new Error('Failed to create blob from canvas'));
								}
							}, 'image/png');
						});
						
						const clipboardData = new (window as any).ClipboardItem({
							'image/png': blob
						});
						
						await navigator.clipboard.write([clipboardData]);
						setCopyButtonSuccess(true);
						setTimeout(() => setCopyButtonSuccess(false), 2000);
					} else {
						// Fallback - create a temporary link and click it to download
						const url = capturedCanvas.toDataURL('image/png');
						const link = document.createElement('a');
						link.href = url;
						link.download = 'qr-payment.png';
						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);
						
						setCopyButtonSuccess(true);
						setTimeout(() => setCopyButtonSuccess(false), 2000);
					}
				} catch (err) {
					console.error('Error copying with Clipboard API, falling back to URL download:', err);
					// Fallback to download
					const url = capturedCanvas.toDataURL('image/png');
					const link = document.createElement('a');
					link.href = url;
					link.download = 'qr-payment.png';
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					
					setCopyButtonSuccess(true);
					setTimeout(() => setCopyButtonSuccess(false), 2000);
				}
			} catch (error) {
				console.error('Error capturing QR container:', error);
				if (qrUrl) {
					await copyToClipboard(qrUrl);
					setCopyButtonSuccess(true);
					setTimeout(() => setCopyButtonSuccess(false), 2000);
				}
			}
		} catch (error) {
			console.error('Failed to copy QR code:', error);
			// Final fallback
			if (qrUrl) {
				await copyToClipboard(qrUrl);
				setCopyButtonSuccess(true);
				setTimeout(() => setCopyButtonSuccess(false), 2000);
			}
		}
	}

	// Change QR API Link
	const changeQrLink = (linkIndex: number) => {
		if (linkIndex === 4 && !qrLinks[3]) return; // Skip if link 4 is empty
		setActiveQrLink(linkIndex)
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
								<p className="font-medium text-lg">{bankName}</p>
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
									<p className="font-medium text-lg">{accountNumber}</p>
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
					<div className="relative rounded-lg overflow-hidden qr-container bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 p-[3px] flex-grow" style={{ maxWidth: 'fit-content' }}>
						<div className="bg-background rounded-lg p-4 sm:p-6 flex flex-col items-center qr-bg h-full">
							{/* QR Code with loading effect - 17% larger (30% increase, then 10% decrease) */}
							<div className="relative flex items-center justify-center flex-grow">
								{qrUrl ? (
									<div className={`transition-opacity duration-300 ${isLoading ? 'opacity-30 blur-sm' : 'opacity-100'}`}>
										{qrUrl && qrUrl.trim() !== '' ? (
											<Image 
												ref={qrImageRef}
												src={qrUrl}
												alt="VietQR Payment Code"
												width={292} /* 17% larger than original 250px */
												height={292} /* 17% larger than original 250px */
												className="w-full max-w-[292px] h-auto" /* 17% larger than original */
												unoptimized
												crossOrigin="anonymous"
											/>
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
							
							{/* Payment text below QR code */}
							<div className="text-center mt-3 sm:mt-4">
								<p className="text-foreground text-base sm:text-lg font-semibold payment-label mb-0">Tổng thanh toán:</p>
								<p className="text-green-600 text-2xl sm:text-3xl font-bold payment-amount mt-0">
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
