'use client'

import React, { useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import { useStore } from '@/app/lib/store'
import { StoreProvider } from './providers/store-provider'
import { useVersionCheck } from '@/app/hooks/use-version-check'

export function Providers({ children }: { children: React.ReactNode }) {
	// Register service worker to handle cache clearing
	useEffect(() => {
		if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
			// Force unregister any existing service workers first
			navigator.serviceWorker.getRegistrations().then(registrations => {
				for (let registration of registrations) {
					registration.unregister();
				}
				
				// Register the new service worker with cache-busting query param
				navigator.serviceWorker.register(`/sw.js?v=${Date.now()}`)
					.then(registration => {
						console.log('Service worker registered successfully');
						
						// Force reload once after registration
						const reloadKey = 'sw-reload-once';
						if (!sessionStorage.getItem(reloadKey)) {
							sessionStorage.setItem(reloadKey, 'true');
							window.location.reload();
						}
					})
					.catch(err => {
						console.error('Service worker registration failed:', err);
					});
			});
		}
		
		// Suppress console errors for RSC 404s
		const originalError = console.error;
		console.error = function(...args) {
			// Filter out RSC file not found errors
			const errorText = args.length > 0 ? String(args[0]) : '';
			if (errorText.includes('.txt?_rsc=') || errorText.includes('was preloaded using link preload')) {
				// Silently ignore these specific errors
				return;
			}
			
			// Pass through other errors to the original console.error
			return originalError.apply(console, args);
		};
		
		return () => {
			// Restore original console.error on cleanup
			console.error = originalError;
		};
	}, []);
	
	return (
		<StoreProvider>
			<InnerProviders>{children}</InnerProviders>
		</StoreProvider>
	)
}

function InnerProviders({ children }: { children: React.ReactNode }) {
	const { theme } = useStore()
	
	// Sử dụng hook kiểm tra phiên bản
	useVersionCheck()
	
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