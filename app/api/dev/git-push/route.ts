import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: Request) {
	// Only allow in development
	if (process.env.NODE_ENV !== 'development') {
		return NextResponse.json(
			{ error: 'This endpoint is only available in development' },
			{ status: 403 }
		)
	}

	try {
		const { commands } = await request.json()

		if (!commands || !Array.isArray(commands)) {
			return NextResponse.json(
				{ error: 'Invalid commands' },
				{ status: 400 }
			)
		}

		// Execute git commands
		const results = []
		for (const command of commands) {
			try {
				const { stdout, stderr } = await execAsync(command)
				results.push({
					command,
					stdout: stdout.trim(),
					stderr: stderr.trim(),
					success: true
				})
			} catch (error: any) {
				results.push({
					command,
					error: error.message,
					success: false
				})
			}
		}

		return NextResponse.json({ results })
	} catch (error) {
		console.error('Error executing git commands:', error)
		return NextResponse.json(
			{ error: 'Failed to execute git commands' },
			{ status: 500 }
		)
	}
} 