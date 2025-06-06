'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Trash2, Shield, LogOut, Plus, Home, LayoutGrid, FileText, ArrowDownWideNarrow, GripVertical, Globe, HelpCircle, Share2, Database, Upload, Search, Image as ImageIcon, Bold, Italic, Link, List, Eye, EyeOff, Settings } from 'lucide-react'
import { useStore } from '@/app/lib/store'
import { useTranslation } from '@/app/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/components/ui/dialog'
import { Product, FAQArticle, SocialLink, Language } from '@/app/lib/types'
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

// Add the jshine-gradient CSS class as in the product page
const jshineGradientClassName = "bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"

type TabType = 'products' | 'faq' | 'social' | 'tos' | 'data' | 'settings'
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
				<div 
					className="h-10 w-10 rounded bg-center bg-cover" 
					style={{ backgroundImage: `url(${product.image})` }}
				/>
				<div className="flex-1">
					<p className="font-medium">{product.name}</p>
					<div className="flex flex-wrap gap-1 mt-1">
						{product.options && product.options.length > 0 ? (
							product.options.slice(0, 3).map((option) => (
								<Badge key={option.id} variant="secondary" className="text-xs">
									{option.name}
								</Badge>
							))
						) : (
							<p className="text-xs text-muted-foreground">{product.category}</p>
						)}
						{product.options && product.options.length > 3 && (
							<Badge variant="outline" className="text-xs">
								+{product.options.length - 3}
							</Badge>
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
				className="h-8 w-8 p-0"
				onClick={() => onInsert('[link](url)')}
			>
				<Link className="h-4 w-4" />
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
	const router = useRouter()
	const { 
		isAdminAuthenticated, 
		setAdminAuthenticated,
		products,
		addProduct,
		updateProduct,
		deleteProduct,
		tosContent,
		setTosContent,
		faqArticles,
		addFaqArticle,
		updateFaqArticle,
		deleteFaqArticle,
		setFaqArticles,
		socialLinks,
		setSocialLinks,
		updateSocialLink,
		language,
		setLanguage,
		siteConfig,
		setSiteConfig
	} = useStore()
	const { t } = useTranslation()
	const [activeTab, setActiveTab] = useState<TabType>('products')
	const [productTab, setProductTab] = useState<ProductTabType>('details')
	const [editingProduct, setEditingProduct] = useState<Product | null>(null)
	const [productDialog, setProductDialog] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [tosForm, setTosForm] = useState(tosContent || '')
	const [selectedArticles, setSelectedArticles] = useState<string[]>([])
	const [sortableProducts, setSortableProducts] = useState<Product[]>([])
	const [isSaving, setIsSaving] = useState(false)
	const [isPushing, setIsPushing] = useState(false)
	const [faqDialog, setFaqDialog] = useState(false)
	const [editingFaq, setEditingFaq] = useState<FAQArticle | null>(null)
	const [faqForm, setFaqForm] = useState({
		title: '',
		content: '',
		category: 'general',
		tags: [] as string[]
	})
	const [showMarkdownPreview, setShowMarkdownPreview] = useState(false)
	const [articleSearchQuery, setArticleSearchQuery] = useState('')
	
	// Kiểm tra môi trường
	const isDevelopment = process.env.NODE_ENV === 'development'
	
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
	
	// Update sortable products when products change
	useEffect(() => {
		if (products.length > 0) {
			// Sort products by sortOrder
			setSortableProducts([...products].sort((a, b) => a.sortOrder - b.sortOrder))
		}
	}, [products])
	
	// Product form state
	const [productForm, setProductForm] = useState({
		name: '',
		localizedName: { en: '', vi: '' },
		description: '',
		localizedDescription: { en: '', vi: '' },
		image: '',
		category: '',
		slug: '',
		options: [] as NonNullable<Product['options']>,
		relatedArticles: [] as string[],
		isLocalized: false
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
	
	// Helper function to get lowest price from product options with proper null checks
	const getLowestPrice = (product: Product): number => {
		if (!product.options || product.options.length === 0) {
			return product.price || 0
		}
		
		let lowestPrice = Number.MAX_SAFE_INTEGER
		for (const option of product.options) {
			for (const value of option.values) {
				if (value.price < lowestPrice) {
					lowestPrice = value.price
				}
			}
		}
		
		return lowestPrice === Number.MAX_SAFE_INTEGER ? (product.price || 0) : lowestPrice
	}
	
	// Function to open product edit dialog
	const openProductEdit = (product: Product) => {
		setEditingProduct(product)
		setProductForm({
			name: product.name,
			localizedName: product.localizedName || { en: '', vi: '' },
			description: product.description || '',
			localizedDescription: product.localizedDescription || { en: '', vi: '' },
			image: product.image || '',
			category: product.category || '',
			slug: product.slug || '',
			options: product.options || [],
			relatedArticles: product.relatedArticles || [],
			isLocalized: product.isLocalized || false
		})
		setSelectedArticles(product.relatedArticles || [])
		setProductDialog(true)
	}
	
	// Function to add option field
	const addOptionField = () => {
		setProductForm({
			...productForm,
			options: [
				...productForm.options,
				{
					id: Date.now().toString(),
					name: '',
					type: 'select',
					values: [{ value: '', price: 0, description: '' }]
				}
			]
		})
	}
	
	// Function to remove option
	const removeOption = (optionIndex: number) => {
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
		updatedOptions[optionIndex].values.push({ value: '', price: 0, description: '' })
		
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
		
		setProductForm({
			...productForm,
			options: updatedOptions
		})
	}
	
	// Function to update option value
	const updateOptionValue = (
		optionIndex: number, 
		valueIndex: number, 
		value: string | number, 
		property: string
	) => {
		const updatedOptions = [...productForm.options]
		updatedOptions[optionIndex].values[valueIndex] = {
			...updatedOptions[optionIndex].values[valueIndex],
			[property]: property === 'price' ? Number(value) : value
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
	
	// Function to handle saving product
	const handleSaveProduct = () => {
		if (!productForm.name) {
			alert('Please enter product name')
			return
		}

		// Generate a slug if empty
		const slug = productForm.slug || generateSlug(productForm.name)
		
		// Create or update product
		const productData: Product = {
			id: editingProduct?.id || Date.now().toString(),
			name: productForm.name,
			localizedName: productForm.isLocalized ? productForm.localizedName : undefined,
			price: 0, // Default price, will be calculated from options
			description: productForm.description,
			localizedDescription: productForm.isLocalized ? productForm.localizedDescription : undefined,
			image: productForm.image,
			category: productForm.category,
			slug,
			options: productForm.options,
			relatedArticles: selectedArticles,
			sortOrder: editingProduct?.sortOrder || products.length + 1,
			isLocalized: productForm.isLocalized
		}
		
		if (editingProduct) {
			updateProduct(editingProduct.id, productData)
		} else {
			addProduct(productData)
		}
		
		// Reset form and close dialog
		setProductDialog(false)
		setEditingProduct(null)
		setProductForm({
			name: '',
			localizedName: { en: '', vi: '' },
			description: '',
			localizedDescription: { en: '', vi: '' },
			image: '',
			category: '',
			slug: '',
			options: [],
			relatedArticles: [],
			isLocalized: false
		})
		setSelectedArticles([])
	}
	
	// Handle drag end event
	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event
		
		if (over && active.id !== over.id) {
			setSortableProducts((items) => {
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
	
	// Hàm xóa sản phẩm khỏi store
	const handleDeleteProduct = (id: string) => {
		// Xóa sản phẩm khỏi store
		deleteProduct(id)
		
		// Đóng dialog nếu đang mở
		setProductDialog(false)
		setEditingProduct(null)
	}
	
	// Hàm xử lý push to GitHub
	const handlePushToGitHub = async () => {
		setIsPushing(true)
		
		try {
			// Add all changes
			const response = await fetch('/api/dev/git-push', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					commands: [
						'git add -A',
						'git commit -m "chore: update store data from admin dashboard"',
						'git push origin main'
					]
				}),
			})
			
			if (response.ok) {
				alert('Successfully pushed to GitHub! Cloudflare will auto-deploy in a few minutes.')
			} else {
				throw new Error('Failed to push to GitHub')
			}
		} catch (error) {
			console.error('Error pushing to GitHub:', error)
			alert('Error pushing to GitHub. Please check console for details.')
		} finally {
			setIsPushing(false)
		}
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
	
	// Price input validation
	const validatePriceInput = (value: string): number => {
		const cleaned = value.replace(/[^0-9.]/g, '')
		const parts = cleaned.split('.')
		
		if (parts.length > 2) {
			return parseFloat(parts[0] + '.' + parts[1]) || 0
		}
		
		return parseFloat(cleaned) || 0
	}
	
	// Filtered articles for search
	const filteredArticles = useMemo(() => {
		if (!articleSearchQuery.trim()) return faqArticles
		
		const query = articleSearchQuery.toLowerCase()
		return faqArticles.filter(article => 
			article.title.toLowerCase().includes(query) ||
			article.content.toLowerCase().includes(query) ||
			article.tags.some(tag => tag.toLowerCase().includes(query))
		)
	}, [faqArticles, articleSearchQuery])
	
	// Auto-save for product form
	const debouncedProductForm = useDebounce(productForm, 1000)
	const debouncedSelectedArticles = useDebounce(selectedArticles, 1000)
	
	useEffect(() => {
		if (editingProduct && debouncedProductForm.name) {
			// Generate a slug if empty
			const slug = debouncedProductForm.slug || generateSlug(debouncedProductForm.name)
			
			// Create updated product data
			const productData: Product = {
				...editingProduct,
				name: debouncedProductForm.name,
				localizedName: debouncedProductForm.isLocalized ? debouncedProductForm.localizedName : undefined,
				description: debouncedProductForm.description,
				localizedDescription: debouncedProductForm.isLocalized ? debouncedProductForm.localizedDescription : undefined,
				image: debouncedProductForm.image,
				category: debouncedProductForm.category,
				slug,
				options: debouncedProductForm.options,
				relatedArticles: debouncedSelectedArticles,
				isLocalized: debouncedProductForm.isLocalized
			}
			
			updateProduct(editingProduct.id, productData)
		}
	}, [debouncedProductForm, debouncedSelectedArticles, editingProduct, updateProduct])
	
	// Auto-save for TOS
	const debouncedTosForm = useDebounce(tosForm, 1000)
	
	useEffect(() => {
		if (activeTab === 'tos' && debouncedTosForm !== tosContent) {
			setTosContent(debouncedTosForm)
		}
	}, [debouncedTosForm, activeTab, tosContent, setTosContent])
	
	// Auto-save for FAQ
	const debouncedFaqForm = useDebounce(faqForm, 1000)
	
	useEffect(() => {
		if (editingFaq && debouncedFaqForm.title) {
			const updatedFaq: Partial<FAQArticle> = {
				title: debouncedFaqForm.title,
				content: debouncedFaqForm.content,
				category: debouncedFaqForm.category,
				tags: debouncedFaqForm.tags,
				updatedAt: new Date()
			}
			
			updateFaqArticle(editingFaq.id, updatedFaq)
		}
	}, [debouncedFaqForm, editingFaq, updateFaqArticle])
	
	// Site config state for editing
	const [editingSiteConfig, setEditingSiteConfig] = useState(siteConfig)
	
	// Auto-save for site config
	const debouncedSiteConfig = useDebounce(editingSiteConfig, 1000)
	const [showSavedNotification, setShowSavedNotification] = useState(false)
	
	useEffect(() => {
		if (activeTab === 'settings' && JSON.stringify(debouncedSiteConfig) !== JSON.stringify(siteConfig)) {
			setSiteConfig(debouncedSiteConfig)
			setShowSavedNotification(true)
			setTimeout(() => setShowSavedNotification(false), 2000)
		}
	}, [debouncedSiteConfig, activeTab, siteConfig, setSiteConfig])
	
	// Initialize editingSiteConfig when siteConfig changes
	useEffect(() => {
		setEditingSiteConfig(siteConfig)
	}, [siteConfig])
	
	// Nếu đang loading, hiển thị thông báo
	if (isLoading) {
		return null
	}
	
	// Trong production, không hiển thị gì
	if (!isDevelopment) {
		return null
	}
	
	return (
		<div className="flex flex-col min-h-screen">
			<style jsx global>{`
				.jshine-gradient {
					background: linear-gradient(
						to right,
						#06b6d4, /* cyan */
						#0ea5e9, /* sky/light blue */
						#8b5cf6, /* violet */
						#a855f7, /* purple */
						#d946ef, /* fuchsia */
						#ec4899, /* pink */
						#f43f5e, /* rose */
						#ef4444, /* red */
						#f97316, /* orange */
						#f59e0b, /* amber */
						#eab308, /* yellow */
						#84cc16, /* lime */
						#22c55e, /* green */
						#10b981, /* emerald */
						#06b6d4  /* back to cyan for seamless loop */
					);
					-webkit-background-clip: text;
					-webkit-text-fill-color: transparent;
					background-clip: text;
					background-size: 1000% 100%;
					animation: jshine 9s linear infinite;
				}
				
				@keyframes jshine {
					0% {
						background-position: 0% center;
					}
					100% {
						background-position: 100% center;
					}
				}
			`}</style>
			<div className="container flex h-16 items-center px-4 sm:px-6 justify-between">
				<div className="flex items-center gap-2 font-semibold">
					<Shield className="h-5 w-5" />
					<span>{t('adminDashboard')}</span>
				</div>
				<nav className="flex items-center space-x-4">
					<Button variant="ghost" size="icon" asChild>
						<a href="/" target="_blank">
							<Home className="h-5 w-5" />
							<span className="sr-only">{t('home')}</span>
						</a>
					</Button>
					<Button variant="ghost" size="icon" onClick={handleLogout}>
						<LogOut className="h-5 w-5" />
						<span className="sr-only">{t('logout')}</span>
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={toggleLanguage}
						className="flex items-center gap-2 px-3 py-1.5 h-9 w-20 rounded-full border-2 hover:border-primary transition-all duration-200"
					>
						<div className="flex items-center gap-2 justify-center w-full">
							{language === 'en' ? (
								<>
									<USFlag />
									<span className="font-medium">EN</span>
								</>
							) : (
								<>
									<VietnamFlag />
									<span className="font-medium">VN</span>
								</>
							)}
						</div>
					</Button>
				</nav>
			</div>
			
			<div className="container grid flex-1 gap-6 md:grid-cols-[200px_1fr] py-6">
				{/* Sidebar */}
				<div className="flex flex-col gap-2">
					<Button 
						variant={activeTab === 'products' ? 'default' : 'ghost'} 
						className="justify-start"
						onClick={() => setActiveTab('products')}
					>
						<Home className="mr-2 h-4 w-4" />
						{t('products')}
					</Button>
					<Button 
						variant={activeTab === 'faq' ? 'default' : 'ghost'} 
						className="justify-start"
						onClick={() => setActiveTab('faq')}
					>
						<HelpCircle className="mr-2 h-4 w-4" />
						FAQ
					</Button>
					<Button 
						variant={activeTab === 'social' ? 'default' : 'ghost'} 
						className="justify-start"
						onClick={() => setActiveTab('social')}
					>
						<Share2 className="mr-2 h-4 w-4" />
						Social Links
					</Button>
					<Button 
						variant={activeTab === 'tos' ? 'default' : 'ghost'} 
						className="justify-start"
						onClick={() => setActiveTab('tos')}
					>
						<FileText className="mr-2 h-4 w-4" />
						{t('termsOfService')}
					</Button>
					<Button 
						variant={activeTab === 'data' ? 'default' : 'ghost'} 
						className="justify-start"
						onClick={() => setActiveTab('data')}
					>
						<Database className="mr-2 h-4 w-4" />
						Quản lý dữ liệu
					</Button>
					<Button 
						variant={activeTab === 'settings' ? 'default' : 'ghost'} 
						className="justify-start"
						onClick={() => setActiveTab('settings')}
					>
						<Settings className="mr-2 h-4 w-4" />
						Cài đặt chung
					</Button>
					
					<div className="mt-auto pt-4 border-t">
						<Button
							variant="outline"
							className="w-full justify-start"
							onClick={toggleLanguage}
						>
							<Globe className="mr-2 h-4 w-4" />
							{language === 'en' 
								? <span className="flex items-center"><VietnamFlag className="mr-1" /> {t('switchToVietnamese')}</span> 
								: <span className="flex items-center"><USFlag className="mr-1" /> {t('switchToEnglish')}</span>}
						</Button>
					</div>
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
											<LayoutGrid className="h-4 w-4 mr-2" />
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
										{products.map((product) => (
											<Card key={product.id} className="overflow-hidden">
												<div className="relative aspect-video">
													{product.image && (
														<div 
															className="w-full h-full bg-cover bg-center" 
															style={{ backgroundImage: `url(${product.image})` }}
														/>
													)}
												</div>
												<CardHeader className="p-4">
													<CardTitle className="text-lg">{product.name}</CardTitle>
													<div className="flex flex-wrap gap-1 mt-1">
														{product.options?.slice(0, 2).map((option) => (
															<Badge key={option.id} variant="outline" className="text-xs">
																{option.name}: {option.values.length}
															</Badge>
														))}
														{product.options && product.options.length > 2 && (
															<Badge variant="outline" className="text-xs">
																+{product.options.length - 2} {t('moreOptions')}
															</Badge>
														)}
													</div>
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
															onClick={() => handleDeleteProduct(product.id)}
														>
															<Trash2 className="mr-2 h-3 w-3" />
															{t('delete')}
														</Button>
													</div>
												</CardContent>
											</Card>
										))}
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
														items={sortableProducts.map(product => product.id)}
														strategy={verticalListSortingStrategy}
													>
														<div className="grid grid-cols-1 gap-2">
															{sortableProducts.map((product) => (
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
								if (!open) {
									setProductDialog(false)
									setEditingProduct(null)
									setArticleSearchQuery('')
								}
							}}>
								<DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" aria-describedby="product-dialog-description">
									<DialogHeader>
										<DialogTitle>{editingProduct ? t('editProduct') : t('addProduct')}</DialogTitle>
										<DialogDescription id="product-dialog-description">
											{editingProduct ? t('editProductDescription') : t('addProductDescription')}
										</DialogDescription>
									</DialogHeader>
									<div className="space-y-4 py-4">
										<div className="flex items-center justify-between space-x-2 mb-4 pb-4 border-b">
											<div className="flex items-center space-x-2">
												<input
													type="checkbox"
													id="isLocalized"
													className="h-4 w-4"
													checked={productForm.isLocalized}
													onChange={(e) => setProductForm({...productForm, isLocalized: e.target.checked})}
												/>
												<label htmlFor="isLocalized" className="font-medium">{t('enableLocalization')}</label>
											</div>
											{productForm.isLocalized && (
												<div className="flex items-center">
													<span className="mr-2 text-sm text-muted-foreground">{t('currentlyEditing')}:</span>
													<div className="flex items-center">
														{language === 'en' ? (
															<div className="flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded">
																<USFlag />
																<span className="ml-2 font-medium">English</span>
															</div>
														) : (
															<div className="flex items-center px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded">
																<VietnamFlag />
																<span className="ml-2 font-medium">Tiếng Việt</span>
															</div>
														)}
													</div>
												</div>
											)}
										</div>
										<div className="space-y-2">
											<label>{t('name')}</label>
											{!productForm.isLocalized ? (
												<Input 
													value={productForm.name} 
													onChange={(e) => setProductForm({...productForm, name: e.target.value})}
												/>
											) : (
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
											)}
										</div>
										
										{/* Custom URL Slug */}
										<div className="space-y-2">
											<label>URL Slug <span className="text-xs text-muted-foreground">(/product/...)</span></label>
											<Input 
												value={productForm.slug} 
												onChange={(e) => setProductForm({...productForm, slug: e.target.value})}
												placeholder="custom-product-url"
											/>
											<p className="text-xs text-muted-foreground">
												{t('fullURL')}: {typeof window !== 'undefined' ? window.location.origin : ''}/store/product/{productForm.slug}
											</p>
										</div>
										
										<div className="space-y-2">
											<label>{t('imageURL')}</label>
											<Input 
												value={productForm.image} 
												onChange={(e) => setProductForm({...productForm, image: e.target.value})}
											/>
											{productForm.image && (
												<div className="mt-2 relative w-full h-40 bg-center bg-cover rounded-md" 
													style={{ backgroundImage: `url(${productForm.image})` }}
												/>
											)}
										</div>
										<div className="space-y-2">
											<label>{t('category')}</label>
											<Input 
												value={productForm.category} 
												onChange={(e) => setProductForm({...productForm, category: e.target.value})}
											/>
										</div>
										
										{/* Product Options - Nested Options */}
										<div className="space-y-4 border-t pt-4">
											<div className="flex justify-between items-center">
												<h3 className="text-lg font-semibold">{t('productOptions')}</h3>
												<Button 
													size="sm" 
													variant="outline" 
													onClick={addOptionField}
												>
													<Plus className="w-4 h-4 mr-1" /> {t('addOption')}
												</Button>
											</div>
											
											<p className="text-sm text-muted-foreground">
												{t('optionPriceFormat')}
											</p>
											
											{productForm.options.map((option, optionIndex) => (
												<div key={option.id} className="border rounded-md p-4 space-y-3">
													<div className="flex items-center justify-between">
														<h4 className="font-medium">Option {optionIndex + 1}</h4>
														<Button 
															variant="ghost" 
															size="sm" 
															className="h-8 w-8 p-0 text-destructive"
															onClick={() => removeOption(optionIndex)}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
													
													<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
														<div className="space-y-2">
															<label className="text-sm font-medium">{t('optionName')}</label>
															<Input 
																value={option.name} 
																onChange={(e) => updateOption(optionIndex, 'name', e.target.value)}
																placeholder="Color, Size, etc."
															/>
														</div>
													</div>
													
													<div className="space-y-2">
														<div className="flex justify-between items-center">
															<label className="text-sm font-medium">{t('optionValues')}</label>
															<Button 
																variant="ghost" 
																size="sm"
																onClick={() => addValueToOption(optionIndex)}
															>
																<Plus className="h-3 w-3 mr-1" /> {t('addValue')}
															</Button>
														</div>
														
														{option.values.map((value, valueIndex) => (
															<div key={valueIndex} className="space-y-3 border p-3 rounded-md mb-3">
																<div className="flex justify-between items-center">
																	<h5 className="font-medium text-sm">Option Value {valueIndex + 1}</h5>
																	{option.values.length > 1 && (
																		<Button 
																			variant="ghost" 
																			size="sm" 
																			className="p-0 h-8 w-8 text-destructive"
																			onClick={() => removeOptionValue(optionIndex, valueIndex)}
																		>
																			<Trash2 className="h-4 w-4" />
																		</Button>
																	)}
																</div>
																
																<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
																	<div className="space-y-2">
																		<label className="text-xs text-muted-foreground">Value Name</label>
																		<Input 
																			value={value.value}
																			onChange={(e) => updateOptionValue(optionIndex, valueIndex, e.target.value, 'value')}
																			placeholder="e.g., Red, Small, etc."
																			className="flex-1"
																		/>
																	</div>
																	
																	<div className="space-y-2">
																		<label className="text-xs text-muted-foreground">Price ({language === 'en' ? 'USD' : 'VNĐ'})</label>
																		<Input 
																			value={value.price}
																			onChange={(e) => {
																				const validatedPrice = validatePriceInput(e.target.value)
																				updateOptionValue(optionIndex, valueIndex, validatedPrice, 'price')
																			}}
																			placeholder={language === 'en' ? "e.g., 100.00" : "e.g., 100000"}
																			className="flex-1"
																		/>
																		<p className="text-xs text-muted-foreground">
																			{formatPrice(value.price, language)}
																		</p>
																	</div>
																</div>
																
																<div className="space-y-2">
																	<label className="text-xs text-muted-foreground">Description</label>
																	<Input 
																		value={value.description}
																		onChange={(e) => updateOptionValue(optionIndex, valueIndex, e.target.value, 'description')}
																		placeholder="Describe this option value"
																		className="flex-1"
																	/>
																</div>
															</div>
														))}
													</div>
												</div>
											))}
										</div>
										
										{/* Description - Markdown */}
										<div className="space-y-2 border-t pt-4">
											<label>{t('description')} <span className="text-xs text-muted-foreground">(Markdown)</span></label>
											{!productForm.isLocalized ? (
												<textarea 
													className="w-full p-2 border rounded-md min-h-[200px]"
													value={productForm.description} 
													onChange={(e) => setProductForm({...productForm, description: e.target.value})}
													placeholder="Product description in Markdown format..."
												/>
											) : (
												<textarea 
													className="w-full p-2 border rounded-md min-h-[200px]"
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
													placeholder={language === 'en' 
														? "Product description in English (Markdown format)..." 
														: "Mô tả sản phẩm bằng tiếng Việt (định dạng Markdown)..."}
												/>
											)}
										</div>
										
										{/* Related Articles */}
										<div className="space-y-4 border-t pt-4">
											<h3 className="text-lg font-semibold">{t('relatedArticles')}</h3>
											
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
											
											<div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2 border rounded-md">
												{filteredArticles.length > 0 ? (
													filteredArticles.map(article => (
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
									<DialogFooter>
										<Button onClick={handleSaveProduct}>{t('save')}</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						</div>
					)}
					
					{activeTab === 'faq' && (
						<div className="space-y-6">
							<div className="flex justify-between items-center">
								<h2 className="text-xl font-semibold">FAQ Management</h2>
								<Button 
									onClick={() => {
										const newArticle: FAQArticle = {
											id: Date.now().toString(),
											title: 'New FAQ Article',
											content: '# New FAQ Article\n\nWrite your content here...',
											category: 'general',
											slug: 'new-faq-' + Date.now(),
											createdAt: new Date(),
											updatedAt: new Date(),
											tags: []
										}
										addFaqArticle(newArticle)
										setEditingFaq(newArticle)
										setFaqForm({
											title: newArticle.title,
											content: newArticle.content,
											category: newArticle.category,
											tags: newArticle.tags
										})
										setFaqDialog(true)
									}}
								>
									<Plus className="mr-2 h-4 w-4" />
									Add FAQ
								</Button>
							</div>
							
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{faqArticles.map((article) => (
									<Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
										<CardHeader className="p-4">
											<CardTitle className="text-lg">{article.title}</CardTitle>
											<div className="flex flex-wrap gap-1 mt-2">
												<Badge variant="secondary" className="text-xs">
													{article.category}
												</Badge>
												{article.tags.slice(0, 2).map(tag => (
													<Badge key={tag} variant="outline" className="text-xs">
														{tag}
													</Badge>
												))}
												{article.tags.length > 2 && (
													<Badge variant="outline" className="text-xs">
														+{article.tags.length - 2}
													</Badge>
												)}
											</div>
										</CardHeader>
										<CardContent className="p-4 pt-0">
											<p className="text-sm mb-4 line-clamp-3 text-muted-foreground">
												{article.content.replace(/[#*\[\]]/g, '').substring(0, 150)}...
											</p>
											<div className="flex space-x-2">
												<Button 
													variant="outline" 
													size="sm" 
													className="flex-1"
													onClick={() => {
														setEditingFaq(article)
														setFaqForm({
															title: article.title,
															content: article.content,
															category: article.category,
															tags: article.tags
														})
														setFaqDialog(true)
													}}
												>
													<Edit className="mr-2 h-3 w-3" />
													Edit
												</Button>
												<Button 
													variant="outline" 
													size="sm" 
													className="flex-1 text-destructive hover:text-destructive"
													onClick={() => {
														if (confirm('Delete this FAQ?')) {
															deleteFaqArticle(article.id)
														}
													}}
												>
													<Trash2 className="mr-2 h-3 w-3" />
													Delete
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
									setShowMarkdownPreview(false)
								}
							}}>
								<DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" aria-describedby="faq-dialog-description">
									<DialogHeader>
										<DialogTitle>{editingFaq ? 'Edit FAQ Article' : 'Add FAQ Article'}</DialogTitle>
										<DialogDescription id="faq-dialog-description">
											Write your FAQ content using Markdown formatting
										</DialogDescription>
									</DialogHeader>
									<div className="flex-1 overflow-hidden flex flex-col">
										<div className="space-y-4 pb-4">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div className="space-y-2">
													<label className="text-sm font-medium">Title</label>
													<Input 
														value={faqForm.title}
														onChange={(e) => setFaqForm({...faqForm, title: e.target.value})}
														placeholder="FAQ title..."
														className="w-full"
													/>
												</div>
												<div className="space-y-2">
													<label className="text-sm font-medium">Category</label>
													<Input 
														value={faqForm.category}
														onChange={(e) => setFaqForm({...faqForm, category: e.target.value})}
														placeholder="e.g., general, technical, billing"
														className="w-full"
													/>
												</div>
											</div>
											
											<div className="space-y-2">
												<label className="text-sm font-medium">Tags (comma separated)</label>
												<Input 
													value={faqForm.tags.join(', ')}
													onChange={(e) => setFaqForm({
														...faqForm, 
														tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
													})}
													placeholder="tag1, tag2, tag3"
													className="w-full"
												/>
											</div>
										</div>
										
										<div className="flex-1 overflow-hidden">
											<div className="flex items-center justify-between mb-2">
												<label className="text-sm font-medium">Content</label>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
												>
													{showMarkdownPreview ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
													{showMarkdownPreview ? 'Hide Preview' : 'Show Preview'}
												</Button>
											</div>
											
											<div className={`grid ${showMarkdownPreview ? 'grid-cols-2 gap-4' : 'grid-cols-1'} h-[400px]`}>
												<div className="border rounded-md overflow-hidden flex flex-col">
													<MarkdownToolbar 
														onInsert={(text) => {
															const textarea = document.getElementById('faq-content') as HTMLTextAreaElement
															if (textarea) {
																const start = textarea.selectionStart
																const end = textarea.selectionEnd
																const currentValue = faqForm.content
																const newValue = currentValue.substring(0, start) + text + currentValue.substring(end)
																setFaqForm({...faqForm, content: newValue})
																
																// Restore cursor position
																setTimeout(() => {
																	textarea.focus()
																	textarea.setSelectionRange(start + text.length, start + text.length)
																}, 0)
															}
														}}
													/>
													<textarea
														id="faq-content"
														className="flex-1 w-full p-3 resize-none font-mono text-sm"
														value={faqForm.content}
														onChange={(e) => setFaqForm({...faqForm, content: e.target.value})}
														placeholder="Write your FAQ content in Markdown..."
													/>
												</div>
												
												{showMarkdownPreview && (
													<div className="border rounded-md p-4 overflow-y-auto bg-muted/10">
														<div 
															className="prose prose-sm dark:prose-invert max-w-none"
															dangerouslySetInnerHTML={{
																__html: faqForm.content
																	.replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
																	.replace(/^## (.*?)$/gm, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
																	.replace(/^### (.*?)$/gm, '<h3 class="text-lg font-semibold mb-2">$1</h3>')
																	.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
																	.replace(/\*(.*?)\*/g, '<em>$1</em>')
																	.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline">$1</a>')
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
									<DialogFooter className="mt-4"></DialogFooter>
								</DialogContent>
							</Dialog>
						</div>
					)}
					
					{activeTab === 'social' && (
						<div className="space-y-6">
							<div className="flex justify-between items-center">
								<h2 className="text-xl font-semibold">Social Links Management</h2>
								<Button 
									onClick={() => {
										const newLink: SocialLink = {
											id: Date.now().toString(),
											platform: 'new-platform',
											url: 'https://example.com',
											icon: 'icon-name'
										}
										setSocialLinks([...socialLinks, newLink])
									}}
								>
									<Plus className="mr-2 h-4 w-4" />
									Add Social Link
								</Button>
							</div>
							
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{socialLinks.map((link) => (
									<Card key={link.id} className="overflow-hidden">
										<CardHeader className="p-4">
											<CardTitle className="text-lg">{link.platform}</CardTitle>
											<div className="text-sm text-muted-foreground">
												{link.url}
											</div>
										</CardHeader>
										<CardContent className="p-4 pt-0">
											<div className="flex space-x-2">
												<Button 
													variant="outline" 
													size="sm" 
													className="flex-1"
													onClick={() => {
														const newUrl = prompt('New URL:', link.url)
														if (newUrl) {
															updateSocialLink(link.id, { url: newUrl })
														}
													}}
												>
													<Edit className="mr-2 h-3 w-3" />
													Edit
												</Button>
												<Button 
													variant="outline" 
													size="sm" 
													className="flex-1 text-destructive hover:text-destructive"
													onClick={() => {
														if (confirm('Delete this social link?')) {
															setSocialLinks(socialLinks.filter(l => l.id !== link.id))
														}
													}}
												>
													<Trash2 className="mr-2 h-3 w-3" />
													Delete
												</Button>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</div>
					)}
					
					{activeTab === 'tos' && (
						<div className="space-y-6">
							<h2 className="text-xl font-semibold">{t('termsOfService')}</h2>
							<div className="space-y-4">
								<Card>
									<CardHeader>
										<CardTitle>{t('editTOS')}</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-2">
											<label className="text-sm font-medium">{t('tosContent')}</label>
											<textarea 
												className="w-full p-2 border rounded-md min-h-[400px]"
												value={tosForm} 
												onChange={(e) => setTosForm(e.target.value)}
												placeholder={language === 'en' ? "Enter terms of service content..." : "Nhập nội dung điều khoản dịch vụ..."}
											/>
										</div>
									</CardContent>
								</Card>
							</div>
						</div>
					)}
					
					{activeTab === 'data' && (
						<div className="space-y-6">
							<h2 className="text-xl font-semibold">Quản lý dữ liệu</h2>
							<Card>
								<CardHeader>
									<CardTitle>Đẩy code lên GitHub</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<p className="text-sm text-muted-foreground">
										Khi bạn thay đổi bất kỳ nội dung nào trong Admin Dashboard, các thay đổi sẽ được lưu tự động. 
										Nhấn nút bên dưới để đẩy toàn bộ code lên GitHub và Cloudflare sẽ tự động deploy trong vài phút.
									</p>
									
									<Button 
										onClick={handlePushToGitHub}
										disabled={isPushing}
										className="w-full"
										size="lg"
									>
										<Upload className="mr-2 h-5 w-5" />
										{isPushing ? 'Đang đẩy lên GitHub...' : 'Đẩy code lên GitHub'}
									</Button>
									
									<div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-4">
										<p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">
											⚠️ Lưu ý:
										</p>
										<ul className="text-sm text-amber-800 dark:text-amber-300 space-y-1 list-disc list-inside">
											<li>Chỉ sử dụng tính năng này khi bạn đã hoàn thành các thay đổi</li>
											<li>Sau khi push, Cloudflare sẽ tự động build và deploy trong 2-5 phút</li>
											<li>Kiểm tra trạng thái deploy tại Cloudflare Dashboard</li>
										</ul>
									</div>
								</CardContent>
							</Card>
						</div>
					)}
					
					{activeTab === 'settings' && (
						<div className="space-y-6">
							<h2 className="text-xl font-semibold">Cài đặt chung</h2>
							
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
									Đã lưu thay đổi!
								</div>
							)}
							
							<Card className="mb-6">
								<CardHeader>
									<CardTitle>Xem trước</CardTitle>
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
										<CardTitle>Tiêu đề gradient</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-2">
											<label className="text-sm font-medium">Tiêu đề chính trên trang chủ</label>
											<Input 
												value={editingSiteConfig.heroTitle}
												onChange={(e) => setEditingSiteConfig({...editingSiteConfig, heroTitle: e.target.value})}
												placeholder="Nhập tiêu đề..."
											/>
										</div>
									</CardContent>
								</Card>
								
								<Card>
									<CardHeader>
										<CardTitle>Tiêu đề nhỏ</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-2">
											<label className="text-sm font-medium">Tiêu đề nhỏ hiển thị bên dưới</label>
											<Input 
												value={editingSiteConfig.heroQuote}
												onChange={(e) => setEditingSiteConfig({...editingSiteConfig, heroQuote: e.target.value})}
												placeholder="Nhập tiêu đề nhỏ..."
											/>
										</div>
									</CardContent>
								</Card>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
} 