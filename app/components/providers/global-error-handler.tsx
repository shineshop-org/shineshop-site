'use client'

import { useEffect } from 'react'

export default function GlobalErrorHandler() {
  useEffect(() => {
    const originalConsoleError = console.error
    
    // Improved error handling for AbortController errors
    console.error = (...args) => {
      // Check if this is an AbortError which is usually just a timeout
      const errorString = args.join(' ')
      if (errorString.includes('AbortError') || errorString.includes('aborted')) {
        console.warn('Request was aborted (likely timeout):', ...args)
        return // Suppress full error for abort errors
      }
      
      // Check if this is a React error that might cause a refresh
      if (
        errorString.includes('React will try to recreate this component tree') ||
        errorString.includes('Consider adding an error boundary') ||
        errorString.includes('uncaught error')
      ) {
        // Log but prevent potential refresh-causing errors
        originalConsoleError('Prevented potential refresh-causing error:', ...args)
      } else {
        // Regular error handling
        originalConsoleError(...args)
      }
    }
    
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Check if this is an aborted fetch
      if (
        event.reason?.name === 'AbortError' || 
        String(event.reason).includes('aborted')
      ) {
        console.warn('Unhandled AbortError (safely handled):', event.reason)
      } else {
        console.error('Unhandled Promise Rejection:', event.reason)
      }
      
      // Prevent default behavior which might refresh the page
      event.preventDefault()
    }
    
    // Handle runtime errors
    const handleRuntimeError = (event: ErrorEvent) => {
      if (
        event.error?.name === 'AbortError' || 
        String(event.error).includes('aborted')
      ) {
        console.warn('Runtime AbortError (safely handled):', event.error)
      } else {
        console.error('Runtime Error:', event.error)
      }
      
      // Prevent default behavior which might refresh the page
      event.preventDefault()
      return true // Prevents the browser from displaying its own error message
    }
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleRuntimeError)
    
    return () => {
      // Restore original console.error and remove event listeners on cleanup
      console.error = originalConsoleError
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleRuntimeError)
    }
  }, [])
  
  // This component doesn't render anything
  return null
} 