import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Configure as force-static for compatibility with static exports
export const dynamic = 'force-static'

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'store-data.json')
const BACKUP_DIR = path.join(process.cwd(), 'data')
const BACKUPS_DIR = path.join(process.cwd(), 'data', 'backups')

// Ensure data directory exists
function ensureDataDir() {
	if (!fs.existsSync(BACKUP_DIR)) {
		fs.mkdirSync(BACKUP_DIR, { recursive: true })
	}
	// Ensure backups directory exists
	if (!fs.existsSync(BACKUPS_DIR)) {
		fs.mkdirSync(BACKUPS_DIR, { recursive: true })
	}
}

// Create backup of current data
function createBackup(data: any) {
	try {
		ensureDataDir()
		const timestamp = Date.now()
		const backupPath = path.join(BACKUPS_DIR, `store-backup-${timestamp}.json`)
		fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), 'utf-8')
		
		// Keep only last 5 backups
		const backupFiles = fs.readdirSync(BACKUPS_DIR)
			.filter(file => file.startsWith('store-backup-') && file.endsWith('.json'))
			.sort()
		
		if (backupFiles.length > 5) {
			const filesToDelete = backupFiles.slice(0, backupFiles.length - 5)
			filesToDelete.forEach(file => {
				try {
					fs.unlinkSync(path.join(BACKUPS_DIR, file))
				} catch (error) {
					console.warn('Failed to delete old backup:', file, error)
				}
			})
		}
	} catch (error) {
		console.warn('Failed to create backup:', error)
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

export async function GET() {
	try {
		ensureDataDir()
		
		// Check if data file exists
		if (!fs.existsSync(DATA_FILE_PATH)) {
			return NextResponse.json(null)
		}
		
		// Read data from file
		const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf-8')
		const data = safeJsonParse(fileContent)
		
		return NextResponse.json(data)
	} catch (error) {
		console.error('Error getting store data:', error)
		return NextResponse.json(
			{ error: 'Failed to get store data', message: (error as Error).message },
			{ status: 500 }
		)
	}
}

export async function POST(request: NextRequest) {
	try {
		let data;
		
		// Kiểm tra Content-Type header nhưng không báo lỗi nếu nó không đúng
		const contentType = request.headers.get('content-type')
		
		try {
			// Thử parse request.json() trước (cách hiện tại)
			data = await request.json();
		} catch (jsonError) {
			try {
				// Nếu không được thì đọc text và parse thủ công
				const text = await request.text();
				data = safeJsonParse(text);
			} catch (textError) {
				console.error('Error parsing request:', textError);
				return NextResponse.json(
					{ error: 'Invalid JSON format in request body' },
					{ status: 200 } // Trả về 200 thay vì 400 để tương thích với store.ts
				);
			}
		}
		
		if (!data) {
			console.error('No data received');
			return NextResponse.json(
				{ error: 'No data received' },
				{ status: 200 } // Trả về 200 thay vì 400 để tương thích với store.ts
			);
		}
		
		ensureDataDir()
		
		// Create backup before saving new data
		if (fs.existsSync(DATA_FILE_PATH)) {
			try {
				const currentData = safeJsonParse(fs.readFileSync(DATA_FILE_PATH, 'utf-8'))
				createBackup(currentData)
			} catch (error) {
				console.warn('Failed to read current data for backup:', error)
			}
		}
		
		// Sanitize descriptions to handle special characters
		if (data.products && Array.isArray(data.products)) {
			data.products = data.products.map((product: any) => {
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
		
		// Save data to file
		fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8')
		
		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error saving store data:', error)
		return NextResponse.json(
			{ error: 'Failed to save store data', message: (error as Error).message },
			{ status: 500 }
		)
	}
} 