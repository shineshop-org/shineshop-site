import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Configure as force-static for compatibility with static exports
export const dynamic = 'force-static'

const STORE_DATA_PATH = path.join(process.cwd(), 'data', 'store-data.json')
const INITIAL_DATA_PATH = path.join(process.cwd(), 'app', 'lib', 'initial-data.ts')

export async function POST(request: NextRequest) {
  try {
    // Read store-data.json
    if (!fs.existsSync(STORE_DATA_PATH)) {
      return NextResponse.json(
        { error: 'Store data file not found' },
        { status: 404 }
      )
    }

    // Read the current store data
    const storeDataRaw = fs.readFileSync(STORE_DATA_PATH, 'utf-8')
    const storeData = JSON.parse(storeDataRaw)

    // Check if initial-data.ts exists
    if (!fs.existsSync(INITIAL_DATA_PATH)) {
      return NextResponse.json(
        { error: 'Initial data file not found' },
        { status: 404 }
      )
    }

    // Generate the new content for initial-data.ts
    const initialDataContent = generateInitialDataContent(storeData)

    // Write the updated content to initial-data.ts
    fs.writeFileSync(INITIAL_DATA_PATH, initialDataContent, 'utf-8')

    return NextResponse.json({ 
      success: true, 
      message: 'Static data file updated successfully'
    })
  } catch (error) {
    console.error('Error updating static data file:', error)
    return NextResponse.json(
      { error: 'Failed to update static data file', details: (error as Error).message },
      { status: 500 }
    )
  }
}

// Function to generate the content for initial-data.ts
function generateInitialDataContent(storeData: any): string {
  const { products, faqArticles, socialLinks, tosContent } = storeData

  // Create a string representation of the data in TypeScript format
  let content = `import { Product, FAQArticle, SocialLink } from './types'\n\n`

  // Generate products section
  content += `export const initialProducts: Product[] = ${formatTsArray(products)}\n\n`

  // Generate FAQ articles section
  content += `export const initialFAQArticles: FAQArticle[] = ${formatTsArray(faqArticles)}\n\n`

  // Generate social links section
  content += `export const initialSocialLinks: SocialLink[] = ${formatTsArray(socialLinks)}\n\n`

  // Generate TOS content section
  if (tosContent) {
    content += `export const initialTOSContent = \`${escapeBackticks(tosContent)}\``
  }

  return content
}

// Helper function to format an array as TypeScript code
function formatTsArray(array: any[]): string {
  if (!Array.isArray(array) || array.length === 0) {
    return '[]'
  }

  // Pretty print the array with proper indentation
  return JSON.stringify(array, null, 2)
    // Fix date format for createdAt and updatedAt
    .replace(/"createdAt":\s*"([^"]+)"/g, '"createdAt": new Date("$1")')
    .replace(/"updatedAt":\s*"([^"]+)"/g, '"updatedAt": new Date("$1")')
}

// Helper function to escape backticks in string templates
function escapeBackticks(str: string): string {
  return str ? str.replace(/`/g, '\\`') : ''
} 