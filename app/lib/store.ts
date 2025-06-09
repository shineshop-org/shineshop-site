import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Language, Product, FAQArticle, SocialLink, PaymentInfo, SiteConfig } from './types'
import { 
	initialProducts, 
	initialFAQArticles, 
	initialSocialLinks, 
	initialTOSContent,
	initialSiteConfig,
	initialPaymentInfo,
	initialLanguage,
	initialTheme,
	dataVersion 
} from './initial-data'
import { setLanguagePreference, setThemePreference, getLanguagePreference, getThemePreference } from './cookies'

// Lưu trữ phiên bản hiện tại của dữ liệu
const CURRENT_DATA_VERSION = dataVersion

interface StoreState {
	// Language
	language: Language
	setLanguage: (language: Language) => void
	
	// Theme
	theme: 'light' | 'dark'
	setTheme: (theme: 'light' | 'dark') => void
	
	// Products
	products: Product[]
	setProducts: (products: Product[]) => void
	addProduct: (product: Product) => void
	updateProduct: (id: string, product: Partial<Product>) => void
	deleteProduct: (id: string) => void
	
	// FAQ Articles
	faqArticles: FAQArticle[]
	setFaqArticles: (articles: FAQArticle[]) => void
	addFaqArticle: (article: FAQArticle) => void
	updateFaqArticle: (id: string, article: Partial<FAQArticle>) => void
	deleteFaqArticle: (id: string) => void
	
	// Social Links
	socialLinks: SocialLink[]
	setSocialLinks: (links: SocialLink[]) => void
	updateSocialLink: (id: string, link: Partial<SocialLink>) => void
	
	// Payment Info
	paymentInfo: PaymentInfo
	setPaymentInfo: (info: PaymentInfo) => void
	
	// Site Config
	siteConfig: SiteConfig
	setSiteConfig: (config: SiteConfig) => void
	
	// TOS
	tosContent: string
	setTosContent: (content: string) => void
	
	// Admin
	isAdminAuthenticated: boolean
	setAdminAuthenticated: (authenticated: boolean) => void

	// Sync with server
	syncDataToServer: () => Promise<void>
	loadDataFromServer: () => Promise<void>
	isInitialized: boolean
	
	// Phiên bản dữ liệu
	dataVersion: number
}

// Helper function to save data to server
async function saveToServer(data: any) {
	try {
		// Check if we're in development mode where API routes are available
		const isDevelopment = process.env.NODE_ENV === 'development'
		
		// Only allow API calls in development mode for strict accuracy
		if (!isDevelopment) {
			throw new Error('API not available in production static export mode')
		}

		const response = await fetch('/api/store-data', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		})
		
		if (response.status === 404 || response.status === 501) {
			throw new Error('API endpoint not available')
		}

		if (!response.ok) {
			if (response.status === 200) {
				return { success: true }
			}
			throw new Error(`Failed to save data to server: ${response.status}`)
		}
		
		return await response.json()
	} catch (error) {
		console.error('Error saving to server:', error)
		throw error // Re-throw error instead of falling back
	}
}

// Helper function to load data from server
async function loadFromServer() {
	try {
		// Check if we're in development mode where API routes are available
		const isDevelopment = process.env.NODE_ENV === 'development'
		
		// Only allow API calls in development mode for strict accuracy
		if (!isDevelopment) {
			throw new Error('API not available in production static export mode')
		}

		const response = await fetch('/api/store-data', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		})
		
		if (!response.ok) {
			// Check if it's 404 (API not found) or 501 (API not available in static mode)
			if (response.status === 404 || response.status === 501) {
				throw new Error('API endpoint not available')
			}
			throw new Error(`Failed to load data from server: ${response.status}`)
		}
		
		return await response.json()
	} catch (error) {
		console.error('Error loading from server:', error)
		throw error // Re-throw error instead of falling back
	}
}

// Helper function to detect user's system theme preference
function getSystemThemePreference(): 'light' | 'dark' {
	if (typeof window !== 'undefined') {
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
	}
	return initialTheme || 'light'
}

// Always default to Vietnamese
function getDefaultLanguage(): Language {
	return initialLanguage || 'vi'
}

