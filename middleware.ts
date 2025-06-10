import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import CryptoJS from 'crypto-js'

// Environment check
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

// Cache version - increment this when deploying major content changes
const CACHE_VERSION = '1.0.5'

// Define navbar paths that should be exempt from redirects
const NAVBAR_PATHS = ['/payment', '/social', '/service', '/faq']

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

	// Skip redirect for navbar paths
	if (NAVBAR_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
		return NextResponse.next()
	}

	// For homepage redirects - to prevent loops, only redirect if not coming from /store
	if (pathname === '/' && !referer.includes('/store')) {
		// Redirect homepage to /store
		url.pathname = '/store'
		return NextResponse.redirect(url)
	}

	// Add cache control headers to prevent browser caching
	const response = NextResponse.next()
	
	// Generate a unique timestamp to force fresh content
	const timestamp = Date.now().toString()
	
	// Generate cache key based on current time (changes every minute)
	const timeWindow = Math.floor(Date.now() / (60 * 1000))
	const cacheKey = `v${CACHE_VERSION}-${timeWindow}`
	
	// Check if this is the homepage
	const isHomepage = pathname === '/' || pathname === '/index.html' || pathname === '/store'
	const isProductPage = pathname.includes('/store/product/')
	
	// Set different cache policies based on the route
	if (isHomepage || isProductPage) {
		// For homepage and product pages - aggressive cache busting
		response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
		response.headers.set('CDN-Cache-Control', 'no-store')
		response.headers.set('Cloudflare-CDN-Cache-Control', 'no-store')
		response.headers.set('X-Cache-Bust', cacheKey)
		response.headers.set('Cache-Tag', 'shineshop-site,content-update')
		// Less aggressive clear-site-data
		response.headers.set('Clear-Site-Data', '"cache"')
		response.headers.set('Pragma', 'no-cache')
		response.headers.set('Expires', '0')
		
		// Force revalidation of browser cache
		response.headers.set('ETag', `W/"${timestamp}"`)
		response.headers.set('Last-Modified', new Date().toUTCString())
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