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

// Đọc dữ liệu từ file
function readStoreData() {
	try {
		if (!fs.existsSync(DATA_FILE_PATH)) {
			// Nếu file không tồn tại, trả về đối tượng rỗng
			return {}
		}
		
		const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf-8')
		return safeJsonParse(fileContent)
	} catch (error) {
		console.error('Error reading store data:', error)
		// Trả về đối tượng rỗng nếu có lỗi
		return {}
	}
}

export async function GET() {
	try {
		ensureDataDir()
		
		// Đọc dữ liệu từ file
		const data = readStoreData()
		
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
		
		// Đọc dữ liệu từ request
		try {
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
		
		// Đọc dữ liệu hiện tại để merge
		const existingData = readStoreData();
		
		// Tạo backup trước khi cập nhật
		createBackup(existingData);
		
		// Merge dữ liệu từ request vào dữ liệu hiện tại
		const mergedData = { ...existingData, ...data };
		
		// Sanitize descriptions to handle special characters
		if (mergedData.products && Array.isArray(mergedData.products)) {
			mergedData.products = mergedData.products.map((product: any) => {
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
		
		// Save data to file with error handling
		try {
			fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(mergedData, null, 2), 'utf-8')
			
			return NextResponse.json({ 
				success: true,
				message: 'Data updated successfully'
			});
		} catch (writeError) {
			console.error('Error writing store data:', writeError);
			return NextResponse.json(
				{ error: 'Failed to write store data', message: (writeError as Error).message },
				{ status: 200 } // Vẫn trả về 200 để tránh refresh trang
			);
		}
	} catch (error) {
		console.error('Error processing store data request:', error);
		return NextResponse.json(
			{ error: 'Failed to process store data request', message: (error as Error).message },
			{ status: 200 } // Trả về 200 thay vì 500 để tránh refresh trang
		);
	}
} 