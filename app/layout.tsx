import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './components/providers'
import { Navbar } from './components/navbar'
import { LanguageInitializer } from './components/language-initializer'
import { HtmlHead } from './components/html-head'
import { initialSiteConfig } from './lib/initial-data'
import CacheRefresh from './components/cache-refresh'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: initialSiteConfig.siteTitle,
	description: 'Shop for premium electronics, accessories, and more at Shine Shop. Quality products with excellent customer service.',
	// Add cache control metadata
	other: {
		'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
		'Pragma': 'no-cache',
		'Expires': '0',
		'X-Build-Id': `build-${Date.now()}`,
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
				<meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
				<meta httpEquiv="Pragma" content="no-cache" />
				<meta httpEquiv="Expires" content="0" />
				<meta name="build-id" content={`build-${Date.now()}`} />
			</head>
			<body className={inter.className}>
				<Providers>
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