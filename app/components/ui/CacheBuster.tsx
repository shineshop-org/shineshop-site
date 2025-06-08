'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { RefreshCw } from 'lucide-react'

export function CacheBuster() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<null | { success: boolean; message: string; timestamp: number }>(null)

  const clearCache = async () => {
    try {
      setIsLoading(true)
      setResult(null)
      
      // Call the cache-purge API
      const response = await fetch('/api/cache-purge?' + new Date().getTime())
      const data = await response.json()
      
      setResult(data)
      
      // Force reload after successful cache purge
      if (data.success) {
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    } catch (error) {
      console.error('Failed to clear cache:', error)
      setResult({
        success: false,
        message: 'Failed to clear cache: ' + (error instanceof Error ? error.message : String(error)),
        timestamp: Date.now()
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-4 border border-gray-200 rounded-md">
      <h3 className="text-lg font-medium">Quản lý cache</h3>
      <p className="text-sm text-gray-500">
        Nếu bạn không thấy nội dung mới nhất, hãy thử làm mới cache
      </p>
      
      <Button 
        variant="outline" 
        onClick={clearCache} 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Đang làm mới...
          </>
        ) : (
          'Làm mới cache'
        )}
      </Button>
      
      {result && (
        <div className={`text-sm ${result.success ? 'text-green-500' : 'text-red-500'} mt-2`}>
          {result.message}
          {result.success && ' - Đang tải lại trang...'}
        </div>
      )}
    </div>
  )
} 