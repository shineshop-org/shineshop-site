'use client'

import React, { useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import { useStore } from '@/app/lib/store'
import { StoreProvider } from './providers/store-provider'
import { useVersionCheck } from '@/app/hooks/use-version-check'
import RSCErrorHandler from './providers/rsc-error-handler'

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
		
		// Suppress console errors for RSC 404s and font preload warnings
		const originalError = console.error;
		console.error = function(...args) {
			// Filter out RSC file not found errors and preload warnings
			const errorText = args.length > 0 ? String(args[0]) : '';
			if (
				errorText.includes('.txt?_rsc=') || 
				errorText.includes('was preloaded using link preload') ||
				errorText.includes('Failed to load resource: the server responded with a status of 404') ||
				errorText.includes('service.txt?_rsc=') ||
				errorText.includes('faq.txt?_rsc=') ||
				errorText.includes('payment.txt?_rsc=') ||
				errorText.includes('social.txt?_rsc=') ||
				errorText.includes('store/product/') ||
				errorText.includes('Failed to fetch RSC payload')
			) {
				// Silently ignore these specific errors
				return;
			}
			
			// Pass through other errors to the original console.error
			return originalError.apply(console, args);
		};
		
		// Also handle fetch for RSC files to prevent network errors
		const originalFetch = window.fetch;
		window.fetch = function(input, init) {
			const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input instanceof Request ? input.url : '';
			
			// If this is an RSC file request that's likely to fail, handle it gracefully
			if (url.includes('.txt?_rsc=') || url.includes('?_rsc=')) {
				// For already navigated pages, return an empty 200 response to prevent errors
				return Promise.resolve(new Response('', { status: 200, headers: { 'Content-Type': 'text/plain' } }));
			}
			
			// Otherwise, proceed with the original fetch
			return originalFetch.apply(window, [input, init]);
		};
		
		return () => {
			// Restore original console.error and fetch on cleanup
			console.error = originalError;
			window.fetch = originalFetch;
		};
	}, []);
	
	return (
		<StoreProvider>
			<InnerProviders>{children}</InnerProviders>
			<RSCErrorHandler />
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
			defaultTheme="system"
			enableSystem={true}
			storageKey={undefined}
		>
			{children}
		</ThemeProvider>
	)
} 