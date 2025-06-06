import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'store-data.json')
const KV_KEY = 'store-data'
const KV_BACKUP_PREFIX = 'store-backup-'

// Check if running in Cloudflare environment
const isCloudflare = process.env.CF_PAGES === '1' || process.env.NODE_ENV === 'production'

// Ensure data directory exists (for development)
async function ensureDataDirectory() {
	if (!isCloudflare) {
		const dataDir = path.join(process.cwd(), 'data')
		try {
			await fs.access(dataDir)
		} catch {
			await fs.mkdir(dataDir, { recursive: true })
		}
	}
}

// GET: Read store data
export async function GET(request: NextRequest) {
	try {
		let data = null
		
		if (isCloudflare && process.env.STORE_KV) {
			// Use Cloudflare KV in production
			const kv = process.env.STORE_KV as any
			const storedData = await kv.get(KV_KEY)
			if (storedData) {
				data = JSON.parse(storedData)
			}
		} else {
			// Use file system in development
			await ensureDataDirectory()
			try {
				const fileData = await fs.readFile(DATA_FILE_PATH, 'utf-8')
				data = JSON.parse(fileData)
			} catch (error) {
				// File doesn't exist
			}
		}
		
		// Return data or default values
		return NextResponse.json(data || {
			products: [],
			faqArticles: [],
			socialLinks: [],
			paymentInfo: {
				bankName: 'Techcombank - Ngân hàng TMCP Kỹ thương Việt Nam',
				accountNumber: 'MS00T09331707449347',
				accountName: 'SHINE SHOP',
				qrTemplate: 'compact',
				wiseEmail: 'payment@shineshop.org',
				paypalEmail: 'paypal@shineshop.org'
			},
			siteConfig: {
				heroTitle: 'Welcome to Shine Shop',
				heroQuote: 'Your trusted online shopping destination',
				contactLinks: {
					facebook: 'https://facebook.com/shineshop',
					whatsapp: 'https://wa.me/84123456789'
				}
			},
			tosContent: '',
			language: 'vi',
			theme: 'light'
		})
	} catch (error) {
		console.error('Error reading store data:', error)
		return NextResponse.json({ error: 'Failed to read data' }, { status: 500 })
	}
}

// POST: Save store data
export async function POST(request: NextRequest) {
	try {
		// Get data from request body
		const data = await request.json()
		
		// Validate data structure
		if (!data || typeof data !== 'object') {
			return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
		}
		
		const dataString = JSON.stringify(data, null, 2)
		const timestamp = Date.now()
		
		if (isCloudflare && process.env.STORE_KV) {
			// Use Cloudflare KV in production
			const kv = process.env.STORE_KV as any
			
			// Save main data
			await kv.put(KV_KEY, dataString)
			
			// Save backup
			const backupKey = `${KV_BACKUP_PREFIX}${timestamp}`
			await kv.put(backupKey, dataString, {
				expirationTtl: 86400 * 7 // Keep backups for 7 days
			})
			
			// Clean old backups (KV will auto-expire them after 7 days)
		} else {
			// Use file system in development
			await ensureDataDirectory()
			
			// Save data to file
			await fs.writeFile(DATA_FILE_PATH, dataString, 'utf-8')
			
			// Also create a backup with timestamp
			const backupPath = path.join(process.cwd(), 'data', `store-backup-${timestamp}.json`)
			await fs.writeFile(backupPath, dataString, 'utf-8')
			
			// Keep only the last 5 backups
			const files = await fs.readdir(path.join(process.cwd(), 'data'))
			const backupFiles = files
				.filter(f => f.startsWith('store-backup-') && f.endsWith('.json'))
				.sort()
				.reverse()
			
			// Delete old backups
			for (let i = 5; i < backupFiles.length; i++) {
				await fs.unlink(path.join(process.cwd(), 'data', backupFiles[i]))
			}
		}
		
		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error saving store data:', error)
		return NextResponse.json({ error: 'Failed to save data' }, { status: 500 })
	}
} 