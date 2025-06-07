'use client'

import Script from 'next/script'
import { useEffect } from 'react'

export function HtmlHead() {
  // Force reload if coming from browser history
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page is loaded from cache (back/forward navigation)
        window.location.reload()
      }
    }
    
    window.addEventListener('pageshow', handlePageShow)
    return () => {
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [])
  
  return (
    <>
      {/* Meta tags to prevent caching */}
      <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
      <meta httpEquiv="Pragma" content="no-cache" />
      <meta httpEquiv="Expires" content="0" />
      
      {/* Load force-reload script */}
      <Script src="/force-reload.js" strategy="beforeInteractive" />
    </>
  )
} 