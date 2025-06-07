'use client'

import { useEffect } from 'react'
import { useStore } from '@/app/lib/store'
import { dataVersion } from '@/app/lib/initial-data'

/**
 * Hook để kiểm tra phiên bản của dữ liệu trong ứng dụng
 * 
 * Nếu phiên bản dữ liệu hiện tại trong store không khớp với phiên bản mới nhất từ initial-data.ts,
 * thì hook sẽ tự động làm mới dữ liệu bằng cách tải lại trang.
 */
export function useVersionCheck() {
  const storeVersion = useStore(state => state.dataVersion)
  
  useEffect(() => {
    // Nếu dữ liệu phiên bản cũ, hoặc không có phiên bản
    if (!storeVersion || storeVersion !== dataVersion) {
      console.log('Phát hiện phiên bản mới của ứng dụng, đang làm mới dữ liệu...')
      
      // Xóa localStorage để đảm bảo dữ liệu mới được tải
      localStorage.removeItem('shineshop-storage-v3')
      
      // Chờ một chút để đảm bảo localStorage đã được xóa
      setTimeout(() => {
        // Làm mới trang để tải dữ liệu mới
        window.location.reload()
      }, 100)
    }
  }, [storeVersion])
  
  return null
} 