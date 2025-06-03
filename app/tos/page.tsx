'use client'

import React from 'react'
import { useStore } from '@/app/lib/store'
import { useTranslation } from '@/app/hooks/use-translations'
import { Card, CardContent } from '@/app/components/ui/card'
import ReactMarkdown from 'react-markdown'

export default function TOSPage() {
	const { tosContent } = useStore()
	const { t } = useTranslation()
	
	return (
		<div className="max-w-4xl mx-auto py-8">
			<Card>
				<CardContent className="p-8">
					<div className="prose prose-sm dark:prose-invert max-w-none">
						<ReactMarkdown
							components={{
								h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
								h2: ({ children }) => <h2 className="text-2xl font-semibold mt-6 mb-3">{children}</h2>,
								h3: ({ children }) => <h3 className="text-xl font-medium mt-4 mb-2">{children}</h3>,
								p: ({ children }) => <p className="mb-4">{children}</p>,
								ul: ({ children }) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
								ol: ({ children }) => <ol className="list-decimal pl-6 mb-4">{children}</ol>,
								li: ({ children }) => <li className="mb-1">{children}</li>,
								strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
								em: ({ children }) => <em className="italic">{children}</em>,
								hr: () => <hr className="my-8 border-t border-border" />,
							}}
						>
							{tosContent}
						</ReactMarkdown>
					</div>
				</CardContent>
			</Card>
		</div>
	)
} 