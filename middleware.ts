import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import CryptoJS from 'crypto-js'

// Environment check
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

// Enable debug logging only in development and when explicitly wanted
const ENABLE_DEBUG_LOGGING = isDevelopment && false // Set to true to enable verbose logging

// Cache version - increment this when deploying major content changes
const CACHE_VERSION = '1.0.5'

// Define navbar paths that should be exempt from redirects
const NAVBAR_PATHS = ['/payment', '/social', '/service', '/faq', '/tos']

// Middleware
export function middleware(req: NextRequest) {
	const url = req.nextUrl.clone()
	const pathname = url.pathname
	const referer = req.headers.get('referer') || ''
	const userAgent = req.headers.get('user-agent') || ''
	
	// -------------------- ADMIN ROUTES PROTECTION --------------------
	// Skip ALL middleware processing for admin routes and API routes
	// This is critical to prevent redirects during admin operations
	if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
		const response = NextResponse.next()
		
		// Set admin session cookies for admin routes
		if (pathname.startsWith('/admin')) {
			response.cookies.set('adminAuthenticated', 'true', {
				httpOnly: true,
				maxAge: 60 * 60, // 1 hour
				path: '/',
				sameSite: 'strict'
			})
			
			response.cookies.set('admin_session', 'true', {
				httpOnly: true,
				maxAge: 60 * 60, // 1 hour
				path: '/',
				sameSite: 'strict'
			})
			
			// Add admin headers to prevent redirects
			response.headers.set('X-Admin-Request', 'true')
			response.headers.set('X-Prevent-Redirect', 'true')
			response.headers.set('X-Admin-Session', 'true')
		}
		
		// For API routes, set cache control headers
		if (pathname.startsWith('/api')) {
			response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
			response.headers.set('Pragma', 'no-cache')
			response.headers.set('Expires', '0')
		}
		
		return response
	}

	// -------------------- ADMIN CONTEXT DETECTION --------------------
	// Check all possible indicators of being in admin context
	const isAdminRequest = req.headers.get('X-Admin-Request') === 'true'
	const preventRedirect = req.headers.get('X-Prevent-Redirect') === 'true'
	const isAdminSession = req.headers.get('X-Admin-Session') === 'true'
	const adminReferer = referer && referer.includes('/admin')
	const cookies = req.cookies
	const hasAdminCookie = cookies.has('admin_session') || cookies.has('adminAuthenticated')
	
	// Create a strong admin context indicator
	const isAdminContext = isAdminRequest || preventRedirect || isAdminSession || adminReferer || hasAdminCookie
	
	// Skip all redirects if we're in admin context
	if (isAdminContext) {
		// Only log in debug mode to reduce console noise
		if (ENABLE_DEBUG_LOGGING) {
			console.log('Admin context detected, skipping redirects')
		}
		const response = NextResponse.next()
		response.headers.set('X-Admin-Context', 'true')
		return response
	}
	
	// Skip redirect for navbar paths
	if (NAVBAR_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
		return NextResponse.next()
	}

	// -------------------- HOMEPAGE REDIRECT --------------------
	// For homepage redirects - Only redirect if NOT in admin context
	if (pathname === '/' && 
	    !referer.includes('/store') && 
	    !referer.includes('/admin') && 
	    !req.headers.get('X-Requested-With')?.includes('fetch')) {
		// Redirect homepage to /store
		url.pathname = '/store'
		return NextResponse.redirect(url)
	}
	
	// -------------------- STORE PROTECTION --------------------
	// If this is a navigation to /store but we detect admin context
	// redirect back to admin dashboard instead
	if (pathname === '/store' && isAdminContext) {
		if (ENABLE_DEBUG_LOGGING) {
			console.log('Prevented redirect to /store for admin user, redirecting back to admin')
		}
		url.pathname = '/admin/dashboard'
		return NextResponse.redirect(url)
	}

	// -------------------- CACHE HEADERS --------------------
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