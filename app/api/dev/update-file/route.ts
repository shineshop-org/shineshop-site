import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Configure as force-static for compatibility with static exports
export const dynamic = 'force-static'

const STORE_DATA_PATH = path.join(process.cwd(), 'data', 'store-data.json')
const INITIAL_DATA_PATH = path.join(process.cwd(), 'app', 'lib', 'initial-data.ts')
const BACKUP_DIR = path.join(process.cwd(), 'data', 'backups')

// Ensure backup directory exists
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true })
  }
}

// Safe JSON parse with error handling
function safeJsonParse(text: string) {
  try {
    return JSON.parse(text)
  } catch (error) {
    console.error('Error parsing JSON:', error)
    throw new Error('Failed to parse JSON data')
  }
}

// Create backup of current data
function createBackup(filePath: string, prefix: string = 'backup') {
  try {
    ensureBackupDir()
    
    const filename = path.basename(filePath)
    const timestamp = Date.now()
    const backupPath = path.join(BACKUP_DIR, `${prefix}-${filename}-${timestamp}`)
    
    fs.copyFileSync(filePath, backupPath)
    console.log(`Backup created: ${backupPath}`)
    
    return backupPath
  } catch (error) {
    console.warn('Failed to create backup:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get request body with safe fallback
    let body;
    
    try {
      body = await request.json();
    } catch (error) {
      console.warn('Failed to parse request body as JSON, using default values:', error);
      body = {};
    }
    
    const { forceUpdate = false, dataVersion = 2 } = body

    // Check if store-data.json exists
    if (!fs.existsSync(STORE_DATA_PATH)) {
      return NextResponse.json(
        { error: 'Store data file not found' },
        { status: 404 }
      )
    }

    // Create backup of store data file before modifying
    createBackup(STORE_DATA_PATH, 'store-data')
    
    // Read the current store data with error handling
    let storeDataRaw, storeData;
    try {
      storeDataRaw = fs.readFileSync(STORE_DATA_PATH, 'utf-8')
      storeData = safeJsonParse(storeDataRaw)
    } catch (error) {
      console.error('Error reading or parsing store data:', error)
      return NextResponse.json(
        { error: 'Failed to read or parse store data file', details: (error as Error).message },
        { status: 500 }
      )
    }

    // If forceUpdate is true, ensure the dataVersion is updated
    if (forceUpdate) {
      storeData.dataVersion = dataVersion
      
      try {
        // Sanitize product descriptions before saving to avoid issues with quotes
        if (storeData.products && Array.isArray(storeData.products)) {
          storeData.products = storeData.products.map((product: any) => {
            // Sanitize option descriptions
            if (product.options && Array.isArray(product.options)) {
              product.options = product.options.map((option: any) => {
                if (option.values && Array.isArray(option.values)) {
                  option.values = option.values.map((value: any) => {
                    // Handle any problematic characters in descriptions
                    if (value.description) {
                      // Replace problematic quotes with safe ones
                      value.description = value.description.replace(/\\"/g, "'").replace(/"/g, "'");
                    }
                    return value;
                  });
                }
                return option;
              });
            }
            return product;
          });
        }
        
        // Save updated store data back to file
        fs.writeFileSync(STORE_DATA_PATH, JSON.stringify(storeData, null, 2), 'utf-8')
      } catch (error) {
        console.error('Error saving updated store data:', error)
        return NextResponse.json(
          { error: 'Failed to save updated store data', details: (error as Error).message },
          { status: 500 }
        )
      }
    }

    // Check if initial-data.ts exists
    if (!fs.existsSync(INITIAL_DATA_PATH)) {
      return NextResponse.json(
        { error: 'Initial data file not found' },
        { status: 404 }
      )
    }

    // Create backup of initial data file before modifying
    createBackup(INITIAL_DATA_PATH, 'initial-data')
    
    try {
      // Generate the new content for initial-data.ts
      const initialDataContent = generateInitialDataContent(storeData, dataVersion)

      // Write the updated content to initial-data.ts
      fs.writeFileSync(INITIAL_DATA_PATH, initialDataContent, 'utf-8')
    } catch (error) {
      console.error('Error generating or writing initial data:', error)
      return NextResponse.json(
        { error: 'Failed to generate or write initial data file', details: (error as Error).message },
        { status: 500 }
      )
    }

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