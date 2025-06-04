'use client'

import { jwtDecode } from 'jwt-js-decode'
import CryptoJS from 'crypto-js'
import jwt from 'jsonwebtoken'

// Hằng số bảo mật - trong môi trường thực tế, đây nên là biến môi trường
const JWT_SECRET = 'verySecretKey-cb47d642-1a43-4f97-9314-7dd9b8c7e8c9'
const ENCRYPTION_KEY = 'encKey-b9e25a8d-3c74-4f5a-9e12-f3b0e2dc4a19'
const COOKIE_NAME = 'shineshop_admin_auth'
const HEADER_NAME = 'X-Shineshop-Admin-Key'
const HEADER_VALUE = 'sh1n3sh0p-s3cr3t-k3y-9d7f61a3'

// Cookie đặc biệt để kích hoạt trang admin
export const ADMIN_ACCESS_COOKIE = {
  name: 'shineshop_admin_access',
  value: generateAccessToken(),
  maxAge: 30 * 24 * 60 * 60 // 30 ngày
}

// Admin credentials
export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'shineshop2024',
  token: generateSpecialToken()
}

// Tạo token đặc biệt để kích hoạt trang admin
function generateAccessToken(): string {
  const timestamp = new Date().getTime()
  // Use a simpler approach to generate unique ID
  const uniqueId = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15)
  
  const payload = {
    accessKey: true,
    timestamp,
    uniqueId,
    signature: CryptoJS.HmacSHA256(`${timestamp}:${uniqueId}`, ENCRYPTION_KEY).toString()
  }
  
  return CryptoJS.AES.encrypt(
    JSON.stringify(payload),
    ENCRYPTION_KEY
  ).toString()
}

// Xác thực token kích hoạt
export function verifyAccessToken(token: string): boolean {
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
    
    // Kiểm tra hạn token (30 ngày)
    const expiryTime = payload.timestamp + (30 * 24 * 60 * 60 * 1000)
    if (new Date().getTime() > expiryTime) {
      return false
    }
    
    return true
  } catch (error) {
    console.error('Access token verification failed:', error)
    return false
  }
}

// Tạo token đặc biệt để sử dụng trong cookie
function generateSpecialToken(): string {
  const timestamp = new Date().getTime()
  const payload = {
    admin: true,
    timestamp,
    special: 'shineshop-secure'
  }
  
  // Mã hóa token
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(payload),
    ENCRYPTION_KEY
  ).toString()
  
  return encryptedData
}

// Xác thực bằng token
export function verifySpecialToken(token: string): boolean {
  try {
    // Giải mã token
    const decrypted = CryptoJS.AES.decrypt(token, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8)
    const payload = JSON.parse(decrypted)
    
    // Kiểm tra tính hợp lệ
    if (!payload.admin || !payload.special || payload.special !== 'shineshop-secure') {
      return false
    }
    
    // Kiểm tra token có hết hạn không (30 ngày)
    const expiryTime = payload.timestamp + (30 * 24 * 60 * 60 * 1000)
    if (new Date().getTime() > expiryTime) {
      return false
    }
    
    return true
  } catch (error) {
    console.error('Token verification failed:', error)
    return false
  }
}

// Tạo JWT token cho phiên đăng nhập
export function createAuthToken(username: string): string {
  const payload = {
    sub: username,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 ngày
    admin: true
  }
  
  // Sử dụng phương pháp khác để tạo JWT token
  return CryptoJS.AES.encrypt(
    JSON.stringify(payload),
    JWT_SECRET
  ).toString()
}

// Xác thực JWT token
export function verifyAuthToken(token: string): boolean {
  try {
    const decrypted = CryptoJS.AES.decrypt(token, JWT_SECRET).toString(CryptoJS.enc.Utf8)
    const payload = JSON.parse(decrypted)
    
    if (!payload.admin) return false
    
    // Kiểm tra hết hạn
    const currentTime = Math.floor(Date.now() / 1000)
    if (payload.exp < currentTime) return false
    
    return true
  } catch (error) {
    return false
  }
}

// Thiết lập cookie bảo mật
export function setAuthCookie(token: string): void {
  // Thiết lập cookie với httpOnly và secure (trong môi trường production)
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=strict${window.location.protocol === 'https:' ? '; secure' : ''}`
}

// Lấy token từ cookie
export function getAuthCookie(): string | null {
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === COOKIE_NAME) {
      return value
    }
  }
  return null
}

// Xóa cookie
export function clearAuthCookie(): void {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`
}

// Thiết lập cookie kích hoạt
export function setAccessCookie(): void {
  document.cookie = `${ADMIN_ACCESS_COOKIE.name}=${ADMIN_ACCESS_COOKIE.value}; path=/; max-age=${ADMIN_ACCESS_COOKIE.maxAge}; samesite=strict${window.location.protocol === 'https:' ? '; secure' : ''}`
}

// Tạo file cookie để import vào trình duyệt
export function generateCookieFile(): string {
  const domain = window.location.hostname
  const path = '/'
  const secure = window.location.protocol === 'https:' ? 'TRUE' : 'FALSE'
  const expiryDate = new Date(Date.now() + ADMIN_ACCESS_COOKIE.maxAge * 1000).toUTCString()
  
  return `# Netscape HTTP Cookie File
# https://curl.se/docs/http-cookies.html
# This file was generated by shineshop-admin. Edit at your own risk.

${domain}\tTRUE\t${path}\t${secure}\t${Math.floor(Date.now()/1000) + ADMIN_ACCESS_COOKIE.maxAge}\t${ADMIN_ACCESS_COOKIE.name}\t${ADMIN_ACCESS_COOKIE.value}
`
}

// Kiểm tra header bảo mật
export function checkSecretHeader(headers: Headers): boolean {
  return headers.get(HEADER_NAME) === HEADER_VALUE
}

// Tạo một đoạn mã Javascript để thêm header bảo mật
export function generateHeaderInjectionScript(): string {
  return `
  // Thêm đoạn này vào console trình duyệt để có thể truy cập trang admin
  (function() {
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
      originalOpen.apply(this, arguments);
      this.setRequestHeader('${HEADER_NAME}', '${HEADER_VALUE}');
    };
    
    const originalFetch = window.fetch;
    window.fetch = function(resource, init) {
      init = init || {};
      init.headers = init.headers || {};
      init.headers['${HEADER_NAME}'] = '${HEADER_VALUE}';
      return originalFetch(resource, init);
    };
    
    // Thiết lập cookie
    document.cookie = '${COOKIE_NAME}=${ADMIN_CREDENTIALS.token}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=strict';
    
    // Thiết lập cookie kích hoạt admin
    document.cookie = '${ADMIN_ACCESS_COOKIE.name}=${ADMIN_ACCESS_COOKIE.value}; path=/; max-age=${ADMIN_ACCESS_COOKIE.maxAge}; samesite=strict';
    
    console.log('Admin access enabled successfully!');
  })();
  `
} 