import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './components/providers'
import { Navbar } from './components/navbar'
import { LanguageInitializer } from './components/language-initializer'
import { HtmlHead } from './components/html-head'
import { initialSiteConfig } from './lib/initial-data'
import CacheRefresh from './components/cache-refresh'
import { SystemPreferencesProvider } from './hooks/system-preferences'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: initialSiteConfig.siteTitle,
	description: 'Shop for premium electronics, accessories, and more at Shine Shop. Quality products with excellent customer service.',
	icons: {
		icon: '/pageLogo.png',
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HtmlHead />
			</head>
			<body className={inter.className}>
				<Providers>
					<SystemPreferencesProvider />
					<LanguageInitializer />
					<Navbar />
					<CacheRefresh />
					<main className="min-h-screen pt-16 transition-all duration-200">
						<div className="container mx-auto px-4">
							{children}
						</div>
					</main>
				</Providers>
			</body>
		</html>
	)
} 