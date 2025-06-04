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

interface ProductClientProps {
	slug: string
	initialProduct: Product
}

export default function ProductClient({ slug, initialProduct }: ProductClientProps) {
	const { products, faqArticles } = useStore()
	const [product, setProduct] = useState<Product>(initialProduct)
	const [relatedArticles, setRelatedArticles] = useState<FAQArticle[]>([])
	
	useEffect(() => {
		// Try to find the product in the store
		const storeProduct = products.find(p => p.slug === slug)
		
		// Update with store data if available
		if (storeProduct) {
			setProduct(storeProduct)
			
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
		}
	}, [slug, products, faqArticles, initialProduct])
	
	return (
		<div className="max-w-7xl mx-auto py-8 page-transition">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Product Image with 16:9 aspect ratio */}
				<div className="relative shadow-lg rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
					{/* 16:9 Aspect ratio container */}
					<div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
						<Image
							src={product.image}
							alt={product.name}
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
						<h1 className="text-3xl font-bold">{product.name}</h1>
						<p className="text-2xl font-semibold text-primary mt-4">
							{formatPrice(product.price, 'en-US')}
						</p>
					</div>
					
					{/* Options */}
					{product.options && product.options.length > 0 && (
						<div className="space-y-4">
							{product.options.map((option) => (
								<div key={option.id} className="space-y-2">
									<label className="text-sm font-medium">{option.name}</label>
									{option.type === 'select' ? (
										<select
											className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 transition-colors"
											defaultValue=""
										>
											<option value="" disabled>Select {option.name}</option>
											{option.values.map((value) => (
												<option key={value} value={value}>{value}</option>
											))}
										</select>
									) : (
										<div className="space-y-2">
											{option.values.map((value) => (
												<label key={value} className="flex items-center space-x-2 cursor-pointer hover:text-primary transition-colors">
													<input
														type="radio"
														name={option.id}
														value={value}
														className="w-4 h-4"
													/>
													<span>{value}</span>
												</label>
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
							<CardTitle>Product Details</CardTitle>
						</CardHeader>
						<CardContent>
							{product.description ? (
								<p className="text-muted-foreground whitespace-pre-wrap">
									{product.description}
								</p>
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
							<CardTitle>Related Articles</CardTitle>
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
										<div className="flex items-center mt-1 text-sm text-muted-foreground">
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