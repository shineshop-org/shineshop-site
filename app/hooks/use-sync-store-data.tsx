'use client'

import { useEffect } from 'react'
import { useStore } from '@/app/lib/store'

/**
 * Hook để đảm bảo tính nhất quán dữ liệu giữa localStorage và store
 * 
 * Khi initial-data.ts đã được đồng bộ với store-data.json, 
 * chúng ta chỉ cần đảm bảo store được tải đúng từ localStorage khi cần
 */
export function useSyncStoreData() {
  const { loadDataFromServer } = useStore()
  
  useEffect(() => {
    // Chỉ chạy một lần khi component mount
    if (typeof window !== 'undefined') {
      try {
        // Gọi loadDataFromServer để đảm bảo dữ liệu được đồng bộ
        // từ store-data.json hoặc localStorage
        loadDataFromServer()
      } catch (error) {
        console.error('Error syncing store data:', error)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Chỉ chạy một lần khi component mount
  
  return null
} 