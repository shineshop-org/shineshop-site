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

	// Sync with server (backup to prevent data loss)
	syncDataToServer: () => void
}

export const useStore = create<StoreState>()(
	persist(
		(set, get) => ({
			// Language
			language: 'vi',
			setLanguage: (language) => set({ language }),
			
			// Theme
			theme: 'light',
			setTheme: (theme) => set({ theme }),
			
			// Products
			products: initialProducts,
			setProducts: (products) => set({ products }),
			addProduct: (product) => {
				set((state) => ({ products: [...state.products, product] }))
				// Try to sync after changes
				setTimeout(() => get().syncDataToServer(), 500)
			},
			updateProduct: (id, product) => {
				set((state) => ({
					products: state.products.map((p) => p.id === id ? { ...p, ...product } : p)
				}))
				// Try to sync after changes
				setTimeout(() => get().syncDataToServer(), 500)
			},
			deleteProduct: (id) => {
				set((state) => ({
					products: state.products.filter((p) => p.id !== id)
				}))
				// Try to sync after changes
				setTimeout(() => get().syncDataToServer(), 500)
			},
			
			// FAQ Articles
			faqArticles: initialFAQArticles,
			setFaqArticles: (articles) => set({ faqArticles: articles }),
			addFaqArticle: (article) => {
				set((state) => ({ faqArticles: [...state.faqArticles, article] }))
				// Try to sync after changes
				setTimeout(() => get().syncDataToServer(), 500)
			},
			updateFaqArticle: (id, article) => {
				set((state) => ({
					faqArticles: state.faqArticles.map((a) => a.id === id ? { ...a, ...article } : a)
				}))
				// Try to sync after changes
				setTimeout(() => get().syncDataToServer(), 500)
			},
			deleteFaqArticle: (id) => {
				set((state) => ({
					faqArticles: state.faqArticles.filter((a) => a.id !== id)
				}))
				// Try to sync after changes
				setTimeout(() => get().syncDataToServer(), 500)
			},
			
			// Social Links
			socialLinks: initialSocialLinks,
			setSocialLinks: (links) => set({ socialLinks: links }),
			updateSocialLink: (id, link) => set((state) => ({
				socialLinks: state.socialLinks.map((l) => l.id === id ? { ...l, ...link } : l)
			})),
			
			// Payment Info
			paymentInfo: {
				bankName: 'Techcombank - Ngân hàng TMCP Kỹ thương Việt Nam',
				accountNumber: 'MS00T09331707449347',
				accountName: 'SHINE SHOP',
				qrTemplate: 'compact',
				wiseEmail: 'payment@shineshop.org',
				paypalEmail: 'paypal@shineshop.org'
			},
			setPaymentInfo: (info) => set({ paymentInfo: info }),
			
			// Site Config
			siteConfig: {
				heroTitle: 'Welcome to Shine Shop',
				heroQuote: 'Your trusted online shopping destination',
				contactLinks: {
					facebook: 'https://facebook.com/shineshop',
					whatsapp: 'https://wa.me/84123456789'
				}
			},
			setSiteConfig: (config) => set({ siteConfig: config }),
			
			// TOS
			tosContent: '',
			setTosContent: (content) => set({ tosContent: content }),
			
			// Admin
			isAdminAuthenticated: false,
			setAdminAuthenticated: (authenticated) => set({ isAdminAuthenticated: authenticated }),

			// Sync data to server 
			syncDataToServer: () => {
				try {
					// We're just making sure data is properly saved to localStorage
					// In a real implementation, this could call an API endpoint
					const state = get()
					
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
					
					// Update the main localStorage storage
					localStorage.setItem('shineshop-storage-v3', JSON.stringify(stateToSave))
					
					// Also update the backup storage
					localStorage.setItem('shineshop-backup', JSON.stringify({
						...stateToSave,
						timestamp: new Date().toISOString()
					}))
					
					// Force a storage event for cross-tab communication
					// This helps synchronize changes across tabs
					window.dispatchEvent(new StorageEvent('storage', {
						key: 'shineshop-storage-v3',
						newValue: JSON.stringify(stateToSave)
					}))
				} catch (error) {
					console.error('Failed to sync data:', error)
				}
			}
		}),
		{
			name: 'shineshop-storage-v3', // Updated version to avoid conflicts
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
		}
	)
) 