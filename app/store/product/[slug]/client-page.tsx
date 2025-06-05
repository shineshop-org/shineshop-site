'use client'

import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { initialFAQArticles } from '@/app/lib/initial-data'
import { formatPrice } from '@/app/lib/utils'
import { useStore } from '@/app/lib/store'
import { Product, FAQArticle } from '@/app/lib/types'
import { useTranslation } from '@/app/hooks/use-translations'
import ReactMarkdown from 'react-markdown'

interface ProductClientProps {
	slug: string
	initialProduct: Product
}

export default function ProductClient({ slug, initialProduct }: ProductClientProps) {
	const { products, faqArticles, language } = useStore()
	const { t } = useTranslation()
	const [product, setProduct] = useState<Product>(initialProduct)
	const [relatedArticles, setRelatedArticles] = useState<FAQArticle[]>([])
	const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
	const [priceDisplay, setPriceDisplay] = useState<string>('')
	const productImageRef = useRef<HTMLDivElement>(null)
	const [transform, setTransform] = useState('')
	const productInfoRef = useRef<HTMLDivElement>(null)
	
	useEffect(() => {
		// Try to find the product in the store
		const storeProduct = products.find(p => p.slug === slug)
		
		// Update with store data if available
		if (storeProduct) {
			setProduct(storeProduct)
			
			// Initialize selected options - always select the first option by default
			if (storeProduct.options && storeProduct.options.length > 0) {
				const initialOptions: Record<string, string> = {}
				storeProduct.options.forEach(option => {
					if (option.values.length > 0) {
						initialOptions[option.id] = option.values[0].value
					}
				})
				setSelectedOptions(initialOptions)
			}
			
			// Find related articles from store
			if (storeProduct.relatedArticles && storeProduct.relatedArticles.length > 0) {
				const related = faqArticles.filter(article => 
					storeProduct.relatedArticles?.includes(article.id)
				)
				setRelatedArticles(related)
			}
		} else {
			// Use initial product data and find related articles from initial data
			if (initialProduct.relatedArticles) {
				const related = initialFAQArticles.filter(article => 
					initialProduct.relatedArticles?.includes(article.id)
				)
				setRelatedArticles(related)
			}
			
			// Initialize selected options for initial product - always select the first option by default
			if (initialProduct.options && initialProduct.options.length > 0) {
				const initialOptions: Record<string, string> = {}
				initialProduct.options.forEach(option => {
					if (option.values.length > 0) {
						initialOptions[option.id] = option.values[0].value
					}
				})
				setSelectedOptions(initialOptions)
			}
		}
		
		// Initialize price display after setting initial product and options
		setTimeout(() => {
			setPriceDisplay(formatPrice(getSelectedPrice(), 'en-US'))
		}, 10)
	}, [slug, products, faqArticles, initialProduct])
	
	// Handle option selection
	const handleOptionChange = (optionId: string, value: string) => {
		setSelectedOptions(prev => ({
			...prev,
			[optionId]: value
		}))
		
		// Update price immediately without animation
		setPriceDisplay(formatPrice(getSelectedPrice(), 'en-US'))
	}
	
	// Extract the lowest price from product options
	const getLowestPrice = () => {
		if (!product.options || product.options.length === 0) {
			return product.price
		}
		
		const optionValues = product.options.flatMap(option => 
			option.values.map(value => value.price)
		)
		
		const lowestPrice = optionValues.length > 0 
			? Math.min(...optionValues.filter(price => !isNaN(price) && isFinite(price)))
			: product.price
			
		return !isNaN(lowestPrice) && isFinite(lowestPrice) ? lowestPrice : product.price
	}
	
	// Get current selected price based on options
	const getSelectedPrice = () => {
		if (!product.options || product.options.length === 0 || Object.keys(selectedOptions).length === 0) {
			return product.price
		}
		
		// Get price based on selected options
		let totalPrice = product.price
		
		// Find the selected option values and their prices
		Object.entries(selectedOptions).forEach(([optionId, selectedValue]) => {
			if (!selectedValue) return
			
			const option = product.options?.find(opt => opt.id === optionId)
			if (option) {
				const optionValue = option.values.find(val => val.value === selectedValue)
				if (optionValue) {
					totalPrice = optionValue.price // Just use the option price directly
				}
			}
		})
		
		return totalPrice
	}
	
	// Get the product name based on language and localization settings
	const getProductName = () => {
		if (product.isLocalized && product.localizedName) {
			return product.localizedName[language as 'en' | 'vi'] || product.name
		}
		return product.name
	}
	
	// Get the product description based on language and localization settings
	const getProductDescription = () => {
		if (product.isLocalized && product.localizedDescription) {
			return product.localizedDescription[language as 'en' | 'vi'] || product.description
		}
		return product.description
	}
	
	// Get note label based on language
	const getNoteLabel = () => {
		return language === 'vi' ? 'Ghi chú' : 'Note'
	}
	
	// 3D card hover effect for product image
	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!productImageRef.current) return
		
		const rect = productImageRef.current.getBoundingClientRect()
		const x = e.clientX - rect.left
		const y = e.clientY - rect.top
		const centerX = rect.width / 2
		const centerY = rect.height / 2
		
		const rotateX = ((y - centerY) / centerY) * -10
		const rotateY = ((x - centerX) / centerX) * 10
		
		setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`)
	}
	
	const handleMouseLeave = () => {
		setTransform('')
	}
	
	return (
		<div className="max-w-7xl mx-auto py-6 page-transition">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Product Image with fixed 16:9 aspect ratio and 3D hover effect */}
				<div className="relative">
					<div
						ref={productImageRef}
						className="relative shadow-lg rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900"
						onMouseMove={handleMouseMove}
						onMouseLeave={handleMouseLeave}
						style={{
							transform: transform,
							transition: 'transform 0.1s ease-out'
						}}
					>
						{/* Fixed 16:9 Aspect ratio container */}
						<div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
							<Image
								src={product.image}
								alt={getProductName()}
								fill
								className="object-cover"
								sizes="(max-width: 1024px) 100vw, 50vw"
								priority
							/>
						</div>
						{/* Dynamic shadow based on hover position */}
						<div 
							className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
							style={{
								background: 'radial-gradient(circle at center, rgba(0,0,0,0.2) 0%, transparent 70%)',
								transform: 'translateZ(-20px) scale(0.95)',
								filter: 'blur(20px)'
							}}
						/>
					</div>
				</div>
				
				{/* Product Info */}
				<div ref={productInfoRef} className="space-y-4 flex flex-col py-3">
					<div className="space-y-1">
						<h1 className="text-3xl font-bold">{getProductName()}</h1>
						<p className="text-3xl font-semibold jshine-gradient">
							{priceDisplay || formatPrice(getSelectedPrice(), 'en-US')}
						</p>
					</div>
					
					{/* Options - Always show main option even if it's the only one */}
					<div className="space-y-4 my-2">
						{/* Package Type Option (Gói nâng cấp) */}
						<div className="space-y-1">
							<div className="flex flex-wrap gap-2">
								<label className="cursor-pointer flex items-center justify-center px-4 py-2 rounded-full border transition-all bg-primary text-primary-foreground border-primary">
									<input
										type="radio"
										name="package-type"
										value="chinh-chu"
										checked={true}
										readOnly
										className="sr-only"
									/>
									<span>Chính chủ (Add Family)</span>
								</label>
							</div>
						</div>
						
						{/* Divider between option sections */}
						<div className="h-px bg-border/50 dark:bg-border/30 my-2 w-full"></div>
						
						{/* Render dynamic product options */}
						{product.options && product.options.map((option) => (
							<div key={option.id} className="space-y-1">
								<div className="flex flex-wrap gap-2">
									{option.values.map((value) => (
										<label
											key={value.value}
											className={`cursor-pointer flex items-center justify-center px-4 py-2 rounded-full border transition-all hover:border-primary ${
												selectedOptions[option.id] === value.value 
													? 'bg-primary text-primary-foreground border-primary' 
													: 'bg-background border-input hover:bg-accent/50'
											}`}
										>
											<input
												type="radio"
												name={option.id}
												value={value.value}
												checked={selectedOptions[option.id] === value.value}
												onChange={() => handleOptionChange(option.id, value.value)}
												className="sr-only"
											/>
											<span>{value.value}</span>
										</label>
									))}
								</div>
								{selectedOptions[option.id] && (
									<div>
										{option.values.map((value) => (
											value.value === selectedOptions[option.id] && value.description && (
												<p key={value.value} className="text-sm text-muted-foreground mt-4">
													<span className="inline-block bg-primary/15 px-2 py-0.5 rounded-md text-xs font-semibold mr-1 text-primary border border-primary/20">
														{getNoteLabel()}
													</span> 
													{value.description}
												</p>
											)
										))}
									</div>
								)}
							</div>
						))}
						
						{/* If there are no options, create a single option for display consistency */}
						{(!product.options || product.options.length === 0) && (
							<div className="space-y-1">
								<div className="flex flex-wrap gap-2">
									<label className="cursor-pointer flex items-center justify-center px-4 py-2 rounded-full border transition-all bg-primary text-primary-foreground border-primary">
										<input
											type="radio"
											name="default-option"
											value="default"
											checked={true}
											readOnly
											className="sr-only"
										/>
										<span>Chính chủ (Add Family)</span>
									</label>
								</div>
								<p className="text-sm text-muted-foreground mt-4">
									<span className="inline-block bg-primary/15 px-2 py-0.5 rounded-md text-xs font-semibold mr-1 text-primary border border-primary/20">
										{getNoteLabel()}
									</span> 
									40000 cho tháng đầu tiên và sau đó là 35000 nếu bạn gia hạn đúng thời điểm hoặc trước đó.
								</p>
							</div>
						)}
					</div>
					
					{/* Order Buttons - Push to bottom with flex-grow */}
					<div className="flex flex-col space-y-3 mt-auto">
						<div className="flex gap-4">
							<Button
								asChild
								size="lg"
								className="flex-1 hover:scale-105 transition-all duration-200 bg-[#0084ff] hover:bg-[#0084ff]/90 text-white"
							>
								<Link
									href="http://m.me/521868681019157"
									target="_blank"
									rel="noopener noreferrer"
								>
									<MessageCircle className="mr-2 h-5 w-5" />
									Messenger
								</Link>
							</Button>
							<Button
								asChild
								size="lg"
								className="flex-1 hover:scale-105 transition-all duration-200 bg-[#25D366] hover:bg-[#25D366]/90 text-white"
							>
								<Link
									href="https://whatsapp.com"
									target="_blank"
									rel="noopener noreferrer"
								>
									<MessageCircle className="mr-2 h-5 w-5" />
									WhatsApp
								</Link>
							</Button>
						</div>
						
						{/* TOS agreement text */}
						<p className="text-center text-sm text-foreground italic">
							Khi bạn đã mua hàng đồng nghĩa rằng việc bạn hoàn toàn đồng ý và tuân thủ{' '}
							<Link href="/tos" className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent hover:underline font-medium">
								Điều khoản và Điều kiện
							</Link>
							{' '}của chúng tôi
						</p>
					</div>
				</div>
			</div>
			
			{/* Description and Related Articles */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
				{/* Description - Always show */}
				<div className="lg:col-span-2">
					<Card className="dark:bg-card/80 dark:border-primary/20">
						<CardHeader>
							<CardTitle>{t('productDetails')}</CardTitle>
						</CardHeader>
						<CardContent className="pb-8">
							{getProductDescription() ? (
								<div className="prose dark:prose-invert prose-sm max-w-none">
									<ReactMarkdown>
										{getProductDescription()}
									</ReactMarkdown>
								</div>
							) : (
								<p className="text-muted-foreground/50 italic">
									No description available for this product
								</p>
							)}
						</CardContent>
					</Card>
				</div>
				
				{/* Related Articles - Always show */}
				<div>
					<Card className="dark:bg-card/80 dark:border-primary/20">
						<CardHeader>
							<CardTitle>{t('relatedArticles')}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 py-5">
							{relatedArticles.length > 0 ? (
								relatedArticles.map((article) => (
									<Link
										key={article.id}
										href={`/faq/${article.slug}`}
										className="block p-3 rounded-md hover:bg-accent dark:hover:bg-primary/20 transition-all duration-200"
									>
										<h4 className="font-medium line-clamp-2">{article.title}</h4>
										<p className="mt-1 text-sm text-muted-foreground line-clamp-2">
											{article.content.substring(0, 100)}...
										</p>
										<div className="flex items-center mt-2 text-sm text-muted-foreground">
											<ExternalLink className="mr-1 h-3 w-3" />
											Read More
										</div>
									</Link>
								))
							) : (
								<p className="text-muted-foreground/50 italic text-center py-4">
									No related articles available
								</p>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
			
			{/* Custom CSS Animation */}
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
		</div>
	)
} 