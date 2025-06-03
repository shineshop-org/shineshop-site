'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Facebook, Instagram, Twitter, MessageCircle, Send, Youtube, Copy, ExternalLink, Check } from 'lucide-react'
import { useStore } from '@/app/lib/store'
import { useTranslation } from '@/app/hooks/use-translations'
import { Card, CardContent } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'

const iconMap: Record<string, React.ReactNode> = {
	facebook: <Facebook className="h-8 w-8" />,
	instagram: <Instagram className="h-8 w-8" />,
	twitter: <Twitter className="h-8 w-8" />,
	'message-circle': <MessageCircle className="h-8 w-8" />,
	send: <Send className="h-8 w-8" />,
	youtube: <Youtube className="h-8 w-8" />,
}

export default function SocialPage() {
	const { socialLinks } = useStore()
	const { t } = useTranslation()
	const [copiedId, setCopiedId] = useState<string | null>(null)
	
	const handleCopy = async (url: string, id: string) => {
		try {
			await navigator.clipboard.writeText(url)
			setCopiedId(id)
			setTimeout(() => setCopiedId(null), 2000)
		} catch (err) {
			console.error('Failed to copy:', err)
		}
	}
	
	return (
		<div className="max-w-4xl mx-auto py-8">
			<div className="text-center mb-8">
				<h1 className="text-4xl font-bold">{t('socialLinks')}</h1>
				<p className="text-muted-foreground mt-2">
					Connect with us on social media
				</p>
			</div>
			
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{socialLinks.map((link) => (
					<Card key={link.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
						<CardContent className="p-6">
							<div className="flex flex-col items-center space-y-4">
								{/* Icon */}
								<div className="p-4 bg-primary/10 rounded-full text-primary">
									{iconMap[link.icon] || <ExternalLink className="h-8 w-8" />}
								</div>
								
								{/* Platform Name */}
								<h3 className="font-semibold text-lg">{link.platform}</h3>
								
								{/* Action Buttons */}
								<div className="flex gap-2 w-full">
									<Button
										onClick={() => handleCopy(link.url, link.id)}
										variant="outline"
										size="sm"
										className="flex-1"
									>
										{copiedId === link.id ? (
											<>
												<Check className="mr-2 h-4 w-4" />
												Copied!
											</>
										) : (
											<>
												<Copy className="mr-2 h-4 w-4" />
												{t('copyLink')}
											</>
										)}
									</Button>
									<Button
										asChild
										size="sm"
										className="flex-1"
									>
										<Link
											href={link.url}
											target="_blank"
											rel="noopener noreferrer"
										>
											<ExternalLink className="mr-2 h-4 w-4" />
											{t('openLink')}
										</Link>
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	)
} 