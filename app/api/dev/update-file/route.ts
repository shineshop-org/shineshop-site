import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Đường dẫn gốc của dự án
const PROJECT_ROOT = process.cwd()

// Các file được phép cập nhật
const ALLOWED_FILES = [
  'app/lib/initial-data.ts'
]

// Kiểm tra môi trường
const isDevelopment = process.env.NODE_ENV === 'development'

export async function POST(request: NextRequest) {
  // Không cho phép sửa file khi không phải môi trường development
  if (!isDevelopment) {
    return NextResponse.json(
      { error: 'This API is only available in development mode' },
      { status: 403 }
    )
  }

  try {
    const data = await request.json()
    const { filePath, content } = data

    // Kiểm tra xem đường dẫn file có hợp lệ
    if (!ALLOWED_FILES.includes(filePath)) {
      return NextResponse.json(
        { error: 'File path not allowed' },
        { status: 403 }
      )
    }

    // Tạo đường dẫn đầy đủ đến file
    const fullPath = path.join(PROJECT_ROOT, filePath)

    // Ghi nội dung vào file
    fs.writeFileSync(fullPath, content, 'utf8')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating file:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update file' },
      { status: 500 }
    )
  }
} 