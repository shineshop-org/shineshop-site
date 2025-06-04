'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Trash2, Shield, LogOut, Plus, Home } from 'lucide-react'
import { useStore } from '@/app/lib/store'
import { useTranslation } from '@/app/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog'
import { Product } from '@/app/lib/types'
import { generateSlug } from '@/app/lib/utils'
import { clearAuthCookie, ADMIN_CREDENTIALS, getAuthCookie, verifySpecialToken, ADMIN_ACCESS_COOKIE } from '@/app/lib/auth'

type TabType = 'products' | 'tos'

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
		setTosContent
	} = useStore()
	const { t } = useTranslation()
	const [activeTab, setActiveTab] = useState<TabType>('products')
	const [editingProduct, setEditingProduct] = useState<Product | null>(null)
	const [productDialog, setProductDialog] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [tosForm, setTosForm] = useState(tosContent)
	
	// Product form state
	const [productForm, setProductForm] = useState({
		name: '',
		price: '',
		description: '',
		image: '',
		category: '',
		sortOrder: '1',
		options: [] as {
			id: string;
			name: string;
			type: 'select' | 'radio';
			values: string[];
		}[]
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
	
	const handleLogout = () => {
		clearAuthCookie()
		setAdminAuthenticated(false)
		router.push('/admin')
	}
	
	const handleSaveProduct = () => {
		const newProduct: Product = {
			id: editingProduct?.id || Date.now().toString(),
			name: productForm.name,
			price: Number(productForm.price),
			description: productForm.description,
			image: productForm.image,
			category: productForm.category,
			slug: editingProduct?.slug || generateSlug(productForm.name),
			sortOrder: Number(productForm.sortOrder),
			options: productForm.options,
			relatedArticles: editingProduct?.relatedArticles || []
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
			price: '',
			description: '',
			image: '',
			category: '',
			sortOrder: '1',
			options: []
		})
		setEditingProduct(null)
	}
	
	const openProductEdit = (product: Product) => {
		setEditingProduct(product)
		setProductForm({
			name: product.name,
			price: product.price.toString(),
			description: product.description,
			image: product.image,
			category: product.category,
			sortOrder: product.sortOrder.toString(),
			options: product.options || []
		})
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
							<div className="flex justify-between items-center">
								<h2 className="text-xl font-semibold">{t('productsManagement')}</h2>
								<Button onClick={() => setProductDialog(true)}>
									<Plus className="mr-2 h-4 w-4" />
									{t('addProduct')}
								</Button>
							</div>
							
							{/* Products List */}
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
											<div className="flex justify-between items-center mt-2">
												<span className="text-primary font-semibold">
													{new Intl.NumberFormat('vi-VN', { 
														style: 'currency', 
														currency: 'VND',
														minimumFractionDigits: 0,
														maximumFractionDigits: 0
													}).format(product.price)}
												</span>
												<span className="text-sm text-muted-foreground">{product.category}</span>
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
											<label>{t('price')}</label>
											<Input 
												type="number" 
												value={productForm.price} 
												onChange={(e) => setProductForm({...productForm, price: e.target.value})}
											/>
										</div>
										<div className="space-y-2">
											<label>{t('description')}</label>
											<textarea 
												className="w-full p-2 border rounded-md min-h-[200px]"
												value={productForm.description} 
												onChange={(e) => setProductForm({...productForm, description: e.target.value})}
											/>
										</div>
										<div className="space-y-2">
											<label>{t('imageURL')}</label>
											<Input 
												value={productForm.image} 
												onChange={(e) => setProductForm({...productForm, image: e.target.value})}
											/>
										</div>
										<div className="space-y-2">
											<label>{t('category')}</label>
											<Input 
												value={productForm.category} 
												onChange={(e) => setProductForm({...productForm, category: e.target.value})}
											/>
										</div>
										<div className="space-y-2">
											<label>{t('sortOrder')}</label>
											<Input 
												type="number" 
												value={productForm.sortOrder} 
												onChange={(e) => setProductForm({...productForm, sortOrder: e.target.value})}
											/>
										</div>
										
										{/* Product Options */}
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
																	placeholder="Option value"
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