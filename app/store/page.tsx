'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useStore } from '@/app/lib/store'
import { useTranslation } from '@/app/hooks/use-translations'
import { formatPrice } from '@/app/lib/utils'
import { Card, CardContent } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'

export default function StorePage() {
	const { products, siteConfig } = useStore()
	const { t, language } = useTranslation()
	const [selectedCategory, setSelectedCategory] = useState('all')
	const productsRef = useRef<HTMLDivElement>(null)
	
	// Auto-scroll on page load
	useEffect(() => {
		const timer = setTimeout(() => {
			if (productsRef.current) {
				productsRef.current.scrollIntoView({ 
					behavior: 'smooth',
					block: 'start'
				})
			}
		}, 500)
		
		return () => clearTimeout(timer)
	}, [])
	
	// Get unique categories
	const categories = ['all', ...new Set(products.map(p => p.category))]
	
	// Filter products by category
	const filteredProducts = selectedCategory === 'all' 
		? products 
		: products.filter(p => p.category === selectedCategory)
	
	// Sort products by sortOrder
	const sortedProducts = [...filteredProducts].sort((a, b) => a.sortOrder - b.sortOrder)
	
	return (
		<div className="space-y-12 pb-12">
			{/* Hero Section */}
			<section className="mt-8 text-center space-y-4">
				<h1 className="text-4xl md:text-6xl font-bold jshine-gradient">
					{siteConfig.heroTitle}
				</h1>
				<p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
					{siteConfig.heroQuote}
				</p>
			</section>
			
			{/* Products Section */}
			<section ref={productsRef} className="space-y-6">
				{/* Category Filter */}
				<div className="flex flex-wrap gap-2 justify-center">
					{categories.map((category) => (
						<Button
							key={category}
							variant={selectedCategory === category ? 'default' : 'outline'}
							size="sm"
							onClick={() => setSelectedCategory(category)}
							className="rounded-full"
						>
							{category === 'all' ? t('allProducts') : category}
						</Button>
					))}
				</div>
				
				{/* Product Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{sortedProducts.map((product) => (
						<Link key={product.id} href={`/store/product/${product.slug}`}>
							<Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 card-3d h-full">
								<div className="aspect-square relative overflow-hidden">
									<Image
										src={product.image}
										alt={product.name}
										fill
										className="object-cover hover:scale-105 transition-transform duration-300"
										sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
									/>
								</div>
								<CardContent className="p-4">
									<h3 className="font-semibold line-clamp-2">{product.name}</h3>
									<p className="text-lg font-bold text-primary mt-2">
										{formatPrice(product.price, language === 'vi' ? 'vi-VN' : 'en-US')}
									</p>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			</section>
		</div>
	)
} 