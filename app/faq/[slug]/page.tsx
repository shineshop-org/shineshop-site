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
	// If there are no FAQ articles, provide a fallback slug to prevent build errors
	if (!initialFAQArticles || initialFAQArticles.length === 0) {
		return [{ slug: 'fallback-faq-slug' }]
	}
	
	return initialFAQArticles.map((article) => ({
		slug: article.slug,
	}))
}

export default function FAQArticlePage({ params }: FAQArticlePageProps) {
	// Get initial data for static generation
	const initialArticle = initialFAQArticles.find(a => a.slug === params.slug)
	
	// For SSG, we need to return a 404 if the article doesn't exist
	if (!initialArticle) {
		// If it's our fallback slug, render a placeholder instead of 404
		if (params.slug === 'fallback-faq-slug') {
			const fallbackArticle = {
				id: 'fallback',
				slug: 'fallback-faq-slug',
				title: 'FAQ',
				content: 'No FAQ articles available at this time.',
				category: 'General',
				tags: [],
				createdAt: new Date(),
				updatedAt: new Date()
			}
			return <FaqArticleClient slug={params.slug} initialArticle={fallbackArticle} />
		}
		
		notFound()
	}
	
	// Pass initialArticle and slug to the client component
	return <FaqArticleClient slug={params.slug} initialArticle={initialArticle} />
} 