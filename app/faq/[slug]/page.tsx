import React from 'react'
import { notFound } from 'next/navigation'
import { initialFAQArticles } from '@/app/lib/initial-data'
import FaqArticleClient from './client-page'

interface FAQArticlePageProps {
	params: {
		slug: string
	}
}

// This function runs at build time to generate the static paths
export function generateStaticParams() {
	return initialFAQArticles.map((article) => ({
		slug: article.slug,
	}))
}

export default function FAQArticlePage({ params }: FAQArticlePageProps) {
	// Get initial data for static generation
	const initialArticle = initialFAQArticles.find(a => a.slug === params.slug)
	
	// For SSG, we need to return a 404 if the article doesn't exist
	if (!initialArticle) {
		notFound()
	}
	
	// Pass initialArticle and slug to the client component
	return <FaqArticleClient slug={params.slug} initialArticle={initialArticle} />
} 