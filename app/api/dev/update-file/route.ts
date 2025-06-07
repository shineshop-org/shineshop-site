import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Configure as force-static for compatibility with static exports
export const dynamic = 'force-static'

const STORE_DATA_PATH = path.join(process.cwd(), 'data', 'store-data.json')
const INITIAL_DATA_PATH = path.join(process.cwd(), 'app', 'lib', 'initial-data.ts')

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json().catch(() => ({}))
    const { forceUpdate = false, dataVersion = 2 } = body

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

    // If forceUpdate is true, ensure the dataVersion is updated
    if (forceUpdate) {
      storeData.dataVersion = dataVersion
      
      // Save updated store data back to file
      fs.writeFileSync(STORE_DATA_PATH, JSON.stringify(storeData, null, 2), 'utf-8')
    }

    // Check if initial-data.ts exists
    if (!fs.existsSync(INITIAL_DATA_PATH)) {
      return NextResponse.json(
        { error: 'Initial data file not found' },
        { status: 404 }
      )
    }

    // Generate the new content for initial-data.ts
    const initialDataContent = generateInitialDataContent(storeData, dataVersion)

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
function generateInitialDataContent(storeData: any, dataVersion: number = 2): string {
  const { 
    products = [], 
    faqArticles = [], 
    socialLinks = [], 
    tosContent = '',
    siteConfig = {},
    language = 'vi',
    theme = 'light',
    paymentInfo = {}
  } = storeData

  // Create a string representation of the data in TypeScript format
  let content = `import { Product, FAQArticle, SocialLink, SiteConfig, PaymentInfo } from './types'\n\n`

  // Generate products section
  content += `export const initialProducts: Product[] = ${formatTsArray(products)}\n\n`

  // Generate FAQ articles section
  content += `export const initialFAQArticles: FAQArticle[] = ${formatTsArray(faqArticles)}\n\n`

  // Generate social links section
  content += `export const initialSocialLinks: SocialLink[] = ${formatTsArray(socialLinks)}\n\n`

  // Generate TOS content section with proper escaping
  content += `export const initialTOSContent = \`${escapeBackticks(tosContent)}\`\n\n`

  // Generate site configuration section (contains gradient titles, small titles, etc.)
  content += `export const initialSiteConfig: SiteConfig = ${formatTsObject(siteConfig)}\n\n`

  // Generate payment info section
  content += `export const initialPaymentInfo: PaymentInfo = ${formatTsObject(paymentInfo)}\n\n`

  // Generate initial language and theme settings
  content += `export const initialLanguage = "${language}"\n\n`
  content += `export const initialTheme = "${theme}"\n\n`

  // Add dataVersion at the end
  content += `// Track data version for sync and migration\nexport const dataVersion = ${dataVersion}`

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

// Helper function to format an object as TypeScript code
function formatTsObject(obj: any): string {
  if (!obj || typeof obj !== 'object' || Object.keys(obj).length === 0) {
    return '{}'
  }

  // Pretty print the object with proper indentation
  return JSON.stringify(obj, null, 2)
    // Fix date format for any date fields
    .replace(/"createdAt":\s*"([^"]+)"/g, '"createdAt": new Date("$1")')
    .replace(/"updatedAt":\s*"([^"]+)"/g, '"updatedAt": new Date("$1")')
}

// Helper function to escape backticks in string templates
function escapeBackticks(str: string): string {
  return str ? str.replace(/`/g, '\\`') : ''
} 