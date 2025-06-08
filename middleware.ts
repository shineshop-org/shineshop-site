import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import CryptoJS from 'crypto-js'

// Environment check
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

// Cache version - increment this when deploying major content changes
const CACHE_VERSION = '1.0.1'

// Middleware
export function middleware(req: NextRequest) {
	const url = req.nextUrl.clone()
	const pathname = url.pathname
	const referer = req.headers.get('referer') || ''
	const userAgent = req.headers.get('user-agent') || ''
	
	// Skip middleware for admin pages in development
	if (process.env.NODE_ENV === 'development' && pathname.startsWith('/admin')) {
		return NextResponse.next()
	}

	// Add cache control headers to prevent browser caching
	const response = NextResponse.next()
	
	// Generate a unique timestamp to force fresh content
	const timestamp = Date.now().toString()
	
	// Generate cache key based on current time window (changes every hour)
	const timeWindow = Math.floor(Date.now() / (60 * 60 * 1000))
	const cacheKey = `v${CACHE_VERSION}-${timeWindow}`
	
	// Check if this is the homepage
	const isHomepage = pathname === '/' || pathname === '/index.html' || pathname === '/store'
	
	// Set different cache policies based on the route
	if (isHomepage || pathname.includes('/store/product/')) {
		// For homepage and product pages - more aggressive cache busting
		response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
		response.headers.set('CDN-Cache-Control', 'no-store')
		response.headers.set('Cloudflare-CDN-Cache-Control', 'no-store')
		response.headers.set('X-Cache-Bust', cacheKey)
		response.headers.set('Cache-Tag', 'shineshop-site,content-update')
	} else if (pathname.includes('/_next/')) {
		// For Next.js assets - allow caching but with versioning
		response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
	} else {
		// For other routes - moderate cache control
		response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0')
		response.headers.set('Pragma', 'no-cache')
		response.headers.set('Expires', '0')
		response.headers.set('Surrogate-Control', 'no-store')
		response.headers.set('CDN-Cache-Control', 'no-store, max-age=0')
		response.headers.set('Cloudflare-CDN-Cache-Control', 'no-store, max-age=0')
		response.headers.set('X-Content-Fresh', timestamp)
	}
	
	// Add custom header to identify cache version
	response.headers.set('X-Cache-Version', CACHE_VERSION)
	
	return response
}

export const config = {
	matcher: [
		// Skip Next.js internals and all static files
		'/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
	],
} 