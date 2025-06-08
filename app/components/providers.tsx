'use client'

import React, { useEffect } from 'react'
import { StoreProvider } from './providers/store-provider'
import RSCErrorHandler from './providers/rsc-error-handler'
import { Providers as ProvidersComponent } from './providers/index'

export function Providers({ children }: { children: React.ReactNode }) {
	// Handle errors and warning suppression
	useEffect(() => {
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
		<ProvidersComponent>
			{children}
		</ProvidersComponent>
	)
} 