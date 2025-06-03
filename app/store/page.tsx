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
	const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))]
	
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
							<ProductCard product={product} language={language} />
						</Link>
					))}
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
			<Card className="overflow-hidden h-full border-0 shadow-lg hover:shadow-2xl transition-shadow duration-300">
				{/* 16:9 Aspect Ratio Container */}
				<div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
					<Image
						src={product.image}
						alt={product.name}
						fill
						className="object-cover"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
					/>
					{/* Overlay gradient on hover */}
					<div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : ''}`} />
				</div>
				<CardContent className="p-4 relative z-10 bg-background">
					<h3 className="font-semibold line-clamp-2 mb-2">{product.name}</h3>
					<p className="text-lg font-bold bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
						{formatPrice(product.price, language === 'vi' ? 'vi-VN' : 'en-US')}
					</p>
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