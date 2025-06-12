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
      
      {/* Script to prevent navigation when saving from admin */}
      <Script id="prevent-admin-navigation" strategy="beforeInteractive">
        {`
          (function() {
            // Add a variable to track if navigation should be prevented
            window.__preventAdminNavigation = false;
            
            // Override history.pushState to prevent navigation when flag is set
            const originalPushState = history.pushState;
            history.pushState = function() {
              // Check if we should prevent navigation
              if (window.__preventAdminNavigation && 
                  window.location.pathname.includes('/admin') &&
                  !arguments[2].includes('/admin')) {
                console.log('Navigation prevented by admin protection');
                return;
              }
              return originalPushState.apply(this, arguments);
            };
            
            // Override window.location setter to prevent navigation
            const originalLocationDescriptor = Object.getOwnPropertyDescriptor(window, 'location');
            if (originalLocationDescriptor && originalLocationDescriptor.configurable) {
              Object.defineProperty(window, 'location', {
                configurable: true,
                get: function() { 
                  return originalLocationDescriptor.get.call(this);
                },
                set: function(url) {
                  if (window.__preventAdminNavigation && 
                      window.location.pathname.includes('/admin') &&
                      typeof url === 'string' && !url.includes('/admin')) {
                    console.log('Location change prevented by admin protection');
                    return url;
                  }
                  return originalLocationDescriptor.set.call(this, url);
                }
              });
            }
          })();
        `}
      </Script>
    </>
  )
} 