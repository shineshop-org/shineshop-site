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
        // Get current products from store
        const currentProducts = [...products]
        
        // Check if any initialProducts are missing or have different options
        let needsUpdate = false
        initialProducts.forEach(initialProduct => {
          const storeProduct = currentProducts.find(p => p.id === initialProduct.id)
          
          // If product doesn't exist in store or has different options structure
          if (!storeProduct) {
            currentProducts.push(initialProduct)
            needsUpdate = true
          } else if (
            initialProduct.options && 
            JSON.stringify(initialProduct.options) !== JSON.stringify(storeProduct.options)
          ) {
            // Update the product with initial product options
            const productIndex = currentProducts.findIndex(p => p.id === initialProduct.id)
            if (productIndex !== -1) {
              currentProducts[productIndex] = {
                ...currentProducts[productIndex],
                options: initialProduct.options
              }
              needsUpdate = true
            }
          }
        })
        
        // Update store if needed
        if (needsUpdate) {
          setProducts(currentProducts)
        }
      } catch (error) {
        console.error('Error syncing store data:', error)
      }
    }
  }, [products, setProducts])
  
  return null
} 