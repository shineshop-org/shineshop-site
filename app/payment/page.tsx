'use client'

import React, { useEffect } from 'react'
import { useStore } from '@/app/lib/store'
import { useTranslation } from '@/app/hooks/use-translations'
import { VietQRPayment } from '@/app/components/ui/viet-qr-payment'
import { setPageTitle } from '@/app/lib/utils'

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

	// Set page title on component mount
	useEffect(() => {
		setPageTitle('Payment')
	}, [])

	return (
		<div className="max-w-6xl mx-auto py-8 page-transition">
			<div className="text-center mb-8">
				<h1 className="text-4xl font-bold jshine-gradient">{t('payment')}</h1>
			</div>
			
			{/* VietQR Payment */}
			<div className="px-2 sm:px-0">
				<VietQRPayment
					accountNumber={paymentInfo.accountNumber}
					bankName={paymentInfo.bankName}
					accountName={paymentInfo.accountName}
				/>
			</div>
		</div>
	)
} 