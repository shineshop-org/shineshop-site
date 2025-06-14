'use client'

import React from 'react'
import Link from 'next/link'
import { Shield, Mail, MessageSquare } from 'lucide-react'
import { useTranslation } from '@/app/hooks/use-translations'
import { Card, CardContent } from '@/app/components/ui/card'

const services = [
	{
		id: '2fa',
		title: 'Lấy mã 2FA',
		icon: Shield,
		href: '/service/2fa',
		color: 'text-green-500',
		bgColor: 'bg-green-500/10'
	},
	{
		id: 'netflix',
		title: 'Lấy mã Netflix',
		icon: Mail,
		href: '/service/netflix',
		color: 'text-red-500',
		bgColor: 'bg-red-500/10'
	},
	{
		id: 'gpt',
		title: 'Lấy mã ChatGPT',
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
			<div className="text-center mb-8 px-2 sm:px-0">
				<h1 className="text-4xl font-bold jshine-gradient">{t('services')}</h1>
				<p className="text-muted-foreground mt-2">
					Useful tools and utilities for our customers
				</p>
			</div>
			
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-2 sm:px-0">
				{services.map((service) => (
					<Link key={service.id} href={service.href}>
						<Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
							<CardContent className="flex items-center p-4 sm:p-6">
								<div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${service.bgColor} ${service.color} flex items-center justify-center`}>
									<service.icon className="h-5 w-5 sm:h-6 sm:w-6" />
								</div>
								<h3 className="text-lg sm:text-xl font-medium ml-3 sm:ml-4">{service.title}</h3>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</div>
	)
} 