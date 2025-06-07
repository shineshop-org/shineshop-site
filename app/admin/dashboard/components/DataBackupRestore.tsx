'use client'

import { useState, useRef } from 'react'
import { Button } from '@/app/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/app/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '@/app/components/ui/alert'
import { useStore } from '@/app/lib/store'
import { Download, Upload, Save } from 'lucide-react'

export function DataBackupRestore() {
  const store = useStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Xuất dữ liệu ra file JSON
  const handleExportData = () => {
    try {
      // Lấy toàn bộ dữ liệu từ store
      const data = {
        language: store.language,
        theme: store.theme,
        products: store.products,
        faqArticles: store.faqArticles,
        socialLinks: store.socialLinks,
        paymentInfo: store.paymentInfo,
        siteConfig: store.siteConfig,
        tosContent: store.tosContent
      }

      // Tạo và tải xuống file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `shineshop-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      
      // Dọn dẹp
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 0)

      setMessage({ type: 'success', text: 'Xuất dữ liệu thành công!' })
    } catch (error) {
      console.error('Lỗi khi xuất dữ liệu:', error)
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi xuất dữ liệu!' })
    }
  }

  // Chọn file để nhập
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Nhập dữ liệu từ file JSON
  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string
          const data = JSON.parse(content)

          // Cập nhật store với dữ liệu từ file
          if (data.language) store.setLanguage(data.language)
          if (data.theme) store.setTheme(data.theme)
          if (data.products) store.setProducts(data.products)
          if (data.faqArticles) store.setFaqArticles(data.faqArticles)
          if (data.socialLinks) store.setSocialLinks(data.socialLinks)
          if (data.paymentInfo) store.setPaymentInfo(data.paymentInfo)
          if (data.siteConfig) store.setSiteConfig(data.siteConfig)
          if (data.tosContent) store.setTosContent(data.tosContent)

          // Lưu dữ liệu lên server
          await store.syncDataToServer()

          setMessage({ type: 'success', text: 'Nhập dữ liệu thành công!' })
        } catch (error) {
          console.error('Lỗi khi xử lý file:', error)
          setMessage({ type: 'error', text: 'File không hợp lệ! Vui lòng chọn file JSON đúng định dạng.' })
        }
      }
      reader.readAsText(file)
      
      // Reset input để có thể nhập cùng file lần nữa nếu cần
      e.target.value = ''
    } catch (error) {
      console.error('Lỗi khi nhập dữ liệu:', error)
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi nhập dữ liệu!' })
    }
  }

  // Lưu dữ liệu lên server
  const handleSaveToServer = async () => {
    try {
      await store.syncDataToServer()
      setMessage({ type: 'success', text: 'Lưu dữ liệu lên server thành công!' })
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu:', error)
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi lưu dữ liệu lên server!' })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sao lưu & Khôi phục Dữ liệu</CardTitle>
        <CardDescription>
          Xuất dữ liệu để sao lưu và nhập lại sau mỗi lần deploy để tránh mất dữ liệu
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {message && (
          <Alert className={message.type === 'success' ? 'bg-green-50' : 'bg-red-50'}>
            <AlertTitle>{message.type === 'success' ? 'Thành công' : 'Lỗi'}</AlertTitle>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}
        
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Bước 1: Xuất dữ liệu trước khi deploy</h3>
            <p className="text-sm text-muted-foreground">
              Tải xuống file JSON chứa toàn bộ dữ liệu hiện tại của trang web
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Bước 2: Deploy website</h3>
            <p className="text-sm text-muted-foreground">
              Sau khi deploy hoàn tất, nhập lại dữ liệu từ file đã xuất để khôi phục
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          onClick={handleExportData}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Download className="mr-2 h-4 w-4" /> Xuất dữ liệu
        </Button>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportData}
          accept=".json"
          className="hidden"
        />
        
        <div className="flex space-x-2">
          <Button 
            onClick={handleSaveToServer}
            className="bg-green-500 hover:bg-green-600"
          >
            <Save className="mr-2 h-4 w-4" /> Lưu lên server
          </Button>
          
          <Button 
            onClick={handleImportClick}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Upload className="mr-2 h-4 w-4" /> Nhập dữ liệu
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
} 