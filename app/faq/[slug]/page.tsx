'use client'

import React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Tag } from 'lucide-react'
import { useStore } from '@/app/lib/store'
import { useTranslation } from '@/app/hooks/use-translations'
import { Card, CardContent, CardHeader } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import ReactMarkdown from 'react-markdown'
import { initialFAQArticles } from '@/app/lib/initial-data'

interface FAQArticlePageProps {
	params: {
		slug: string
	}
}

// This function generates all possible FAQ article paths at build time
export function generateStaticParams() {
	return initialFAQArticles.map((article) => ({
		slug: article.slug,
	}))
}

export default function FAQArticlePage({ params }: FAQArticlePageProps) {
	const { faqArticles } = useStore()
	const { t } = useTranslation()
	
	const article = faqArticles.find(a => a.slug === params.slug)
	
	if (!article) {
		notFound()
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