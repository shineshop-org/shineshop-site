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
	localizedCategory?: {
		en: string
		vi: string
	}
	options?: ProductOption[]
	relatedArticles?: string[]
	slug: string
	sortOrder: number
	isLocalized?: boolean
	tags?: string[]
}

export interface ProductOption {
	id: string
	name: string
	localizedName?: {
		en: string
		vi: string
	}
	type: 'select' | 'radio'
	values: OptionValue[]
}

export interface OptionValue {
	value: string
	localizedValue?: {
		en: string
		vi: string
	}
	price: number
	localizedPrice?: {
		en: number
		vi: number
	}
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
	// Gradient titles that can be edited from the admin dashboard
	gradientTitles?: {
		home?: string
		products?: string
		about?: string
		contact?: string
		faq?: string
	}
	// Small titles/subtitles that can be edited from the admin dashboard
	smallTitles?: {
		home?: string
		products?: string
		about?: string
		contact?: string
		faq?: string
	}
	// Additional site configuration settings
	seo?: {
		title?: string
		description?: string
		keywords?: string[]
	}
	// Theme settings
	theme?: {
		primaryColor?: string
		secondaryColor?: string
		accentColor?: string
	}
	// Custom CSS classes
	customClasses?: {
		[key: string]: string
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