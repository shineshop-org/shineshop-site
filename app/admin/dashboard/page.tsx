'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Trash2, Shield, LogOut, Plus, Home, LayoutGrid, FileText, ArrowDownWideNarrow, GripVertical, Globe } from 'lucide-react'
import { useStore } from '@/app/lib/store'
import { useTranslation } from '@/app/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/components/ui/dialog'
import { Product, FAQArticle } from '@/app/lib/types'
import { generateSlug } from '@/app/lib/utils'
import { clearAuthCookie, ADMIN_CREDENTIALS, getAuthCookie, verifySpecialToken, ADMIN_ACCESS_COOKIE } from '@/app/lib/auth'
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
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'

type TabType = 'products' | 'tos'
type ProductTabType = 'details' | 'card-order'

// Sortable item component for drag and drop
function SortableProductItem({ product, getLowestPrice }: { product: Product; getLowestPrice: (product: Product) => number }) {
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
				<div>
					<p className="font-medium">{product.name}</p>
					<p className="text-xs text-muted-foreground">
						{product.category}
					</p>
				</div>
			</div>
			<div className="flex-shrink-0">
				<p className="text-primary font-semibold">
					{new Intl.NumberFormat('vi-VN', { 
						style: 'currency', 
						currency: 'VND',
						minimumFractionDigits: 0,
						maximumFractionDigits: 0
					}).format(getLowestPrice(product))}
				</p>
			</div>
		</div>
	)
}

// Flag SVG Components
const VietnamFlag = () => (
	<svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect width="24" height="16" fill="#DA251D"/>
		<path d="M12 3L13.2 6.6H17L14 8.8L15.2 12.4L12 10.2L8.8 12.4L10 8.8L7 6.6H10.8L12 3Z" fill="#FFFF00"/>
	</svg>
)

