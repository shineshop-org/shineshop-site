import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import CryptoJS from 'crypto-js'

// Các biến bảo mật - trong môi trường thực tế, đây nên là biến môi trường
const COOKIE_NAME = 'shineshop_admin_auth'
const HEADER_NAME = 'X-Shineshop-Admin-Key'
const HEADER_VALUE = 'sh1n3sh0p-s3cr3t-k3y-9d7f61a3'
const ACCESS_COOKIE_NAME = 'shineshop_admin_access'
const ENCRYPTION_KEY = 'encKey-b9e25a8d-3c74-4f5a-9e12-f3b0e2dc4a19'

// Lưu trữ IP để giới hạn rate
const ipAccess: { [key: string]: { count: number, timestamp: number } } = {}
const MAX_ADMIN_ATTEMPTS = 10 // Số lần truy cập tối đa trong thời gian giới hạn
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 phút
const RATE_LIMIT_BLOCK_TIME = 15 * 60 * 1000 // 15 phút

// Hàm lấy địa chỉ IP từ request
function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  
  if (forwarded) {
    // Lấy IP đầu tiên trong danh sách x-forwarded-for
    return forwarded.split(',')[0].trim()
  }
  if (realIp) {
    return realIp
  }
  
  return 'unknown'
}

// Kiểm tra tính hợp lệ của access token
function verifyAccessToken(token: string): boolean {
  try {
    const decrypted = CryptoJS.AES.decrypt(token, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8)
    const payload = JSON.parse(decrypted)
    
    // Kiểm tra các thuộc tính cần thiết
    if (!payload.accessKey || !payload.timestamp || !payload.uniqueId || !payload.signature) {
      return false
    }
    
    // Xác thực chữ ký
    const expectedSignature = CryptoJS.HmacSHA256(`${payload.timestamp}:${payload.uniqueId}`, ENCRYPTION_KEY).toString()
    if (payload.signature !== expectedSignature) {
      return false
    }
    
    // Kiểm tra hạn token (24 giờ)
    const expiryTime = payload.timestamp + (24 * 60 * 60 * 1000)
    if (new Date().getTime() > expiryTime) {
      return false
    }
    
    return true
  } catch (error) {
    console.error('Access token verification failed:', error)
    return false
  }
}

// Hàm kiểm tra IP rate limit
function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  
  // Làm sạch dữ liệu cũ
  Object.keys(ipAccess).forEach(key => {
    if (now - ipAccess[key].timestamp > RATE_LIMIT_BLOCK_TIME) {
      delete ipAccess[key]
    }
  })
  
  // Kiểm tra IP hiện tại
  if (!ipAccess[ip]) {
    ipAccess[ip] = { count: 1, timestamp: now }
    return true
  }
  
  // Nếu đang trong thời gian bị chặn
  if (ipAccess[ip].count > MAX_ADMIN_ATTEMPTS && 
      now - ipAccess[ip].timestamp < RATE_LIMIT_BLOCK_TIME) {
    return false
  }
  
  // Nếu đã qua thời gian giới hạn, reset counter
  if (now - ipAccess[ip].timestamp > RATE_LIMIT_WINDOW) {
    ipAccess[ip] = { count: 1, timestamp: now }
    return true
  }
  
  // Tăng counter và kiểm tra giới hạn
  ipAccess[ip].count++
  return ipAccess[ip].count <= MAX_ADMIN_ATTEMPTS
}

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname
  
  // Add Content Security Policy header and other security headers
  const response = NextResponse.next()
  
  // Define Content Security Policy
  const cspHeader = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://images.unsplash.com https://img.vietqr.io https://api.vietqr.io https://ik.imagekit.io; font-src 'self'; connect-src 'self'; frame-src 'self'; object-src 'none';"
  
  // Set security headers
  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Kiểm tra nếu đường dẫn bắt đầu bằng /admin
  if (path.startsWith('/admin')) {
    // Lấy IP của người dùng
    const ip = getClientIp(request)
    
    // Kiểm tra rate limit
    if (!checkRateLimit(ip)) {
      return new NextResponse(null, {
        status: 429,
        statusText: 'Too Many Requests',
        headers: {
          'Retry-After': '900'
        }
      })
    }
    
    // Kiểm tra cookie đặc biệt để kích hoạt trang admin
    const accessCookie = request.cookies.get(ACCESS_COOKIE_NAME)
    
    // Nếu không có cookie đặc biệt hoặc cookie không hợp lệ, trả về 404
    if (!accessCookie || !verifyAccessToken(accessCookie.value)) {
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
  
  return response
}

// Configure the middleware to run on all paths instead of just admin paths
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 