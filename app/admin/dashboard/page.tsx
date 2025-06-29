'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Trash2, Shield, LogOut, Plus, Home, LayoutGrid, FileText, ArrowDownWideNarrow, GripVertical, Globe, HelpCircle, Share2, Search, Image as ImageIcon, Bold, Italic, Link, List, Eye, EyeOff, Settings, Save } from 'lucide-react'
import { useStore } from '@/app/lib/store'
import { useTranslation } from '@/app/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/components/ui/dialog'
import { Product, FAQArticle, SocialLink, Language, ProductOption } from '@/app/lib/types'
import { generateSlug } from '@/app/lib/utils'
import { ADMIN_ACCESS_COOKIE } from '@/app/lib/auth'
import { Badge } from '@/app/components/ui/badge'
import { 
	DndContext, 
	closestCenter, 
	KeyboardSensor, 
	PointerSensor, 
	useSensor, 
	useSensors,
	DragEndEvent
} from '@dnd-kit/core'
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ErrorBoundary from '@/app/components/providers/error-boundary'

// Add the jshine-gradient CSS class as in the product page
const jshineGradientClassName = "text-[#0ea5e9]" // JShine color (sky blue)

type TabType = 'products' | 'faq' | 'settings'
type ProductTabType = 'details' | 'card-order'

// Sortable item component for drag and drop
function SortableProductItem({ product, getLowestPrice, formatPrice, language }: { 
	product: Product; 
	getLowestPrice: (product: Product) => number;
	formatPrice: (price: number | string, lang?: Language) => string;
	language: Language;
}) {
	const { t } = useTranslation()
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
	} = useSortable({ id: product.id })
	
	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	}
	
	// Get localized product name
	const productName = language === 'en' 
        ? (product.localizedName?.en || product.name)
        : (product.localizedName?.vi || product.name);
	
	// Function to get localized option name
	const getOptionName = (option: ProductOption) => {
		return option.localizedName && language === 'en' 
			? option.localizedName.en 
			: option.localizedName && language === 'vi'
				? option.localizedName.vi
				: option.name;
	}
	
	// Function to get localized option value
	const getOptionValue = (value: any) => {
		return value.localizedValue && language === 'en'
			? value.localizedValue.en
			: value.localizedValue && language === 'vi'
				? value.localizedValue.vi
				: value.value;
	}
	
	return (
		<div 
			ref={setNodeRef}
			style={style}
			className="flex items-center justify-between border p-3 rounded-md bg-background hover:bg-accent/50 cursor-grab active:cursor-grabbing"
		>
			<div className="flex items-center gap-3">
				<button
					className="touch-none h-8 w-8 flex items-center justify-center text-muted-foreground"
					{...attributes}
					{...listeners}
				>
					<GripVertical className="h-4 w-4" />
				</button>
				{product.image ? (
					<div 
						className="h-10 w-10 rounded bg-center bg-cover" 
						style={{ backgroundImage: `url(${product.image})` }}
					/>
				) : (
					<div className="h-10 w-10 rounded bg-muted/30 flex items-center justify-center">
						<div className="text-muted-foreground text-lg">📦</div>
					</div>
				)}
				<div className="flex-1">
					<p className="font-medium">{productName}</p>
					<div className="flex flex-col gap-1 mt-1">
						<div className="text-xs text-muted-foreground">
							<span className="font-medium">URL Slug: </span>{product.slug}
						</div>
						<div>
							{product.localizedCategory 
								? (language === 'en' ? product.localizedCategory.en : product.localizedCategory.vi) 
								: ''}
						</div>
						{product.tags && product.tags.length > 0 && (
							<div className="flex flex-wrap gap-1 mt-1">
								{product.tags.slice(0, 2).map(tag => (
									<Badge key={tag} variant="secondary" className="text-xs">
										{tag}
									</Badge>
								))}
								{product.tags.length > 2 && (
									<Badge variant="secondary" className="text-xs">
										+{product.tags.length - 2}
									</Badge>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
			<div className="flex-shrink-0">
				<p className="jshine-gradient font-semibold">
					{formatPrice(getLowestPrice(product), language)}
				</p>
			</div>
		</div>
	)
}

// Flag SVG Components
const VietnamFlag = (props: React.SVGProps<SVGSVGElement>) => (
	<svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
		<rect width="24" height="16" fill="#DA251D"/>
		<path d="M12 3L13.2 6.6H17L14 8.8L15.2 12.4L12 10.2L8.8 12.4L10 8.8L7 6.6H10.8L12 3Z" fill="#FFFF00"/>
	</svg>
)

const USFlag = (props: React.SVGProps<SVGSVGElement>) => (
	<svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
		<rect width="24" height="16" fill="#B22234"/>
		<rect y="1.23" width="24" height="1.23" fill="white"/>
		<rect y="3.69" width="24" height="1.23" fill="white"/>
		<rect y="6.15" width="24" height="1.23" fill="white"/>
		<rect y="8.62" width="24" height="1.23" fill="white"/>
		<rect y="11.08" width="24" height="1.23" fill="white"/>
		<rect y="13.54" width="24" height="1.23" fill="white"/>
		<rect width="9.6" height="8.62" fill="#3C3B6E"/>
	</svg>
)

// Box Icon for placeholder images
const BoxIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
		<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
		<path d="M7.5 4.21l4.5 2.6 4.5-2.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
		<path d="M7.5 19.79V14.6L3 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
		<path d="M21 12l-4.5 2.6v5.19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
		<path d="M12 2.5v9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
	</svg>
)

// Debounce hook for auto-save
function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value)

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value)
		}, delay)

		return () => {
			clearTimeout(handler)
		}
	}, [value, delay])

	return debouncedValue
}

// Markdown toolbar component for FAQ editor
function MarkdownToolbar({ onInsert }: { onInsert: (text: string) => void }) {
	return (
		<div className="flex items-center gap-1 p-1 border-b">
			<Button
				type="button"
				variant="ghost"
				size="sm"
				className="h-8 w-8 p-0"
				onClick={() => onInsert('**bold**')}
			>
				<Bold className="h-4 w-4" />
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				className="h-8 w-8 p-0"
				onClick={() => onInsert('*italic*')}
			>
				<Italic className="h-4 w-4" />
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				className="h-8 w-8 p-0 relative"
				onClick={() => onInsert('[link text](https://example.com)')}
				title="Insert Obsidian-style link: [text](url)"
			>
				<Link className="h-4 w-4" />
				<span className="absolute bottom-0 right-0 text-[8px] font-bold text-primary">Ob</span>
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				className="h-8 w-8 p-0"
				onClick={() => onInsert('- List item')}
			>
				<List className="h-4 w-4" />
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				className="h-8 w-8 p-0"
				onClick={() => onInsert('![alt text](image-url)')}
			>
				<ImageIcon className="h-4 w-4" />
			</Button>
			<div className="h-6 w-px bg-border mx-1" />
			<Button
				type="button"
				variant="ghost"
				size="sm"
				className="h-8 w-8 p-0"
				onClick={() => onInsert('# Heading 1')}
			>
				H1
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				className="h-8 w-8 p-0"
				onClick={() => onInsert('## Heading 2')}
			>
				H2
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				className="h-8 w-8 p-0"
				onClick={() => onInsert('### Heading 3')}
			>
				H3
			</Button>
		</div>
	)
}

