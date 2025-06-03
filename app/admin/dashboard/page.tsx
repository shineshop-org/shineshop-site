'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, FileText, Link2, Settings, LogOut, Plus, Edit, Trash2 } from 'lucide-react'
import { useStore } from '@/app/lib/store'
import { useTranslation } from '@/app/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog'
import { Product, FAQArticle } from '@/app/lib/types'
import { generateSlug } from '@/app/lib/utils'

type TabType = 'products' | 'faq' | 'social' | 'settings'

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
		tosContent: tosContent
	})
	
	useEffect(() => {
		if (!isAdminAuthenticated) {
			router.push('/admin')
		}
	}, [isAdminAuthenticated, router])
	
	const handleLogout = () => {
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
			accountName: settingsForm.accountName
		})
		
		setTosContent(settingsForm.tosContent)
		
		alert('Settings saved successfully!')
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
				<Button onClick={handleLogout} variant="outline">
					<LogOut className="mr-2 h-4 w-4" />
					{t('logout')}
				</Button>
			</div>
			
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
					
					<div className="grid gap-4">
						{products.sort((a, b) => a.sortOrder - b.sortOrder).map((product) => (
							<Card key={product.id}>
								<CardContent className="flex items-center justify-between p-4">
									<div className="flex items-center space-x-4">
										<img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
										<div>
											<h3 className="font-semibold">{product.name}</h3>
											<p className="text-sm text-muted-foreground">{product.category} - {product.price.toLocaleString()} VND</p>
										</div>
									</div>
									<div className="flex space-x-2">
										<Button size="sm" variant="outline" onClick={() => openProductEdit(product)}>
											<Edit className="h-4 w-4" />
										</Button>
										<Button size="sm" variant="destructive" onClick={() => deleteProduct(product.id)}>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			)}
			
			{activeTab === 'faq' && (
				<div className="space-y-4">
					<div className="flex justify-between items-center">
						<h2 className="text-xl font-semibold">FAQ Management</h2>
						<Button onClick={() => setFaqDialog(true)}>
							<Plus className="mr-2 h-4 w-4" />
							Add Article
						</Button>
					</div>
					
					<div className="grid gap-4">
						{faqArticles.map((article) => (
							<Card key={article.id}>
								<CardContent className="flex items-center justify-between p-4">
									<div>
										<h3 className="font-semibold">{article.title}</h3>
										<p className="text-sm text-muted-foreground">{article.category} - {article.tags.join(', ')}</p>
									</div>
									<div className="flex space-x-2">
										<Button size="sm" variant="outline" onClick={() => openFAQEdit(article)}>
											<Edit className="h-4 w-4" />
										</Button>
										<Button size="sm" variant="destructive" onClick={() => deleteFaqArticle(article.id)}>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			)}
			
			{activeTab === 'settings' && (
				<Card>
					<CardHeader>
						<CardTitle>Site Settings</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Terms of Service Content</label>
							<textarea
								className="w-full min-h-[200px] p-3 border rounded-md"
								value={settingsForm.tosContent}
								onChange={(e) => setSettingsForm({...settingsForm, tosContent: e.target.value})}
							/>
						</div>
						<Button onClick={handleSaveSettings}>Save Settings</Button>
					</CardContent>
				</Card>
			)}
			
			{/* Product Dialog */}
			<Dialog open={productDialog} onOpenChange={setProductDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Name</label>
							<Input
								value={productForm.name}
								onChange={(e) => setProductForm({...productForm, name: e.target.value})}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Price (VND)</label>
							<Input
								type="number"
								value={productForm.price}
								onChange={(e) => setProductForm({...productForm, price: e.target.value})}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Category</label>
							<Input
								value={productForm.category}
								onChange={(e) => setProductForm({...productForm, category: e.target.value})}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Image URL</label>
							<Input
								value={productForm.image}
								onChange={(e) => setProductForm({...productForm, image: e.target.value})}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Description</label>
							<textarea
								className="w-full p-2 border rounded-md"
								rows={4}
								value={productForm.description}
								onChange={(e) => setProductForm({...productForm, description: e.target.value})}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Sort Order</label>
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
			
			{/* FAQ Dialog */}
			<Dialog open={faqDialog} onOpenChange={setFaqDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{editingFAQ ? 'Edit Article' : 'Add Article'}</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Title</label>
							<Input
								value={faqForm.title}
								onChange={(e) => setFaqForm({...faqForm, title: e.target.value})}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Category</label>
							<Input
								value={faqForm.category}
								onChange={(e) => setFaqForm({...faqForm, category: e.target.value})}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Tags (comma-separated)</label>
							<Input
								value={faqForm.tags}
								onChange={(e) => setFaqForm({...faqForm, tags: e.target.value})}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Content (Markdown)</label>
							<textarea
								className="w-full p-2 border rounded-md"
								rows={8}
								value={faqForm.content}
								onChange={(e) => setFaqForm({...faqForm, content: e.target.value})}
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
	)
} 