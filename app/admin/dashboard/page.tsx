'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, FileText, Link2, Settings, LogOut, Plus, Edit, Trash2, Info, Shield, Lock, Home, ShoppingBag } from 'lucide-react'
import { useStore } from '@/app/lib/store'
import { useTranslation } from '@/app/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog'
import { Product, FAQArticle } from '@/app/lib/types'
import { generateSlug } from '@/app/lib/utils'
import { clearAuthCookie, ADMIN_CREDENTIALS, getAuthCookie, verifySpecialToken, ADMIN_ACCESS_COOKIE } from '@/app/lib/auth'
import { Alert, AlertTitle, AlertDescription } from '@/app/components/ui/alert'
import { CookieExporter } from '@/app/admin/cookie-exporter'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { AdminCookieControl } from '@/app/admin/admin-cookie-control'

type TabType = 'overview' | 'content' | 'products' | 'faq' | 'social' | 'settings' | 'security'

export default function AdminDashboardPage() {
	const router = useRouter()
	const { 
		isAdminAuthenticated, 
		setAdminAuthenticated,
		products,
		addProduct,
		updateProduct,
		deleteProduct,
		faqArticles,
		addFaqArticle,
		updateFaqArticle,
		deleteFaqArticle,
		siteConfig,
		setSiteConfig,
		paymentInfo,
		setPaymentInfo,
		tosContent,
		setTosContent
	} = useStore()
	const { t } = useTranslation()
	const [activeTab, setActiveTab] = useState<TabType>('products')
	const [editingProduct, setEditingProduct] = useState<Product | null>(null)
	const [editingFAQ, setEditingFAQ] = useState<FAQArticle | null>(null)
	const [productDialog, setProductDialog] = useState(false)
	const [faqDialog, setFaqDialog] = useState(false)
	const [showSecurityInfo, setShowSecurityInfo] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	
	// Product form state
	const [productForm, setProductForm] = useState({
		name: '',
		price: '',
		description: '',
		image: '',
		category: '',
		sortOrder: '1'
	})
	
	// FAQ form state
	const [faqForm, setFaqForm] = useState({
		title: '',
		content: '',
		category: '',
		tags: ''
	})
	
	// Settings form state
	const [settingsForm, setSettingsForm] = useState({
		heroTitle: siteConfig.heroTitle,
		heroQuote: siteConfig.heroQuote,
		facebookLink: siteConfig.contactLinks.facebook,
		whatsappLink: siteConfig.contactLinks.whatsapp,
		bankName: paymentInfo.bankName,
		accountNumber: paymentInfo.accountNumber,
		accountName: paymentInfo.accountName,
		wiseEmail: paymentInfo.wiseEmail,
		paypalEmail: paymentInfo.paypalEmail,
		tosContent: tosContent
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
			slug: generateSlug(productForm.name),
			sortOrder: Number(productForm.sortOrder),
			options: editingProduct?.options || [],
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
	
	const handleSaveFAQ = () => {
		const newFAQ: FAQArticle = {
			id: editingFAQ?.id || Date.now().toString(),
			title: faqForm.title,
			content: faqForm.content,
			category: faqForm.category,
			slug: generateSlug(faqForm.title),
			tags: faqForm.tags.split(',').map(tag => tag.trim()),
			createdAt: editingFAQ?.createdAt || new Date(),
			updatedAt: new Date()
		}
		
		if (editingFAQ) {
			updateFaqArticle(editingFAQ.id, newFAQ)
		} else {
			addFaqArticle(newFAQ)
		}
		
		setFaqDialog(false)
		resetFAQForm()
		
		// Force sync to ensure data is saved
		useStore.getState().syncDataToServer()
	}
	
	const handleSaveSettings = () => {
		setSiteConfig({
			heroTitle: settingsForm.heroTitle,
			heroQuote: settingsForm.heroQuote,
			contactLinks: {
				facebook: settingsForm.facebookLink,
				whatsapp: settingsForm.whatsappLink
			}
		})
		
		setPaymentInfo({
			...paymentInfo,
			bankName: settingsForm.bankName,
			accountNumber: settingsForm.accountNumber,
			accountName: settingsForm.accountName,
			wiseEmail: settingsForm.wiseEmail,
			paypalEmail: settingsForm.paypalEmail
		})
		
		setTosContent(settingsForm.tosContent)
		
		// Force sync to ensure data is saved
		useStore.getState().syncDataToServer()
		
		alert('Đã lưu cài đặt thành công!')
	}
	
	const resetProductForm = () => {
		setProductForm({
			name: '',
			price: '',
			description: '',
			image: '',
			category: '',
			sortOrder: '1'
		})
		setEditingProduct(null)
	}
	
	const resetFAQForm = () => {
		setFaqForm({
			title: '',
			content: '',
			category: '',
			tags: ''
		})
		setEditingFAQ(null)
	}
	
	const openProductEdit = (product: Product) => {
		setEditingProduct(product)
		setProductForm({
			name: product.name,
			price: product.price.toString(),
			description: product.description,
			image: product.image,
			category: product.category,
			sortOrder: product.sortOrder.toString()
		})
		setProductDialog(true)
	}
	
	const openFAQEdit = (faq: FAQArticle) => {
		setEditingFAQ(faq)
		setFaqForm({
			title: faq.title,
			content: faq.content,
			category: faq.category,
			tags: faq.tags.join(', ')
		})
		setFaqDialog(true)
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
			<header className="border-b">
				<div className="container flex h-16 items-center px-4 sm:px-6">
					<div className="flex items-center gap-2 font-semibold">
						<Shield className="h-5 w-5" />
						<span>{t('adminDashboard')}</span>
					</div>
					<nav className="ml-auto flex items-center space-x-4">
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
			</header>
			
			<div className="container grid flex-1 gap-6 md:grid-cols-[200px_1fr] py-6">
				{/* Sidebar */}
				<div className="flex flex-col gap-2">
					<Button 
						variant={activeTab === 'overview' ? 'default' : 'ghost'} 
						className="justify-start" 
						onClick={() => setActiveTab('overview')}
					>
						<Home className="mr-2 h-4 w-4" />
						{t('overview')}
					</Button>
					<Button 
						variant={activeTab === 'content' ? 'default' : 'ghost'} 
						className="justify-start"
						onClick={() => setActiveTab('content')}
					>
						<FileText className="mr-2 h-4 w-4" />
						{t('content')}
					</Button>
					<Button 
						variant={activeTab === 'products' ? 'default' : 'ghost'} 
						className="justify-start"
						onClick={() => setActiveTab('products')}
					>
						<ShoppingBag className="mr-2 h-4 w-4" />
						{t('products')}
					</Button>
					<Button 
						variant={activeTab === 'faq' ? 'default' : 'ghost'} 
						className="justify-start"
						onClick={() => setActiveTab('faq')}
					>
						<FileText className="mr-2 h-4 w-4" />
						{t('faq')}
					</Button>
					<Button 
						variant={activeTab === 'settings' ? 'default' : 'ghost'} 
						className="justify-start"
						onClick={() => setActiveTab('settings')}
					>
						<Settings className="mr-2 h-4 w-4" />
						{t('settings')}
					</Button>
					<Button 
						variant={activeTab === 'security' ? 'default' : 'ghost'} 
						className="justify-start"
						onClick={() => setActiveTab('security')}
					>
						<Lock className="mr-2 h-4 w-4" />
						{t('security')}
					</Button>
				</div>
				
				{/* Main Content */}
				<div className="flex-1">
					{activeTab === 'overview' && (
						<div className="grid gap-4">
							<h1 className="text-2xl font-bold tracking-tight">{t('overview')}</h1>
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="text-sm font-medium">
											{t('totalProducts')}
										</CardTitle>
										<ShoppingBag className="h-4 w-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">12</div>
										<p className="text-xs text-muted-foreground">
											+2 trong tháng này
										</p>
									</CardContent>
								</Card>
								{/* Các thẻ thống kê khác có thể được thêm vào đây */}
							</div>
						</div>
					)}
					
					{activeTab === 'content' && (
						<div className="grid gap-4">
							<h1 className="text-2xl font-bold tracking-tight">{t('content')}</h1>
							<p className="text-muted-foreground">
								{t('contentDescription')}
							</p>
						</div>
					)}
					
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
								<DialogContent>
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
												className="w-full p-2 border rounded-md min-h-[100px]"
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
									</div>
									<DialogFooter>
										<Button variant="outline" onClick={() => setProductDialog(false)}>{t('cancel')}</Button>
										<Button onClick={handleSaveProduct}>{t('save')}</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						</div>
					)}
					
					{activeTab === 'faq' && (
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<h2 className="text-xl font-semibold">{t('faqManagement')}</h2>
								<Button onClick={() => setFaqDialog(true)}>
									<Plus className="mr-2 h-4 w-4" />
									{t('addFAQ')}
								</Button>
							</div>
							
							{/* FAQ List */}
							<div className="space-y-4">
								{faqArticles.map((faq) => (
									<Card key={faq.id}>
										<CardHeader>
											<div className="flex justify-between items-start">
												<div>
													<CardTitle>{faq.title}</CardTitle>
													<div className="flex mt-2 space-x-2">
														{faq.tags.map((tag) => (
															<span 
																key={tag} 
																className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
															>
																{tag}
															</span>
														))}
													</div>
												</div>
												<div className="flex space-x-2">
													<Button 
														variant="ghost" 
														size="sm"
														onClick={() => openFAQEdit(faq)}
													>
														<Edit className="h-4 w-4" />
													</Button>
													<Button 
														variant="ghost" 
														size="sm"
														className="text-destructive hover:text-destructive"
														onClick={() => {
															if (confirm('Are you sure you want to delete this FAQ?')) {
																deleteFaqArticle(faq.id)
															}
														}}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</div>
										</CardHeader>
										<CardContent>
											<p className="text-muted-foreground whitespace-pre-wrap">{faq.content}</p>
										</CardContent>
									</Card>
								))}
							</div>
							
							{/* FAQ Dialog */}
							<Dialog open={faqDialog} onOpenChange={setFaqDialog}>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>{editingFAQ ? t('editFAQ') : t('addFAQ')}</DialogTitle>
									</DialogHeader>
									<div className="space-y-4 py-4">
										<div className="space-y-2">
											<label>{t('title')}</label>
											<Input 
												value={faqForm.title} 
												onChange={(e) => setFaqForm({...faqForm, title: e.target.value})}
											/>
										</div>
										<div className="space-y-2">
											<label>{t('content')}</label>
											<textarea 
												className="w-full p-2 border rounded-md min-h-[150px]"
												value={faqForm.content} 
												onChange={(e) => setFaqForm({...faqForm, content: e.target.value})}
											/>
										</div>
										<div className="space-y-2">
											<label>{t('category')}</label>
											<Input 
												value={faqForm.category} 
												onChange={(e) => setFaqForm({...faqForm, category: e.target.value})}
											/>
										</div>
										<div className="space-y-2">
											<label>{t('tags')}</label>
											<Input 
												value={faqForm.tags} 
												onChange={(e) => setFaqForm({...faqForm, tags: e.target.value})}
											/>
										</div>
									</div>
									<DialogFooter>
										<Button variant="outline" onClick={() => setFaqDialog(false)}>{t('cancel')}</Button>
										<Button onClick={handleSaveFAQ}>{t('save')}</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						</div>
					)}
					
					{activeTab === 'settings' && (
						<div className="space-y-6">
							<h2 className="text-xl font-semibold">{t('siteSettings')}</h2>
							
							<div className="space-y-4">
								<Card>
									<CardHeader>
										<CardTitle>{t('heroSection')}</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="space-y-2">
											<label className="text-sm font-medium">{t('heroTitle')}</label>
											<Input 
												value={settingsForm.heroTitle} 
												onChange={(e) => setSettingsForm({...settingsForm, heroTitle: e.target.value})}
											/>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium">{t('heroQuote')}</label>
											<Input 
												value={settingsForm.heroQuote} 
												onChange={(e) => setSettingsForm({...settingsForm, heroQuote: e.target.value})}
											/>
										</div>
									</CardContent>
								</Card>
								
								<Card>
									<CardHeader>
										<CardTitle>{t('contactLinks')}</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="space-y-2">
											<label className="text-sm font-medium">{t('facebookLink')}</label>
											<Input 
												value={settingsForm.facebookLink} 
												onChange={(e) => setSettingsForm({...settingsForm, facebookLink: e.target.value})}
											/>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium">{t('whatsappLink')}</label>
											<Input 
												value={settingsForm.whatsappLink} 
												onChange={(e) => setSettingsForm({...settingsForm, whatsappLink: e.target.value})}
											/>
										</div>
									</CardContent>
								</Card>
								
								<Card>
									<CardHeader>
										<CardTitle>{t('paymentInformation')}</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="space-y-2">
											<label className="text-sm font-medium">{t('bankName')}</label>
											<Input 
												value={settingsForm.bankName} 
												onChange={(e) => setSettingsForm({...settingsForm, bankName: e.target.value})}
											/>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium">{t('accountNumber')}</label>
											<Input 
												value={settingsForm.accountNumber} 
												onChange={(e) => setSettingsForm({...settingsForm, accountNumber: e.target.value})}
											/>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium">{t('accountName')}</label>
											<Input 
												value={settingsForm.accountName} 
												onChange={(e) => setSettingsForm({...settingsForm, accountName: e.target.value})}
											/>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium">{t('wiseEmail')}</label>
											<Input 
												value={settingsForm.wiseEmail} 
												onChange={(e) => setSettingsForm({...settingsForm, wiseEmail: e.target.value})}
											/>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium">{t('paypalEmail')}</label>
											<Input 
												value={settingsForm.paypalEmail} 
												onChange={(e) => setSettingsForm({...settingsForm, paypalEmail: e.target.value})}
											/>
										</div>
									</CardContent>
								</Card>
								
								<Card>
									<CardHeader>
										<CardTitle>{t('termsOfService')}</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-2">
											<label className="text-sm font-medium">{t('tosContent')}</label>
											<textarea 
												className="w-full p-2 border rounded-md min-h-[200px]"
												value={settingsForm.tosContent} 
												onChange={(e) => setSettingsForm({...settingsForm, tosContent: e.target.value})}
											/>
										</div>
									</CardContent>
								</Card>
								
								<div className="flex justify-end">
									<Button onClick={handleSaveSettings}>{t('saveAllSettings')}</Button>
								</div>
							</div>
						</div>
					)}
					
					{activeTab === 'security' && (
						<div className="space-y-6">
							<h2 className="text-xl font-semibold">{t('security')}</h2>
							
							<div className="space-y-6">
								<CookieExporter />
								
								<Card>
									<CardHeader>
										<CardTitle>{t('securityInstructions')}</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<Alert>
											<AlertTitle>{t('important')}</AlertTitle>
											<AlertDescription>
												{t('specialCookieDescription')}
											</AlertDescription>
										</Alert>
										
										<div className="space-y-2">
											<h3 className="font-medium">{t('adminSecurityInstructions')}</h3>
											<p className="text-sm text-gray-600">
												{t('adminSecurityInstructionsDescription')}
											</p>
											<ul className="list-disc pl-5 text-sm space-y-1 text-gray-600">
												<li>{t('specialCookieRequired')}</li>
												<li>{t('loginAuthentication')}</li>
												<li>{t('apiHeader')}</li>
												<li>{t('sessionCookie')}</li>
												<li>{t('dataEncryption')}</li>
											</ul>
										</div>
										
										<div className="space-y-2">
											<h3 className="font-medium">{t('importantNotes')}</h3>
											<ul className="list-disc pl-5 text-sm space-y-1 text-gray-600">
												<li>{t('storeCookie')}</li>
												<li>{t('shareCookie')}</li>
												<li>{t('logout')}</li>
												<li>{t('publicDevice')}</li>
											</ul>
										</div>
									</CardContent>
								</Card>
								
								<div className="grid gap-4 md:grid-cols-2">
									<AdminCookieControl />
									
									<Card>
										<CardHeader>
											<CardTitle className="text-lg flex items-center gap-2">
												<Lock className="h-5 w-5" />
												{t('authentication')}
											</CardTitle>
											<CardDescription>
												{t('accountAuthentication')}
											</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="space-y-4">
												<div className="space-y-2">
													<Label htmlFor="username">{t('username')}</Label>
													<Input id="username" value="admin" readOnly />
												</div>
												<div className="space-y-2">
													<Label htmlFor="password">{t('password')}</Label>
													<Input id="password" type="password" value="********" readOnly />
												</div>
											</div>
										</CardContent>
										<CardFooter>
											<Button variant="outline" className="w-full" disabled>
												{t('changePassword')}
											</Button>
										</CardFooter>
									</Card>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
} 