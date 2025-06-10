import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Đường dẫn đến file
const STORE_DATA_PATH = path.join(process.cwd(), 'data', 'store-data.json')
const INITIAL_DATA_PATH = path.join(process.cwd(), 'app', 'lib', 'initial-data.ts')

// Hàm đọc dữ liệu từ store-data.json
function readStoreData() {
  if (!fs.existsSync(STORE_DATA_PATH)) {
    throw new Error('Store data file không tồn tại')
  }
  
  const fileContent = fs.readFileSync(STORE_DATA_PATH, 'utf-8')
  return JSON.parse(fileContent)
}

// Hàm cập nhật initial-data.ts
function updateInitialData(data: any) {
  // Đọc nội dung hiện tại của file
  const currentContent = fs.readFileSync(INITIAL_DATA_PATH, 'utf-8')
  
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
  const tosContent = JSON.stringify(data.tosContent || '')
  const socialLinks = JSON.stringify(data.socialLinks || [])
  const siteConfig = JSON.stringify(data.siteConfig || {})
  
  // Tạo nội dung chuẩn với dấu chấm phẩy
  const formattedTOSContent = `export const initialTOSContent = ${tosContent};`
  const formattedSocialLinks = `export const initialSocialLinks: SocialLink[] = ${socialLinks};`
  const formattedSiteConfig = `export const initialSiteConfig: SiteConfig = ${siteConfig};`
  
  // Cập nhật file với dữ liệu mới
  let updatedContent = currentContent
  
  // Cập nhật TOS Content
  const tosRegex = new RegExp('export const initialTOSContent = ([\\s\\S]*?)(;|\\n)')
  updatedContent = updatedContent.replace(tosRegex, formattedTOSContent + '\n')
  
  // Cập nhật Social Links
  const socialLinksRegex = new RegExp('export const initialSocialLinks: SocialLink\\[\\] = ([\\s\\S]*?)(;|\\n)')
  updatedContent = updatedContent.replace(socialLinksRegex, formattedSocialLinks + '\n')
  
  // Cập nhật Site Config
  const siteConfigRegex = new RegExp('export const initialSiteConfig: SiteConfig = ([\\s\\S]*?)(;|\\n)')
  updatedContent = updatedContent.replace(siteConfigRegex, formattedSiteConfig + '\n')
  
  // Đảm bảo không có dấu chấm phẩy kép
  updatedContent = updatedContent.replace(/;;/g, ';')
  
  // Ghi file đã cập nhật
  fs.writeFileSync(INITIAL_DATA_PATH, updatedContent)
  
  return {
    success: true,
    message: 'initial-data.ts đã được cập nhật thành công',
    backup: backupPath
  }
}

export async function POST() {
  try {
    // Chỉ chạy trong môi trường development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({
        error: 'API này chỉ khả dụng trong môi trường development'
      }, { status: 403 })
    }
    
    // Đọc dữ liệu từ store-data.json
    const storeData = readStoreData()
    
    // Cập nhật initial-data.ts
    const result = updateInitialData(storeData)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Lỗi khi cập nhật initial-data:', error)
    return NextResponse.json({
      error: 'Không thể cập nhật initial-data.ts',
      message: (error as Error).message
    }, { status: 500 })
  }
} 