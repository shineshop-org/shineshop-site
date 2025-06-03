import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './components/providers'
import { Navbar } from './components/navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'Shine Shop - Your Trusted Online Shopping Destination',
	description: 'Shop for premium electronics, accessories, and more at Shine Shop. Quality products with excellent customer service.',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className}>
				<Providers>
					<Navbar />
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