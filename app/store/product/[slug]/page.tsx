'use client'

import React, { useState } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Facebook, MessageCircle, ExternalLink } from 'lucide-react'
import { useStore } from '@/app/lib/store'
import { useTranslation } from '@/app/hooks/use-translations'
import { formatPrice } from '@/app/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'

interface ProductPageProps {
	params: {
		slug: string
	}
}

export default function ProductPage({ params }: ProductPageProps) {
	const { products, faqArticles, siteConfig } = useStore()
	const { t, language } = useTranslation()
	const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
	
	const product = products.find(p => p.slug === params.slug)
	
	if (!product) {
		notFound()
	}
	
	const relatedArticles = product.relatedArticles
		? faqArticles.filter(article => product.relatedArticles?.includes(article.id))
		: []
	
	const handleOptionChange = (optionId: string, value: string) => {
		setSelectedOptions(prev => ({ ...prev, [optionId]: value }))
	}
	
	return (
		<div className="max-w-7xl mx-auto py-8 page-transition">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Product Image - Updated with better aspect ratio handling */}
				<div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 shadow-lg">
					<Image
						src={product.image}
						alt={product.name}
						fill
						className="object-contain p-4"
						sizes="(max-width: 1024px) 100vw, 50vw"
						priority
					/>
				</div>
				
				{/* Product Info */}
				<div className="space-y-6">
					<div>
						<h1 className="text-3xl font-bold">{product.name}</h1>
						<p className="text-2xl font-semibold text-primary mt-4">
							{formatPrice(product.price, language === 'vi' ? 'vi-VN' : 'en-US')}
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
											onChange={(e) => handleOptionChange(option.id, e.target.value)}
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
														onChange={(e) => handleOptionChange(option.id, e.target.value)}
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
								href={siteConfig.contactLinks.facebook}
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
								href={siteConfig.contactLinks.whatsapp}
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
							{product.description ? (
								<p className="text-muted-foreground whitespace-pre-wrap">
									{product.description}
								</p>
							) : (
								<p className="text-muted-foreground/50 italic">
									{language === 'vi' ? 'Chưa có mô tả cho sản phẩm này' : 'No description available for this product'}
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
										<div className="flex items-center mt-1 text-sm text-muted-foreground">
											<ExternalLink className="mr-1 h-3 w-3" />
											{t('readMore')}
										</div>
									</Link>
								))
							) : (
								<p className="text-muted-foreground/50 italic text-center py-4">
									{language === 'vi' ? 'Không có bài viết liên quan' : 'No related articles available'}
								</p>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
} 