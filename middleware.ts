import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname
  
  // Check if we're in production and the path starts with /admin
  if (process.env.NODE_ENV === 'production' && path.startsWith('/admin')) {
    // In production, redirect admin routes to 404
    return NextResponse.rewrite(new URL('/404', request.url))
  }
  
  // Otherwise, continue with the request
  return NextResponse.next()
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: ['/admin/:path*'],
} 