'use client'

import { useEffect } from 'react'

/**
 * Component ẩn này sẽ tự động xóa cache trình duyệt khi trang được tải
 * Không hiển thị UI nào, chỉ thực hiện xóa cache
 */
export function ClearBrowserCache() {
  useEffect(() => {
    // Chỉ chạy một lần khi trang được tải
    const clearCache = async () => {
      try {
        // Thêm timestamp vào localStorage để theo dõi thời gian làm mới
        const lastClearTime = localStorage.getItem('cache-last-cleared')
        const currentTime = Date.now()
        
        // Chỉ xóa cache nếu đã qua 3 phút kể từ lần cuối
        if (!lastClearTime || (currentTime - parseInt(lastClearTime)) > 3 * 60 * 1000) {
          // Gọi API làm mới cache
          await fetch('/api/cache-purge?' + currentTime)
          
          // Làm mới cửa sổ hiện tại nếu cần thiết
          if (window.location.pathname === '/store' || window.location.pathname === '/') {
            const cacheStatus = sessionStorage.getItem('cache-refreshed')
            
            if (!cacheStatus) {
              // Đánh dấu là đã làm mới trong session này
              sessionStorage.setItem('cache-refreshed', 'true')
              
              // Thử xóa cache Service Worker nếu có
              if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations()
                for (const registration of registrations) {
                  await registration.unregister()
                }
              }
              
              // Thử xóa cache API
              if ('caches' in window) {
                const cacheNames = await window.caches.keys()
                await Promise.all(
                  cacheNames.map(name => window.caches.delete(name))
                )
              }
              
              // Cập nhật thời gian làm mới cache
              localStorage.setItem('cache-last-cleared', currentTime.toString())
              
              // Tải lại trang với cache mới
              window.location.reload()
            }
          }
        }
      } catch (error) {
        console.error('Failed to clear cache:', error)
      }
    }
    
    // Thực hiện xóa cache sau khi trang đã tải xong
    if (document.readyState === 'complete') {
      clearCache()
    } else {
      window.addEventListener('load', clearCache)
      return () => window.removeEventListener('load', clearCache)
    }
  }, [])
  
  // Component này không hiển thị gì cả
  return null
} 