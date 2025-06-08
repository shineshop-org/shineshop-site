'use client';

import { useEffect } from 'react';

export default function CacheRefresh() {
  useEffect(() => {
    // Function to force cache refresh
    const refreshCache = async () => {
      try {
        // Add a timestamp to the fetch URL to bypass cache
        const timestamp = Date.now();
        await fetch(`/api/cache-purge?t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-store',
            'Pragma': 'no-cache',
          },
        });
        
        // Add cache-busting meta tags dynamically
        const metaCache = document.createElement('meta');
        metaCache.setAttribute('http-equiv', 'Cache-Control');
        metaCache.setAttribute('content', 'no-cache, no-store, must-revalidate');
        document.head.appendChild(metaCache);
        
        const metaPragma = document.createElement('meta');
        metaPragma.setAttribute('http-equiv', 'Pragma');
        metaPragma.setAttribute('content', 'no-cache');
        document.head.appendChild(metaPragma);
        
        const metaExpires = document.createElement('meta');
        metaExpires.setAttribute('http-equiv', 'Expires');
        metaExpires.setAttribute('content', '0');
        document.head.appendChild(metaExpires);
        
        // Add a cache-busting query param to all internal links
        document.querySelectorAll('a').forEach(link => {
          const href = link.getAttribute('href');
          if (href && href.startsWith('/') && !href.includes('?')) {
            link.setAttribute('href', `${href}?t=${timestamp}`);
          }
        });
      } catch (error) {
        console.error('Failed to refresh cache:', error);
      }
    };

    // Run the cache refresh on initial load
    refreshCache();
    
    // Setup an interval to periodically check for cache freshness
    const interval = setInterval(refreshCache, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  return null; // This component doesn't render anything visible
} 