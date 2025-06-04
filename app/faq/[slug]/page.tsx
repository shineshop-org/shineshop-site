'use client'

import React, { useEffect, useState } from 'react'
import { notFound, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Tag } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import ReactMarkdown from 'react-markdown'
import { initialFAQArticles } from '@/app/lib/initial-data'
import { useStore } from '@/app/lib/store'
import { FAQArticle } from '@/app/lib/types'

interface FAQArticlePageProps {
	params: {
		slug: string
	}
}

export default function FAQArticlePage({ params }: FAQArticlePageProps) {
	const { faqArticles } = useStore()
	const [article, setArticle] = useState<FAQArticle | null>(null)
	const router = useRouter()
	
	useEffect(() => {
		// Try to find the article in the store first
		const storeArticle = faqArticles.find(a => a.slug === params.slug)
		
		if (storeArticle) {
			setArticle(storeArticle)
		} else {
			// Fallback to initial data if not found in store
			const initialArticle = initialFAQArticles.find(a => a.slug === params.slug)
			
			if (initialArticle) {
				setArticle(initialArticle)
			} else {
				// Article not found at all
				router.push('/404')
			}
		}
	}, [params.slug, faqArticles, router])
	
	// Show loading state while fetching article
	if (!article) {
		return (
			<div className="max-w-4xl mx-auto py-8 flex justify-center items-center min-h-[50vh]">
				<p>Loading article...</p>
			</div>
		)
	}
	
	return (
		<div className="max-w-4xl mx-auto py-8">
			{/* Back Button */}
			<Link href="/faq">
				<Button variant="ghost" className="mb-6">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to FAQ
				</Button>
			</Link>
			
			{/* Article */}
			<Card>
				<CardHeader className="space-y-4">
					<h1 className="text-3xl font-bold">{article.title}</h1>
					<div className="flex items-center gap-4 text-sm text-muted-foreground">
						<div className="flex items-center gap-1">
							<Calendar className="h-4 w-4" />
							{new Date(article.updatedAt).toLocaleDateString()}
						</div>
						<div className="flex items-center gap-1">
							<Tag className="h-4 w-4" />
							{article.category}
						</div>
					</div>
					<div className="flex flex-wrap gap-2">
						{article.tags.map((tag) => (
							<span
								key={tag}
								className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full"
							>
								{tag}
							</span>
						))}
					</div>
				</CardHeader>
				<CardContent>
					<div className="prose prose-sm dark:prose-invert max-w-none">
						<ReactMarkdown
							components={{
								h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>,
								h2: ({ children }) => <h2 className="text-xl font-semibold mt-5 mb-3">{children}</h2>,
								h3: ({ children }) => <h3 className="text-lg font-medium mt-4 mb-2">{children}</h3>,
								p: ({ children }) => <p className="mb-4">{children}</p>,
								ul: ({ children }) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
								ol: ({ children }) => <ol className="list-decimal pl-6 mb-4">{children}</ol>,
								li: ({ children }) => <li className="mb-1">{children}</li>,
								strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
								em: ({ children }) => <em className="italic">{children}</em>,
								code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded text-sm">{children}</code>,
								pre: ({ children }) => <pre className="bg-muted p-4 rounded-md overflow-x-auto mb-4">{children}</pre>,
								blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 italic mb-4">{children}</blockquote>,
							}}
						>
							{article.content}
						</ReactMarkdown>
					</div>
				</CardContent>
			</Card>
		</div>
	)
} 