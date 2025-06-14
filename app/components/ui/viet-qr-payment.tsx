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
		'https://api.vietqr.io/image/970422-598422222-M58hYc1.jpg?accountName=TRAN%20BAO%20NHU&amount=0',
		'https://api.vietqr.io/image/970422-598422222-UgaSJbV.jpg?accountName=TRAN%20BAO%20NHU&amount=0',
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
									totalPaymentText.setAttribute('style', 'color: #fff; font-weight: 600; font-size: 1rem; margin-bottom: 0;')
									totalPaymentText.textContent = 'Tổng thanh toán:'
								}
								
								const amountText = clonedContainer.querySelector('.payment-amount')
								if (amountText) {
									amountText.setAttribute('style', 'color: #16a34a; font-weight: bold; font-size: 1.5rem; margin-top: 0;')
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
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
			{/* QR Code and Amount Input */}
			<div className="flex flex-col items-center">
				<div className="w-full max-w-sm mb-4">
					{/* QR Code container with QR link selector buttons */}
					<div className="flex">
						{/* QR Code with gradient border and payment text */}
						<div className="relative rounded-lg overflow-hidden qr-container bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 p-[3px] flex-grow">
							<div className="bg-background rounded-lg p-3 sm:p-4 flex flex-col items-center">
								{/* QR Code with loading effect */}
								<div className="relative flex items-center justify-center">
									{qrUrl ? (
										<div className={`transition-opacity duration-300 ${isLoading ? 'opacity-30 blur-sm' : 'opacity-100'}`}>
											{qrUrl && qrUrl.trim() !== '' ? (
												<Image 
													ref={qrImageRef}
													src={qrUrl}
													alt="VietQR Payment Code"
													width={250}
													height={250}
													className="w-full max-w-[250px] h-auto"
													unoptimized
												/>
											) : (
												<div className="p-4 sm:p-6 flex flex-col items-center justify-center bg-muted rounded-lg">
													<div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-muted-foreground/20 rounded-lg flex items-center justify-center mb-2">
														<span className="text-xl sm:text-2xl">QR</span>
													</div>
													<p className="text-center text-muted-foreground text-xs sm:text-sm">Nhập số tiền để tạo mã QR</p>
												</div>
											)}
										</div>
									) : (
										<div className="p-4 sm:p-6 flex flex-col items-center justify-center bg-muted rounded-lg">
											<div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-muted-foreground/20 rounded-lg flex items-center justify-center mb-2">
												<span className="text-xl sm:text-2xl">QR</span>
											</div>
											<p className="text-center text-muted-foreground text-xs sm:text-sm">Nhập số tiền để tạo mã QR</p>
										</div>
									)}
									
									{/* Loading indicator */}
									{isLoading && (
										<div className="absolute inset-0 flex items-center justify-center">
											<div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
										</div>
									)}
								</div>
								
								{/* Payment text below QR code */}
								<div className="text-center mt-2 sm:mt-3">
									<p className="text-foreground text-sm sm:text-base font-semibold payment-label mb-0">Tổng thanh toán:</p>
									<p className="text-green-600 text-xl sm:text-2xl font-bold payment-amount mt-0">
									{formattedAmount ? `${formattedAmount} VND` : '0 VND'}
									</p>
								</div>
							</div>
						</div>
						
						{/* QR Link selector buttons */}
						<div className="flex flex-col gap-1 sm:gap-2 pl-2 sm:pl-3 justify-center">
							{[1, 2, 3, 4].map((num) => (
								<button
									key={num}
									onClick={() => changeQrLink(num)}
									disabled={num === 4 && !qrLinks[3]}
									className={`h-8 w-8 sm:h-12 sm:w-12 rounded-lg flex items-center justify-center border bg-background ${
										num === 4 && !qrLinks[3] ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
									} ${
										activeQrLink === num 
											? 'border-primary border-2' 
											: 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
									}`}
								>
									<span className="text-xs sm:text-sm font-medium">{num}</span>
								</button>
							))}
						</div>
					</div>
					
					{/* Amount Input Field */}
					<div className="mt-4">
						<div className="relative">
							<Input
								type="text"
								placeholder="Nhập số tiền (VND)"
								value={formattedAmount}
								onChange={handleAmountChange}
								className="text-center pr-12"
							/>
							<span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
								VND
							</span>
						</div>
					</div>
				</div>
				
				{/* Bank Info Card */}
				<div className="w-full max-w-sm mt-6">
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-lg font-semibold">{bankName}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{/* Account Name */}
							<div>
								<p className="text-sm text-muted-foreground">Tên tài khoản</p>
								<p className="font-medium">{accountName}</p>
							</div>
							
							{/* Account Number with Copy Button */}
							<div className="flex items-center justify-between">
								<div className="flex-1">
									<p className="text-sm text-muted-foreground">Số tài khoản</p>
									<p className="font-medium">{accountNumber}</p>
								</div>
								<Button 
									onClick={handleCopyAccountNumber} 
									variant={copied ? "default" : "outline"} 
									size="sm"
									className={copied ? "bg-green-500 hover:bg-green-600" : ""}
								>
									{copied ? (
										<>
											<Check className="h-4 w-4 mr-1" /> 
											<span>Đã copy</span>
										</>
									) : (
										<>
											<Copy className="h-4 w-4 mr-1" /> 
											<span>Copy</span>
										</>
									)}
								</Button>
							</div>
						</CardContent>
					</Card>
					
					{/* Copy QR button */}
					<Button
						onClick={handleCopyPaymentInfo}
						className="mt-4 w-full flex items-center justify-center"
						variant={copyButtonSuccess ? "default" : "outline"}
					>
						{copyButtonSuccess ? (
							<>
								<Check className="h-4 w-4 mr-2" />
								<span>QR đã được copy</span>
							</>
						) : (
							<>
								<Copy className="h-4 w-4 mr-2" />
								<span>Copy QR và thông tin</span>
							</>
						)}
					</Button>
				</div>
			</div>
			
			{/* Bank Account Information Card */}
			<div className="flex flex-col space-y-4 sm:space-y-6">
				{/* Additional Instructions */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-lg">Hướng dẫn thanh toán</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
							<ol className="list-decimal list-inside space-y-2 text-blue-900 dark:text-blue-100 text-sm sm:text-base">
								<li>Nhập số tiền cần thanh toán</li>
								<li>Quét mã QR bằng ứng dụng ngân hàng của bạn</li>
								<li>Hoặc sao chép số tài khoản và chuyển khoản trực tiếp</li>
								<li>Giữ lại biên lai thanh toán</li>
							</ol>
						</div>
					</CardContent>
				</Card>
				
				{/* Marketing Message */}
				<Card>
					<CardContent className="p-4 sm:p-6">
						<div className="flex flex-col items-center text-center gap-2 sm:gap-3">
							<div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
								<Check className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
							</div>
							<h3 className="text-lg sm:text-xl font-semibold">Thanh toán bảo mật</h3>
							<p className="text-muted-foreground text-sm sm:text-base">
								Mọi giao dịch đều được bảo mật và xử lý nhanh chóng. Sau khi thanh toán, dịch vụ sẽ được kích hoạt trong thời gian nhanh nhất.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
