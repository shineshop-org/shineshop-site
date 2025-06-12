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
	
	// TOS - readonly
	tosContent: string
	
	// Admin
	isAdminAuthenticated: boolean
	setAdminAuthenticated: (authenticated: boolean) => void

	// Sync with server
	syncDataToServer: () => Promise<void>
	loadDataFromServer: () => Promise<void>
	isInitialized: boolean
	
	// Phiên bản dữ liệu
	dataVersion: number
	
	// Sync error state
	syncError: boolean
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

		// Use a non-navigating fetch approach to prevent page transitions
		const controller = new AbortController();
		const timeoutId = setTimeout(() => {
			try {
				controller.abort('Timeout exceeded');
			} catch (e) {
				console.warn('Error aborting fetch:', e);
			}
		}, 8000); // Increased from 5 to 8 seconds for more reliability
		
		const response = await fetch('/api/store-data', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
			signal: controller.signal,
			// Add cache: 'no-store' to prevent caching issues
			cache: 'no-store',
		})
		
		clearTimeout(timeoutId);
		
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
		// Improve error logging for aborted requests
		if ((error as any).name === 'AbortError') {
			console.warn('Request was aborted (timeout):', error);
			return { success: false, error: 'Request timeout', aborted: true };
		}
		
		console.error('Error saving to server:', error)
		// Don't throw the error, just return a failure object
		return { success: false, error: (error as Error).message }
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

		// Use a non-navigating fetch approach
		const controller = new AbortController();
		const timeoutId = setTimeout(() => {
			try {
				controller.abort('Timeout exceeded');
			} catch (e) {
				console.warn('Error aborting fetch:', e);
			}
		}, 8000); // Increased from 5 to 8 seconds for more reliability
		
		const response = await fetch('/api/store-data', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			signal: controller.signal,
			// Add cache: 'no-store' to prevent caching issues
			cache: 'no-store',
		})
		
		clearTimeout(timeoutId);
		
		if (!response.ok) {
			// Check if it's 404 (API not found) or 501 (API not available in static mode)
			if (response.status === 404 || response.status === 501) {
				throw new Error('API endpoint not available')
			}
			throw new Error(`Failed to load data from server: ${response.status}`)
		}
		
		return await response.json()
	} catch (error) {
		// Improve error logging for aborted requests
		if ((error as any).name === 'AbortError') {
			console.warn('Request was aborted (timeout):', error);
			return { success: false, error: 'Request timeout', aborted: true };
		}
		
		console.error('Error loading from server:', error)
		// Don't throw the error, just return a failure object
		return { success: false, error: (error as Error).message }
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
	
	// Sync error state
	syncError: false,
	
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
	
	// TOS - readonly
	tosContent: initialTOSContent || '',
	
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
			// Skip in static builds
			if (typeof window === 'undefined') {
				return
			}
			
			// Only attempt to load from server in development mode
			const isDevelopment = process.env.NODE_ENV === 'development'
			if (!isDevelopment) {
				console.log('Running in production mode, skipping server data load')
				return
			}
			
			const response = await fetch('/api/store-data')
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}
			
			const data = await response.json()
			
			// Validate and set data if available
			if (data) {
				if (data.products && Array.isArray(data.products)) {
					set({ products: data.products })
				}
				
				if (data.faqArticles && Array.isArray(data.faqArticles)) {
					set({ faqArticles: data.faqArticles })
				}
				
				if (data.socialLinks && Array.isArray(data.socialLinks)) {
					set({ socialLinks: data.socialLinks })
				}
				
				if (data.paymentInfo) {
					set({ paymentInfo: data.paymentInfo })
				}
				
				if (data.siteConfig) {
					set({ siteConfig: data.siteConfig })
				}
				
				if (data.language) {
					set({ language: data.language })
				}
				
				if (data.theme) {
					set({ theme: data.theme as 'light' | 'dark' })
				}
				
				set({ dataVersion: data.dataVersion || 1 })
				
				// Mark as initialized
				set({ isInitialized: true })
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
		}
	},
	
	// Save data to server
	syncDataToServer: async () => {
		try {
			// Skip if no window (server-side rendering)
			if (typeof window === 'undefined') {
				return;
			}
			
			// Check for an existing debounce timer
			if ((window as any)._syncDataTimeout) {
				// Don't create multiple syncs, just use the existing one
				console.log('Sync already scheduled, skipping redundant sync');
				return;
			}
			
			// Get the current state to preserve it in case of hot-reload
			const currentState = get();
			
			// Preserve current products in localStorage before sync
			try {
				localStorage.setItem('shineshop-products-backup', 
					JSON.stringify(currentState.products));
			} catch (e) {
				console.error('Failed to backup products to localStorage', e);
			}
			
			// Setup a safe sync with debounce
			(window as any)._syncDataTimeout = setTimeout(async () => {
				try {
					// Set a flag to block navigation during sync
					(window as any).__preventAdminNavigation = true;
					
					const state = get();
					
					// Create data object with current data
					const data = {
						products: state.products,
						faqArticles: state.faqArticles,
						socialLinks: state.socialLinks,
						language: state.language,
						theme: state.theme,
						paymentInfo: state.paymentInfo,
						siteConfig: state.siteConfig,
						dataVersion: CURRENT_DATA_VERSION
					};
					
					// Only attempt to save to server in development mode
					const isDevelopment = process.env.NODE_ENV === 'development';
					if (!isDevelopment) {
						console.log('Running in production mode, skipping server sync');
						return;
					}
					
					// Use a controlled API call that won't trigger navigation
					try {
						// Add cache busting to prevent browser caching issues
						const cacheBuster = `?_t=${Date.now()}`;
						
						// Check if we're in the admin dashboard
						const isInAdmin = typeof window !== 'undefined' && 
							window.location.pathname.includes('/admin/dashboard');
						
						// Use a non-navigating fetch with explicit no-cache settings
						const controller = new AbortController();
						const timeoutId = setTimeout(() => {
							try {
								controller.abort('Timeout exceeded');
							} catch (e) {
								console.warn('Error aborting fetch:', e);
							}
						}, 8000); // Increased timeout from 5 to 8 seconds
						
						// Create a custom header to signal this is an admin-initiated request
						const headers = {
							'Content-Type': 'application/json',
							'Cache-Control': 'no-cache, no-store, must-revalidate',
							'Pragma': 'no-cache',
							'Expires': '0'
						};
						
						// Add a special header if we're in admin
						if (isInAdmin) {
							Object.assign(headers, {
								'X-Admin-Request': 'true',
								'X-Prevent-Redirect': 'true'
							});
						}
						
						const response = await fetch(`/api/store-data${cacheBuster}`, {
							method: 'POST',
							headers,
							body: JSON.stringify(data),
							signal: controller.signal,
							cache: 'no-store',
							// Crucial: prevent redirect
							redirect: 'error'
						});
						
						clearTimeout(timeoutId);
						
						// Only parse JSON if we need to - skip otherwise
						if (response.ok) {
							// Update data version after successful save
							set({ dataVersion: CURRENT_DATA_VERSION });
							console.log('Data synced successfully');
							
							// Mark sync time to help recover from hot reloads
							if (typeof window !== 'undefined') {
								(window as any).__lastSyncTime = Date.now();
							}
						} else {
							console.error('Error syncing data, status:', response.status);
						}
					} catch (fetchError) {
						// If this is an AbortError, it's likely just a timeout
						if ((fetchError as any).name === 'AbortError') {
							console.warn('Sync request timed out, but may have completed');
							// Don't treat timeouts as fatal errors
							set({ syncError: false });
						} else {
							console.error('Fetch error during sync:', fetchError);
							set({ syncError: true });
						}
						// Intentionally not re-throwing to prevent navigation
					}
				} catch (syncError) {
					console.error('Error during sync preparation:', syncError);
					// Intentionally not re-throwing to prevent navigation
				} finally {
					// Always clean up
					delete (window as any)._syncDataTimeout;
					
					// Keep navigation prevention for a bit longer to ensure recompiles don't trigger navigation
					setTimeout(() => {
						delete (window as any).__preventAdminNavigation;
					}, 3000);
				}
			}, 1000); // Longer debounce of 1 second
			
			// Return a resolved promise
			return Promise.resolve();
		} catch (error) {
			console.error('Error in syncDataToServer:', error);
			// Don't throw error, just log
			return Promise.resolve();
		}
	}
})) 