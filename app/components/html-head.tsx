'use client'

import Script from 'next/script'
import { useStore } from '@/app/lib/store'
import { useEffect } from 'react'
import { setPageTitle } from '@/app/lib/utils'

export function HtmlHead() {
  const { siteConfig } = useStore()
  
  // Update document title when siteConfig changes
  useEffect(() => {
    if (siteConfig?.siteTitle) {
      // Just set the default title - specific pages will override this
      setPageTitle()
    }
  }, [siteConfig])
  
  return (
    <>
      {/* Meta tags for SEO */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="Shop for premium electronics, accessories, and more at Shine Shop. Quality products with excellent customer service." />
      <meta name="keywords" content="online shop, premium products, electronics, accessories" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={siteConfig?.siteTitle || "SHINE SHOP"} />
      <meta property="og:description" content="Shop for premium electronics, accessories, and more at Shine Shop. Quality products with excellent customer service." />
      <meta property="og:site_name" content="SHINE SHOP" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteConfig?.siteTitle || "SHINE SHOP"} />
      <meta name="twitter:description" content="Shop for premium electronics, accessories, and more at Shine Shop. Quality products with excellent customer service." />
    </>
  )
} 