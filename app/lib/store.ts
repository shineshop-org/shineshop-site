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

export const useStore = create<StoreState>()(
	persist(
		(set, get) => ({
			// Language
			language: initialLanguage || 'vi',
			setLanguage: (language) => {
				set({ language })
				get().syncDataToServer()
			},
			
			// Theme
			theme: initialTheme || 'light',
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
					
					if (!isDevelopment) {
						// In production, just mark as initialized and use static data
						set({ isInitialized: true })
						return {
							products: initialProducts,
							faqArticles: initialFAQArticles,
							socialLinks: initialSocialLinks,
							language: initialLanguage,
							theme: initialTheme,
							paymentInfo: initialPaymentInfo,
							siteConfig: initialSiteConfig,
							tosContent: initialTOSContent,
							dataVersion: CURRENT_DATA_VERSION
						}
					}
					
					const data = await loadFromServer()
					// Strict data requirement - no fallbacks
					set({
						products: data.products,
						faqArticles: data.faqArticles,
						socialLinks: data.socialLinks,
						language: data.language,
						theme: data.theme,
						paymentInfo: data.paymentInfo,
						siteConfig: data.siteConfig,
						tosContent: data.tosContent,
						isInitialized: true,
						dataVersion: CURRENT_DATA_VERSION
					})
					return data
				} catch (error) {
					console.error('Failed to load data from server, using local storage data', error)
					
					// In case of error, ensure we're still initialized with static data
					set({ 
						isInitialized: true,
						products: initialProducts,
						faqArticles: initialFAQArticles,
						socialLinks: initialSocialLinks,
						language: initialLanguage || 'vi',
						theme: initialTheme || 'light',
						paymentInfo: initialPaymentInfo,
						siteConfig: initialSiteConfig,
						tosContent: initialTOSContent
					})
					
					throw error
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
					
					// Removed automatic update-file functionality to prevent reloads
					// The developer can manually update initial-data.ts when needed
					
					// Update data version after successful save
					set({ dataVersion: CURRENT_DATA_VERSION })
				} catch (error) {
					console.error('Error syncing data to server:', error)
					throw error
				}
			}
		}),
		{
			name: 'shineshop-storage-v3',
			storage: createJSONStorage(() => localStorage),
			onRehydrateStorage: () => (state) => {
				// Kiểm tra phiên bản dữ liệu khi khôi phục từ localStorage
				if (state) {
					// Nếu phiên bản dữ liệu trong localStorage khác với phiên bản hiện tại
					// hoặc không có phiên bản (dữ liệu cũ), làm mới dữ liệu
					if (!state.dataVersion || state.dataVersion !== CURRENT_DATA_VERSION) {
						console.log('Data version mismatch, resetting to initial data...');
						// Cập nhật state với dữ liệu mới từ initial-data.ts
						state.products = initialProducts;
						state.faqArticles = initialFAQArticles;
						state.socialLinks = initialSocialLinks;
						state.siteConfig = initialSiteConfig;
						state.tosContent = initialTOSContent;
						state.language = initialLanguage || 'vi';
						state.theme = initialTheme || 'light';
						state.paymentInfo = initialPaymentInfo;
						state.dataVersion = CURRENT_DATA_VERSION;
						
						// Lưu trạng thái mới ngay lập tức
						try {
							localStorage.setItem('shineshop-storage-v3', JSON.stringify({
								state: {
									products: initialProducts,
									faqArticles: initialFAQArticles,
									socialLinks: initialSocialLinks,
									language: initialLanguage || 'vi',
									theme: initialTheme || 'light',
									paymentInfo: initialPaymentInfo,
									siteConfig: initialSiteConfig,
									tosContent: initialTOSContent,
									dataVersion: CURRENT_DATA_VERSION
								}
							}));
						} catch (error) {
							console.error('Failed to update localStorage with new version', error);
						}
					}
					
					// Only sync data with the server if needed, and add a way to prevent loops
					// Avoid auto-sync when just loading the page to prevent infinite loops
					let shouldSync = true;
					
					try {
						const lastSyncTime = sessionStorage.getItem('last-data-sync-time');
						const currentTime = Date.now();
						
						// Only sync if it's been more than 5 seconds since the last sync
						// This prevents rapid sync loops while still allowing intentional data changes to sync
						if (lastSyncTime && (currentTime - parseInt(lastSyncTime)) <= 5000) {
							shouldSync = false;
						} else {
							sessionStorage.setItem('last-data-sync-time', currentTime.toString());
						}
					} catch (err) {
						// Fallback if sessionStorage is not available (SSR or cookies disabled)
						console.warn('SessionStorage not available, using limited sync prevention');
						// Continue with sync, but at least we tried to throttle
					}
					
					// Only try to sync in development mode
					const isDevelopment = process.env.NODE_ENV === 'development';
					if (shouldSync && isDevelopment) {
						state.syncDataToServer().catch(error => {
							console.error('Auto-sync failed:', error);
						});
					}
				}
			}
		}
	)
) 