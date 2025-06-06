'use client'

import React from 'react'
import { ThemeProvider } from 'next-themes'
import { useStore } from '@/app/lib/store'
import { StoreProvider } from './providers/store-provider'

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<StoreProvider>
			<InnerProviders>{children}</InnerProviders>
		</StoreProvider>
	)
}

function InnerProviders({ children }: { children: React.ReactNode }) {
	const { theme } = useStore()
	
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme={theme}
			enableSystem={false}
			storageKey="shineshop-theme"
		>
			{children}
		</ThemeProvider>
	)
} 