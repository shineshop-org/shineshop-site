'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Tag } from 'lucide-react'
import { useStore } from '@/app/lib/store'
import { useTranslation } from '@/app/hooks/use-translations'
import { formatPrice } from '@/app/lib/utils'
import { Card, CardContent } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'
import { Product } from '@/app/lib/types'
import { setPageTitle } from '@/app/lib/utils'

export default function StorePage() {
	const { products, siteConfig } = useStore()
	const { t, language } = useTranslation()
	const [selectedCategory, setSelectedCategory] = useState('all')
	const productsRef = useRef<HTMLDivElement>(null)
	const categoryRef = useRef<HTMLDivElement>(null)
	const [isMounted, setIsMounted] = useState(false)
	
	// Set isMounted to true once the component is mounted
	useEffect(() => {
		setIsMounted(true)
		// Set default title for store page
		setPageTitle()
	}, [])
	
	// Get unique categories with localized values
	const categories = useMemo(() => {
		// Start with 'all' category
		const uniqueCategories = ['all'];
		
		// Get localized categories based on current language
		products.forEach(product => {
			const localizedCat = product.localizedCategory?.[language as 'en' | 'vi'] || '';
			if (localizedCat && !uniqueCategories.includes(localizedCat)) {
				uniqueCategories.push(localizedCat);
			}
		});
		
		return uniqueCategories;
	}, [products, language]);
	
	// Filter products by localized category
	const filteredProducts = useMemo(() => {
		if (selectedCategory === 'all') {
			return products;
		}
		
		return products.filter(product => {
			const localizedCat = product.localizedCategory?.[language as 'en' | 'vi'] || '';
			return localizedCat === selectedCategory;
		});
	}, [products, selectedCategory, language]);
	
	// Sort products by sortOrder
	const sortedProducts = [...filteredProducts].sort((a, b) => a.sortOrder - b.sortOrder)
	
	// Handle category change with animation
	const handleCategoryChange = (category: string) => {
		setSelectedCategory(category)
	}
	
	return (
		<div className="space-y-12 pb-12 page-transition">
			{/* Hero Section */}
			<section className="mt-8 text-center space-y-2">
				<h1 className="text-4xl md:text-6xl font-bold jshine-gradient">
					{siteConfig.heroTitle}
				</h1>
				<p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
					{siteConfig.heroQuote}
				</p>
			</section>
			
			{/* Products Section */}
			<section className="space-y-6">
				{/* Category Filter */}
				<div ref={categoryRef} className="flex flex-wrap gap-2 justify-center">
					{categories.map((category) => (
						<Button
							key={category}
							variant={selectedCategory === category ? 'default' : 'outline'}
							size="sm"
							onClick={() => handleCategoryChange(category)}
							className="rounded-full"
						>
							{category === 'all' ? t('allProducts') : category}
						</Button>
					))}
				</div>
				
				{/* Product Grid - With animated transitions */}
				<div ref={productsRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 px-2 sm:px-0">
					<AnimatePresence mode="popLayout">
						{sortedProducts.map((product) => {
							// Ensure product has a slug
							if (!product.slug) {
								console.error('Product missing slug:', product);
								return null;
							}
							
							return (
								<motion.div
									key={product.id}
									layout
									initial={isMounted ? { opacity: 0, scale: 0.8 } : undefined}
									animate={isMounted ? { opacity: 1, scale: 1 } : undefined}
									exit={isMounted ? { opacity: 0, scale: 0.8 } : undefined}
									transition={{
										opacity: { duration: 0.3 },
										layout: {
											type: "spring",
											stiffness: 400,
											damping: 40
										}
									}}
								>
									<Link 
										href={`/store/product/${product.slug}`}
										prefetch={true}
										data-product-slug={product.slug}
										onClick={(e) => {
											e.stopPropagation(); // Stop the event from propagating further
											console.log(`Navigating to product: ${product.slug}`);
											
											// Force navigation directly to the product page
											// This ensures we go to the correct URL even if Next.js navigation is being intercepted
											window.location.href = `/store/product/${product.slug}`;
											
											// Prevent default to handle navigation manually
											e.preventDefault();
										}}
									>
										<ProductCard product={product} language={language} />
									</Link>
								</motion.div>
							);
						})}
					</AnimatePresence>
				</div>
			</section>
		</div>
	)
}

interface ProductCardProps {
	product: Product
	language: string
}

function ProductCard({ product, language }: ProductCardProps) {
	const cardRef = useRef<HTMLDivElement>(null)
	const [transform, setTransform] = useState('')
	const [isHovered, setIsHovered] = useState(false)
	const [isMounted, setIsMounted] = useState(false)
	
	// Set isMounted to true once the component is mounted
	useEffect(() => {
		setIsMounted(true)
	}, [])
	
	// Get the product name based on language and localization settings
	const getProductName = () => {
		if (product.isLocalized && product.localizedName) {
			return product.localizedName[language as 'en' | 'vi'] || product.name
		}
		return product.name
	}
	
	// Calculate lowest price from options
	const getLowestPrice = () => {
		if (!product.options || product.options.length === 0) {
			return product.price;
		}
		
		const optionValues = product.options.flatMap(option => 
			option.values.map(value => {
				// Require strict localized price - no fallback
				if (!value.localizedPrice) {
					console.warn(`Missing localized price for option ${option.name}, value ${value.value}`)
					return null
				}
				
				const currentPrice = language === 'en' ? value.localizedPrice.en : value.localizedPrice.vi
				return typeof currentPrice === 'number' && !isNaN(currentPrice) && isFinite(currentPrice) ? currentPrice : null
			})
		).filter(price => price !== null) as number[];
		
		if (optionValues.length === 0) {
			return product.price;
		}
		
		return Math.min(...optionValues);
	}
	
	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!cardRef.current) return
		
		const rect = cardRef.current.getBoundingClientRect()
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
		setIsHovered(false)
	}
	
	const handleMouseEnter = () => {
		setIsHovered(true)
	}
	
	return (
		<div 
			ref={cardRef}
			className="relative group"
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			onMouseEnter={handleMouseEnter}
			onClick={(e) => e.stopPropagation()}
			style={{
				transform: isMounted ? transform : '',
				transition: 'transform 0.1s ease-out',
				pointerEvents: 'none'
			}}
		>
			<Card className="overflow-hidden h-full border border-border/50 dark:border-primary/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-primary/50 dark:hover:border-primary/40 dark:bg-card/80" style={{ pointerEvents: 'auto' }}>
				{/* 16:9 Aspect Ratio Container */}
				<div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
					{/* Sử dụng div placeholder cho cả client và server để đảm bảo hydration nhất quán */}
					<div className="absolute inset-0 bg-muted flex items-center justify-center">
						{/* Chỉ hiển thị hình ảnh ở client-side sau khi component đã mounted */}
						{isMounted && product.image && product.image.trim() !== '' ? (
							<img
								src={`${product.image}`}
								alt={getProductName()}
								className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
								loading="eager"
								onError={(e) => {
									// Retry loading with timestamp if image fails to load
									const imgElement = e.currentTarget;
									const src = imgElement.src;
									
									// Only add timestamp if not already present
									if (!src.includes('?t=')) {
										imgElement.src = `${src}${src.includes('?') ? '&' : '?'}t=${Date.now()}`;
									}
								}}
							/>
						) : (
							<div className="text-muted-foreground text-4xl">📦</div>
						)}
					</div>
				</div>
				<CardContent className="p-3 relative z-10 bg-background dark:bg-card/90">
					<h3 className="font-semibold text-sm truncate mb-1" title={getProductName()}>
						{getProductName()}
					</h3>
					<div className="flex items-center justify-end gap-1">
						<span className="text-xs text-muted-foreground self-center">
							{language === 'vi' ? 'chỉ từ' : 'from'}
						</span>
						<p className="text-lg font-bold jshine-gradient">
							{formatPrice(getLowestPrice(), language === 'vi' ? 'vi-VN' : 'en-US')}
						</p>
					</div>
				</CardContent>
			</Card>
			{/* Dynamic shadow based on hover position */}
			<div 
				className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
				style={{
					background: 'radial-gradient(circle at center, rgba(0,0,0,0.2) 0%, transparent 70%)',
					transform: 'translateZ(-20px) scale(0.95)',
					filter: 'blur(20px)'
				}}
			/>
		</div>
	)
} 