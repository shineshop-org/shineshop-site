import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import CryptoJS from 'crypto-js'

// Environment check
const isDevelopment = process.env.NODE_ENV === 'development'

// Middleware
export function middleware(req: NextRequest) {
	// Skip middleware in production (for static export compatibility)
	if (!isDevelopment) {
		return NextResponse.next()
	}

	const url = req.nextUrl.clone()
	const pathname = url.pathname

	// Trong môi trường phát triển, cho phép tất cả truy cập vào admin
	if (pathname.startsWith('/admin')) {
		// Trong development, luôn cho phép truy cập vào admin
		return NextResponse.next()
	}

	return NextResponse.next()
}

export const config = {
	matcher: [
		// Skip Next.js internals and all static files
		'/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
	],
} 