'use client'

import { useEffect } from 'react'
import { setupGlobalErrorHandlers } from '@/app/lib/error-handlers'

/**
 * Provider component that sets up global error handling
 * to prevent unwanted page refreshes
 */
export default function ErrorProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Set up global error handlers when the component mounts
    setupGlobalErrorHandlers()
    
    // Disable React's own error overlay in development
    // This prevents the error overlay from appearing and causing refreshes
    if (process.env.NODE_ENV === 'development') {
      // @ts-ignore - Accessing window.__NEXT_DATA__ which exists but isn't typed
      if (window.__NEXT_DATA__) {
        // @ts-ignore - Hacky way to disable Next.js error overlay
        window.__NEXT_ERROR_OVERLAY = {
          setEditorHandler: () => {},
          dismissBuildError: () => {},
          reportBuildError: () => {},
          reportRuntimeError: () => {},
        }
      }
    }
  }, [])
  
  // Simply render the children as this component only adds behavior
  return <>{children}</>
} 