export const useStore = create<StoreState>()((set, get) => ({
	// Language - always default to Vietnamese
	language: initialLanguage || 'vi',
	setLanguage: (language) => {
		// Update state
		set({ language })
		
		// Save language preference to cookie with higher priority
		if (typeof window !== 'undefined') {
			try {
				setLanguagePreference(language)
				console.log(`Language preference set to: ${language}`)
			} catch (e) {
				console.error('Error setting language cookie:', e)
			}
		}
		
		get().syncDataToServer()
	},
	
	// Theme
	theme: initialTheme || 'light',
	setTheme: (theme) => {
		// Update state
		set({ theme })
		
		// Save theme preference to cookie
		if (typeof window !== 'undefined') {
			try {
				setThemePreference(theme)
				
				// Dispatch event for theme change listeners
				document.dispatchEvent(new CustomEvent('themeChange', { 
					detail: { theme } 
				}))
			} catch (e) {
				console.error('Error setting theme cookie:', e)
			}
		}
		
		get().syncDataToServer()
	},
	
	// Products
	products: initialProducts,
	setProducts: (products) => {
		set({ products })
		get().syncDataToServer()
	},
	addProduct: (product) => {
		set((state) => ({ products: [...state.products, product] }))
		get().syncDataToServer()
	},
	updateProduct: (id, product) => {
		set((state) => ({
			products: state.products.map((p) => p.id === id ? { ...p, ...product } : p)
		}))
		get().syncDataToServer()
	},
	deleteProduct: (id) => {
		set((state) => ({
			products: state.products.filter((p) => p.id !== id)
		}))
		get().syncDataToServer()
	},
	
	// FAQ Articles
	faqArticles: initialFAQArticles,
	setFaqArticles: (articles) => {
		set({ faqArticles: articles })
		get().syncDataToServer()
	},
	addFaqArticle: (article) => {
		set((state) => ({ faqArticles: [...state.faqArticles, article] }))
		get().syncDataToServer()
	},
	updateFaqArticle: (id, article) => {
		set((state) => ({
			faqArticles: state.faqArticles.map((a) => a.id === id ? { ...a, ...article } : a)
		}))
		get().syncDataToServer()
	},
	deleteFaqArticle: (id) => {
		set((state) => ({
			faqArticles: state.faqArticles.filter((a) => a.id !== id)
		}))
		get().syncDataToServer()
	},
	
	// Social Links
	socialLinks: initialSocialLinks,
	setSocialLinks: (links) => {
		set({ socialLinks: links })
		get().syncDataToServer()
	},
	updateSocialLink: (id, link) => {
		set((state) => ({
			socialLinks: state.socialLinks.map((l) => l.id === id ? { ...l, ...link } : l)
		}))
		get().syncDataToServer()
	},
	
	// Payment Info
	paymentInfo: initialPaymentInfo || {
		bankName: 'Techcombank - Ngân hàng TMCP Kỹ thương Việt Nam',
		accountNumber: 'MS00T09331707449347',
		accountName: 'SHINE SHOP',
		qrTemplate: 'compact',
		wiseEmail: 'payment@shineshop.org',
		paypalEmail: 'paypal@shineshop.org'
	},
	setPaymentInfo: (info) => {
		set({ paymentInfo: info })
		get().syncDataToServer()
	},
	
	// Site Config
	siteConfig: initialSiteConfig || {
		heroTitle: 'Welcome to Shine Shop',
		heroQuote: 'Your trusted online shopping destination',
		contactLinks: {
			facebook: 'https://facebook.com/shineshop',
			whatsapp: 'https://wa.me/84123456789'
		}
	},
	setSiteConfig: (config) => {
		set({ siteConfig: config })
		get().syncDataToServer()
	},
	
	// TOS
	tosContent: initialTOSContent || '',
	setTosContent: (content) => {
		set({ tosContent: content })
		get().syncDataToServer()
	},
	
	// Admin
	isAdminAuthenticated: false,
	setAdminAuthenticated: (authenticated) => set({ isAdminAuthenticated: authenticated }),

	// Flag to track if data is loaded from server
	isInitialized: false,
	
	// Version dữ liệu
	dataVersion: CURRENT_DATA_VERSION,

	// Load data from server
	loadDataFromServer: async () => {
		try {
			// Only attempt to load from server in development mode
			const isDevelopment = process.env.NODE_ENV === 'development'
			
			// Set theme based on system preference
			const systemTheme = getSystemThemePreference()
			
			// Always default to Vietnamese
			const defaultLanguage = getDefaultLanguage()
			
			if (!isDevelopment) {
				// In production, just mark as initialized and use static data with detected preferences
				set({ 
					isInitialized: true,
					products: initialProducts,
					faqArticles: initialFAQArticles,
					socialLinks: initialSocialLinks,
					language: defaultLanguage,
					theme: systemTheme,
					paymentInfo: initialPaymentInfo,
					siteConfig: initialSiteConfig,
					tosContent: initialTOSContent,
					dataVersion: CURRENT_DATA_VERSION
				})
				return {
					products: initialProducts,
					faqArticles: initialFAQArticles,
					socialLinks: initialSocialLinks,
					language: defaultLanguage,
					theme: systemTheme,
					paymentInfo: initialPaymentInfo,
					siteConfig: initialSiteConfig,
					tosContent: initialTOSContent,
					dataVersion: CURRENT_DATA_VERSION
				}
			}
			
			try {
				const data = await loadFromServer()
				// Strict data requirement - no fallbacks
				set({
					products: data.products,
					faqArticles: data.faqArticles,
					socialLinks: data.socialLinks,
					language: defaultLanguage,
					theme: systemTheme,
					paymentInfo: data.paymentInfo,
					siteConfig: data.siteConfig,
					tosContent: data.tosContent,
					isInitialized: true,
					dataVersion: CURRENT_DATA_VERSION
				})
				return data
			} catch (serverError) {
				console.error('Failed to load data from server, using static data', serverError)
				
				// In case of error, ensure we're still initialized with static data and detected preferences
				set({ 
					isInitialized: true,
					products: initialProducts,
					faqArticles: initialFAQArticles,
					socialLinks: initialSocialLinks,
					language: defaultLanguage,
					theme: systemTheme,
					paymentInfo: initialPaymentInfo,
					siteConfig: initialSiteConfig,
					tosContent: initialTOSContent,
					dataVersion: CURRENT_DATA_VERSION
				})
				
				// Don't throw the error, just return static data
				return {
					products: initialProducts,
					faqArticles: initialFAQArticles,
					socialLinks: initialSocialLinks,
					language: defaultLanguage,
					theme: systemTheme,
					paymentInfo: initialPaymentInfo,
					siteConfig: initialSiteConfig,
					tosContent: initialTOSContent,
					dataVersion: CURRENT_DATA_VERSION
				}
			}
		} catch (error) {
			console.error('Failed to load data, using static data', error)
			
			// Set theme based on system preference - fallback
			let systemTheme: 'light' | 'dark' = 'light'
			try {
				systemTheme = getSystemThemePreference()
			} catch (e) {
				console.error('Error getting theme preference, using default', e)
			}
			
			// In case of error, ensure we're still initialized with static data
			set({ 
				isInitialized: true,
				products: initialProducts,
				faqArticles: initialFAQArticles,
				socialLinks: initialSocialLinks,
				language: initialLanguage || 'vi',
				theme: systemTheme,
				paymentInfo: initialPaymentInfo,
				siteConfig: initialSiteConfig,
				tosContent: initialTOSContent,
				dataVersion: CURRENT_DATA_VERSION
			})
			
			// Return static data instead of throwing
			return {
				products: initialProducts,
				faqArticles: initialFAQArticles,
				socialLinks: initialSocialLinks,
				language: initialLanguage || 'vi',
				theme: systemTheme,
				paymentInfo: initialPaymentInfo,
				siteConfig: initialSiteConfig,
				tosContent: initialTOSContent,
				dataVersion: CURRENT_DATA_VERSION
			}
		}
	},
	
	// Save data to server
	syncDataToServer: async () => {
		try {
			const state = get()
			
			// Create data object with current data
			const data = {
				products: state.products,
				faqArticles: state.faqArticles,
				socialLinks: state.socialLinks,
				language: state.language,
				theme: state.theme,
				paymentInfo: state.paymentInfo,
				siteConfig: state.siteConfig,
				tosContent: state.tosContent,
				dataVersion: CURRENT_DATA_VERSION
			}
			
			// Only attempt to save to server in development mode
			const isDevelopment = process.env.NODE_ENV === 'development'
			if (!isDevelopment) {
				console.log('Running in production mode, skipping server sync')
				return
			}
			
			// Save to server - this only updates store-data.json and does NOT trigger reloads
			await saveToServer(data)
			
			// Update data version after successful save
			set({ dataVersion: CURRENT_DATA_VERSION })
		} catch (error) {
			console.error('Error syncing data to server:', error)
			// Don't throw error, just log
		}
	}
})) 