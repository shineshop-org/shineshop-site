'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Facebook, MessageCircle, ExternalLink } from 'lucide-react'
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
	
	useEffect(() => {
		// Try to find the product in the store
		const storeProduct = products.find(p => p.slug === slug)
		
		// Update with store data if available
		if (storeProduct) {
			setProduct(storeProduct)
			
			// Initialize selected options
			if (storeProduct.options && storeProduct.options.length > 0) {
				const initialOptions: Record<string, string> = {}
				storeProduct.options.forEach(option => {
					if (option.values.length > 0) {
						initialOptions[option.id] = ''
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
			
			// Initialize selected options for initial product
			if (initialProduct.options && initialProduct.options.length > 0) {
				const initialOptions: Record<string, string> = {}
				initialProduct.options.forEach(option => {
					if (option.values.length > 0) {
						initialOptions[option.id] = ''
					}
				})
				setSelectedOptions(initialOptions)
			}
		}
	}, [slug, products, faqArticles, initialProduct])
	
	// Handle option selection
	const handleOptionChange = (optionId: string, value: string) => {
		setSelectedOptions(prev => ({
			...prev,
			[optionId]: value
		}))
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
	
	return (
		<div className="max-w-7xl mx-auto py-8 page-transition">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Product Image with 16:9 aspect ratio */}
				<div className="relative shadow-lg rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
					{/* 16:9 Aspect ratio container */}
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
				</div>
				
				{/* Product Info */}
				<div className="space-y-6">
					<div>
						<h1 className="text-3xl font-bold">{getProductName()}</h1>
						<p className="text-2xl font-semibold text-primary mt-4">
							{formatPrice(getSelectedPrice(), 'en-US')}
						</p>
					</div>
					
					{/* Options */}
					{product.options && product.options.length > 0 && (
						<div className="space-y-4">
							{product.options.map((option) => (
								<div key={option.id} className="space-y-2">
									<label className="text-sm font-medium">{option.name}</label>
									{option.type === 'select' ? (
										<div className="space-y-2">
											<select
												className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 transition-colors"
												value={selectedOptions[option.id] || ''}
												onChange={(e) => handleOptionChange(option.id, e.target.value)}
											>
												<option value="" disabled>Select {option.name}</option>
												{option.values.map((value) => (
													<option key={value.value} value={value.value}>{value.value}</option>
												))}
											</select>
											{selectedOptions[option.id] && (
												<div>
													{option.values.map((value) => (
														value.value === selectedOptions[option.id] && value.description && (
															<p key={value.value} className="text-sm text-muted-foreground mt-1">{value.description}</p>
														)
													))}
												</div>
											)}
										</div>
									) : (
										<div className="space-y-2">
											{option.values.map((value) => (
												<div key={value.value} className="mb-2">
													<label className="flex items-center space-x-2 cursor-pointer hover:text-primary transition-colors">
														<input
															type="radio"
															name={option.id}
															value={value.value}
															checked={selectedOptions[option.id] === value.value}
															onChange={() => handleOptionChange(option.id, value.value)}
															className="w-4 h-4"
														/>
														<span>{value.value}</span>
													</label>
													{selectedOptions[option.id] === value.value && value.description && (
														<p className="text-sm text-muted-foreground ml-6 mt-1">{value.description}</p>
													)}
												</div>
											))}
										</div>
									)}
								</div>
							))}
						</div>
					)}
					
					{/* Order Buttons */}
					<div className="flex gap-4">
						<Button
							asChild
							size="lg"
							className="flex-1 hover:scale-105 transition-all duration-200 bg-primary hover:bg-primary/90 dark:bg-primary/80 dark:hover:bg-primary"
						>
							<Link
								href="https://facebook.com"
								target="_blank"
								rel="noopener noreferrer"
							>
								<Facebook className="mr-2 h-5 w-5" />
								Facebook
							</Link>
						</Button>
						<Button
							asChild
							size="lg"
							variant="outline"
							className="flex-1 hover:scale-105 transition-all duration-200 dark:border-primary/50 dark:hover:bg-primary/20"
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
				</div>
			</div>
			
			{/* Description and Related Articles */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
				{/* Description - Always show */}
				<div className="lg:col-span-2">
					<Card className="dark:bg-card/80 dark:border-primary/20">
						<CardHeader>
							<CardTitle>{t('productDetails')}</CardTitle>
						</CardHeader>
						<CardContent>
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
						<CardContent className="space-y-3">
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
		</div>
	)
} 