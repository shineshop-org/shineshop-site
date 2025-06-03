import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function formatPrice(price: number, locale = 'vi-VN'): string {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: 'VND',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(price)
}

export function generateSlug(text: string): string {
	return text
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)+/g, '')
}

export function formatNumberWithThousandsSeparator(number: number): string {
	return new Intl.NumberFormat('vi-VN').format(number)
}

// Copy to clipboard helper
export async function copyToClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text)
		return true
	} catch {
		// Fallback for older browsers
		try {
			const textArea = document.createElement('textarea')
			textArea.value = text
			document.body.appendChild(textArea)
			textArea.select()
			document.execCommand('copy')
			document.body.removeChild(textArea)
			return true
		} catch {
			return false
		}
	}
} 