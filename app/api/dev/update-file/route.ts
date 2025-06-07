import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { filePath, content } = await request.json()
    
    if (!filePath || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request format. Expected filePath and content.' },
        { status: 400 }
      )
    }

    // Ensure the path is within the project directory for security
    const absolutePath = path.join(process.cwd(), filePath)
    const normalizedCwd = path.normalize(process.cwd())
    
    if (!absolutePath.startsWith(normalizedCwd)) {
      return NextResponse.json(
        { error: 'Access denied. Cannot write to locations outside the project directory.' },
        { status: 403 }
      )
    }
    
    // Ensure the directory exists
    const directory = path.dirname(absolutePath)
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true })
    }
    
    // Write the file
    fs.writeFileSync(absolutePath, content, 'utf-8')
    
    return NextResponse.json({ success: true, message: 'File updated successfully' })
  } catch (error) {
    console.error('Error updating file:', error)
    return NextResponse.json(
      { error: 'Failed to update file', details: (error as Error).message },
      { status: 500 }
    )
  }
} 