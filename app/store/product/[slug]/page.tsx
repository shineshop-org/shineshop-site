import React from 'react'
import { initialProducts } from '@/app/lib/initial-data'
import ProductClient from './client-page'

interface ProductPageProps {
	params: Promise<{
		slug: string
	}>
}

// This function runs at build time to generate the static paths
export function generateStaticParams() {
	// Generate paths for all initial products
	return initialProducts.map((product) => ({
		slug: product.slug,
	}))
}

export default async function ProductPage({ params }: ProductPageProps) {
	const { slug } = await params
	
	console.log(`[Server] Rendering product page for slug: ${slug}`)
	
	// Get initial data for static generation
	const initialProduct = initialProducts.find(p => p.slug === slug)
	
	if (initialProduct) {
		console.log(`[Server] Found matching initial product: ${initialProduct.name}`)
	} else {
		console.log(`[Server] No matching initial product found for slug: ${slug}`)
	}
	
	// We'll just use the initial product here and let the client component
	// handle checking the store data. This prevents 404s for dynamically added products.
	// If no initial product is found, we'll still render the client component
	// which will try to find the product in the store.
	return <ProductClient 
		slug={slug} 
		initialProduct={initialProduct || {
			id: '',
			name: '',
			price: 0,
			description: '',
			image: '',
			category: '',
			slug, // Pass the slug to ensure it's available
			sortOrder: 0
		}} 
	/>
} 