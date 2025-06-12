'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ReturnToDashboard() {
  const router = useRouter()
  
  useEffect(() => {
    // Show message
    console.log('Detected unwanted navigation - returning to dashboard')
    
    // Redirect back to admin dashboard after a short delay
    const timer = setTimeout(() => {
      router.push('/admin/dashboard')
    }, 500)
    
    return () => clearTimeout(timer)
  }, [router])
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-yellow-800 dark:text-yellow-200 mb-4">
          Redirecting...
        </h1>
        <p className="text-yellow-700 dark:text-yellow-300 mb-6">
          You were redirected away from the admin dashboard. 
          Returning you to the dashboard now...
        </p>
        <div className="w-full h-2 bg-yellow-200 dark:bg-yellow-800 rounded-full overflow-hidden">
          <div className="h-full bg-yellow-500 animate-pulse" style={{ width: '100%' }}></div>
        </div>
      </div>
    </div>
  )
} 