import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Language, Product, FAQArticle, SocialLink, PaymentInfo, SiteConfig } from './types'
import { initialProducts, initialFAQArticles, initialSocialLinks } from './initial-data'

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

export const useStore = create<StoreState>()(
	persist(
		(set, get) => ({
			// Language
			language: 'vi',
			setLanguage: (language) => {
				set({ language })
				get().syncDataToServer()
			},
			
			// Theme
			theme: 'light',
			setTheme: (theme) => {
				set({ theme })
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
			paymentInfo: {
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
			siteConfig: {
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
			tosContent: '',
			setTosContent: (content) => {
				set({ tosContent: content })
				get().syncDataToServer()
			},
			
			// Admin
			isAdminAuthenticated: false,
			setAdminAuthenticated: (authenticated) => set({ isAdminAuthenticated: authenticated }),

			// Flag to track if data is loaded from server
			isInitialized: false,

			// Load data from server
			loadDataFromServer: async () => {
				try {
					const data = await loadFromServer()
					// Strict data requirement - no fallbacks
					set({
						products: data.products,
						faqArticles: data.faqArticles,
						socialLinks: data.socialLinks,
						paymentInfo: data.paymentInfo,
						siteConfig: data.siteConfig,
						tosContent: data.tosContent,
						language: data.language,
						theme: data.theme,
						isInitialized: true
					})
				} catch (error) {
					console.error('Failed to load data from server:', error)
					// Don't set initialized flag on error to prevent further operations
					throw error
				}
			},

			// Sync data to server 
			syncDataToServer: async () => {
				try {
					const state = get()
					
					// Only sync if initialized to avoid overwriting server data on initial load
					if (!state.isInitialized) {
						return
					}
					
					// Create a consistent state object
					const stateToSave = {
						language: state.language,
						theme: state.theme,
						products: state.products,
						faqArticles: state.faqArticles,
						socialLinks: state.socialLinks,
						paymentInfo: state.paymentInfo,
						siteConfig: state.siteConfig,
						tosContent: state.tosContent,
					}
					
					// Save to server only - no localStorage fallback
					await saveToServer(stateToSave)
				} catch (error) {
					console.error('Failed to sync data to server:', error)
					throw error // Re-throw error instead of silently failing
				}
			}
		}),
		{
			name: 'shineshop-storage-v3',
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				language: state.language,
				theme: state.theme,
				products: state.products,
				faqArticles: state.faqArticles,
				socialLinks: state.socialLinks,
				paymentInfo: state.paymentInfo,
				siteConfig: state.siteConfig,
				tosContent: state.tosContent,
			}),
			onRehydrateStorage: () => (state) => {
				// Load data from server after rehydration
				if (state && !state.isInitialized) {
					state.loadDataFromServer()
				}
			}
		}
	)
) 