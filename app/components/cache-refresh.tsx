'use client';

import { useEffect } from 'react';

export default function CacheRefresh() {
  useEffect(() => {
    // Function to force cache refresh
    const refreshCache = async () => {
      try {
        // Add a timestamp to the fetch URL to bypass cache
        const timestamp = Date.now();
        
        // Kiểm tra xem đã làm mới cache chưa
        const cacheStatus = sessionStorage.getItem('cache-refreshed');
        const lastRefresh = localStorage.getItem('last-cache-refresh');
        const currentPathname = window.location.pathname;
        
        // Chỉ làm mới cache khi người dùng truy cập trang chủ hoặc trang sản phẩm
        // và chưa làm mới trong phiên hiện tại
        if (!cacheStatus && (currentPathname === '/store' || currentPathname === '/' || currentPathname.includes('/store/product/'))) {
          // Gọi API xóa cache
          await fetch(`/api/cache-purge?t=${timestamp}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-store',
              'Pragma': 'no-cache',
            },
          });
          
          // Lưu thời gian làm mới cuối cùng
          localStorage.setItem('last-cache-refresh', timestamp.toString());
          sessionStorage.setItem('cache-refreshed', 'true');
          
          // Thêm meta tags để ngăn cache
          updateMetaTags();
          
          // Cố gắng xóa cache trình duyệt
          clearBrowserCache();
          
          // Cập nhật tất cả các liên kết nội bộ với tham số timestamp
          updateInternalLinks(timestamp);
          
          // Trong trường hợp trang chủ, thử tải lại trang sau 2 giây nếu là lần đầu truy cập
          if ((currentPathname === '/store' || currentPathname === '/') && !lastRefresh) {
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Failed to refresh cache:', error);
      }
    };
    
    // Thêm meta tags để ngăn cache
    const updateMetaTags = () => {
      // Xóa meta tags hiện có nếu có
      document.querySelectorAll('meta[data-cache-control]').forEach(el => el.remove());
      
      // Thêm meta tags mới
      const metaCache = document.createElement('meta');
      metaCache.setAttribute('http-equiv', 'Cache-Control');
      metaCache.setAttribute('content', 'no-cache, no-store, must-revalidate');
      metaCache.setAttribute('data-cache-control', 'true');
      document.head.appendChild(metaCache);
      
      const metaPragma = document.createElement('meta');
      metaPragma.setAttribute('http-equiv', 'Pragma');
      metaPragma.setAttribute('content', 'no-cache');
      metaPragma.setAttribute('data-cache-control', 'true');
      document.head.appendChild(metaPragma);
      
      const metaExpires = document.createElement('meta');
      metaExpires.setAttribute('http-equiv', 'Expires');
      metaExpires.setAttribute('content', '0');
      metaExpires.setAttribute('data-cache-control', 'true');
      document.head.appendChild(metaExpires);
      
      // Thêm meta tag mới với timestamp
      const metaTimestamp = document.createElement('meta');
      metaTimestamp.setAttribute('name', 'cache-timestamp');
      metaTimestamp.setAttribute('content', Date.now().toString());
      metaTimestamp.setAttribute('data-cache-control', 'true');
      document.head.appendChild(metaTimestamp);
    };
    
    // Cố gắng xóa cache trình duyệt
    const clearBrowserCache = async () => {
      // Thử xóa cache Service Worker nếu có
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
          }
        } catch (e) {
          console.error('Error unregistering service workers:', e);
        }
      }
      
      // Thử xóa cache API
      if ('caches' in window) {
        try {
          const cacheNames = await window.caches.keys();
          await Promise.all(cacheNames.map(name => window.caches.delete(name)));
        } catch (e) {
          console.error('Error clearing cache API:', e);
        }
      }
    };
    
    // Cập nhật các liên kết nội bộ
    const updateInternalLinks = (timestamp: number) => {
      document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/')) {
          // Thêm hoặc cập nhật tham số timestamp
          const url = new URL(href, window.location.origin);
          url.searchParams.set('t', timestamp.toString());
          link.setAttribute('href', url.pathname + url.search);
        }
      });
    };

    // Chạy refreshCache khi trang tải xong
    if (document.readyState === 'complete') {
      refreshCache();
    } else {
      window.addEventListener('load', refreshCache);
      return () => window.removeEventListener('load', refreshCache);
    }
  }, []);

  return null; // Component này không hiển thị gì
} 