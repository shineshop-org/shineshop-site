export interface Product {
	id: string
	name: string
	localizedName?: {
		en: string
		vi: string
	}
	price: number
	description: string
	localizedDescription?: {
		en: string
		vi: string
	}
	image: string
	category: string
	options?: ProductOption[]
	relatedArticles?: string[]
	slug: string
	sortOrder: number
	isLocalized?: boolean
}

export interface ProductOption {
	id: string
	name: string
	type: 'select' | 'radio'
	values: OptionValue[]
}

export interface OptionValue {
	value: string
	price: number
	description: string
}

export interface FAQArticle {
	id: string
	title: string
	content: string
	category: string
	slug: string
	createdAt: Date
	updatedAt: Date
	tags: string[]
	isLocalized?: boolean
	localizedTitle?: {
		en: string
		vi: string
	}
	localizedContent?: {
		en: string
		vi: string
	}
}

export interface SocialLink {
	id: string
	platform: string
	url: string
	icon: string
}

export interface PaymentInfo {
	bankName: string
	accountNumber: string
	accountName: string
	qrTemplate: string
	wiseEmail: string
	paypalEmail: string
}

export interface SiteConfig {
	heroTitle: string
	heroQuote: string
	contactLinks: {
		facebook: string
		whatsapp: string
	}
}

export interface AdminUser {
	username: string
	hashedPassword: string
}

export type Language = 'en' | 'vi'

export interface Translations {
	[key: string]: {
		en: string
		vi: string
	}
} 