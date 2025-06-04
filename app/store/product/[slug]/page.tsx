import React from 'react'
import { notFound } from 'next/navigation'
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

export default function ProductPage({ params }: ProductPageProps) {
	// Get initial data for static generation
	const initialProduct = initialProducts.find(p => p.slug === params.slug)
	
	// For SSG, we need to return a 404 if the product doesn't exist
	if (!initialProduct) {
		notFound()
	}
	
	// Pass initialProduct and slug to the client component
	return <ProductClient slug={params.slug} initialProduct={initialProduct} />
} 