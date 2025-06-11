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
    // Đọc nội dung hiện tại của file
    let currentContent: string;
    try {
      currentContent = fs.readFileSync(INITIAL_DATA_PATH, 'utf-8')
    } catch (readError) {
      console.error('Lỗi khi đọc file initial-data.ts:', readError);
      throw new Error(`Không thể đọc file initial-data.ts: ${(readError as Error).message}`);
    }
    
    // Tạo backup trước khi sửa đổi
    const backupDir = path.join(process.cwd(), 'data', 'backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }
    
    // Tạo backup với timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = path.join(backupDir, `initial-data-${timestamp}.ts`)
    fs.writeFileSync(backupPath, currentContent)

    // Chuẩn bị các phần dữ liệu cần cập nhật
    const socialLinks = JSON.stringify(data.socialLinks || [])
    const siteConfig = JSON.stringify(data.siteConfig || {})
    
    // Tạo nội dung chuẩn với dấu chấm phẩy
    const formattedSocialLinks = `export const initialSocialLinks: SocialLink[] = ${socialLinks};`
    const formattedSiteConfig = `export const initialSiteConfig: SiteConfig = ${siteConfig};`
    
    // Cập nhật file với dữ liệu mới
    let updatedContent = currentContent
    
    // Cập nhật Social Links
    const socialLinksRegex = /export const initialSocialLinks: SocialLink\[\] = ([\s\S]*?);/
    if (socialLinksRegex.test(updatedContent)) {
      updatedContent = updatedContent.replace(socialLinksRegex, formattedSocialLinks)
    } else {
      console.warn('Không thể tìm thấy mẫu Social Links trong file, thêm vào cuối file')
      updatedContent += '\n' + formattedSocialLinks + '\n'
    }
    
    // Cập nhật Site Config
    const siteConfigRegex = /export const initialSiteConfig: SiteConfig = ([\s\S]*?);/
    if (siteConfigRegex.test(updatedContent)) {
      updatedContent = updatedContent.replace(siteConfigRegex, formattedSiteConfig)
    } else {
      console.warn('Không thể tìm thấy mẫu Site Config trong file, thêm vào cuối file')
      updatedContent += '\n' + formattedSiteConfig + '\n'
    }
    
    // Đảm bảo không có dấu chấm phẩy kép
    updatedContent = updatedContent.replace(/;;/g, ';')
    
    // Ghi file đã cập nhật ngay cả khi không có thay đổi
    try {
      fs.writeFileSync(INITIAL_DATA_PATH, updatedContent, 'utf-8')
      console.log('Đã cập nhật initial-data.ts thành công')
    } catch (writeError) {
      console.error('Lỗi khi ghi file initial-data.ts:', writeError);
      throw new Error(`Không thể ghi file initial-data.ts: ${(writeError as Error).message}`);
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