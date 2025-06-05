import React from 'react'
import { initialProducts } from '@/app/lib/initial-data'
import ProductClient from './client-page'

interface ProductPageProps {
	params: {
		slug: string
	}
}

// This function runs at build time to generate the static paths
export function generateStaticParams() {
	return initialProducts.map((product) => ({
		slug: product.slug,
	}))
}

export default async function ProductPage({ params }: ProductPageProps) {
	const slug = params.slug
	
	// Get initial data for static generation
	const initialProduct = initialProducts.find(p => p.slug === slug)
	
	// We'll just use the initial product here and let the client component
	// handle checking the store data. This prevents 404s for dynamically added products.
	// If no initial product is found, we'll still render the client component
	// which will try to find the product in the store.
	return <ProductClient slug={slug} initialProduct={initialProduct || {
		id: '',
		name: '',
		price: 0,
		description: '',
		image: '',
		category: '',
		slug,
		sortOrder: 0
	}} />
} 