const USFlag = () => (
	<svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
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

export default function AdminDashboardPage() {
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
		language,
		setLanguage
	} = useStore()
	const { t } = useTranslation()
	const [activeTab, setActiveTab] = useState<TabType>('products')
	const [productTab, setProductTab] = useState<ProductTabType>('details')
	const [editingProduct, setEditingProduct] = useState<Product | null>(null)
	const [productDialog, setProductDialog] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [tosForm, setTosForm] = useState(tosContent)
	const [selectedArticles, setSelectedArticles] = useState<string[]>([])
	const [sortableProducts, setSortableProducts] = useState<Product[]>([])
	const [isSaving, setIsSaving] = useState(false)
	
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
		localizedName: {
			en: '',
			vi: ''
		},
		description: '',
		localizedDescription: {
			en: '',
			vi: ''
		},
		image: '',
		category: '',
		options: [] as {
			id: string;
			name: string;
			type: 'select' | 'radio';
			values: string[];
		}[],
		relatedArticles: [] as string[],
		isLocalized: false
	})
	
	useEffect(() => {
		// Kiểm tra cookie đặc biệt
		const cookies = document.cookie.split(';')
		const hasAccessCookie = cookies.some(cookie => {
			const [name] = cookie.trim().split('=')
			return name === ADMIN_ACCESS_COOKIE.name
		})
		
		// Nếu không có cookie đặc biệt, chuyển hướng đến 404
		if (!hasAccessCookie) {
			setTimeout(() => {
				window.location.href = '/404'
			}, 100)
			return
		}
		
		// Kiểm tra xác thực
		const authCookie = getAuthCookie()
		if (!authCookie || !verifySpecialToken(authCookie)) {
			router.push('/admin')
			return
		}
		
		setIsLoading(false)
	}, [router])
	
	// Handle updating selectedArticles when editing product is set
	useEffect(() => {
		if (editingProduct && editingProduct.relatedArticles) {
			setSelectedArticles(editingProduct.relatedArticles)
		} else {
			setSelectedArticles([])
		}
	}, [editingProduct])
	
	const handleLogout = () => {
		clearAuthCookie()
		setAdminAuthenticated(false)
		router.push('/admin')
	}
	
	const toggleLanguage = () => {
		setLanguage(language === 'en' ? 'vi' : 'en')
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
	
	const handleSaveProduct = () => {
		// Get the lowest price from options if available
		const optionValues = productForm.options.flatMap(option => 
			option.values.map(value => {
				// Try to extract price from format like "Option - $10"
				const priceMatch = value.match(/.*?[- ]\$?(\d+(?:\.\d+)?)$/)
				return priceMatch ? parseFloat(priceMatch[1]) : Infinity
			})
		)
		
		// Set the lowest price found or fallback to 0
		const lowestPrice = optionValues.length > 0 
			? Math.min(...optionValues.filter(price => price !== Infinity))
			: 0
			
		const newProduct: Product = {
			id: editingProduct?.id || Date.now().toString(),
			name: productForm.name,
			price: !isNaN(lowestPrice) && isFinite(lowestPrice) ? lowestPrice : 0,
			description: productForm.description,
			image: productForm.image,
			category: productForm.category,
			slug: editingProduct?.slug || generateSlug(productForm.name),
			sortOrder: editingProduct?.sortOrder || 999, // Default to end of list
			options: productForm.options,
			relatedArticles: selectedArticles
		}
		
		// Add localization if enabled
		if (productForm.isLocalized) {
			newProduct.isLocalized = true
			newProduct.localizedName = {
				en: productForm.localizedName.en || productForm.name,
				vi: productForm.localizedName.vi || productForm.name
			}
			newProduct.localizedDescription = {
				en: productForm.localizedDescription.en || productForm.description,
				vi: productForm.localizedDescription.vi || productForm.description
			}
		}
		
		if (editingProduct) {
			updateProduct(editingProduct.id, newProduct)
		} else {
			addProduct(newProduct)
		}
		
		setProductDialog(false)
		resetProductForm()
		
		// Force sync to ensure data is saved
		useStore.getState().syncDataToServer()
	}
	
	const handleSaveTos = () => {
		setTosContent(tosForm)
		useStore.getState().syncDataToServer()
		alert('Điều khoản dịch vụ đã được cập nhật!')
	}
	
	const resetProductForm = () => {
		setProductForm({
			name: '',
			localizedName: {
				en: '',
				vi: ''
			},
			description: '',
			localizedDescription: {
				en: '',
				vi: ''
			},
			image: '',
			category: '',
			options: [],
			relatedArticles: [],
			isLocalized: false
		})
		setSelectedArticles([])
		setEditingProduct(null)
	}
	
	const openProductEdit = (product: Product) => {
		setEditingProduct(product)
		
		// Initialize form with existing product data
		const formData = {
			name: product.name,
			localizedName: product.localizedName || {
				en: product.name,
				vi: product.name
			},
			description: product.description,
			localizedDescription: product.localizedDescription || {
				en: product.description,
				vi: product.description
			},
			image: product.image,
			category: product.category,
			options: product.options || [],
			relatedArticles: product.relatedArticles || [],
			isLocalized: product.isLocalized || false
		}
		
		setProductForm(formData)
		setSelectedArticles(product.relatedArticles || [])
		setProductDialog(true)
	}
	
	const addOptionField = () => {
		const newOption = {
			id: Date.now().toString(),
			name: '',
			type: 'select' as const,
			values: ['']
		}
		setProductForm({
			...productForm,
			options: [...productForm.options, newOption]
		})
	}
	
	const updateOption = (index: number, field: string, value: any) => {
		const updatedOptions = [...productForm.options]
		updatedOptions[index] = {
			...updatedOptions[index],
			[field]: value
		}
		setProductForm({
			...productForm,
			options: updatedOptions
		})
	}
	
	const updateOptionValue = (optionIndex: number, valueIndex: number, value: string) => {
		const updatedOptions = [...productForm.options]
		const optionValues = [...updatedOptions[optionIndex].values]
		optionValues[valueIndex] = value
		updatedOptions[optionIndex] = {
			...updatedOptions[optionIndex],
			values: optionValues
		}
		setProductForm({
			...productForm,
			options: updatedOptions
		})
	}
	
	const addValueToOption = (optionIndex: number) => {
		const updatedOptions = [...productForm.options]
		updatedOptions[optionIndex] = {
			...updatedOptions[optionIndex],
			values: [...updatedOptions[optionIndex].values, '']
		}
		setProductForm({
			...productForm,
			options: updatedOptions
		})
	}
	
	const removeOption = (index: number) => {
		const updatedOptions = [...productForm.options]
		updatedOptions.splice(index, 1)
		setProductForm({
			...productForm,
			options: updatedOptions
		})
	}
	
	const removeOptionValue = (optionIndex: number, valueIndex: number) => {
		const updatedOptions = [...productForm.options]
		const optionValues = [...updatedOptions[optionIndex].values]
		optionValues.splice(valueIndex, 1)
		updatedOptions[optionIndex] = {
			...updatedOptions[optionIndex],
			values: optionValues
		}
		setProductForm({
			...productForm,
			options: updatedOptions
		})
	}
	
	const toggleArticleSelection = (articleId: string) => {
		setSelectedArticles(prev => {
			if (prev.includes(articleId)) {
				return prev.filter(id => id !== articleId)
			} else {
				return [...prev, articleId]
			}
		})
	}
	
	// Calculate lowest price for display
	const getLowestPrice = (product: Product) => {
		if (!product.options || product.options.length === 0) {
			return product.price
		}
		
		const optionValues = product.options.flatMap(option => 
			option.values.map(value => {
				const priceMatch = value.match(/.*?[- ]\$?(\d+(?:\.\d+)?)$/)
				return priceMatch ? parseFloat(priceMatch[1]) : Infinity
			})
		)
		
		const lowestPrice = optionValues.length > 0 
			? Math.min(...optionValues.filter(price => price !== Infinity))
			: product.price
			
		return !isNaN(lowestPrice) && isFinite(lowestPrice) ? lowestPrice : product.price
	}
	
	// Nếu đang loading, không hiển thị gì
	if (isLoading) {
		return null
	}
	
	if (!isAdminAuthenticated) {
		return null
	}
	
	return (
		<div className="flex flex-col min-h-screen">
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
						variant={activeTab === 'tos' ? 'default' : 'ghost'} 
						className="justify-start"
						onClick={() => setActiveTab('tos')}
					>
						<Home className="mr-2 h-4 w-4" />
						{t('termsOfService')}
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
															onClick={() => {
																if (confirm('Are you sure you want to delete this product?')) {
																	deleteProduct(product.id)
																}
															}}
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
												
												{isSaving && (
													<p className="text-sm text-primary mb-4">
														{t('savingChanges')}...
													</p>
												)}
												
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
							<Dialog open={productDialog} onOpenChange={setProductDialog}>
								<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby="product-dialog-description">
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
														
														<div className="space-y-2">
															<label className="text-sm font-medium">{t('optionType')}</label>
															<select 
																className="w-full p-2 border rounded-md"
																value={option.type}
																onChange={(e) => updateOption(optionIndex, 'type', e.target.value)}
															>
																<option value="select">Dropdown Select</option>
																<option value="radio">Radio Button</option>
															</select>
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
															<div key={valueIndex} className="flex items-center space-x-2">
																<Input 
																	value={value}
																	onChange={(e) => updateOptionValue(optionIndex, valueIndex, e.target.value)}
																	placeholder="Option value (e.g., 'Red', 'Small - $10')"
																	className="flex-1"
																/>
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
											
											<div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2">
												{faqArticles.map(article => (
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
												))}
											</div>
										</div>
									</div>
									<DialogFooter>
										<Button variant="outline" onClick={() => setProductDialog(false)}>{t('cancel')}</Button>
										<Button onClick={handleSaveProduct}>{t('save')}</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
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
											/>
										</div>
									</CardContent>
								</Card>
								
								<div className="flex justify-end">
									<Button onClick={handleSaveTos}>{t('saveTOS')}</Button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
} 