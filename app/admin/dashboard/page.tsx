'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Trash2, Shield, LogOut, Plus, Home, LayoutGrid, FileText, ArrowDownWideNarrow } from 'lucide-react'
import { useStore } from '@/app/lib/store'
import { useTranslation } from '@/app/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog'
import { Product, FAQArticle } from '@/app/lib/types'
import { generateSlug } from '@/app/lib/utils'
import { clearAuthCookie, ADMIN_CREDENTIALS, getAuthCookie, verifySpecialToken, ADMIN_ACCESS_COOKIE } from '@/app/lib/auth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { Badge } from '@/app/components/ui/badge'

type TabType = 'products' | 'tos'
type ProductTabType = 'details' | 'card-order'

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
		faqArticles
	} = useStore()
	const { t } = useTranslation()
	const [activeTab, setActiveTab] = useState<TabType>('products')
	const [productTab, setProductTab] = useState<ProductTabType>('details')
	const [editingProduct, setEditingProduct] = useState<Product | null>(null)
	const [productDialog, setProductDialog] = useState(false)
	const [cardOrderDialog, setCardOrderDialog] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [tosForm, setTosForm] = useState(tosContent)
	const [selectedArticles, setSelectedArticles] = useState<string[]>([])
	
	// Product form state
	const [productForm, setProductForm] = useState({
		name: '',
		description: '',
		image: '',
		category: '',
		options: [] as {
			id: string;
			name: string;
			type: 'select' | 'radio';
			values: string[];
		}[],
		relatedArticles: [] as string[]
	})
	
	// Sort order form
	const [sortOrderForm, setOrderForm] = useState({
		id: '',
		sortOrder: 1
	})
	
	// Check for duplicate sort orders
	const [sortOrderError, setSortOrderError] = useState('')
	
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
	
	const openCardOrderEdit = (product: Product) => {
		setOrderForm({
			id: product.id,
			sortOrder: product.sortOrder || 1
		})
		setCardOrderDialog(true)
	}
	
	const handleSaveSortOrder = () => {
		// Check if the sort order already exists
		const isDuplicate = products.some(p => 
			p.id !== sortOrderForm.id && p.sortOrder === sortOrderForm.sortOrder
		)
		
		if (isDuplicate) {
			setSortOrderError(t('sortOrderExists'))
			return
		}
		
		// Update product sort order
		updateProduct(sortOrderForm.id, { sortOrder: sortOrderForm.sortOrder })
		setCardOrderDialog(false)
		setSortOrderError('')
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
			description: '',
			image: '',
			category: '',
			options: [],
			relatedArticles: []
		})
		setSelectedArticles([])
		setEditingProduct(null)
	}
	
	const openProductEdit = (product: Product) => {
		setEditingProduct(product)
		setProductForm({
			name: product.name,
			description: product.description,
			image: product.image,
			category: product.category,
			options: product.options || [],
			relatedArticles: product.relatedArticles || []
		})
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
									{/* Product Cards Order Tab */}
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
													{t('productCardsOrderDescription')}
												</p>
												
												<div className="grid grid-cols-1 gap-2">
													{products
														.sort((a, b) => a.sortOrder - b.sortOrder)
														.map((product) => (
															<div key={product.id} className="flex items-center justify-between border p-3 rounded-md">
																<div className="flex items-center gap-3">
																	<div 
																		className="h-10 w-10 rounded bg-center bg-cover" 
																		style={{ backgroundImage: `url(${product.image})` }}
																	/>
																	<div>
																		<p className="font-medium">{product.name}</p>
																		<p className="text-xs text-muted-foreground">
																			{t('sortOrder')}: {product.sortOrder}
																		</p>
																	</div>
																</div>
																<div className="flex items-center gap-2">
																	<p className="text-primary font-semibold">
																		{new Intl.NumberFormat('vi-VN', { 
																			style: 'currency', 
																			currency: 'VND',
																			minimumFractionDigits: 0,
																			maximumFractionDigits: 0
																		}).format(getLowestPrice(product))}
																	</p>
																	<Button 
																		variant="ghost" 
																		size="icon" 
																		onClick={() => openCardOrderEdit(product)}
																	>
																		<Edit className="h-4 w-4" />
																	</Button>
																</div>
															</div>
														))}
												</div>
											</CardContent>
										</Card>
									</div>
								</TabsContent>
							</Tabs>
							
							{/* Product Dialog */}
							<Dialog open={productDialog} onOpenChange={setProductDialog}>
								<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
									<DialogHeader>
										<DialogTitle>{editingProduct ? t('editProduct') : t('addProduct')}</DialogTitle>
									</DialogHeader>
									<div className="space-y-4 py-4">
										<div className="space-y-2">
											<label>{t('name')}</label>
											<Input 
												value={productForm.name} 
												onChange={(e) => setProductForm({...productForm, name: e.target.value})}
											/>
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
											<textarea 
												className="w-full p-2 border rounded-md min-h-[200px]"
												value={productForm.description} 
												onChange={(e) => setProductForm({...productForm, description: e.target.value})}
												placeholder="Product description in Markdown format..."
											/>
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
							
							{/* Sort Order Dialog */}
							<Dialog open={cardOrderDialog} onOpenChange={setCardOrderDialog}>
								<DialogContent className="sm:max-w-md">
									<DialogHeader>
										<DialogTitle>{t('editCardSortOrder')}</DialogTitle>
									</DialogHeader>
									<div className="space-y-4 py-4">
										<div className="space-y-2">
											<label>{t('sortOrder')}</label>
											<Input 
												type="number" 
												min="1"
												value={sortOrderForm.sortOrder} 
												onChange={(e) => {
													setOrderForm({...sortOrderForm, sortOrder: parseInt(e.target.value) || 1})
													setSortOrderError('')
												}}
											/>
											{sortOrderError && (
												<p className="text-sm text-destructive mt-1">{sortOrderError}</p>
											)}
											<p className="text-xs text-muted-foreground mt-2">
												{t('sortOrderHint')}
											</p>
										</div>
									</div>
									<DialogFooter>
										<Button variant="outline" onClick={() => setCardOrderDialog(false)}>
											{t('cancel')}
										</Button>
										<Button onClick={handleSaveSortOrder}>{t('save')}</Button>
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