import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'store-data.json')
const BACKUP_DIR = path.join(process.cwd(), 'data')

// Ensure data directory exists
function ensureDataDir() {
	if (!fs.existsSync(BACKUP_DIR)) {
		fs.mkdirSync(BACKUP_DIR, { recursive: true })
	}
}

// Create backup of current data
function createBackup(data: any) {
	try {
		ensureDataDir()
		const timestamp = Date.now()
		const backupPath = path.join(BACKUP_DIR, `store-backup-${timestamp}.json`)
		fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), 'utf-8')
		
		// Keep only last 5 backups
		const backupFiles = fs.readdirSync(BACKUP_DIR)
			.filter(file => file.startsWith('store-backup-') && file.endsWith('.json'))
			.sort()
		
		if (backupFiles.length > 5) {
			const filesToDelete = backupFiles.slice(0, backupFiles.length - 5)
			filesToDelete.forEach(file => {
				try {
					fs.unlinkSync(path.join(BACKUP_DIR, file))
				} catch (error) {
					console.warn('Failed to delete old backup:', file, error)
				}
			})
		}
	} catch (error) {
		console.warn('Failed to create backup:', error)
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
		const data = JSON.parse(fileContent)
		
		return NextResponse.json(data)
	} catch (error) {
		console.error('Error getting store data:', error)
		return NextResponse.json(
			{ error: 'Failed to get store data' },
			{ status: 500 }
		)
	}
}

export async function POST(request: NextRequest) {
	try {
		const data = await request.json()
		
		ensureDataDir()
		
		// Create backup before saving new data
		if (fs.existsSync(DATA_FILE_PATH)) {
			try {
				const currentData = JSON.parse(fs.readFileSync(DATA_FILE_PATH, 'utf-8'))
				createBackup(currentData)
			} catch (error) {
				console.warn('Failed to read current data for backup:', error)
			}
		}
		
		// Save data to file
		fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8')
		
		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error saving store data:', error)
		return NextResponse.json(
			{ error: 'Failed to save store data' },
			{ status: 500 }
		)
	}
} 