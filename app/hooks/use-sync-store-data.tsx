'use client'

import { useEffect } from 'react'
import { useStore } from '@/app/lib/store'
import { Product } from '@/app/lib/types'

/**
 * Hook để đảm bảo tính nhất quán dữ liệu giữa localStorage và store
 * 
 * Khi initial-data.ts đã được đồng bộ với store-data.json, 
 * chúng ta chỉ cần đảm bảo store được tải đúng từ localStorage khi cần
 */
export function useSyncStoreData() {
  const { loadDataFromServer, setProducts, products } = useStore()
  
  useEffect(() => {
    // Chỉ chạy một lần khi component mount
    if (typeof window !== 'undefined') {
      try {
        // Check if we're recovering from a hot reload
        const lastSyncTime = (window as any).__lastSyncTime;
        const now = Date.now();
        
        if (lastSyncTime && (now - lastSyncTime < 3000)) {
          console.log('Hot reload detected, checking for backed up data');
          
          // Try to recover products from localStorage backup
          try {
            const backupData = localStorage.getItem('shineshop-products-backup');
            if (backupData) {
              const backupProducts = JSON.parse(backupData) as Product[];
              
              // Only update if we have backup products and they differ from current products
              if (backupProducts && backupProducts.length > 0) {
                console.log('Recovered', backupProducts.length, 'products from localStorage backup');
                setProducts(backupProducts);
              }
            }
            
            // Also check for last saved product data
            const lastSavedProduct = localStorage.getItem('last-saved-product');
            if (lastSavedProduct) {
              const savedProduct = JSON.parse(lastSavedProduct) as Product;
              console.log('Found last saved product:', savedProduct.name);
              
              // Update products with the saved product
              const existingProducts = [...products]; 
              const existingIndex = existingProducts.findIndex(p => p.id === savedProduct.id);
              
              if (existingIndex >= 0) {
                existingProducts[existingIndex] = savedProduct;
                setProducts(existingProducts);
                console.log('Updated existing product with saved data');
              }
              
              // Clear last saved product
              localStorage.removeItem('last-saved-product');
            }
          } catch (e) {
            console.error('Error recovering from backup:', e);
          }
          
          // Clear hot reload marker
          delete (window as any).__lastSyncTime;
        } else {
          // Normal load, just load data from server
          loadDataFromServer()
        }
      } catch (error) {
        console.error('Error syncing store data:', error)
        // Fallback to normal load
        loadDataFromServer()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Chỉ chạy một lần khi component mount
  
  return null
} 