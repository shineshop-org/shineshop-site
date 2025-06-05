'use client'

import { useEffect } from 'react'
import { useStore } from '@/app/lib/store'
import { initialProducts } from '@/app/lib/initial-data'

/**
 * Hook to ensure data consistency between initial static data and dynamic store
 * 
 * This helps ensure that products defined in initial-data.ts are always
 * correctly merged with any user-added products in the store.
 */
export function useSyncStoreData() {
  const { products, setProducts } = useStore()
  
  useEffect(() => {
    // Only run this once when component mounts
    if (typeof window !== 'undefined') {
      try {
        // First, check for any localStorage data
        const storedData = localStorage.getItem('shineshop-storage-v3')
        let localStorageProducts = []
        
        if (storedData) {
          const parsedData = JSON.parse(storedData)
          if (parsedData.products && Array.isArray(parsedData.products)) {
            localStorageProducts = parsedData.products
          }
        }
        
        // If we have products in localStorage, use those as the base
        // Otherwise use the current store products
        const currentProducts = localStorageProducts.length > 0 
          ? [...localStorageProducts] 
          : [...products]
        
        // CRITICAL: Only add missing initial products but never 
        // add back products that were deliberately removed in admin
        let needsUpdate = false
        
        // First, create a map of existing IDs for quick lookup
        const existingProductIds = new Set(currentProducts.map(p => p.id))
        
        // Only add products from initialProducts that don't already exist
        initialProducts.forEach(initialProduct => {
          // Skip "youtube-premium" product to prevent it from being re-added if removed
          if (initialProduct.id === 'youtube-premium') {
            return
          }
          
          // Only add completely new products from initialProducts
          if (!existingProductIds.has(initialProduct.id)) {
            currentProducts.push(initialProduct)
            needsUpdate = true
          }
        })
        
        // Update store if needed
        if (needsUpdate) {
          setProducts(currentProducts)
          
          // Update localStorage immediately to ensure consistency
          try {
            const currentState = JSON.parse(localStorage.getItem('shineshop-storage-v3') || '{}')
            localStorage.setItem('shineshop-storage-v3', JSON.stringify({
              ...currentState,
              products: currentProducts
            }))
            
            // Also update backup storage
            localStorage.setItem('shineshop-backup', JSON.stringify({
              ...currentState,
              products: currentProducts,
              timestamp: new Date().toISOString()
            }))
          } catch (error) {
            console.error('Error updating localStorage:', error)
          }
        }
      } catch (error) {
        console.error('Error syncing store data:', error)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Chỉ chạy một lần khi component mount, bỏ products và setProducts khỏi dependency
  
  return null
} 