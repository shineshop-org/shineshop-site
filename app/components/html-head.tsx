'use client'

import Script from 'next/script'
import { useStore } from '@/app/lib/store'
import { useEffect } from 'react'

export function HtmlHead() {
  const { siteConfig } = useStore()
  
  // Update document title when siteConfig changes
  useEffect(() => {
    if (siteConfig?.siteTitle) {
      document.title = siteConfig.siteTitle
    }
  }, [siteConfig])
  
  return (
    <>
      {/* Meta tags for SEO */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </>
  )
} 