import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Đường dẫn đến file
const STORE_DATA_PATH = path.join(process.cwd(), 'data', 'store-data.json')
const INITIAL_DATA_PATH = path.join(process.cwd(), 'app', 'lib', 'initial-data.ts')

// Hàm đọc dữ liệu từ store-data.json
function readStoreData() {
  try {
    if (!fs.existsSync(STORE_DATA_PATH)) {
      throw new Error('Store data file không tồn tại')
    }
    
    const fileContent = fs.readFileSync(STORE_DATA_PATH, 'utf-8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.error('Error reading store data:', error)
    throw new Error(`Không thể đọc dữ liệu từ store-data.json: ${(error as Error).message}`)
  }
}

// Hàm cập nhật initial-data.ts
function updateInitialData(data: any) {
  try {
    // Tạo backup trước khi sửa đổi
    const backupDir = path.join(process.cwd(), 'data', 'backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }
    
    // Tạo backup với timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = path.join(backupDir, `initial-data-${timestamp}.ts`)
    
    // Thay thế toàn bộ file initial-data.ts với phiên bản mới đọc dữ liệu từ store-data.json
    const newContent = `import { Product, FAQArticle, SocialLink, SiteConfig, PaymentInfo } from './types'
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
export const dataVersion = storeData.dataVersion || 1`

    // Backup file hiện tại trước khi ghi đè
    try {
      const currentContent = fs.readFileSync(INITIAL_DATA_PATH, 'utf-8')
      fs.writeFileSync(backupPath, currentContent)
    } catch (readError) {
      console.error('Lỗi khi đọc/backup file initial-data.ts:', readError)
    }

    // Ghi file mới
    try {
      fs.writeFileSync(INITIAL_DATA_PATH, newContent, 'utf-8')
      console.log('Đã cập nhật initial-data.ts thành công')
    } catch (writeError) {
      console.error('Lỗi khi ghi file initial-data.ts:', writeError)
      throw new Error(`Không thể ghi file initial-data.ts: ${(writeError as Error).message}`)
    }
    
    return {
      success: true,
      message: 'initial-data.ts đã được cập nhật thành công',
      backup: backupPath
    }
  } catch (error) {
    console.error('Error updating initial data:', error)
    throw new Error(`Không thể cập nhật initial-data.ts: ${(error as Error).message}`)
  }
}

export async function POST(req: NextRequest) {
  try {
    // Chỉ chạy trong môi trường development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({
        error: 'API này chỉ khả dụng trong môi trường development'
      }, { status: 403 })
    }
    
    // Đọc dữ liệu từ store-data.json
    let storeData;
    try {
      storeData = readStoreData();
    } catch (readError) {
      console.error('Lỗi khi đọc dữ liệu từ store-data.json:', readError);
      return NextResponse.json({
        error: 'Không thể đọc dữ liệu từ store-data.json',
        message: (readError as Error).message
      }, { status: 500 });
    }
    
    // Kiểm tra xem dữ liệu có tồn tại không trước khi cập nhật
    if (!storeData) {
      return NextResponse.json({
        error: 'Dữ liệu trong store-data.json trống hoặc không hợp lệ'
      }, { status: 400 });
    }
    
    // Cập nhật initial-data.ts
    let result;
    try {
      result = updateInitialData(storeData);
    } catch (updateError) {
      console.error('Lỗi khi cập nhật initial-data.ts:', updateError);
      return NextResponse.json({
        error: 'Không thể cập nhật initial-data.ts',
        message: (updateError as Error).message
      }, { status: 500 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Lỗi khi cập nhật initial-data:', error)
    
    // Trả về lỗi chi tiết để giúp debug
    return NextResponse.json({
      error: 'Không thể cập nhật initial-data.ts',
      message: (error as Error).message,
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    }, { status: 500 })
  }
} 