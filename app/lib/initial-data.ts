import { Product, FAQArticle, SocialLink, SiteConfig, PaymentInfo } from './types'
import fs from 'fs'
import path from 'path'

// Đường dẫn đến file data
const STORE_DATA_PATH = path.join(process.cwd(), 'data', 'store-data.json')

// Đọc dữ liệu từ store-data.json
function getStoreData() {
  try {
    if (fs.existsSync(STORE_DATA_PATH)) {
      const fileContent = fs.readFileSync(STORE_DATA_PATH, 'utf-8')
      return JSON.parse(fileContent)
    }
  } catch (error) {
    console.error('Error reading store data:', error)
  }
  
  // Fallback to empty values if file doesn't exist or can't be read
  return {
    products: [],
    faqArticles: [],
    socialLinks: [],
    paymentInfo: {},
    siteConfig: {},
    language: 'vi',
    theme: 'light',
    dataVersion: 1
  }
}

// Đọc dữ liệu từ file
const storeData = getStoreData()

// Export các giá trị từ store-data.json
export const initialProducts: Product[] = storeData.products || []
export const initialFAQArticles: FAQArticle[] = storeData.faqArticles || []
export const initialSocialLinks: SocialLink[] = storeData.socialLinks || []
export const initialPaymentInfo: PaymentInfo = storeData.paymentInfo || {}
export const initialSiteConfig: SiteConfig = storeData.siteConfig || {}
export const initialTOSContent: string = storeData.tosContent || ''
export const initialLanguage = storeData.language || 'vi'
export const initialTheme = storeData.theme || 'light'
export const dataVersion = storeData.dataVersion || 1