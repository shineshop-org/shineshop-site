'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Trash2, Shield, LogOut, Plus, Home, LayoutGrid, FileText, ArrowDownWideNarrow, GripVertical, Globe, Save, Code } from 'lucide-react'
import { useStore } from '@/app/lib/store'
import { useTranslation } from '@/app/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/components/ui/dialog'
import { Product, FAQArticle } from '@/app/lib/types'
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

type TabType = 'products' | 'tos' | 'export'
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
				<p className="jshine-gradient font-semibold">
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
	const [exportCode, setExportCode] = useState('')
	const [showExportDialog, setShowExportDialog] = useState(false)
	
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
		slug: '',
		options: [] as {
			id: string;
			name: string;
			type: 'select' | 'radio';
			values: {
				value: string;
				price: number;
				description: string;
			}[];
		}[],
		relatedArticles: [] as string[],
		isLocalized: false
	})
	
	useEffect(() => {
		// Trong môi trường development, tự động thiết lập xác thực mà không cần kiểm tra cookie
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
	
	// Xuất dữ liệu ra dạng initialProducts để copy vào file
	const generateExportCode = () => {
		// Sort products by sortOrder
		const sortedProducts = [...products].sort((a, b) => a.sortOrder - b.sortOrder)
		
		// Tạo mã JS
		let code = 'export const initialProducts: Product[] = [\n'
		
		sortedProducts.forEach((product, index) => {
			code += '\t{\n'
			code += `\t\tid: '${product.id}',\n`
			code += `\t\tname: '${product.name.replace(/'/g, "\\'")}',\n`
			if (product.price) code += `\t\tprice: ${product.price},\n`
			if (product.description) code += `\t\tdescription: \`${product.description.replace(/`/g, "\\`")}\`,\n`
			code += `\t\timage: '${product.image}',\n`
			code += `\t\tcategory: '${product.category}',\n`
			code += `\t\tslug: '${product.slug}',\n`
			code += `\t\tsortOrder: ${product.sortOrder},\n`
			
			// Handle options
			if (product.options && product.options.length > 0) {
				code += '\t\toptions: [\n'
				product.options.forEach((option, optIndex) => {
					code += '\t\t\t{\n'
					code += `\t\t\t\tid: '${option.id}',\n`
					code += `\t\t\t\tname: '${option.name.replace(/'/g, "\\'")}',\n`
					code += `\t\t\t\ttype: '${option.type}',\n`
					
					// Handle option values
					code += '\t\t\t\tvalues: [\n'
					option.values.forEach((value, valIndex) => {
						code += '\t\t\t\t\t{\n'
						code += `\t\t\t\t\t\tvalue: '${value.value.replace(/'/g, "\\'")}',\n`
						code += `\t\t\t\t\t\tprice: ${value.price},\n`
						code += `\t\t\t\t\t\tdescription: '${value.description?.replace(/'/g, "\\'")}'\n`
						code += '\t\t\t\t\t}'
						if (valIndex < option.values.length - 1) code += ','
						code += '\n'
					})
					code += '\t\t\t\t]\n'
					
					code += '\t\t\t}'
					if (optIndex < product.options.length - 1) code += ','
					code += '\n'
				})
				code += '\t\t],\n'
			}
			
			// Handle relatedArticles
			if (product.relatedArticles && product.relatedArticles.length > 0) {
				code += `\t\trelatedArticles: [${product.relatedArticles.map(id => `'${id}'`).join(', ')}],\n`
			}
			
			// Handle localization
			if (product.isLocalized) {
				code += `\t\tisLocalized: true,\n`
				
				if (product.localizedName) {
					code += `\t\tlocalizedName: {\n`
					code += `\t\t\ten: '${product.localizedName.en?.replace(/'/g, "\\'")}',\n`
					code += `\t\t\tvi: '${product.localizedName.vi?.replace(/'/g, "\\'")}'\n`
					code += `\t\t},\n`
				}
				
				if (product.localizedDescription) {
					code += `\t\tlocalizedDescription: {\n`
					code += `\t\t\ten: \`${product.localizedDescription.en?.replace(/`/g, "\\`")}\`,\n`
					code += `\t\t\tvi: \`${product.localizedDescription.vi?.replace(/`/g, "\\`")}\`\n`
					code += `\t\t},\n`
				}
			}
			
			code += '\t}'
			if (index < sortedProducts.length - 1) code += ','
			code += '\n'
		})
		
		code += ']'
		
		// Cập nhật state
		setExportCode(code)
		setShowExportDialog(true)
	}
	
	// Export TOS content
	const generateTOSExportCode = () => {
		let code = 'export const initialTOSContent = `' + tosContent.replace(/`/g, "\\`") + '`'
		setExportCode(code)
		setShowExportDialog(true)
	}
	
	// Hàm download file
	const downloadExportFile = () => {
		const element = document.createElement('a')
		const file = new Blob([exportCode], {type: 'text/plain'})
		element.href = URL.createObjectURL(file)
		element.download = 'exported-data.ts'
		document.body.appendChild(element)
		element.click()
		document.body.removeChild(element)
	}
	
	// Hàm xóa sản phẩm khỏi store
	const handleDeleteProduct = (id: string) => {
		// Xóa sản phẩm khỏi store
		deleteProduct(id)
		
		// Đóng dialog nếu đang mở
		setProductDialog(false)
		setEditingProduct(null)
	}
	
	// Thêm hàm để lưu dữ liệu xuống file thông qua API
	const saveToFile = async (content: string, filePath: string) => {
		try {
			const response = await fetch('/api/dev/update-file', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					content,
					filePath,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Failed to update file')
			}

			return true
		} catch (error) {
			console.error('Error saving to file:', error)
			alert(`Error saving to file: ${error}`)
			return false
		}
	}

	// Thêm hàm lưu products dưới dạng code vào file
	const saveProductsToFile = async () => {
		// Sort products by sortOrder
		const sortedProducts = [...products].sort((a, b) => a.sortOrder - b.sortOrder)
		
		// Tạo mã JS
		let code = `import { Product, FAQArticle, SocialLink } from './types'\n\n`
		code += 'export const initialProducts: Product[] = [\n'
		
		sortedProducts.forEach((product, index) => {
			code += '\t{\n'
			code += `\t\tid: '${product.id}',\n`
			code += `\t\tname: '${product.name.replace(/'/g, "\\'")}',\n`
			if (product.price) code += `\t\tprice: ${product.price},\n`
			if (product.description) code += `\t\tdescription: \`${product.description.replace(/`/g, "\\`")}\`,\n`
			code += `\t\timage: '${product.image}',\n`
			code += `\t\tcategory: '${product.category}',\n`
			code += `\t\tslug: '${product.slug}',\n`
			code += `\t\tsortOrder: ${product.sortOrder},\n`
			
			// Handle options
			if (product.options && product.options.length > 0) {
				code += '\t\toptions: [\n'
				product.options.forEach((option, optIndex) => {
					code += '\t\t\t{\n'
					code += `\t\t\t\tid: '${option.id}',\n`
					code += `\t\t\t\tname: '${option.name.replace(/'/g, "\\'")}',\n`
					code += `\t\t\t\ttype: '${option.type}',\n`
					
					// Handle option values
					code += '\t\t\t\tvalues: [\n'
					option.values.forEach((value, valIndex) => {
						code += '\t\t\t\t\t{\n'
						code += `\t\t\t\t\t\tvalue: '${value.value.replace(/'/g, "\\'")}',\n`
						code += `\t\t\t\t\t\tprice: ${value.price},\n`
						code += `\t\t\t\t\t\tdescription: '${value.description?.replace(/'/g, "\\'")}'\n`
						code += '\t\t\t\t\t}'
						if (valIndex < option.values.length - 1) code += ','
						code += '\n'
					})
					code += '\t\t\t\t]\n'
					
					code += '\t\t\t}'
					if (optIndex < product.options.length - 1) code += ','
					code += '\n'
				})
				code += '\t\t],\n'
			}
			
			// Handle relatedArticles
			if (product.relatedArticles && product.relatedArticles.length > 0) {
				code += `\t\trelatedArticles: [${product.relatedArticles.map(id => `'${id}'`).join(', ')}],\n`
			}
			
			// Handle localization
			if (product.isLocalized) {
				code += `\t\tisLocalized: true,\n`
				
				if (product.localizedName) {
					code += `\t\tlocalizedName: {\n`
					code += `\t\t\ten: '${product.localizedName.en?.replace(/'/g, "\\'")}',\n`
					code += `\t\t\tvi: '${product.localizedName.vi?.replace(/'/g, "\\'")}'\n`
					code += `\t\t},\n`
				}
				
				if (product.localizedDescription) {
					code += `\t\tlocalizedDescription: {\n`
					code += `\t\t\ten: \`${product.localizedDescription.en?.replace(/`/g, "\\`")}\`,\n`
					code += `\t\t\tvi: \`${product.localizedDescription.vi?.replace(/`/g, "\\`")}\`\n`
					code += `\t\t},\n`
				}
			}
			
			code += '\t}'
			if (index < sortedProducts.length - 1) code += ','
			code += '\n'
		})
		
		code += ']\n\n'
		
		// Thêm mã cho FAQ và social links (giữ nguyên từ file gốc)
		code += `export const initialFAQArticles: FAQArticle[] = ${JSON.stringify(faqArticles, null, 2).replace(/"([^"]+)":/g, '$1:')}\n\n`
		code += `export const initialSocialLinks: SocialLink[] = ${JSON.stringify(socialLinks, null, 2).replace(/"([^"]+)":/g, '$1:')}\n\n`
		code += `export const initialTOSContent = \`${tosContent.replace(/`/g, '\\`')}\``
		
		// Lưu vào file
		const result = await saveToFile(code, 'app/lib/initial-data.ts')
		
		return result
	}

	// Thêm hàm xử lý sự kiện khi người dùng nhấn nút "Lưu vào File"
	const handleSaveToFile = async () => {
		setIsSaving(true)
		
		// Lưu dữ liệu vào file
		const success = await saveProductsToFile()
		
		if (success) {
			alert('Đã lưu thành công vào file!')
		}
		
		setIsSaving(false)
	}
	
	// Nếu đang loading, hiển thị thông báo
	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Shield className="h-5 w-5" />
							<span>Development Mode</span>
						</CardTitle>
						<div className="text-muted-foreground">Loading admin interface...</div>
					</CardHeader>
				</Card>
			</div>
		)
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
					<Button 
						variant="outline"
						size="sm"
						onClick={handleSaveToFile}
						disabled={isSaving}
						className="flex items-center gap-2 text-green-600 hover:text-green-700"
					>
						<Save className="h-5 w-5" />
						<span>{isSaving ? 'Đang lưu...' : 'Lưu vào File'}</span>
					</Button>
					
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
																		<label className="text-xs text-muted-foreground">Price</label>
																		<Input 
																			value={value.price}
																			onChange={(e) => updateOptionValue(optionIndex, valueIndex, e.target.value, 'price')}
																			placeholder="e.g., 100000"
																			className="flex-1"
																		/>
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