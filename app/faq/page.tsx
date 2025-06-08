'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Calendar, Tag } from 'lucide-react'
import { useStore } from '@/app/lib/store'
import { useTranslation } from '@/app/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'
import { setPageTitle } from '@/app/lib/utils'

export default function FAQPage() {
	const { faqArticles } = useStore()
	const { t } = useTranslation()
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedCategory, setSelectedCategory] = useState('all')
	
	// Set page title on component mount
	useEffect(() => {
		setPageTitle('FAQ')
	}, [])
	
	// Get unique categories
	const categories = ['all', ...Array.from(new Set(faqArticles.map(article => article.category)))]
	
	// Filter articles
	const filteredArticles = faqArticles.filter(article => {
		const matchesSearch = searchQuery === '' || 
			article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
			article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
		
		const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
		
		return matchesSearch && matchesCategory
	})
	
	// Sort by date (newest first)
	const sortedArticles = [...filteredArticles].sort((a, b) => 
		new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
	)
	
	return (
		<div className="max-w-6xl mx-auto py-8 space-y-8">
			{/* Header */}
			<div className="text-center space-y-4">
				<h1 className="text-4xl font-bold">{t('faq')}</h1>
				<p className="text-muted-foreground">
					Find answers to frequently asked questions
				</p>
			</div>
			
			{/* Search and Filters */}
			<div className="space-y-4">
				{/* Search Bar */}
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
					<Input
						type="text"
						placeholder={t('searchFAQ')}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>
				
				{/* Category Filter */}
				<div className="flex flex-wrap gap-2">
					{categories.map((category) => (
						<Button
							key={category}
							variant={selectedCategory === category ? 'default' : 'outline'}
							size="sm"
							onClick={() => setSelectedCategory(category)}
							className="rounded-full"
						>
							{category === 'all' ? 'All Categories' : category}
						</Button>
					))}
				</div>
			</div>
			
			{/* Articles Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{sortedArticles.map((article) => (
					<Link key={article.id} href={`/faq/${article.slug}`}>
						<Card className="h-full hover:shadow-lg transition-shadow duration-300">
							<CardHeader>
								<CardTitle className="line-clamp-2">{article.title}</CardTitle>
								<div className="flex items-center gap-4 text-sm text-muted-foreground">
									<div className="flex items-center gap-1">
										<Calendar className="h-3 w-3" />
										{new Date(article.updatedAt).toLocaleDateString()}
									</div>
									<div className="flex items-center gap-1">
										<Tag className="h-3 w-3" />
										{article.category}
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground line-clamp-3">
									{article.content.replace(/[#*`]/g, '').substring(0, 150)}...
								</p>
								<div className="mt-4 flex flex-wrap gap-2">
									{article.tags.slice(0, 3).map((tag) => (
										<span
											key={tag}
											className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full"
										>
											{tag}
										</span>
									))}
								</div>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
			
			{/* No Results */}
			{sortedArticles.length === 0 && (
				<div className="text-center py-12">
					<p className="text-muted-foreground">
						No articles found. Try adjusting your search or filters.
					</p>
				</div>
			)}
		</div>
	)
} 