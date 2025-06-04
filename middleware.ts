import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Các biến bảo mật - trong môi trường thực tế, đây nên là biến môi trường
const COOKIE_NAME = 'shineshop_admin_auth'
const HEADER_NAME = 'X-Shineshop-Admin-Key'
const HEADER_VALUE = 'sh1n3sh0p-s3cr3t-k3y-9d7f61a3'
const ACCESS_COOKIE_NAME = 'shineshop_admin_access'

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname
  
  // Kiểm tra nếu đường dẫn bắt đầu bằng /admin
  if (path.startsWith('/admin')) {
    // Kiểm tra cookie đặc biệt để kích hoạt trang admin
    const accessCookie = request.cookies.get(ACCESS_COOKIE_NAME)
    
    // Nếu không có cookie đặc biệt, trả về 404
    if (!accessCookie) {
      // Trả về 404 thay vì chuyển hướng
      return NextResponse.rewrite(new URL('/404', request.url))
    }
    
    // Đã có cookie kích hoạt, tiếp tục kiểm tra các điều kiện khác cho các trang ngoại trừ trang đăng nhập
    if (path !== '/admin') {
      // Kiểm tra header bảo mật
      const hasSecretHeader = request.headers.get(HEADER_NAME) === HEADER_VALUE
      
      // Kiểm tra cookie xác thực
      const authCookie = request.cookies.get(COOKIE_NAME)
      
      // Nếu không có header bảo mật hoặc cookie hợp lệ, chuyển hướng về trang đăng nhập
      if (!hasSecretHeader && !authCookie) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    }
  }
  
  // Otherwise, continue with the request
  return NextResponse.next()
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: ['/admin', '/admin/:path*'],
} 