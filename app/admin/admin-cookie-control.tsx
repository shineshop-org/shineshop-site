'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/app/components/ui/alert'
import { Badge } from '@/app/components/ui/badge'
import { Download, RefreshCw, Shield, XCircle, AlertTriangle } from 'lucide-react'
import { ADMIN_ACCESS_COOKIE, setAccessCookie, generateCookieFile } from '@/app/lib/auth'

export function AdminCookieControl() {
  const [hasAccessCookie, setHasAccessCookie] = useState(false)
  const [cookieValue, setCookieValue] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  // Kiểm tra cookie khi component được tải
  useEffect(() => {
    checkCookie()
  }, [])

  // Hàm kiểm tra cookie
  const checkCookie = () => {
    setIsChecking(true)
    setTimeout(() => {
      const cookies = document.cookie.split(';')
      let accessCookieValue = null
      
      const hasAccess = cookies.some(cookie => {
        const [name, value] = cookie.trim().split('=')
        if (name === ADMIN_ACCESS_COOKIE.name) {
          accessCookieValue = value
          return true
        }
        return false
      })
      
      setHasAccessCookie(hasAccess)
      setCookieValue(accessCookieValue)
      setIsChecking(false)
    }, 500) // Delay giả lập để tạo hiệu ứng đang kiểm tra
  }

  // Hàm thiết lập cookie
  const handleSetCookie = () => {
    setAccessCookie()
    checkCookie()
  }

  // Hàm xóa cookie
  const handleRemoveCookie = () => {
    if (confirm('Bạn có chắc chắn muốn xóa cookie đặc biệt? Sau khi xóa, bạn sẽ không thể truy cập trang admin cho đến khi thiết lập lại cookie bằng script hoặc thủ công.')) {
      document.cookie = `${ADMIN_ACCESS_COOKIE.name}=; path=/; max-age=0`
      checkCookie()
      alert('Đã xóa cookie. Lưu ý rằng nếu bạn rời khỏi trang này, bạn sẽ không thể truy cập lại cho đến khi thiết lập lại cookie đặc biệt.')
    }
  }

  // Hàm tải xuống file cookie
  const handleDownloadCookieFile = () => {
    const cookieFileContent = generateCookieFile()
    const blob = new Blob([cookieFileContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = 'shineshop_admin_cookies.txt'
    document.body.appendChild(a)
    a.click()
    
    // Dọn dẹp
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Quản lý Cookie Đặc biệt
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={checkCookie}
            disabled={isChecking}
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription>
          Cookie đặc biệt là bắt buộc để truy cập trang Admin
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isChecking ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Trạng thái:</span>
                {hasAccessCookie ? (
                  <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200">
                    Đã kích hoạt
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">
                    Chưa kích hoạt
                  </Badge>
                )}
              </div>
            </div>
            
            {hasAccessCookie ? (
              <Alert className="bg-green-50 border-green-100">
                <AlertTitle className="text-green-800">Cookie đặc biệt đã được thiết lập</AlertTitle>
                <AlertDescription className="text-green-700">
                  Bạn có thể truy cập trang admin bình thường. Cookie này sẽ hết hạn sau 30 ngày.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-yellow-50 border-yellow-100">
                <AlertTitle className="text-yellow-800">Cookie đặc biệt chưa được thiết lập</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  Nếu bạn không thiết lập cookie này, trang admin sẽ không hiển thị khi truy cập từ bên ngoài.
                </AlertDescription>
              </Alert>
            )}
            
            <Alert className="mt-4 bg-red-50 border-red-100">
              <AlertTriangle className="h-4 w-4 text-red-700" />
              <AlertTitle className="text-red-800">Lưu ý quan trọng</AlertTitle>
              <AlertDescription className="text-red-700">
                Trang admin sẽ trả về lỗi 404 khi không có cookie đặc biệt. Nếu bạn xóa cookie này, bạn sẽ không thể truy cập trang admin cho đến khi thiết lập lại cookie thông qua script hoặc thủ công.
              </AlertDescription>
            </Alert>
            
            <div className="mt-4 space-y-2">
              <div className="text-xs text-muted-foreground">
                <span className="font-semibold">Cookie name:</span> {ADMIN_ACCESS_COOKIE.name}
              </div>
              {cookieValue && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold">Giá trị:</span> 
                  <span className="ml-1 font-mono bg-muted px-1 py-0.5 rounded text-[10px] overflow-hidden whitespace-nowrap text-ellipsis inline-block max-w-[220px]">
                    {cookieValue}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button 
            onClick={handleSetCookie}
            disabled={isChecking}
            className="w-full"
          >
            {hasAccessCookie ? 'Cập nhật Cookie' : 'Thiết lập Cookie'}
          </Button>
          
          <Button 
            variant="destructive"
            onClick={handleRemoveCookie}
            disabled={isChecking || !hasAccessCookie}
            className="w-full"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Xóa Cookie
          </Button>
        </div>
        
        <Button
          variant="outline"
          onClick={handleDownloadCookieFile}
          disabled={isChecking}
          className="w-full mt-2"
        >
          <Download className="h-4 w-4 mr-2" />
          Xuất file Cookie
        </Button>
      </CardFooter>
    </Card>
  )
} 