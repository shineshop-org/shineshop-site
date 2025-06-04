'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, FileText, Link2, Settings, LogOut, Plus, Edit, Trash2, Info, Shield } from 'lucide-react'
import { useStore } from '@/app/lib/store'
import { useTranslation } from '@/app/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog'
import { Product, FAQArticle } from '@/app/lib/types'
import { generateSlug } from '@/app/lib/utils'
import { clearAuthCookie, ADMIN_CREDENTIALS } from '@/app/lib/auth'
import { Alert, AlertTitle, AlertDescription } from '@/app/components/ui/alert'
import { CookieExporter } from '@/app/admin/cookie-exporter'

type TabType = 'products' | 'faq' | 'social' | 'settings' | 'security'

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
		if (!isAdminAuthenticated) {
			router.push('/admin')
		}
	}, [isAdminAuthenticated, router])
	
	const handleLogout = () => {
		// Xóa cookie khi đăng xuất
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
	
	if (!isAdminAuthenticated) {
		return null
	}
	
	return (
		<div className="max-w-7xl mx-auto py-8">
			{/* Header */}
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">{t('dashboard')}</h1>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => setShowSecurityInfo(true)}>
						<Info className="mr-2 h-4 w-4" />
						Thông tin bảo mật
					</Button>
					<Button onClick={handleLogout} variant="outline">
						<LogOut className="mr-2 h-4 w-4" />
						{t('logout')}
					</Button>
				</div>
			</div>
			
			{/* Thông tin bảo mật Dialog */}
			<Dialog open={showSecurityInfo} onOpenChange={setShowSecurityInfo}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Thông tin xác thực và bảo mật</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<Alert>
							<Info className="h-4 w-4" />
							<AlertTitle>Thông tin đăng nhập</AlertTitle>
							<AlertDescription>
								<div className="mt-2 space-y-2">
									<div className="flex justify-between items-center">
										<span className="font-medium">Tên đăng nhập:</span>
										<code className="bg-gray-100 px-2 py-1 rounded">{ADMIN_CREDENTIALS.username}</code>
									</div>
									<div className="flex justify-between items-center">
										<span className="font-medium">Mật khẩu:</span>
										<code className="bg-gray-100 px-2 py-1 rounded">{ADMIN_CREDENTIALS.password}</code>
									</div>
								</div>
							</AlertDescription>
						</Alert>
						
						<div className="mt-4">
							<h3 className="font-medium text-sm mb-2">Token đặc biệt</h3>
							<div className="bg-gray-50 p-3 rounded-md">
								<p className="text-xs mb-2">Token này có thể được sử dụng để truy cập trang admin mà không cần đăng nhập lại:</p>
								<div className="bg-gray-100 p-2 rounded overflow-auto text-xs font-mono break-all">
									{ADMIN_CREDENTIALS.token}
								</div>
							</div>
						</div>
						
						<div className="mt-4">
							<h3 className="font-medium text-sm mb-2">Cách bảo vệ trang admin</h3>
							<ul className="list-disc pl-5 text-sm space-y-1">
								<li>Hệ thống sử dụng cookie bảo mật</li>
								<li>Xác thực thông qua header đặc biệt</li>
								<li>Token được mã hóa bảo mật</li>
								<li>Session hết hạn sau 30 ngày</li>
								<li>Cookie đặc biệt để hiển thị trang admin</li>
							</ul>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowSecurityInfo(false)}>Đóng</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			
			{/* Tabs */}
			<div className="flex space-x-4 mb-6 border-b">
				<Button
					variant={activeTab === 'products' ? 'default' : 'ghost'}
					onClick={() => setActiveTab('products')}
					className="rounded-b-none"
				>
					<Package className="mr-2 h-4 w-4" />
					Products
				</Button>
				<Button
					variant={activeTab === 'faq' ? 'default' : 'ghost'}
					onClick={() => setActiveTab('faq')}
					className="rounded-b-none"
				>
					<FileText className="mr-2 h-4 w-4" />
					FAQ
				</Button>
				<Button
					variant={activeTab === 'settings' ? 'default' : 'ghost'}
					onClick={() => setActiveTab('settings')}
					className="rounded-b-none"
				>
					<Settings className="mr-2 h-4 w-4" />
					Settings
				</Button>
				<Button
					variant={activeTab === 'security' ? 'default' : 'ghost'}
					onClick={() => setActiveTab('security')}
					className="rounded-b-none"
				>
					<Shield className="mr-2 h-4 w-4" />
					Bảo mật
				</Button>
			</div>
			
			{/* Content */}
			{activeTab === 'products' && (
				<div className="space-y-4">
					<div className="flex justify-between items-center">
						<h2 className="text-xl font-semibold">Products Management</h2>
						<Button onClick={() => setProductDialog(true)}>
							<Plus className="mr-2 h-4 w-4" />
							Add Product
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
											Edit
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
											Delete
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
								<DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<label>Name</label>
									<Input 
										value={productForm.name} 
										onChange={(e) => setProductForm({...productForm, name: e.target.value})}
									/>
								</div>
								<div className="space-y-2">
									<label>Price</label>
									<Input 
										type="number" 
										value={productForm.price} 
										onChange={(e) => setProductForm({...productForm, price: e.target.value})}
									/>
								</div>
								<div className="space-y-2">
									<label>Description</label>
									<textarea 
										className="w-full p-2 border rounded-md min-h-[100px]"
										value={productForm.description} 
										onChange={(e) => setProductForm({...productForm, description: e.target.value})}
									/>
								</div>
								<div className="space-y-2">
									<label>Image URL</label>
									<Input 
										value={productForm.image} 
										onChange={(e) => setProductForm({...productForm, image: e.target.value})}
									/>
								</div>
								<div className="space-y-2">
									<label>Category</label>
									<Input 
										value={productForm.category} 
										onChange={(e) => setProductForm({...productForm, category: e.target.value})}
									/>
								</div>
								<div className="space-y-2">
									<label>Sort Order</label>
									<Input 
										type="number" 
										value={productForm.sortOrder} 
										onChange={(e) => setProductForm({...productForm, sortOrder: e.target.value})}
									/>
								</div>
							</div>
							<DialogFooter>
								<Button variant="outline" onClick={() => setProductDialog(false)}>Cancel</Button>
								<Button onClick={handleSaveProduct}>Save</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			)}
			
			{activeTab === 'faq' && (
				<div className="space-y-4">
					<div className="flex justify-between items-center">
						<h2 className="text-xl font-semibold">FAQ Management</h2>
						<Button onClick={() => setFaqDialog(true)}>
							<Plus className="mr-2 h-4 w-4" />
							Add FAQ
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
								<DialogTitle>{editingFAQ ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<label>Title</label>
									<Input 
										value={faqForm.title} 
										onChange={(e) => setFaqForm({...faqForm, title: e.target.value})}
									/>
								</div>
								<div className="space-y-2">
									<label>Content</label>
									<textarea 
										className="w-full p-2 border rounded-md min-h-[150px]"
										value={faqForm.content} 
										onChange={(e) => setFaqForm({...faqForm, content: e.target.value})}
									/>
								</div>
								<div className="space-y-2">
									<label>Category</label>
									<Input 
										value={faqForm.category} 
										onChange={(e) => setFaqForm({...faqForm, category: e.target.value})}
									/>
								</div>
								<div className="space-y-2">
									<label>Tags (comma separated)</label>
									<Input 
										value={faqForm.tags} 
										onChange={(e) => setFaqForm({...faqForm, tags: e.target.value})}
									/>
								</div>
							</div>
							<DialogFooter>
								<Button variant="outline" onClick={() => setFaqDialog(false)}>Cancel</Button>
								<Button onClick={handleSaveFAQ}>Save</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			)}
			
			{activeTab === 'settings' && (
				<div className="space-y-6">
					<h2 className="text-xl font-semibold">Site Settings</h2>
					
					<div className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Hero Section</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<label className="text-sm font-medium">Hero Title</label>
									<Input 
										value={settingsForm.heroTitle} 
										onChange={(e) => setSettingsForm({...settingsForm, heroTitle: e.target.value})}
									/>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">Hero Quote</label>
									<Input 
										value={settingsForm.heroQuote} 
										onChange={(e) => setSettingsForm({...settingsForm, heroQuote: e.target.value})}
									/>
								</div>
							</CardContent>
						</Card>
						
						<Card>
							<CardHeader>
								<CardTitle>Contact Links</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<label className="text-sm font-medium">Facebook Link</label>
									<Input 
										value={settingsForm.facebookLink} 
										onChange={(e) => setSettingsForm({...settingsForm, facebookLink: e.target.value})}
									/>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">WhatsApp Link</label>
									<Input 
										value={settingsForm.whatsappLink} 
										onChange={(e) => setSettingsForm({...settingsForm, whatsappLink: e.target.value})}
									/>
								</div>
							</CardContent>
						</Card>
						
						<Card>
							<CardHeader>
								<CardTitle>Payment Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<label className="text-sm font-medium">Bank Name</label>
									<Input 
										value={settingsForm.bankName} 
										onChange={(e) => setSettingsForm({...settingsForm, bankName: e.target.value})}
									/>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">Account Number</label>
									<Input 
										value={settingsForm.accountNumber} 
										onChange={(e) => setSettingsForm({...settingsForm, accountNumber: e.target.value})}
									/>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">Account Name</label>
									<Input 
										value={settingsForm.accountName} 
										onChange={(e) => setSettingsForm({...settingsForm, accountName: e.target.value})}
									/>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">Wise Email</label>
									<Input 
										value={settingsForm.wiseEmail} 
										onChange={(e) => setSettingsForm({...settingsForm, wiseEmail: e.target.value})}
									/>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">PayPal Email</label>
									<Input 
										value={settingsForm.paypalEmail} 
										onChange={(e) => setSettingsForm({...settingsForm, paypalEmail: e.target.value})}
									/>
								</div>
							</CardContent>
						</Card>
						
						<Card>
							<CardHeader>
								<CardTitle>Terms of Service</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<label className="text-sm font-medium">TOS Content</label>
									<textarea 
										className="w-full p-2 border rounded-md min-h-[200px]"
										value={settingsForm.tosContent} 
										onChange={(e) => setSettingsForm({...settingsForm, tosContent: e.target.value})}
									/>
								</div>
							</CardContent>
						</Card>
						
						<div className="flex justify-end">
							<Button onClick={handleSaveSettings}>Save All Settings</Button>
						</div>
					</div>
				</div>
			)}
			
			{activeTab === 'security' && (
				<div className="space-y-6">
					<h2 className="text-xl font-semibold">Quản lý bảo mật</h2>
					
					<div className="space-y-6">
						<CookieExporter />
						
						<Card>
							<CardHeader>
								<CardTitle>Hướng dẫn bảo mật</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<Alert>
									<AlertTitle>Quan trọng</AlertTitle>
									<AlertDescription>
										Cookie đặc biệt là cần thiết để truy cập trang admin. Nếu bạn xóa cookie này, 
										bạn sẽ không thể truy cập trang admin cho đến khi thiết lập lại cookie.
									</AlertDescription>
								</Alert>
								
								<div className="space-y-2">
									<h3 className="font-medium">Bảo mật trang admin</h3>
									<p className="text-sm text-gray-600">
										Trang admin được bảo vệ bằng nhiều lớp bảo mật để đảm bảo rằng chỉ những người có quyền mới có thể truy cập:
									</p>
									<ul className="list-disc pl-5 text-sm space-y-1 text-gray-600">
										<li>Cookie đặc biệt là bắt buộc để trang admin xuất hiện</li>
										<li>Xác thực tên đăng nhập/mật khẩu</li>
										<li>Yêu cầu header đặc biệt cho API</li>
										<li>Cookie xác thực phiên làm việc</li>
										<li>Mã hóa dữ liệu bảo mật</li>
									</ul>
								</div>
								
								<div className="space-y-2">
									<h3 className="font-medium">Lưu ý quan trọng</h3>
									<ul className="list-disc pl-5 text-sm space-y-1 text-gray-600">
										<li>Lưu trữ tệp cookie ở nơi an toàn</li>
										<li>Không chia sẻ cookie với người không có thẩm quyền</li>
										<li>Đăng xuất khi không sử dụng</li>
										<li>Không sử dụng trang admin trên thiết bị công cộng</li>
									</ul>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			)}
		</div>
	)
} 