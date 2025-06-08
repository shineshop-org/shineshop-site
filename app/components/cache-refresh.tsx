'use client';

import { useEffect, useState } from 'react';

export default function CacheRefresh() {
  const [hasRefreshed, setHasRefreshed] = useState(false);

  useEffect(() => {
    // Skip if already refreshed in this session
    if (hasRefreshed) return;

    // Function to force cache refresh
    const refreshCache = async () => {
      try {
        // Add a timestamp to the fetch URL to bypass cache
        const timestamp = Date.now();
        
        // Only clear storage once per session
        if (typeof window !== 'undefined' && !sessionStorage.getItem('cache-cleared')) {
          try {
            // Mark as cleared in this session
            sessionStorage.setItem('cache-cleared', 'true');
            
            // Clear localStorage data - but don't clear everything
            // Only clear the shineshop storage
            localStorage.removeItem('shineshop-storage-v3');
            localStorage.removeItem('shineshop-theme');
            
            // Try to clear specific cookies only
            const cookiesToClear = ['shineshop-storage-v3', 'shineshop-theme'];
            cookiesToClear.forEach(name => {
              document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
            });
          } catch (e) {
            console.error('Error clearing storage:', e);
          }
        }
        
        // Check if need to refresh cache
        const currentPathname = window.location.pathname;
        
        // Only refresh cache for homepage or product pages, and only once per session
        if (!sessionStorage.getItem('cache-refreshed') && 
            (currentPathname === '/store' || currentPathname === '/' || currentPathname.includes('/store/product/'))) {
          
          // Mark as refreshed in this session
          sessionStorage.setItem('cache-refreshed', 'true');
          setHasRefreshed(true);
          
          // Call API to purge cache
          await fetch(`/api/cache-purge?t=${timestamp}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-store',
              'Pragma': 'no-cache',
            },
          });
          
          // Add meta tags to prevent cache
          updateMetaTags();
          
          // Try to clear browser cache
          clearBrowserCache();
          
          // Update all internal links with timestamp
          updateInternalLinks(timestamp);
        }
      } catch (error) {
        console.error('Failed to refresh cache:', error);
      }
    };
    
    // Add meta tags to prevent cache
    const updateMetaTags = () => {
      // Remove existing meta tags if any
      document.querySelectorAll('meta[data-cache-control]').forEach(el => el.remove());
      
      // Add new meta tags
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
      
      // Add meta tag with timestamp
      const metaTimestamp = document.createElement('meta');
      metaTimestamp.setAttribute('name', 'cache-timestamp');
      metaTimestamp.setAttribute('content', Date.now().toString());
      metaTimestamp.setAttribute('data-cache-control', 'true');
      document.head.appendChild(metaTimestamp);
    };
    
    // Try to clear browser cache
    const clearBrowserCache = async () => {
      // Try to unregister Service Worker if any
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
      
      // Try to clear cache API
      if ('caches' in window) {
        try {
          const cacheNames = await window.caches.keys();
          await Promise.all(cacheNames.map(name => window.caches.delete(name)));
        } catch (e) {
          console.error('Error clearing cache API:', e);
        }
      }
    };
    
    // Update internal links
    const updateInternalLinks = (timestamp: number) => {
      document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/')) {
          // Add or update timestamp parameter
          const url = new URL(href, window.location.origin);
          url.searchParams.set('t', timestamp.toString());
          link.setAttribute('href', url.pathname + url.search);
        }
      });
    };

    // Run refreshCache when page loads, but only once
    if (document.readyState === 'complete') {
      refreshCache();
    } else {
      const handleLoad = () => {
        refreshCache();
        // Remove the event listener after execution
        window.removeEventListener('load', handleLoad);
      };
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [hasRefreshed]);

  return null; // This component doesn't display anything
} 