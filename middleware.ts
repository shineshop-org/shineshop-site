import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import CryptoJS from 'crypto-js'

// Environment check
const isDevelopment = process.env.NODE_ENV === 'development'

// Middleware
export function middleware(req: NextRequest) {
	// Skip middleware in production (for static export compatibility)
	if (!isDevelopment) {
		// In production, add cache control headers to prevent browser caching
		const response = NextResponse.next()
		
		// Set cache control headers
		response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
		response.headers.set('Pragma', 'no-cache')
		response.headers.set('Expires', '0')
		
		return response
	}

	const url = req.nextUrl.clone()
	const pathname = url.pathname

	// Trong môi trường phát triển, cho phép tất cả truy cập vào admin
	if (pathname.startsWith('/admin')) {
		// Trong development, luôn cho phép truy cập vào admin
		return NextResponse.next()
	}

	// Add cache control headers in development too
	const response = NextResponse.next()
	response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
	response.headers.set('Pragma', 'no-cache')
	response.headers.set('Expires', '0')
	
	return response
}

export const config = {
	matcher: [
		// Skip Next.js internals and all static files
		'/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
	],
} 