export default function AdminDashboard() {
	// Extract state from store
	const { 
		products, 
		faqArticles, 
		language, 
		setLanguage,
		addProduct,
		updateProduct,
		deleteProduct,
		updateFaqArticle,
		setAdminAuthenticated,
		siteConfig,
		setSiteConfig,
		setFaqArticles
	} = useStore()
	
	// Router and Translation
	const router = useRouter()
	const { t } = useTranslation()
	
	// State variables
	const [isLoading, setIsLoading] = useState(true)
	const [isPublishing, setIsPublishing] = useState(false)
	const [publishSuccess, setPublishSuccess] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false)
	const [articleSearchQuery, setArticleSearchQuery] = useState('')
	const [faqForm, setFaqForm] = useState({ 
		id: '', 
		title: '', 
		slug: '', 
		content: '', 
		category: '', 
		tags: [] as string[],
		isLocalized: false,
		localizedTitle: { en: '', vi: '' },
		localizedContent: { en: '', vi: '' }
	})
	const [faqDialog, setFaqDialog] = useState(false)
	const [previewDialog, setPreviewDialog] = useState(false)
	const [editingFaq, setEditingFaq] = useState<FAQArticle | null>(null)
	const [showProductDescriptionPreview, setShowProductDescriptionPreview] = useState(false)
	const [showSavedNotification, setShowSavedNotification] = useState(false)
	const [showPublishNotification, setShowPublishNotification] = useState(false)
	
	// Tab state
	const [activeTab, setActiveTab] = useState<TabType>('products')
	const [productTab, setProductTab] = useState<ProductTabType>('details')
	
	// Product state
	const [productToDelete, setProductToDelete] = useState<Product | null>(null)
	const [editingProduct, setEditingProduct] = useState<Product | null>(null)
	const [productDialog, setProductDialog] = useState(false)
	const [selectedArticles, setSelectedArticles] = useState<string[]>([])
	const [sortedProducts, setSortedProducts] = useState<Product[]>([])
	const [priceInputValues, setPriceInputValues] = useState<Record<string, string>>({})
	
	// More state variables
	const isDevelopment = process.env.NODE_ENV === 'development'
	
	// Add a clientside-only flag to help with hydration
	const [isMounted, setIsMounted] = useState<boolean>(false)
	
	// Setup sensors for drag and drop
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
					distance: 8, // 8px movement required before drag starts
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	)
	
	// Setup navigation guard to prevent redirects to /store
	useEffect(() => {
		if (typeof window !== 'undefined') {
			// Mark component as mounted first
			setIsMounted(true);
			
			// Set a flag on window to mark this as an admin page
			(window as any).__isAdminPage = true;
			
			// Set strong admin cookies
			document.cookie = "adminAuthenticated=true; path=/; max-age=3600; SameSite=Strict";
			document.cookie = "admin_session=true; path=/; max-age=3600; SameSite=Strict";
			localStorage.setItem('adminSession', 'true');
			
			// Save original history methods
			const originalPushState = history.pushState;
			const originalReplaceState = history.replaceState;
			
			// Global event listener for popstate (browser back/forward)
			const handlePopState = (event: Event) => {
				const currentUrl = window.location.href;
				if (currentUrl.includes('/store')) {
					console.log('Blocked navigation to /store via popstate');
					// Force back to admin
					window.history.pushState(null, '', '/admin/dashboard');
				}
			};
			
			// Add popstate listener
			window.addEventListener('popstate', handlePopState);
			
			// Intercept pushState to prevent unwanted navigation
			history.pushState = function(data, unused, url) {
				// If this is a navigation to /store, block it
				if (url && typeof url === 'string' && url.includes('/store')) {
					console.log('Admin page: Blocked navigation to /store');
					// Force navigation back to admin dashboard
					return originalPushState.call(this, data, unused, '/admin/dashboard');
				}
				// Otherwise, allow navigation
				return originalPushState.apply(this, [data, unused, url]);
			};
			
			// Intercept replaceState to prevent unwanted navigation
			history.replaceState = function(data, unused, url) {
				// If this is a navigation to /store, block it
				if (url && typeof url === 'string' && url.includes('/store')) {
					console.log('Admin page: Blocked replace to /store');
					// Force navigation back to admin dashboard
					return originalReplaceState.call(this, data, unused, '/admin/dashboard');
				}
				// Otherwise, allow navigation
				return originalReplaceState.apply(this, [data, unused, url]);
			};
			
			// Intercept navigation through links
			const clickHandler = (e: MouseEvent) => {
				const target = e.target as HTMLElement;
				const link = target.closest('a');
				if (link && link.href && link.href.includes('/store')) {
					console.log('Blocked navigation to /store via link click');
					e.preventDefault();
					e.stopPropagation();
					return false;
				}
			};
			
			// Add click event listener to catch link clicks
			document.addEventListener('click', clickHandler, true);
			
			// Override fetch to add admin headers
			const originalFetch = window.fetch;
			window.fetch = function(input, init) {
				// Clone the init object to avoid modifying the original
				const newInit = init ? { ...init } : {};
				
				// Ensure headers object exists
				newInit.headers = newInit.headers || {};
				
				// Add admin headers to all fetch requests
				const headers = new Headers(newInit.headers as HeadersInit);
				headers.set('X-Admin-Request', 'true');
				headers.set('X-Prevent-Redirect', 'true');
				headers.set('X-Admin-Session', 'true');
				
				// Update headers in newInit
				newInit.headers = headers;
				
				// Call original fetch with updated init
				return originalFetch.call(this, input, newInit);
			};
			
			// Prevent form submissions that might navigate away
			const formSubmitHandler = (e: SubmitEvent) => {
				const form = e.target as HTMLFormElement;
				if (form && !form.hasAttribute('data-admin-form')) {
					// If this is not an explicitly marked admin form, prevent default
					// This helps catch any unexpected form submissions
					console.log('Blocked potential navigation-causing form submission');
					e.preventDefault();
					e.stopPropagation();
				}
			};
			
			// Listen for all form submissions
			document.addEventListener('submit', formSubmitHandler, true);
			
			// Detect and prevent page unloads when saving is in progress
			window.addEventListener('beforeunload', (e) => {
				// Check if we have a flag indicating we're in the middle of saving
				if (sessionStorage.getItem('prevent_navigation') === 'true') {
					console.log('Prevented page unload during save operation');
					e.preventDefault();
					// Standard way to show "are you sure" dialog
					e.returnValue = '';
					return '';
				}
			});
			
			// Cleanup on unmount
			return () => {
				// Restore original methods
				history.pushState = originalPushState;
				history.replaceState = originalReplaceState;
				window.fetch = originalFetch;
				
				// Remove event listeners
				window.removeEventListener('popstate', handlePopState);
				document.removeEventListener('click', clickHandler, true);
				document.removeEventListener('submit', formSubmitHandler, true);
				
				// Remove flag
				delete (window as any).__isAdminPage;
			};
		}
	}, []);
	
	// Update sortable products when products change
	useEffect(() => {
		if (products.length > 0) {
			// Sort products by sortOrder
			setSortedProducts([...products].sort((a, b) => a.sortOrder - b.sortOrder))
		}
	}, [products])
	
	// Handle hot-reload data recovery
	useEffect(() => {
		if (typeof window !== 'undefined') {
			// Check if we're recovering from a hot reload after saving
			if ((window as any).__lastSavedProductTime) {
				// If the save happened in the last 3 seconds, it was likely a hot reload
				const timeSinceSave = Date.now() - (window as any).__lastSavedProductTime;
				if (timeSinceSave < 3000) {
					try {
						// Get the last saved product from localStorage
						const savedProductJson = localStorage.getItem('last-saved-product');
						if (savedProductJson) {
							const savedProduct = JSON.parse(savedProductJson);
							console.log('Recovered product after hot reload:', savedProduct.name);
							
							// Find the product in the list and update the UI to show the changes
							const productExists = products.some(p => p.id === savedProduct.id);
							if (productExists) {
								// Make sure the changes are applied
								updateProduct(savedProduct.id, savedProduct);
							}
							
							// Clear the saved product to prevent repeated recovery
							localStorage.removeItem('last-saved-product');
						}
					} catch (e) {
						console.error('Error recovering product after hot reload:', e);
					}
					
					// Clear the timestamp
					delete (window as any).__lastSavedProductTime;
				} else if (timeSinceSave > 10000) {
					// If it's been more than 10 seconds, clean up
					delete (window as any).__lastSavedProductTime;
					localStorage.removeItem('last-saved-product');
				}
			}
		}
	}, []); // Only run on initial mount
	
	// Force sync with server after product changes to ensure latest data
	useEffect(() => {
		// We'll remove the auto-sync to prevent unexpected redirects
		// This was the main cause of the issue
		console.log('Product changes detected, but auto-sync is disabled to prevent unexpected redirects')
		
		// Instead of auto-syncing, we'll let the user manually save
	}, [products])
	
	// Product form state
	const [productForm, setProductForm] = useState({
		name: '',
		localizedName: { en: '', vi: '' },
			description: '',
			localizedDescription: { en: '', vi: '' },
			image: '',
			localizedCategory: { en: '', vi: '' },
			slug: '',
			options: [] as ProductOption[],
			relatedArticles: [] as string[],
			isLocalized: true,
			tags: [] as string[]
	})
	
	useEffect(() => {
		// Trong môi trường development, không cần kiểm tra xác thực
		if (isDevelopment) {
			setIsLoading(false)
			setAdminAuthenticated(true)
			return
		}
		
		// Trong môi trường production, chuyển hướng đến 404
		router.push('/404')
	}, [router, isDevelopment, setAdminAuthenticated])
	
	// Handle updating selectedArticles when editing product is set
	useEffect(() => {
		if (editingProduct && editingProduct.relatedArticles) {
			setSelectedArticles(editingProduct.relatedArticles)
		} else {
			setSelectedArticles([])
		}
	}, [editingProduct])
	
	const handleLogout = () => {
		router.push('/')
	}
	
	const toggleLanguage = () => {
		setLanguage(language === 'en' ? 'vi' : 'en')
	}
	
	// Helper function to get lowest price from product options with strict validation
	const getLowestPrice = (product: Product): number => {
		if (!product.options || product.options.length === 0) {
			return product.price || 0
		}
		
		let lowestPrice = Number.MAX_SAFE_INTEGER
		for (const option of product.options) {
			for (const value of option.values) {
				// Use strict localized price requirement - no fallback
				if (!value.localizedPrice) {
					console.warn(`Missing localized price for option ${option.name}, value ${value.value}`)
					continue
				}
				
				const currentPrice = language === 'en' ? value.localizedPrice.en : value.localizedPrice.vi
				
				if (typeof currentPrice === 'number' && currentPrice > 0 && currentPrice < lowestPrice) {
					lowestPrice = currentPrice
				}
			}
		}
		
		return lowestPrice === Number.MAX_SAFE_INTEGER ? (product.price || 0) : lowestPrice
	}
	
	// Function to open product edit dialog
	const openProductEdit = (product: Product) => {
		setEditingProduct(product)
		
		// Initialize localized fields for existing options if needed
		const processedOptions = (product.options || []).map(option => ({
			...option,
			localizedName: option.localizedName || { en: option.name, vi: option.name },
			values: option.values.map(value => ({
				...value,
				localizedValue: value.localizedValue || { en: '', vi: '' },
				localizedPrice: value.localizedPrice || { en: 0, vi: 0 }
			}))
		}))
		
		// Initialize price input values for all options
		const initialPriceValues: Record<string, string> = {}
		processedOptions.forEach((option, optionIndex) => {
			option.values.forEach((value, valueIndex) => {
				initialPriceValues[`${optionIndex}-${valueIndex}-en`] = 
					value.localizedPrice?.en ? value.localizedPrice.en.toString() : '0'
				initialPriceValues[`${optionIndex}-${valueIndex}-vi`] = 
					value.localizedPrice?.vi ? value.localizedPrice.vi.toString() : '0'
			})
		})
		setPriceInputValues(initialPriceValues)
		
		setProductForm({
			name: product.name,
			localizedName: product.localizedName || { en: product.name, vi: product.name },
			description: product.description || '',
			localizedDescription: product.localizedDescription || { en: product.description || '', vi: product.description || '' },
			image: product.image || '',
			localizedCategory: product.localizedCategory || { en: '', vi: '' },
			slug: product.slug || '',
			options: processedOptions,
			relatedArticles: product.relatedArticles || [],
			isLocalized: true,
			tags: product.tags || []
		})
		setSelectedArticles(product.relatedArticles || [])
		setProductDialog(true)
	}
	
	// Function to add option field
	const addOptionField = () => {
		const newOptionIndex = productForm.options.length
		
		// Initialize price input values for the new option value
		setPriceInputValues({
			...priceInputValues,
			[`${newOptionIndex}-0-en`]: '0',
			[`${newOptionIndex}-0-vi`]: '0'
		})
		
		setProductForm({
			...productForm,
			options: [
				...productForm.options,
				{
					id: Date.now().toString(),
					name: '',
					localizedName: { en: '', vi: '' },
					type: 'select',
					values: [{ 
						localizedValue: { en: '', vi: '' },
						localizedPrice: { en: 0, vi: 0 },
						description: '' 
					}]
				}
			]
		})
	}
	
	// Function to remove option
	const removeOption = (optionIndex: number) => {
		// Create new price input values without the removed option
		const newPriceInputValues = { ...priceInputValues }
		
		// Remove all price input values for this option
		Object.keys(newPriceInputValues).forEach(key => {
			if (key.startsWith(`${optionIndex}-`)) {
				delete newPriceInputValues[key]
			}
		})
		
		// Update keys for options that come after the removed one
		const optionsLength = productForm.options.length
		for (let i = optionIndex + 1; i < optionsLength; i++) {
			productForm.options[i].values.forEach((_, valueIndex) => {
				if (newPriceInputValues[`${i}-${valueIndex}-en`]) {
					newPriceInputValues[`${i-1}-${valueIndex}-en`] = newPriceInputValues[`${i}-${valueIndex}-en`]
					delete newPriceInputValues[`${i}-${valueIndex}-en`]
				}
				if (newPriceInputValues[`${i}-${valueIndex}-vi`]) {
					newPriceInputValues[`${i-1}-${valueIndex}-vi`] = newPriceInputValues[`${i}-${valueIndex}-vi`]
					delete newPriceInputValues[`${i}-${valueIndex}-vi`]
				}
			})
		}
		
		setPriceInputValues(newPriceInputValues)
		
		setProductForm({
			...productForm,
			options: productForm.options.filter((_: any, index: number) => index !== optionIndex)
		})
	}
	
	// Function to update option
	const updateOption = (optionIndex: number, property: string, value: any) => {
		const updatedOptions = [...productForm.options]
		updatedOptions[optionIndex] = {
			...updatedOptions[optionIndex],
			[property]: value
		}
		
		setProductForm({
			...productForm,
			options: updatedOptions
		})
	}
	
	// Function to add value to option
	const addValueToOption = (optionIndex: number) => {
		const updatedOptions = [...productForm.options]
		const newValueIndex = updatedOptions[optionIndex].values.length
		
		updatedOptions[optionIndex].values.push({ 
			localizedValue: { en: '', vi: '' },
			localizedPrice: { en: 0, vi: 0 },
			description: '' 
		})
		
		// Initialize price input values for the new option value
		setPriceInputValues({
			...priceInputValues,
			[`${optionIndex}-${newValueIndex}-en`]: '0',
			[`${optionIndex}-${newValueIndex}-vi`]: '0'
		})
		
		setProductForm({
			...productForm,
			options: updatedOptions
		})
	}
	
	// Function to remove option value
	const removeOptionValue = (optionIndex: number, valueIndex: number) => {
		const updatedOptions = [...productForm.options]
		updatedOptions[optionIndex].values = updatedOptions[optionIndex].values
			.filter((_, index) => index !== valueIndex)
		
		// Create new price input values without the removed value
		const newPriceInputValues = { ...priceInputValues }
		delete newPriceInputValues[`${optionIndex}-${valueIndex}-en`]
		delete newPriceInputValues[`${optionIndex}-${valueIndex}-vi`]
		
		// Update keys for values that come after the removed one
		const optionValuesLength = updatedOptions[optionIndex].values.length + 1 // +1 because we just removed one
		for (let i = valueIndex + 1; i < optionValuesLength; i++) {
			if (newPriceInputValues[`${optionIndex}-${i}-en`]) {
				newPriceInputValues[`${optionIndex}-${i-1}-en`] = newPriceInputValues[`${optionIndex}-${i}-en`]
				delete newPriceInputValues[`${optionIndex}-${i}-en`]
			}
			if (newPriceInputValues[`${optionIndex}-${i}-vi`]) {
				newPriceInputValues[`${optionIndex}-${i-1}-vi`] = newPriceInputValues[`${optionIndex}-${i}-vi`]
				delete newPriceInputValues[`${optionIndex}-${i}-vi`]
			}
		}
		
		setPriceInputValues(newPriceInputValues)
		
		setProductForm({
			...productForm,
			options: updatedOptions
		})
	}
	
	// Function to update option value
	const updateOptionValue = (
		optionIndex: number, 
		valueIndex: number, 
		value: string | number | { en: string; vi: string } | { en: number; vi: number }, 
		property: string
	) => {
		const updatedOptions = [...productForm.options]
		
		if (property === 'localizedValue') {
			updatedOptions[optionIndex].values[valueIndex] = {
				...updatedOptions[optionIndex].values[valueIndex],
				localizedValue: value as { en: string; vi: string }
			}
		} else if (property === 'localizedPrice') {
			updatedOptions[optionIndex].values[valueIndex] = {
				...updatedOptions[optionIndex].values[valueIndex],
				localizedPrice: value as { en: number; vi: number }
			}
		} else if (property === 'description') {
			updatedOptions[optionIndex].values[valueIndex] = {
				...updatedOptions[optionIndex].values[valueIndex],
				description: value as string
			}
		}
		
		setProductForm({
			...productForm,
			options: updatedOptions
		})
	}
	
	// Function to toggle article selection
	const toggleArticleSelection = (articleId: string) => {
		if (selectedArticles.includes(articleId)) {
			setSelectedArticles(selectedArticles.filter(id => id !== articleId))
		} else {
			setSelectedArticles([...selectedArticles, articleId])
		}
	}
	
	// Function to handle saving product - completely rewritten
	const handleSaveProduct = (e?: React.FormEvent) => {
		// Prevent default form submission behavior
		if (e) {
			e.preventDefault()
			e.stopPropagation()
		}
		
		setIsSaving(true)
		
		if (!productForm.slug) {
			setIsSaving(false)
			alert(t('slugRequired'))
			return
		}
		
		// Check for duplicate slug
		const slugExists = products.some(p => 
			p.slug === productForm.slug && 
			(!editingProduct || p.id !== editingProduct.id)
		)
		
		if (slugExists) {
			setIsSaving(false)
			alert(t('slugAlreadyExists') || `URL Slug "${productForm.slug}" already exists. Please use a different slug.`)
			return
		}
		
		// Create product object
		const productToSave: Product = {
			id: editingProduct?.id || Date.now().toString(),
			name: productForm.name,
			localizedName: productForm.localizedName,
			price: 0,
			description: productForm.description,
			localizedDescription: productForm.localizedDescription,
			image: productForm.image,
			localizedCategory: productForm.localizedCategory,
			slug: productForm.slug,
			options: productForm.options || [],
			relatedArticles: selectedArticles,
			sortOrder: editingProduct?.sortOrder || products.length + 1,
			isLocalized: true,
			tags: productForm.tags
		}
		
		// Close dialog immediately
		setProductDialog(false)
		
		try {
			// Save to localStorage as backup
			if (typeof window !== 'undefined') {
				try {
					localStorage.setItem('last-saved-product', JSON.stringify(productToSave))
					;(window as any).__lastSavedProductTime = Date.now()
					// Set a session flag to prevent navigation
					sessionStorage.setItem('prevent_navigation', 'true')
				} catch (e) {
					console.error('Failed to backup product to localStorage', e)
				}
			}
			
			// First update local state
			if (editingProduct) {
				updateProduct(editingProduct.id, productToSave)
			} else {
				addProduct(productToSave)
			}
			
			// Then sync to server with some delay
			setTimeout(async () => {
				try {
					// Prepare updated products array
					const updatedProducts = editingProduct
						? products.map(p => p.id === productToSave.id ? productToSave : p)
						: [...products, productToSave]
					
					// Add cache buster
					const cacheBuster = `?_t=${Date.now()}`
					
					// Use fetch with all the necessary headers
					const response = await fetch(`/api/store-data${cacheBuster}`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Cache-Control': 'no-cache, no-store, must-revalidate',
							'Pragma': 'no-cache',
							'Expires': '0',
							'X-Admin-Request': 'true',
							'X-Prevent-Redirect': 'true',
							'X-Admin-Session': 'true',
							'X-No-Navigation': 'true',
							'X-No-Reload': 'true',
							'X-Fresh': Date.now().toString() // Add a timestamp to prevent caching
						},
						body: JSON.stringify({
							products: updatedProducts
						}),
						cache: 'no-store',
						credentials: 'include',
						// Add this to prevent page navigation
						redirect: 'manual',
						keepalive: true
					})
					
					if (!response.ok) {
						throw new Error(`Server error: ${response.status}`)
					}
					
					// Show success notification
					setShowSavedNotification(true)
					setTimeout(() => {
						setShowSavedNotification(false)
					}, 3000)
					
					// Clear the navigation prevention flag
					if (typeof window !== 'undefined') {
						try {
							sessionStorage.removeItem('prevent_navigation')
						} catch (e) {
							console.error('Failed to clear navigation flag', e)
						}
					}
					
				} catch (error) {
					console.error('Error syncing to server:', error)
					alert(language === 'en' 
							? 'Error saving changes. Your changes are applied locally but may not be persisted.' 
							: 'Lỗi khi lưu thay đổi. Thay đổi của bạn đã được áp dụng cục bộ nhưng có thể không được lưu trữ.')
				} finally {
					setIsSaving(false)
				}
			}, 100)
			
		} catch (error) {
			console.error('Error in save process:', error)
			alert(language === 'en' ? 'Error saving product.' : 'Lỗi khi lưu sản phẩm.')
			setIsSaving(false)
		}
		
		// Clear editing state
		setEditingProduct(null)
		
		// Reset form
		setProductForm({
			name: '',
			localizedName: { en: '', vi: '' },
			description: '',
			localizedDescription: { en: '', vi: '' },
			image: '',
			localizedCategory: { en: '', vi: '' },
			slug: '',
			options: [],
			relatedArticles: [],
			isLocalized: true,
			tags: []
		})
		setPriceInputValues({})
		setSelectedArticles([])
	}
	
	// Add new product logic
	const handleAddProduct = () => {
		// Clear ALL form data to guarantee a fresh form
		setEditingProduct(null) // Ensure we're not in edit mode
		
		// Reset form state completely
		setProductForm({
			name: '',
			localizedName: { en: '', vi: '' },
			description: '',
			localizedDescription: { en: '', vi: '' },
			image: '',
			localizedCategory: { en: '', vi: '' },
			slug: '',
			options: [],
			relatedArticles: [],
			isLocalized: true,
			tags: []
		})
		
		// Reset all other state
		setPriceInputValues({})
		setSelectedArticles([])
		
		// Show the dialog
		setProductDialog(true)
	}
	
	// Handle drag end event
	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event
		
		if (over && active.id !== over.id) {
			setSortedProducts((items) => {
				// Find the indices of the items
				const oldIndex = items.findIndex((item) => item.id === active.id)
				const newIndex = items.findIndex((item) => item.id === over.id)
				
				// Create a new array with the items in the new order
				const newItems = arrayMove(items, oldIndex, newIndex)
				
				// Update sort orders
				updateProductOrders(newItems)
				
				return newItems
			})
		}
	}
	
	// Update product sort orders after drag and drop
	const updateProductOrders = async (sortedProducts: Product[]) => {
		setIsSaving(true)
		
		try {
			// Update each product with new sort order (1, 2, 3, etc.)
			for (let i = 0; i < sortedProducts.length; i++) {
				const product = sortedProducts[i]
				if (product.sortOrder !== i + 1) {
					updateProduct(product.id, { 
						...product,
						sortOrder: i + 1 
					})
				}
			}
			
			// Sync to server
			await useStore.getState().syncDataToServer()
		} catch (error) {
			console.error("Error updating product orders:", error)
		} finally {
			setIsSaving(false)
		}
	}
	
	// Hàm xử lý null/undefined cho product.options
	const safeProductOptions = (product: Product) => {
		return product.options || []
	}
	
	// Hàm xử lý xóa sản phẩm với confirmation
	const handleDeleteProduct = (product: Product) => {
		setProductToDelete(product)
		setDeleteConfirmDialog(true)
	}
	
	// Hàm confirm xóa sản phẩm
	const confirmDeleteProduct = () => {
		if (productToDelete) {
			// Xóa sản phẩm khỏi store
			deleteProduct(productToDelete.id)
			
			// Đóng dialog nếu đang mở
			setProductDialog(false)
			setEditingProduct(null)
		}
		
		// Đóng confirmation dialog
		setDeleteConfirmDialog(false)
		setProductToDelete(null)
	}
	
	// Price formatting helper
	const formatPrice = (price: number | string, lang: Language = language): string => {
		const numPrice = typeof price === 'string' ? parseFloat(price) : price
		
		if (isNaN(numPrice)) {
			return lang === 'en' ? '$0.00' : '0₫'
		}
		
		if (lang === 'en') {
			return new Intl.NumberFormat('en-US', { 
				style: 'currency', 
				currency: 'USD',
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			}).format(numPrice)
		}
		
		return new Intl.NumberFormat('vi-VN', { 
			style: 'currency', 
			currency: 'VND',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(numPrice)
	}
	
	// Price input validation for USD (allows decimals) - returns cleaned string
	const validateUSDPriceInput = (value: string): string => {
		// Only allow numbers and one decimal point
		const cleaned = value.replace(/[^0-9.]/g, '')
		const parts = cleaned.split('.')
		
		// If more than one decimal point, keep only the first one
		if (parts.length > 2) {
			return parts[0] + '.' + parts.slice(1).join('')
		}
		
		return cleaned
	}
	
	// Price input validation for VND (integers only) - returns cleaned string
	const validateVNDPriceInput = (value: string): string => {
		return value.replace(/[^0-9]/g, '')
	}
	
	// Convert string to number for storage
	const convertPriceToNumber = (value: string): number => {
		const num = parseFloat(value)
		return isNaN(num) ? 0 : num
	}
	
	// Filtered articles for search
	const filteredArticles = useMemo(() => {
		// Nếu không có từ khóa tìm kiếm thì hiển thị tất cả bài viết
		if (!articleSearchQuery.trim()) return faqArticles

		// Nếu có từ khóa tìm kiếm thì lọc theo từ khóa
		const query = articleSearchQuery.toLowerCase()
		return faqArticles.filter(article => 
			article.title.toLowerCase().includes(query) ||
			article.content.toLowerCase().includes(query) ||
			article.tags.some(tag => tag.toLowerCase().includes(query))
		)
	}, [faqArticles, articleSearchQuery])

	// Hiển thị các bài viết đã chọn lên đầu danh sách
	const sortedFilteredArticles = useMemo(() => {
		// Sắp xếp để đưa các bài viết đã chọn lên đầu
		return [...filteredArticles].sort((a, b) => {
			const aSelected = selectedArticles.includes(a.id)
			const bSelected = selectedArticles.includes(b.id)
			
			if (aSelected && !bSelected) return -1
			if (!aSelected && bSelected) return 1
			return 0
		})
	}, [filteredArticles, selectedArticles])
	
	// Auto-save for product form - DISABLE to prevent issues
	// const debouncedProductForm = useDebounce(productForm, 2000)
	// const debouncedSelectedArticles = useDebounce(selectedArticles, 2000)
	
	// useEffect(() => {
	// 	// Only auto-save when editing an existing product, not when creating a new one
	// 	if (editingProduct && debouncedProductForm.slug) {
	// 		// Create updated product data
	// 		const productData: Product = {
	// 			...editingProduct,
	// 			name: debouncedProductForm.name || debouncedProductForm.slug,
	// 			localizedName: debouncedProductForm.localizedName.en || debouncedProductForm.localizedName.vi 
	// 				? debouncedProductForm.localizedName 
	// 				: { en: debouncedProductForm.name || debouncedProductForm.slug, vi: debouncedProductForm.name || debouncedProductForm.slug },
	// 			description: debouncedProductForm.description,
	// 			localizedDescription: debouncedProductForm.localizedDescription,
	// 			image: debouncedProductForm.image,
	// 			localizedCategory: debouncedProductForm.localizedCategory,
	// 			slug: debouncedProductForm.slug,
	// 			options: debouncedProductForm.options,
	// 			relatedArticles: debouncedSelectedArticles,
	// 			isLocalized: true,
	// 			tags: debouncedProductForm.tags || []
	// 		}
	// 		
	// 		updateProduct(editingProduct.id, productData)
	// 	}
	// }, [debouncedProductForm, debouncedSelectedArticles, editingProduct, updateProduct])
	
	// Auto-save for FAQ - DISABLE to prevent issues
	// const debouncedFaqForm = useDebounce(faqForm, 2000)
	// 
	// useEffect(() => {
	// 	if (editingFaq && debouncedFaqForm.title) {
	// 		const updatedFaq: Partial<FAQArticle> = {
	// 			title: debouncedFaqForm.title,
	// 			content: debouncedFaqForm.content,
	// 			category: debouncedFaqForm.category,
	// 			tags: debouncedFaqForm.tags,
	// 			isLocalized: debouncedFaqForm.isLocalized,
	// 			localizedTitle: debouncedFaqForm.localizedTitle,
	// 			localizedContent: debouncedFaqForm.localizedContent,
	// 		}
	// 		
	// 		// Update article
	// 		updateFaqArticle(editingFaq.id, updatedFaq)
	// 	}
	// }, [debouncedFaqForm, editingFaq, updateFaqArticle])
	
	
	
	// Site config state for editing
	const [editingSiteConfig, setEditingSiteConfig] = useState(siteConfig)
	
	// Auto-save for site config - DISABLE to prevent issues
	// const debouncedSiteConfig = useDebounce(editingSiteConfig, 2000)
	// 
	// useEffect(() => {
	// 	if (activeTab === 'settings' && JSON.stringify(debouncedSiteConfig) !== JSON.stringify(siteConfig)) {
	// 		setSiteConfig(debouncedSiteConfig)
	// 		setShowSavedNotification(true)
	// 		setTimeout(() => setShowSavedNotification(false), 2000)
	// 	}
	// }, [debouncedSiteConfig, activeTab, siteConfig, setSiteConfig])
	
	// Initialize editingSiteConfig when siteConfig changes
	useEffect(() => {
		setEditingSiteConfig(siteConfig)
	}, [siteConfig])
	
	// Handle publishing to production
	const handlePublishToProduction = async () => {
		setIsPublishing(true)
		setPublishSuccess(false)
		
		try {
			// Call the API to trigger the publish
			const response = await fetch('/api/cache-purge', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					secret: process.env.NEXT_PUBLIC_CACHE_SECRET || 'local-dev',
				}),
			})
			
			if (!response.ok) {
				throw new Error(`HTTP error ${response.status}`)
			}
			
			const result = await response.json()
			console.log('Publish result:', result)
			
			// Show success notification
			setPublishSuccess(true)
			setShowPublishNotification(true)
			setTimeout(() => {
				setShowPublishNotification(false)
			}, 3000)
		} catch (error) {
			console.error('Error publishing to production:', error)
			setPublishSuccess(false)
		} finally {
			setIsPublishing(false)
		}
	}
	
	// Function to save FAQ changes
	const handleSaveFaq = () => {
		// Show save notification
		setShowSavedNotification(true)
		// Hide notification after 3 seconds
		setTimeout(() => {
			setShowSavedNotification(false)
		}, 3000)
	}
	
	// Thêm hàm rebuildInitialData mới
	const rebuildInitialData = async () => {
		try {
			setIsLoading(true)
			const response = await fetch('/api/store-data?rebuild=true', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({})
			})
			
			const result = await response.json()
			
			if (result.success) {
				alert('Đã cập nhật thành công file initial-data.ts từ store-data.json')
			} else {
				alert('Có lỗi xảy ra khi cập nhật: ' + (result.message || 'Không xác định'))
			}
		} catch (error) {
			console.error('Error rebuilding initial data:', error)
			alert('Có lỗi xảy ra: ' + ((error as Error).message || 'Không xác định'))
		} finally {
			setIsLoading(false)
		}
	}
	
	// Nếu đang loading, hiển thị thông báo
	if (isLoading) {
		return null
	}
	
	// Trong production, không hiển thị gì
	if (!isDevelopment) {
		return null
	}
	
	// Add a loading state to prevent hydration mismatch
	if (!isMounted && typeof window !== 'undefined') {
		return <div className="flex items-center justify-center h-screen">
			<div className="text-center">
				<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
				<p className="mt-4">Loading admin panel...</p>
			</div>
		</div>
	}
	
	return (
		<ErrorBoundary>
			<div className="flex flex-col min-h-screen">
				<style jsx global>{`
					.jshine-gradient {
						color: #0ea5e9; /* JShine color (sky blue) instead of gradient */
					}
				`}</style>
				
				<style jsx global>{`
					/* Custom scrollbar styling */
					.scrollbar-custom::-webkit-scrollbar {
						width: 8px;
						height: 8px;
					}
					
					.scrollbar-custom::-webkit-scrollbar-track {
						background: transparent;
						margin: 4px;
					}
					
					.scrollbar-custom::-webkit-scrollbar-thumb {
						background: rgba(155, 155, 155, 0.5);
						border-radius: 10px;
					}
					
					.scrollbar-custom::-webkit-scrollbar-thumb:hover {
						background: rgba(155, 155, 155, 0.7);
					}
					
					/* Firefox scrollbar */
					.scrollbar-custom {
						scrollbar-width: thin;
						scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
					}
					
					/* Increase padding around content to prevent text touching the edges */
					#faq-content {
						padding-right: 16px !important;
						box-sizing: border-box;
						background-color: transparent;
					}
					
					/* Ensure focus works properly on wrapper */
					.focus-within\:ring-2:focus-within {
						box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.3);
					}
					
					/* Ensure textarea fills its container properly */
					textarea#faq-content {
						display: block;
						width: 100%;
						height: 100%;
					}
				`}</style>
				
				<div className="container grid flex-1 gap-6 md:grid-cols-[200px_1fr] py-6">
					{/* Sidebar */}
					<div className="flex flex-col gap-2">
						<Button 
								variant={activeTab === 'products' ? 'default' : 'ghost'} 
								className="justify-start"
								onClick={() => setActiveTab('products')}
							>
								<LayoutGrid className="mr-2 h-4 w-4" />
								{t('products')}
							</Button>
						<Button 
							variant={activeTab === 'faq' ? 'default' : 'ghost'} 
							className="justify-start"
							onClick={() => setActiveTab('faq')}
						>
							<HelpCircle className="mr-2 h-4 w-4" />
							{language === 'en' ? 'FAQ' : 'Câu hỏi thường gặp'}
						</Button>
						<Button 
							variant={activeTab === 'settings' ? 'default' : 'ghost'} 
							className="justify-start"
							onClick={() => setActiveTab('settings')}
						>
							<Settings className="mr-2 h-4 w-4" />
							{language === 'en' ? 'General Settings' : 'Cài đặt chung'}
						</Button>
					</div>
					
					{/* Main Content */}
					<div className="flex-1">
						{activeTab === 'products' && (
							<div className="space-y-4">
								<Tabs value={productTab} onValueChange={(v) => setProductTab(v as ProductTabType)}>
									<div className="flex justify-between items-center">
										<TabsList>
											<TabsTrigger value="details">
												<FileText className="h-4 w-4 mr-2" />
												{t('productDetails')}
											</TabsTrigger>
											<TabsTrigger value="card-order">
												<ArrowDownWideNarrow className="h-4 w-4 mr-2" />
												{t('productCards')}
											</TabsTrigger>
										</TabsList>
										
										{productTab === 'details' && (
											<Button onClick={() => setProductDialog(true)}>
												<Plus className="mr-2 h-4 w-4" />
												{t('addProduct')}
											</Button>
										)}
									</div>
									
									<TabsContent value="details" className="mt-6">
										{/* Product Details Tab */}
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
											{products
												.slice()
												.sort((a, b) => parseInt(b.id) - parseInt(a.id)) // Sort by id (newest first)
												.map((product) => {
											// Get localized product name
											const productName = language === 'en' 
												? (product.localizedName?.en || product.name)
												: (product.localizedName?.vi || product.name);
											
											return (
												<Card key={product.id} className="overflow-hidden">
													<div className="relative aspect-video">
														{product.image ? (
															<div 
																className="w-full h-full bg-cover bg-center" 
																style={{ backgroundImage: `url(${product.image})` }}
															/>
														) : (
															<div className="w-full h-full bg-muted/30 flex items-center justify-center">
																<div className="text-muted-foreground text-3xl">📦</div>
															</div>
														)}
													</div>
													<CardHeader className="p-4">
														<CardTitle className="text-lg">{productName}</CardTitle>
														<div className="text-xs text-muted-foreground mt-1">
															<span className="font-medium">URL Slug: </span>{product.slug}
														</div>
														<div>
															{product.localizedCategory 
																? (language === 'en' ? product.localizedCategory.en : product.localizedCategory.vi) 
																: ''}
														</div>
														{product.tags && product.tags.length > 0 && (
															<div className="flex flex-wrap gap-1 mt-1">
																{product.tags.slice(0, 2).map(tag => (
																	<Badge key={tag} variant="secondary" className="text-xs">
																		{tag}
																	</Badge>
																))}
																{product.tags.length > 2 && (
																	<Badge variant="secondary" className="text-xs">
																		+{product.tags.length - 2}
																	</Badge>
																)}
															</div>
														)}
													</CardHeader>
													<CardContent className="p-4 pt-0">
														<div className="flex space-x-2">
															<Button 
																variant="outline" 
																size="sm" 
																className="flex-1"
																onClick={() => openProductEdit(product)}
															>
																<Edit className="mr-2 h-3 w-3" />
																{t('edit')}
															</Button>
															<Button 
																variant="outline" 
																size="sm" 
																className="flex-1 text-destructive hover:text-destructive"
																onClick={() => handleDeleteProduct(product)}
															>
																<Trash2 className="mr-2 h-3 w-3" />
																{t('delete')}
															</Button>
														</div>
													</CardContent>
												</Card>
											);
										})}
									</div>
								</TabsContent>
								
								<TabsContent value="card-order" className="mt-6">
									{/* Product Cards Order Tab - With Drag and Drop */}
									<div className="space-y-6">
										<Card>
											<CardHeader>
												<CardTitle className="flex items-center">
													<ArrowDownWideNarrow className="h-5 w-5 mr-2" />
													{t('productCardsOrder')}
												</CardTitle>
											</CardHeader>
											<CardContent>
												<p className="text-sm text-muted-foreground mb-4">
													{t('dragAndDropInstructions')}
												</p>
												
												<DndContext
													sensors={sensors}
													collisionDetection={closestCenter}
													onDragEnd={handleDragEnd}
												>
													<SortableContext
														items={sortedProducts.map(product => product.id)}
														strategy={verticalListSortingStrategy}
													>
														<div className="grid grid-cols-1 gap-2">
															{sortedProducts.map((product) => (
																<SortableProductItem
																	key={product.id}
																	product={product}
																	getLowestPrice={getLowestPrice}
																	formatPrice={formatPrice}
																	language={language}
																/>
															))}
														</div>
													</SortableContext>
												</DndContext>
											</CardContent>
										</Card>
									</div>
								</TabsContent>
							</Tabs>
							
							{/* Product Dialog */}
							<Dialog open={productDialog} onOpenChange={(open) => {
								if (open) {
									// Nếu đang mở dialog và không phải đang edit thì reset form
									if (!editingProduct) {
										// Đảm bảo làm trống form khi mở dialog để thêm mới
										setProductForm({
											name: '',
											localizedName: { en: '', vi: '' },
											description: '',
											localizedDescription: { en: '', vi: '' },
											image: '',
											localizedCategory: { en: '', vi: '' },
											slug: '',
											options: [],
											relatedArticles: [],
											isLocalized: true,
											tags: []
										})
										setPriceInputValues({})
										setSelectedArticles([])
									}
								} else {
									// Khi đóng dialog
									setProductDialog(false)
									setEditingProduct(null)
									setArticleSearchQuery('')
									// Reset all form data to prevent carrying over values to a new product
									setProductForm({
										name: '',
										localizedName: { en: '', vi: '' },
										description: '',
										localizedDescription: { en: '', vi: '' },
										image: '',
										localizedCategory: { en: '', vi: '' },
										slug: '',
										options: [],
										relatedArticles: [],
										isLocalized: true,
										tags: []
									})
									setPriceInputValues({})
									setSelectedArticles([])
								}
							}}>
								<DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" aria-describedby="product-dialog-description">
									<form onSubmit={(e) => handleSaveProduct(e)} data-admin-form="true">
									<DialogHeader>
										<div className="flex items-center justify-between">
											<div>
												<DialogTitle className="text-2xl">{editingProduct ? t('editProduct') : t('addProduct')}</DialogTitle>
												<DialogDescription id="product-dialog-description" className="text-base">
													{editingProduct 
														? t('editProductDescription')
														: "Only the URL slug is required. All other fields are optional. When URL slug is provided, the product page will be created automatically."}
												</DialogDescription>
											</div>
										</div>
									</DialogHeader>
									
									{/* Language selector - Sticky at top for easy access */}
									<div className="sticky top-0 z-10 bg-background mb-4 pb-2 border-b">
										<div className="flex items-center justify-end space-x-2">
											<div className="flex items-center">
												<div 
													className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
													onClick={toggleLanguage}
												>
													{language === 'en' ? (
														<div className="flex items-center px-3 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg border-2 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
															<USFlag />
															<span className="ml-2 font-medium text-blue-800 dark:text-blue-200">English</span>
															<span className="ml-2 text-xs text-blue-600 dark:text-blue-300">(click to switch)</span>
														</div>
													) : (
														<div className="flex items-center px-3 py-2 bg-red-100 dark:bg-red-900/30 rounded-lg border-2 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 transition-colors">
															<VietnamFlag />
															<span className="ml-2 font-medium text-red-800 dark:text-red-200">Tiếng Việt</span>
															<span className="ml-2 text-xs text-red-600 dark:text-red-300">(click để chuyển)</span>
														</div>
													)}
												</div>
											</div>
										</div>
									</div>
									
									{/* Main form content with progress indicator */}
									<div className="space-y-8 py-2">
										{/* Progress bar */}
										<div className="w-full bg-muted h-2 rounded-full overflow-hidden">
											<div className="bg-primary h-full" style={{ width: 
												editingProduct 
												? '100%' 
												: productForm.slug ? '30%' : '10%'
											}}></div>
										</div>
										
										{/* Basic Information Section */}
										<div className="bg-muted/20 rounded-lg p-6 border">
											<h3 className="text-lg font-semibold mb-4 flex items-center">
												<span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">1</span>
												{t('basicInfo')}
											</h3>
											
											{/* Essential Fields */}
											<div className="space-y-6">
												{/* URL Slug - Required field highlighted */}
												<div className="space-y-2">
													<label className="font-medium flex items-center">
														URL Slug 
														<span className="text-red-500 ml-1">*</span>
														<span className="ml-2 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs rounded-full">Required</span>
													</label>
													<div className="flex items-center">
														<span className="text-muted-foreground mr-2">/store/product/</span>
														<Input 
															value={productForm.slug} 
															onChange={(e) => setProductForm({...productForm, slug: e.target.value})}
															placeholder="custom-product-url"
															required
															className="flex-1"
														/>
													</div>
												</div>
												
												{/* Product Name */}
												<div className="space-y-2">
													<label className="font-medium">{t('name')}</label>
													<Input 
														value={language === 'en' ? productForm.localizedName.en : productForm.localizedName.vi} 
														onChange={(e) => {
															if (language === 'en') {
																setProductForm({
																	...productForm, 
																	localizedName: {
																		...productForm.localizedName,
																		en: e.target.value
																	}
																})
															} else {
																setProductForm({
																	...productForm, 
																	localizedName: {
																		...productForm.localizedName,
																		vi: e.target.value
																	}
																})
															}
														}}
														placeholder={language === 'en' ? "Product name in English" : "Tên sản phẩm bằng tiếng Việt"}
													/>
												</div>
												
												{/* Category */}
												<div className="space-y-2">
													<label className="font-medium">{t('category')}</label>
													<Input 
														value={language === 'en' ? productForm.localizedCategory.en : productForm.localizedCategory.vi} 
														onChange={(e) => {
															if (language === 'en') {
																setProductForm({
																	...productForm, 
																	localizedCategory: {
																		...productForm.localizedCategory,
																		en: e.target.value
																	}
																})
															} else {
																setProductForm({
																	...productForm, 
																	localizedCategory: {
																		...productForm.localizedCategory,
																		vi: e.target.value
																	}
																})
															}
														}}
														placeholder={language === 'en' ? "Category in English" : "Danh mục bằng tiếng Việt"}
													/>
												</div>
												
												{/* Tags */}
												<div className="space-y-2">
													<label className="font-medium">{t('tags')}</label>
													<Input 
														value={productForm.tags.join(', ')}
														onChange={(e) => setProductForm({
															...productForm, 
															tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
														})}
														placeholder="tag1, tag2, tag3"
														className="w-full"
													/>
												</div>
											</div>
										</div>
										
										{/* Product Image Section */}
										<div className="bg-muted/20 rounded-lg p-6 border">
											<h3 className="text-lg font-semibold mb-4 flex items-center">
												<span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">2</span>
												{t('productImage')}
											</h3>
											
											<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
												<div className="space-y-2">
													<label className="font-medium">{t('imageURL')}</label>
													<Input 
														value={productForm.image} 
														onChange={(e) => setProductForm({...productForm, image: e.target.value})}
														placeholder="https://example.com/image.jpg"
													/>
												</div>
												
												<div className="flex items-center justify-center">
													{productForm.image ? (
														<div className="relative w-full h-40 bg-center bg-cover rounded-md border" 
															style={{ backgroundImage: `url(${productForm.image})` }}
														/>
													) : (
														<div className="relative w-full h-40 bg-muted/30 rounded-md flex flex-col items-center justify-center border border-dashed">
															<div className="text-muted-foreground text-4xl mb-2">📦</div>
															<p className="text-sm text-muted-foreground">Product image preview</p>
														</div>
													)}
												</div>
											</div>
										</div>
										
										{/* Product Options Section */}
										<div className="bg-muted/20 rounded-lg p-6 border">
											<h3 className="text-lg font-semibold mb-4 flex items-center">
												<span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">3</span>
												{t('productOptions')}
											</h3>
											
											<div className="space-y-4">
												<div className="flex justify-end items-center">
													<Button 
														size="sm" 
														variant="outline" 
														onClick={addOptionField}
														className="flex items-center"
													>
														<Plus className="w-4 h-4 mr-1" /> {t('addOption')}
													</Button>
												</div>
												
												{productForm.options.length === 0 && (
													<div className="flex flex-col items-center justify-center py-8 border border-dashed rounded-md bg-muted/10">
														<BoxIcon className="w-12 h-12 text-muted-foreground mb-2" />
														<p className="text-base text-muted-foreground">No options added yet</p>
														<Button 
															variant="secondary"
															size="sm"
															className="mt-4"
															onClick={addOptionField}
														>
															<Plus className="w-4 h-4 mr-1" /> Add Your First Option
														</Button>
													</div>
												)}
												
												{productForm.options.map((option, optionIndex) => (
													<div key={option.id} className={`border rounded-md p-4 space-y-3 shadow-sm ${
														['bg-blue-100 dark:bg-blue-800/20', 
														'bg-green-100 dark:bg-green-800/20',
														'bg-amber-100 dark:bg-amber-800/20',
														'bg-purple-100 dark:bg-purple-800/20',
														'bg-pink-100 dark:bg-pink-800/20'][optionIndex % 5]
													}`}>
														<div className="flex items-center justify-between bg-muted/20 -m-4 mb-3 p-3 border-b">
															<h4 className="font-medium flex items-center">
																<span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-xs mr-2">
																	{optionIndex + 1}
																</span> 
																Option {optionIndex + 1}
															</h4>
															<Button 
																variant="ghost" 
																size="sm" 
																className="h-8 w-8 p-0 text-destructive hover:text-destructive"
																onClick={() => removeOption(optionIndex)}
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														</div>
														
														<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
															<div className="space-y-2">
																<label className="text-sm font-medium">{t('optionName')}</label>
																<Input 
																	value={language === 'en' 
																		? (option.localizedName?.en || '') 
																		: (option.localizedName?.vi || '')} 
																	onChange={(e) => {
																		const newLocalizedName = {
																			...option.localizedName,
																			[language]: e.target.value
																		}
																		updateOption(optionIndex, 'localizedName', newLocalizedName)
																	}}
																	placeholder={language === 'en' 
																		? "Option name in English" 
																		: "Tên tùy chọn bằng tiếng Việt"}
																/>
															</div>
														</div>
														
														<div className="space-y-2">
															<div className="flex justify-between items-center">
																<label className="text-sm font-medium">{t('optionValues')}</label>
																<Button 
																	variant="outline" 
																	size="sm"
																	className="h-7"
																	onClick={() => addValueToOption(optionIndex)}
																>
																	<Plus className="h-3 w-3 mr-1" /> {t('addValue')}
																</Button>
															</div>
															
															{option.values.length === 0 && (
																<div className="flex items-center justify-center p-4 border border-dashed rounded-md bg-muted/10">
																	<Button 
																		variant="secondary"
																		size="sm"
																		onClick={() => addValueToOption(optionIndex)}
																	>
																		<Plus className="h-3 w-3 mr-1" /> {t('addValue')}
																	</Button>
																</div>
															)}
															
															{option.values.map((value, valueIndex) => {
																// Get option name for display
																const optionName = language === 'en'
																	? option.localizedName?.en || `Option ${optionIndex + 1}`
																	: option.localizedName?.vi || `Tùy chọn ${optionIndex + 1}`;
																
																return (
																<div key={valueIndex} className={`space-y-3 border p-3 rounded-md mb-3 shadow-sm ${
																	['bg-blue-200/70 dark:bg-blue-900/30', 
																	'bg-green-200/70 dark:bg-green-900/30',
																	'bg-amber-200/70 dark:bg-amber-900/30',  
																	'bg-purple-200/70 dark:bg-purple-900/30',
																	'bg-pink-200/70 dark:bg-pink-900/30'][valueIndex % 5]
																}`}>
																	<div className="flex justify-between items-center border-b pb-2">
																		<h5 className="font-medium text-sm flex items-center">
																			<span className="mr-2 bg-muted w-5 h-5 rounded-full flex items-center justify-center text-xs">
																				{valueIndex + 1}
																			</span>
																			{optionName}: {`Value ${valueIndex + 1}`}
																		</h5>
																		{option.values.length > 1 && (
																			<Button 
																				variant="ghost" 
																				size="sm" 
																				className="p-0 h-7 w-7 text-destructive hover:text-destructive"
																				onClick={() => removeOptionValue(optionIndex, valueIndex)}
																			>
																				<Trash2 className="h-3 w-3" />
																			</Button>
																		)}
																	</div>
																	
																	<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
																		<div className="space-y-2">
																			<label className="text-xs font-medium">Value Name</label>
																			<Input 
																				value={language === 'en' 
																					? (value.localizedValue?.en || '') 
																					: (value.localizedValue?.vi || '')} 
																				onChange={(e) => {
																					const currentLocalized = value.localizedValue || { en: '', vi: '' }
																					const newLocalizedValue = {
																						en: language === 'en' ? e.target.value : currentLocalized.en,
																						vi: language === 'vi' ? e.target.value : currentLocalized.vi
																					}
																					updateOptionValue(optionIndex, valueIndex, newLocalizedValue, 'localizedValue')
																				}}
																				placeholder={language === 'en' 
																					? "Value name in English" 
																					: "Tên giá trị bằng tiếng Việt"}
																				className="flex-1"
																			/>
																		</div>
																		
																		<div className="space-y-2">
																			<label className="text-xs font-medium flex items-center">
																				Price ({language === 'en' ? 'USD' : 'VNĐ'})
																				<span className="ml-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded-full">
																					{language === 'en' ? 'USD' : 'VND'}
																				</span>
																			</label>
																			<Input 
																				value={language === 'en'
																					? priceInputValues[`${optionIndex}-${valueIndex}-en`] || 
																						(value.localizedPrice?.en && value.localizedPrice.en !== 0 ? value.localizedPrice.en.toString() : '')
																					: priceInputValues[`${optionIndex}-${valueIndex}-vi`] ||
																						(value.localizedPrice?.vi && value.localizedPrice.vi !== 0 ? value.localizedPrice.vi.toString() : '')
																				}
																				onChange={(e) => {
																					const validatedInput = language === 'en' 
																						? validateUSDPriceInput(e.target.value)
																						: validateVNDPriceInput(e.target.value)
																					
																					// Store the string input in state
																					setPriceInputValues({
																						...priceInputValues,
																						[`${optionIndex}-${valueIndex}-${language}`]: validatedInput
																					})
																					
																					const numberValue = convertPriceToNumber(validatedInput)
																					const currentLocalized = value.localizedPrice || { en: 0, vi: 0 }
																					const newLocalizedPrice = {
																						en: language === 'en' ? numberValue : currentLocalized.en,
																						vi: language === 'vi' ? numberValue : currentLocalized.vi
																					}
																					updateOptionValue(optionIndex, valueIndex, newLocalizedPrice, 'localizedPrice')
																				}}
																				placeholder={language === 'en' ? "e.g., 3.99" : "e.g., 100000"}
																				className="flex-1"
																			/>
																		</div>
																	</div>
																	
																	<div className="space-y-2">
																		<label className="text-xs font-medium">Description</label>
																		<Input 
																			value={value.description}
																			onChange={(e) => updateOptionValue(optionIndex, valueIndex, e.target.value, 'description')}
																			placeholder="Describe this option value"
																			className="flex-1"
																		/>
																	</div>
																</div>
																);
															})}
														</div>
													</div>
												))}
											</div>
										</div>
										
										{/* Description Section */}
										<div className="bg-muted/20 rounded-lg p-6 border">
											<h3 className="text-lg font-semibold mb-4 flex items-center">
												<span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">4</span>
												{t('description')}
											</h3>
											
											<div className="space-y-2">
												<div className="flex justify-end items-center mb-2">
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() => setShowProductDescriptionPreview(!showProductDescriptionPreview)}
														className="flex items-center"
													>
														{showProductDescriptionPreview ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
														{showProductDescriptionPreview ? 'Hide Preview' : 'Show Preview'}
													</Button>
												</div>
												
												<div className={`grid ${showProductDescriptionPreview ? 'grid-cols-2 gap-4' : 'grid-cols-1'} min-h-[200px]`}>
													<div className="border rounded-md overflow-hidden flex flex-col bg-background shadow-sm">
														<MarkdownToolbar 
															onInsert={(text) => {
																const textarea = document.getElementById('product-description') as HTMLTextAreaElement
																if (textarea) {
																	const start = textarea.selectionStart
																	const end = textarea.selectionEnd
																	const currentValue = language === 'en' 
																		? productForm.localizedDescription.en 
																		: productForm.localizedDescription.vi
																	const newValue = currentValue.substring(0, start) + text + currentValue.substring(end)
																	
																	if (language === 'en') {
																		setProductForm({
																			...productForm, 
																			localizedDescription: {
																				...productForm.localizedDescription,
																				en: newValue
																			}
																		})
																	} else {
																		setProductForm({
																			...productForm, 
																			localizedDescription: {
																				...productForm.localizedDescription,
																				vi: newValue
																			}
																		})
																	}
																	
																	// Restore cursor position
																	setTimeout(() => {
																		textarea.focus()
																		textarea.setSelectionRange(start + text.length, start + text.length)
																	}, 0)
																}
															}}
														/>
														<textarea 
															id="product-description"
															className="w-full p-4 border-0 rounded-none min-h-[200px] flex-1 font-mono text-sm"
															value={language === 'en' ? productForm.localizedDescription.en : productForm.localizedDescription.vi} 
															onChange={(e) => {
																if (language === 'en') {
																	setProductForm({
																		...productForm, 
																		localizedDescription: {
																			...productForm.localizedDescription,
																			en: e.target.value
																		}
																	})
																} else {
																	setProductForm({
																		...productForm, 
																		localizedDescription: {
																			...productForm.localizedDescription,
																			vi: e.target.value
																		}
																	})
																}
															}}
															placeholder={`Enter product description in ${language === 'en' ? 'English' : 'Vietnamese'}...`}
														/>
													</div>
													
													{showProductDescriptionPreview && (
														<div className="border rounded-md p-4 overflow-y-auto bg-background shadow-sm">
															<div 
																className="prose prose-sm dark:prose-invert max-w-none"
																dangerouslySetInnerHTML={{
																	__html: (language === 'en' ? productForm.localizedDescription.en : productForm.localizedDescription.vi)
																		.replace(/^# (.*?)$/gm, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
																		.replace(/^## (.*?)$/gm, '<h2 class="text-2xl font-semibold mt-6 mb-3">$1</h2>')
																		.replace(/^### (.*?)$/gm, '<h3 class="text-xl font-medium mt-5 mb-2">$1</h3>')
																		.replace(/^#### (.*?)$/gm, '<h4 class="text-lg font-medium mt-4 mb-2">$1</h4>')
																		.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
																		.replace(/\*(.*?)\*/g, '<em>$1</em>')
																		.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="jshine-gradient">$1</a>')
																		.replace(/^- (.*?)$/gm, '<li class="ml-4">$1</li>')
																		.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-md my-4" />')
																		.replace(/\n/g, '<br>')
																}}
															/>
														</div>
													)}
												</div>
											</div>
										</div>
										
										{/* Related Articles Section */}
										<div className="bg-muted/20 rounded-lg p-6 border">
											<h3 className="text-lg font-semibold mb-4 flex items-center">
												<span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">5</span>
												{t('relatedArticles')}
											</h3>
											
											<div className="space-y-4">
												<div className="relative">
													<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
													<Input
														type="text"
														placeholder={language === 'en' ? "Search articles..." : "Tìm kiếm bài viết..."}
														className="pl-9"
														value={articleSearchQuery}
														onChange={(e) => setArticleSearchQuery(e.target.value)}
													/>
												</div>
												
												<div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2 border rounded-md bg-background">
													{sortedFilteredArticles.length > 0 ? (
														sortedFilteredArticles.map(article => (
															<div 
																key={article.id} 
																className={`p-3 border rounded-md cursor-pointer transition-colors ${
																	selectedArticles.includes(article.id) 
																		? 'border-primary bg-primary/10' 
																		: 'hover:border-gray-400'
																}`}
																onClick={() => toggleArticleSelection(article.id)}
															>
																<h4 className="font-medium text-sm line-clamp-1">{article.title}</h4>
																<p className="text-xs text-muted-foreground mt-1 line-clamp-2">
																	{article.content.substring(0, 100)}...
																</p>
															</div>
														))
													) : (
														<div className="col-span-2 text-center py-8 text-muted-foreground">
															{language === 'en' ? "No articles found" : "Không tìm thấy bài viết"}
														</div>
													)}
												</div>
											</div>
										</div>
									</div>
									<DialogFooter className="sticky bottom-0 pt-4 pb-2 bg-background border-t">
										<div className="flex items-center justify-end w-full">
											<Button type="submit" className="px-8" disabled={!productForm.slug}>
												{t('save')}
											</Button>
										</div>
									</DialogFooter>
									</form>
								</DialogContent>
							</Dialog>
						</div>
					)}
					
					{activeTab === 'faq' && (
						<div className="space-y-6">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-xl font-semibold">{language === 'en' ? 'FAQ Management' : 'Quản lý FAQ'}</h2>
								
								<div className="flex items-center gap-2">
									<Button 
										variant="outline"
										onClick={() => {
											setFaqForm({
												id: '',
												title: '',
												slug: '',
												content: '',
												category: '',
												tags: [],
												isLocalized: false,
												localizedTitle: { en: '', vi: '' },
												localizedContent: { en: '', vi: '' }
											})
											setFaqDialog(true)
										}}
									>
										<Plus className="h-4 w-4 mr-2" />
										{language === 'en' ? 'Add FAQ' : 'Thêm FAQ'}
									</Button>
								</div>
							</div>
							
							{/* Save notification banner */}
							{showSavedNotification && (
								<div className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 border rounded-md p-3 flex items-center mb-4 text-green-700 dark:text-green-300">
									<svg 
										xmlns="http://www.w3.org/2000/svg" 
										className="h-5 w-5 mr-2" 
										viewBox="0 0 20 20" 
										fill="currentColor"
									>
										<path 
											fillRule="evenodd" 
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
											clipRule="evenodd" 
										/>
									</svg>
									{language === 'en' ? 'Changes saved!' : 'Đã lưu thay đổi!'}
								</div>
							)}
							
							<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
								{faqArticles.map((article) => (
									<Card key={article.id} className="overflow-hidden">
										<CardHeader className="p-4">
											<CardTitle className="text-lg">{article.title}</CardTitle>
											<div className="flex flex-wrap gap-1 mt-1">
												<Badge variant="secondary">
													{article.category}
												</Badge>
											</div>
										</CardHeader>
										<CardContent className="p-4 pt-0">
											<div className="flex space-x-2">
												<Button 
													variant="outline" 
													size="sm" 
													className="flex-1"
													onClick={() => {
														setEditingFaq(article)
														setFaqForm({
															id: article.id,
															title: article.title,
															slug: article.slug,
															category: article.category,
															tags: article.tags || [],
															content: article.content,
															isLocalized: !!article.isLocalized,
															localizedTitle: article.localizedTitle || { en: article.title, vi: article.title },
															localizedContent: article.localizedContent || { en: article.content, vi: article.content }
														})
														setFaqDialog(true)
													}}
												>
													<Edit className="mr-2 h-3 w-3" />
													{language === 'en' ? 'Edit' : 'Chỉnh sửa'}
												</Button>
												<Button 
													variant="outline" 
													size="sm" 
													className="flex-1 text-destructive hover:text-destructive"
													onClick={() => {
														if (confirm(language === 'en' ? 'Delete this FAQ?' : 'Xóa FAQ này?')) {
															setFaqArticles(faqArticles.filter(a => a.id !== article.id))
														}
													}}
												>
													<Trash2 className="mr-2 h-3 w-3" />
													{language === 'en' ? 'Delete' : 'Xóa'}
												</Button>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
							
							{/* FAQ Dialog */}
							<Dialog open={faqDialog} onOpenChange={(open) => {
								if (!open) {
									setFaqDialog(false)
									setEditingFaq(null)
								}
							}}>
								<DialogContent className="max-w-6xl h-[95vh] overflow-hidden flex flex-col scrollbar-custom" aria-describedby="faq-dialog-description">
									<DialogHeader className="pb-2">
										<DialogTitle>{editingFaq
											? (language === 'en' ? 'Edit FAQ Article' : 'Chỉnh sửa FAQ')
											: (language === 'en' ? 'Add FAQ Article' : 'Thêm FAQ mới')}
										</DialogTitle>
										<DialogDescription id="faq-dialog-description">
											{language === 'en'
												? 'Write your FAQ content using Markdown formatting'
												: 'Viết nội dung FAQ sử dụng định dạng Markdown'}
										</DialogDescription>
									</DialogHeader>

									<div className="flex-1 overflow-auto flex flex-col gap-4 min-h-0">
										<div className="flex items-center gap-2">
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => toggleLanguage()}
												className="flex items-center gap-1"
											>
												{language === 'vi' ? <VietnamFlag className="h-4" /> : <USFlag className="h-4" />}
												{language === 'en' ? 'English' : 'Tiếng Việt'}
											</Button>
											
											<div className="flex-1"></div>
											
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => setPreviewDialog(true)}
												className="flex items-center gap-1"
											>
												<Eye className="h-4 w-4 mr-1" />
												{language === 'en' ? 'Preview' : 'Xem trước'}
											</Button>
											
											<div className="flex items-center">
												<input 
													type="checkbox" 
													id="isLocalized"
													className="mr-2"
													checked={faqForm.isLocalized}
													onChange={(e) => setFaqForm({...faqForm, isLocalized: e.target.checked})}
												/>
												<label htmlFor="isLocalized">
													{language === 'en' ? 'Enable bilingual content' : 'Bật nội dung song ngữ'}
												</label>
											</div>
										</div>
										
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<Input
												type="text"
												value={faqForm.isLocalized 
													? (language === 'en' ? faqForm.localizedTitle.en : faqForm.localizedTitle.vi) 
													: faqForm.title}
												onChange={(e) => {
													if (faqForm.isLocalized) {
														setFaqForm({
															...faqForm, 
															localizedTitle: {
																...faqForm.localizedTitle,
																[language]: e.target.value
															}
														});
													} else {
														setFaqForm({...faqForm, title: e.target.value});
													}
												}}
												placeholder={language === 'en' ? "FAQ title..." : "Tiêu đề FAQ..."}
												className="w-full"
											/>
											
											<Input
												type="text"
												value={faqForm.category}
												onChange={(e) => setFaqForm({...faqForm, category: e.target.value})}
												placeholder={language === 'en' ? "Category..." : "Danh mục..."}
												className="w-full"
											/>
										</div>
										
										<Input
											type="text"
											value={faqForm.tags.join(', ')}
											onChange={(e) => setFaqForm({
												...faqForm,
												tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
											})}
											placeholder={language === 'en' ? "Tags (comma separated)..." : "Thẻ (phân cách bằng dấu phẩy)..."}
											className="w-full"
										/>
										
										<div className="flex items-center gap-2 border p-1 rounded-md">
											<MarkdownToolbar onInsert={(text) => {
												const textarea = document.getElementById('faq-content') as HTMLTextAreaElement
												if (!textarea) return
												
												const start = textarea.selectionStart
												const end = textarea.selectionEnd
												const currentValue = faqForm.isLocalized 
													? (language === 'en' ? faqForm.localizedContent.en : faqForm.localizedContent.vi) 
													: faqForm.content
												
												const newValue = currentValue.substring(0, start) + text + currentValue.substring(end)
												
												if (faqForm.isLocalized) {
													setFaqForm({
														...faqForm, 
														localizedContent: {
															...faqForm.localizedContent,
															[language]: newValue
														}
													});
												} else {
													setFaqForm({...faqForm, content: newValue});
												}
												
												// Set focus back to textarea after insertion
												setTimeout(() => {
													textarea.focus()
													textarea.selectionStart = start + text.length
													textarea.selectionEnd = start + text.length
												}, 0)
											}} />
										</div>
										
										<div className="flex-1 relative border rounded-md focus-within:ring-2 focus-within:ring-primary focus-within:border-primary overflow-hidden">
											<textarea
												id="faq-content"
												className="w-full h-full p-4 font-mono text-sm resize-none border-0 outline-none focus:outline-none focus:ring-0 min-h-[350px] scrollbar-custom"
												style={{ 
													scrollbarWidth: 'thin',
													scrollbarColor: 'rgba(155, 155, 155, 0.5) transparent' 
												}}
												value={faqForm.isLocalized 
													? (language === 'en' ? faqForm.localizedContent.en : faqForm.localizedContent.vi) 
													: faqForm.content}
												onChange={(e) => {
													if (faqForm.isLocalized) {
														setFaqForm({
															...faqForm, 
															localizedContent: {
																...faqForm.localizedContent,
																[language]: e.target.value
															}
														});
													} else {
														setFaqForm({...faqForm, content: e.target.value});
													}
												}}
												placeholder={language === 'en'
													? "Write your FAQ content in Markdown..."
													: "Viết nội dung FAQ bằng Markdown..."}
											></textarea>
										</div>
									</div>

									<DialogFooter className="flex justify-between items-center mt-4">
										<Button
											type="button"
											variant="outline"
											onClick={() => {
												setFaqDialog(false)
												setEditingFaq(null)
											}}
										>
											{language === 'en' ? 'Cancel' : 'Hủy'}
										</Button>
										
										<Button
											type="button"
											onClick={() => {
												if (!faqForm.title && !faqForm.localizedTitle.en && !faqForm.localizedTitle.vi) {
													alert(language === 'en' ? 'Title is required' : 'Yêu cầu nhập tiêu đề')
													return
												}
												
												if (!faqForm.content && !faqForm.localizedContent.en && !faqForm.localizedContent.vi) {
													alert(language === 'en' ? 'Content is required' : 'Yêu cầu nhập nội dung')
													return
												}
												
												const slug = faqForm.slug || generateSlug(faqForm.title || faqForm.localizedTitle.en || faqForm.localizedTitle.vi)
												
												if (editingFaq) {
													// Update existing article
													setFaqArticles(faqArticles.map(a =>
														a.id === editingFaq.id
															? {
																	...a,
																	...faqForm,
																	slug,
																	createdAt: editingFaq.createdAt,
																	updatedAt: new Date()
																}
															: a
													))
												} else {
													// Add new article
													setFaqArticles([
														...faqArticles,
														{
															...faqForm,
															id: Date.now().toString(),
															slug,
															createdAt: new Date(),
															updatedAt: new Date()
														}
													])
												}
												
												setFaqDialog(false)
												setEditingFaq(null)
											}}
										>
											{language === 'en' ? 'Save' : 'Lưu'}
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						</div>
					)}
					
					{activeTab === 'settings' && (
						<div className="space-y-6">
							<h2 className="text-xl font-semibold">{language === 'en' ? 'General Settings' : 'Cài đặt chung'}</h2>
							
							{showSavedNotification && (
								<div className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 border rounded-md p-3 flex items-center text-green-700 dark:text-green-300">
									<svg 
										xmlns="http://www.w3.org/2000/svg" 
										className="h-5 w-5 mr-2" 
										viewBox="0 0 20 20" 
										fill="currentColor"
									>
										<path 
											fillRule="evenodd" 
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
											clipRule="evenodd" 
										/>
									</svg>
									{language === 'en' ? 'Changes saved!' : 'Đã lưu thay đổi!'}
								</div>
							)}
							
							<Card className="mb-6">
								<CardHeader>
									<CardTitle>{language === 'en' ? 'Preview' : 'Xem trước'}</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-background">
										<h1 className={`${jshineGradientClassName} text-4xl font-bold text-center mb-2`}>
											{editingSiteConfig.heroTitle}
										</h1>
										<p className="text-muted-foreground text-center">
											{editingSiteConfig.heroQuote}
										</p>
									</div>
								</CardContent>
							</Card>
							
							<div className="grid gap-4 md:grid-cols-2">
								<Card>
									<CardHeader>
										<CardTitle>{language === 'en' ? 'Gradient Title' : 'Tiêu đề gradient'}</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-2">
											<label className="text-sm font-medium">{language === 'en' ? 'Main title on homepage' : 'Tiêu đề chính trên trang chủ'}</label>
											<Input 
												value={editingSiteConfig.heroTitle}
												onChange={(e) => setEditingSiteConfig({...editingSiteConfig, heroTitle: e.target.value})}
												placeholder={language === 'en' ? 'Enter title...' : 'Nhập tiêu đề...'}
											/>
										</div>
									</CardContent>
								</Card>
								
								<Card>
									<CardHeader>
										<CardTitle>{language === 'en' ? 'Subtitle' : 'Tiêu đề nhỏ'}</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-2">
											<label className="text-sm font-medium">{language === 'en' ? 'Subtitle displayed below' : 'Tiêu đề nhỏ hiển thị bên dưới'}</label>
											<Input 
												value={editingSiteConfig.heroQuote}
												onChange={(e) => setEditingSiteConfig({...editingSiteConfig, heroQuote: e.target.value})}
												placeholder={language === 'en' ? 'Enter subtitle...' : 'Nhập tiêu đề nhỏ...'}
											/>
										</div>
									</CardContent>
								</Card>
							</div>

							<div className="grid gap-4 md:grid-cols-1">
								<Card>
									<CardHeader>
										<CardTitle>{language === 'en' ? 'Website Title' : 'Tiêu đề Website'}</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-2">
											<label className="text-sm font-medium">{language === 'en' ? 'Title displayed in browser tab' : 'Tiêu đề hiển thị trên thanh trình duyệt'}</label>
											<Input 
												value={editingSiteConfig.siteTitle || ''}
												onChange={(e) => setEditingSiteConfig({...editingSiteConfig, siteTitle: e.target.value})}
												placeholder={language === 'en' ? 'Shine Shop - Your Trusted Online Shopping Destination' : 'Shine Shop - Điểm đến mua sắm trực tuyến tin cậy'}
											/>
										</div>
									</CardContent>
								</Card>
							</div>
							
							<Button 
								onClick={() => {
									// Save settings
									setSiteConfig({...editingSiteConfig})
									setShowSavedNotification(true)
									
									// Hide notification after 3 seconds
									setTimeout(() => {
										setShowSavedNotification(false)
									}, 3000)
								}}
								className="mt-4"
							>
								{language === 'en' ? 'Save Settings' : 'Lưu cài đặt'}
							</Button>
							
							<div className="mt-8 border-t pt-6">
								<h3 className="text-xl font-semibold mb-4">{language === 'en' ? 'Admin Tools' : 'Công cụ quản trị'}</h3>
								<div className="grid gap-4 md:grid-cols-1">
									<Card>
										<CardHeader>
											<CardTitle>{language === 'en' ? 'Data Management' : 'Quản lý dữ liệu'}</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="space-y-4">
												<div>
													<p className="text-sm text-muted-foreground mb-2">
														{language === 'en' 
															? 'Update initial-data.ts file from current store data. This will cause the app to recompile.' 
															: 'Cập nhật file initial-data.ts từ dữ liệu hiện tại. Thao tác này sẽ làm ứng dụng biên dịch lại.'}
													</p>
													<Button 
														variant="outline"
														onClick={rebuildInitialData}
														disabled={isLoading}
													>
														{isLoading 
															? (language === 'en' ? 'Processing...' : 'Đang xử lý...') 
															: (language === 'en' ? 'Rebuild Initial Data' : 'Tái tạo dữ liệu ban đầu')}
													</Button>
												</div>
												
												<div>
													<p className="text-sm text-muted-foreground mb-2">
														{language === 'en' 
															? 'Publish changes to production. This will trigger a new build on Cloudflare.' 
															: 'Xuất bản thay đổi lên môi trường production. Điều này sẽ kích hoạt quá trình build mới trên Cloudflare.'}
													</p>
													<Button 
														variant="outline"
														onClick={handlePublishToProduction}
														disabled={isLoading}
													>
														{isLoading 
															? (language === 'en' ? 'Publishing...' : 'Đang xuất bản...') 
															: (language === 'en' ? 'Publish to Production' : 'Xuất bản lên Production')}
													</Button>
												</div>
											</div>
										</CardContent>
									</Card>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
			
			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteConfirmDialog} onOpenChange={setDeleteConfirmDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{language === 'en' ? 'Confirm Delete' : 'Xác nhận xóa'}</DialogTitle>
						<DialogDescription>
							{language === 'en' 
								? `Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`
								: `Bạn có chắc chắn muốn xóa "${productToDelete?.name}"? Hành động này không thể hoàn tác.`
							}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteConfirmDialog(false)}>
							{language === 'en' ? 'Cancel' : 'Hủy'}
						</Button>
						<Button variant="destructive" onClick={confirmDeleteProduct}>
							{language === 'en' ? 'Delete' : 'Xóa'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Preview Dialog */}
			<Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
			  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" aria-describedby="preview-dialog-description">
			    <DialogHeader>
			      <DialogTitle>
			        {language === 'en' ? 'Preview' : 'Xem trước'}
			      </DialogTitle>
			      <DialogDescription id="preview-dialog-description">
			        {faqForm.isLocalized 
			          ? (language === 'en' 
			              ? faqForm.localizedTitle.en || faqForm.title 
			              : faqForm.localizedTitle.vi || faqForm.title) 
			          : faqForm.title}
			      </DialogDescription>
			    </DialogHeader>

			    <div className="mt-4 border rounded p-6 bg-white dark:bg-background min-h-[300px]">
			      <div 
			        className="prose prose-sm max-w-none dark:prose-invert"
			        dangerouslySetInnerHTML={{ 
			          __html: faqForm.isLocalized
			            ? (language === 'en' ? faqForm.localizedContent.en : faqForm.localizedContent.vi)
			            : faqForm.content
			        }}
			      ></div>
			    </div>

			    <DialogFooter className="mt-4">
			      <Button onClick={() => setPreviewDialog(false)}>
			        {language === 'en' ? 'Close' : 'Đóng'}
			      </Button>
			    </DialogFooter>
			  </DialogContent>
			</Dialog>
		</div>
	</ErrorBoundary>
	)
} 