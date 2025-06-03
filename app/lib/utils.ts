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