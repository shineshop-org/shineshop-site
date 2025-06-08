import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import CryptoJS from 'crypto-js'

// Environment check
const isDevelopment = process.env.NODE_ENV === 'development'

// Middleware
export function middleware(req: NextRequest) {
	const url = req.nextUrl.clone()
	const pathname = url.pathname
	
	// Skip middleware for admin pages in development
	if (process.env.NODE_ENV === 'development' && pathname.startsWith('/admin')) {
		return NextResponse.next()
	}

	// Add cache control headers to prevent browser caching
	const response = NextResponse.next()
	
	// Generate a unique timestamp to force fresh content
	const timestamp = Date.now().toString()
	
	// Set cache control headers (more aggressive)
	response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0')
	response.headers.set('Pragma', 'no-cache')
	response.headers.set('Expires', '0')
	response.headers.set('Surrogate-Control', 'no-store')
	response.headers.set('CDN-Cache-Control', 'no-store, max-age=0')
	response.headers.set('Cloudflare-CDN-Cache-Control', 'no-store, max-age=0')
	response.headers.set('X-Content-Fresh', timestamp) // Add a unique header that changes with each request
	response.headers.set('Clear-Site-Data', '"cache", "cookies", "storage"')
	
	return response
}

export const config = {
	matcher: [
		// Skip Next.js internals and all static files
		'/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
	],
} 