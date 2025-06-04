'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Tag } from 'lucide-react'
import { useStore } from '@/app/lib/store'
import { useTranslation } from '@/app/hooks/use-translations'
import { formatPrice } from '@/app/lib/utils'
import { Card, CardContent } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'

export default function StorePage() {
	const { products, siteConfig } = useStore()
	const { t, language } = useTranslation()
	const [selectedCategory, setSelectedCategory] = useState('all')
	const productsRef = useRef<HTMLDivElement>(null)
	const categoryRef = useRef<HTMLDivElement>(null)
	
	// Auto-scroll on page load with smooth animation
	useEffect(() => {
		const timer = setTimeout(() => {
			if (categoryRef.current) {
				const yOffset = -120 // Offset to position slightly above the category section
				const element = categoryRef.current
				const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
				
				// Use requestAnimationFrame for smoother animation
				const startPosition = window.pageYOffset
				const distance = y - startPosition
				const duration = 1000 // 1 second
				let start: number | null = null
				
				const animation = (currentTime: number) => {
					if (start === null) start = currentTime
					const timeElapsed = currentTime - start
					const progress = Math.min(timeElapsed / duration, 1)
					
					// Easing function for smooth animation
					const easeInOutCubic = (t: number) => {
						return t < 0.5 
							? 4 * t * t * t 
							: 1 - Math.pow(-2 * t + 2, 3) / 2
					}
					
					window.scrollTo(0, startPosition + distance * easeInOutCubic(progress))
					
					if (timeElapsed < duration) {
						requestAnimationFrame(animation)
					}
				}
				
				requestAnimationFrame(animation)
			}
		}, 300)
		
		return () => clearTimeout(timer)
	}, [])
	
	// Get unique categories
	const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))]
	
	// Filter products by category
	const filteredProducts = selectedCategory === 'all' 
		? products 
		: products.filter(p => p.category === selectedCategory)
	
	// Sort products by sortOrder
	const sortedProducts = [...filteredProducts].sort((a, b) => a.sortOrder - b.sortOrder)
	
	// Handle category change with animation
	const handleCategoryChange = (category: string) => {
		setSelectedCategory(category)
	}
	
	return (
		<div className="space-y-12 pb-12 page-transition">
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
				<div ref={productsRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-5">
					<AnimatePresence mode="popLayout">
						{sortedProducts.map((product) => (
							<motion.div
								key={product.id}
								layout
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.8 }}
								transition={{
									opacity: { duration: 0.3 },
									layout: {
										type: "spring",
										stiffness: 400,
										damping: 40
									}
								}}
							>
								<Link href={`/store/product/${product.slug}`}>
									<ProductCard product={product} language={language} />
								</Link>
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			</section>
		</div>
	)
}

interface ProductCardProps {
	product: {
		id: string
		name: string
		price: number
		image: string
	}
	language: string
}

function ProductCard({ product, language }: ProductCardProps) {
	const cardRef = useRef<HTMLDivElement>(null)
	const [transform, setTransform] = useState('')
	const [isHovered, setIsHovered] = useState(false)
	
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
			style={{
				transform: transform,
				transition: 'transform 0.1s ease-out'
			}}
		>
			<Card className="overflow-hidden h-full border border-border/50 dark:border-primary/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-primary/50 dark:hover:border-primary/40 dark:bg-card/80">
				{/* 16:9 Aspect Ratio Container */}
				<div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
					<Image
						src={product.image}
						alt={product.name}
						fill
						className="object-cover transition-transform duration-300 group-hover:scale-105"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
					/>
				</div>
				<CardContent className="p-3 relative z-10 bg-background dark:bg-card/90">
					<h3 className="font-semibold text-sm truncate mb-1" title={product.name}>
						{product.name}
					</h3>
					<div className="flex items-center justify-end gap-1">
						<span className="text-xs text-muted-foreground self-end">
							{language === 'vi' ? 'chỉ từ' : 'from'}
						</span>
						<p className="text-lg font-bold bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
							{formatPrice(product.price, language === 'vi' ? 'vi-VN' : 'en-US')}
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