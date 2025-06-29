'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Tag } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import ReactMarkdown from 'react-markdown'
import { initialFAQArticles } from '@/app/lib/initial-data'
import { useStore } from '@/app/lib/store'
import { FAQArticle } from '@/app/lib/types'
import { setPageTitle } from '@/app/lib/utils'

interface FaqArticleClientProps {
	slug: string
	initialArticle: FAQArticle
}

export default function FaqArticleClient({ slug, initialArticle }: FaqArticleClientProps) {
	const { faqArticles, language } = useStore()
	const [article, setArticle] = useState<FAQArticle>(initialArticle)
	const router = useRouter()
	
	useEffect(() => {
		// Try to find the article in the store
		const storeArticle = faqArticles.find(a => a.slug === slug)
		
		// Update with store data if available
		if (storeArticle) {
			setArticle(storeArticle)
		}
	}, [slug, faqArticles])
	
	// Get the appropriate title and content based on language and localization
	const getLocalizedTitle = () => {
		if (article.isLocalized && article.localizedTitle) {
			return language === 'en' 
				? article.localizedTitle.en || article.title
				: article.localizedTitle.vi || article.title
		}
		return article.title
	}
	
	const getLocalizedContent = () => {
		if (article.isLocalized && article.localizedContent) {
			return language === 'en'
				? article.localizedContent.en || article.content
				: article.localizedContent.vi || article.content
		}
		return article.content
	}
	
	// Set page title when article changes
	useEffect(() => {
		if (article) {
			setPageTitle(getLocalizedTitle())
		}
	}, [article, language])
	
	return (
		<div className="max-w-4xl mx-auto py-8">
			{/* Back Button */}
			<Link href="/faq">
				<Button variant="ghost" className="mb-6">
					<ArrowLeft className="mr-2 h-4 w-4" />
					{language === 'en' ? 'Back to FAQ' : 'Quay lại FAQ'}
				</Button>
			</Link>
			
			{/* Article */}
			<Card>
				<CardHeader className="space-y-4">
					<h1 className="text-3xl font-bold">{getLocalizedTitle()}</h1>
					<div className="flex items-center gap-4 text-sm text-muted-foreground">
						<div className="flex items-center gap-1">
							<Calendar className="h-4 w-4" />
							{new Date(article.updatedAt).toLocaleDateString(
								language === 'en' ? 'en-US' : 'vi-VN'
							)}
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
								h1: ({ children }) => <h1 className="text-3xl font-bold mt-2 mb-4">{children}</h1>,
								h2: ({ children }) => <h2 className="text-2xl font-semibold mt-6 mb-3">{children}</h2>,
								h3: ({ children }) => <h3 className="text-xl font-medium mt-5 mb-2">{children}</h3>,
								h4: ({ children }) => <h4 className="text-lg font-medium mt-4 mb-2">{children}</h4>,
								p: ({ children }) => <p className="mb-4">{children}</p>,
								ul: ({ children }) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
								ol: ({ children }) => <ol className="list-decimal pl-6 mb-4">{children}</ol>,
								li: ({ children }) => <li className="mb-2">{children}</li>,
								strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
								em: ({ children }) => <em className="italic">{children}</em>,
								code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded text-sm">{children}</code>,
								pre: ({ children }) => <pre className="bg-muted p-4 rounded-md overflow-x-auto mb-4">{children}</pre>,
								blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 italic mb-4">{children}</blockquote>,
								a: ({ href, children }) => <a href={href} className="jshine-gradient">{children}</a>,
							}}
						>
							{getLocalizedContent()}
						</ReactMarkdown>
					</div>
				</CardContent>
			</Card>
		</div>
	)
} 