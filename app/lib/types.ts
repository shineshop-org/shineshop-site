export interface Product {
	id: string
	name: string
	price: number
	description: string
	image: string
	category: string
	options?: ProductOption[]
	relatedArticles?: string[]
	slug: string
	sortOrder: number
}

export interface ProductOption {
	id: string
	name: string
	values: string[]
	type: 'select' | 'radio'
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