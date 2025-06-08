'use client'

import React, { useEffect } from 'react'
import { useStore } from '@/app/lib/store'
import { useTranslation } from '@/app/hooks/use-translations'
import { Card, CardContent } from '@/app/components/ui/card'
import ReactMarkdown from 'react-markdown'
import { setPageTitle } from '@/app/lib/utils'

export default function TOSPage() {
	const { tosContent } = useStore()
	const { t } = useTranslation()
	
	// Set page title on component mount
	useEffect(() => {
		setPageTitle('Terms of Service')
	}, [])
	
	return (
		<div className="max-w-4xl mx-auto py-8">
			<Card>
				<CardContent className="p-8">
					<div className="prose prose-sm dark:prose-invert max-w-none">
						<ReactMarkdown
							components={{
								h1: ({ children }) => <h1 className="text-3xl font-bold mb-4 text-center">{children}</h1>,
								h2: ({ children }) => <h2 className="text-2xl font-semibold mt-6 mb-3">{children}</h2>,
								h3: ({ children }) => <h3 className="text-xl font-medium mt-5 mb-2">{children}</h3>,
								h4: ({ children }) => <h4 className="text-lg font-medium mt-4 mb-2">{children}</h4>,
								p: ({ children, ...props }) => {
									// Check if this is the date paragraph (usually right after the title)
									const isDateParagraph = props.node && 
										props.node.position && 
										props.node.position.start.line === 3;
									
									return <p className={`mb-4 ${isDateParagraph ? 'text-center' : ''}`}>{children}</p>;
								},
								ul: ({ children }) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
								ol: ({ children }) => <ol className="list-decimal pl-6 mb-4">{children}</ol>,
								li: ({ children }) => <li className="mb-2">{children}</li>,
								strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
								em: ({ children }) => <em className="italic">{children}</em>,
								hr: () => <hr className="my-8 border-t border-border" />,
								a: ({ href, children }) => <a href={href} className="jshine-gradient">{children}</a>,
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