'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SheetRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to Google Sheets
    window.location.href = "https://docs.google.com/spreadsheets/d/1ZYv6Q5JaDyc_geHP67g9F3PUNjpSbc31b3u4GR_o93o/edit?gid=1592107766#gid=1592107766"
  }, [])
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Redirecting to SHINE SHOP Bảng Giá...</p>
    </div>
  )
} 