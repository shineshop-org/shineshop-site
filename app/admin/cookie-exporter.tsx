'use client'

import React, { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '@/app/components/ui/alert'
import { Download, Copy, Check, Info } from 'lucide-react'
import { ADMIN_ACCESS_COOKIE, generateCookieFile, setAccessCookie } from '@/app/lib/auth'

export function CookieExporter() {
  const [copied, setCopied] = useState(false)
  const [cookieApplied, setCookieApplied] = useState(false)
  
  const handleDownloadCookie = () => {
    const cookieContent = generateCookieFile()
    const blob = new Blob([cookieContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = 'shineshop-admin-cookie.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  const handleCopyCookie = () => {
    navigator.clipboard.writeText(ADMIN_ACCESS_COOKIE.value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const handleApplyCookie = () => {
    setAccessCookie()
    setCookieApplied(true)
    setTimeout(() => setCookieApplied(false), 2000)
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-500" />
          Cookie Admin Đặc Biệt
        </CardTitle>
        <CardDescription>
          Tạo và quản lý cookie đặc biệt để truy cập trang admin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertTitle className="text-yellow-800">Cookie Bắt Buộc</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Cookie đặc biệt này là bắt buộc để truy cập trang admin. Nếu không có cookie này, 
            trang admin sẽ hiển thị lỗi 404. Tải xuống tệp cookie và nhập vào trình duyệt của bạn 
            hoặc sử dụng nút {'Áp dụng cookie'} để thiết lập cookie cho trình duyệt hiện tại.
          </AlertDescription>
        </Alert>
        
        <div className="p-3 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium mb-2">Cookie hiện tại:</h3>
          <div className="bg-gray-100 p-2 rounded overflow-auto text-xs font-mono mb-3 break-all">
            {ADMIN_ACCESS_COOKIE.value}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleDownloadCookie} 
              className="flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              Tải tệp cookie
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleCopyCookie}
              className="flex items-center justify-center gap-2"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Đã sao chép' : 'Sao chép giá trị'}
            </Button>
            
            <Button 
              variant="secondary" 
              onClick={handleApplyCookie}
              className="flex items-center justify-center gap-2"
            >
              {cookieApplied ? <Check className="h-4 w-4" /> : null}
              {cookieApplied ? 'Đã áp dụng' : 'Áp dụng cookie'}
            </Button>
          </div>
        </div>
        
        <div className="text-sm space-y-2 border-t pt-3">
          <h3 className="font-medium">Hướng dẫn import cookie vào trình duyệt:</h3>
          <ol className="list-decimal pl-5 space-y-1 text-gray-700">
            <li>Tải xuống tệp cookie bằng cách nhấn {'Tải tệp cookie'}</li>
            <li>Trong Chrome, mở DevTools (F12) &gt; Application &gt; Cookies</li>
            <li>Trong Firefox, sử dụng tiện ích {'Cookie Quick Manager'}</li>
            <li>Trong Edge, mở DevTools &gt; Application &gt; Cookies</li>
            <li>Import tệp cookie vào trình duyệt</li>
            <li>Làm mới trang để áp dụng cookie mới</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
} 