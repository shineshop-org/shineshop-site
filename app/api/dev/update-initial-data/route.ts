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
    // Thay thế toàn bộ file initial-data.ts với phiên bản mới dùng import trực tiếp
    const newContent = `import { Product, FAQArticle, SocialLink, SiteConfig, PaymentInfo } from './types'

// Định nghĩa giá trị mặc định cho dữ liệu
const defaultStoreData = {
  products: [],
  faqArticles: [],
  socialLinks: [],
  paymentInfo: {
    bankName: "Techcombank - Ngân hàng TMCP Kỹ thương Việt Nam",
    accountNumber: "MS00T09331707449347",
    accountName: "SHINE SHOP",
    qrTemplate: "compact",
    wiseEmail: "payment@shineshop.org",
    paypalEmail: "paypal@shineshop.org"
  },
  siteConfig: {
    siteTitle: "SHINE SHOP",
    heroTitle: "Welcome to SHINE SHOP!",
    heroQuote: "Anh em mình cứ thế thôi hẹ hẹ hẹ",
    contactLinks: {
      facebook: "https://facebook.com/shineshop",
      whatsapp: "https://wa.me/84123456789"
    }
  },
  tosContent: "",
  language: 'vi',
  theme: 'light',
  dataVersion: 1
}

// Cố gắng import JSON trực tiếp - điều này hoạt động tại build-time
let storeData;
try {
  // Import động - chỉ hoạt động nếu file tồn tại và chỉ ở build time
  // @ts-ignore - Bỏ qua lỗi TypeScript về import động
  storeData = require('../../data/store-data.json');
} catch (error) {
  // Fallback nếu không thể import
  console.info('Không thể import store-data.json, sử dụng dữ liệu mặc định');
  storeData = defaultStoreData;
}

// Export các giá trị
export const initialProducts: Product[] = storeData.products || defaultStoreData.products;
export const initialFAQArticles: FAQArticle[] = storeData.faqArticles || defaultStoreData.faqArticles;
export const initialSocialLinks: SocialLink[] = storeData.socialLinks || defaultStoreData.socialLinks;
export const initialPaymentInfo: PaymentInfo = storeData.paymentInfo || defaultStoreData.paymentInfo;
export const initialSiteConfig: SiteConfig = storeData.siteConfig || defaultStoreData.siteConfig;
export const initialTOSContent: string = storeData.tosContent || defaultStoreData.tosContent;
export const initialLanguage = storeData.language || defaultStoreData.language;
export const initialTheme = storeData.theme || defaultStoreData.theme;
export const dataVersion = storeData.dataVersion || defaultStoreData.dataVersion;`

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
      message: 'initial-data.ts đã được cập nhật thành công'
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