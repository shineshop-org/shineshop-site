'use client'

import React from 'react'
import Link from 'next/link'
import { Shield, Mail, MessageSquare, ArrowRight } from 'lucide-react'
import { useTranslation } from '@/app/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'

const services = [
	{
		id: '2fa',
		title: 'twoFactorAuth',
		description: 'Decode and generate 2FA TOTP codes',
		icon: Shield,
		href: '/service/2fa',
		color: 'text-green-500',
		bgColor: 'bg-green-500/10'
	},
	{
		id: 'netflix',
		title: 'netflixCode',
		description: 'Extract Netflix codes from Outlook emails',
		icon: Mail,
		href: '/service/netflix',
		color: 'text-red-500',
		bgColor: 'bg-red-500/10'
	},
	{
		id: 'gpt',
		title: 'gptCode',
		description: 'Extract GPT verification codes from emails',
		icon: MessageSquare,
		href: '/service/gpt',
		color: 'text-blue-500',
		bgColor: 'bg-blue-500/10'
	}
]

export default function ServicePage() {
	const { t } = useTranslation()
	
	return (
		<div className="max-w-6xl mx-auto py-8">
			<div className="text-center mb-8">
				<h1 className="text-4xl font-bold">{t('services')}</h1>
				<p className="text-muted-foreground mt-2">
					Useful tools and utilities for our customers
				</p>
			</div>
			
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{services.map((service) => (
					<Link key={service.id} href={service.href}>
						<Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
							<CardHeader>
								<div className={`w-12 h-12 rounded-lg ${service.bgColor} ${service.color} flex items-center justify-center mb-4`}>
									<service.icon className="h-6 w-6" />
								</div>
								<CardTitle className="text-xl">{t(service.title)}</CardTitle>
								<CardDescription>{service.description}</CardDescription>
							</CardHeader>
							<CardContent>
								<Button variant="ghost" className="w-full justify-between">
									Open Tool
									<ArrowRight className="h-4 w-4" />
								</Button>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</div>
	)
} 