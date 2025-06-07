import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import os from 'os'

const execPromise = promisify(exec)

export async function GET() {
  try {
    const results = {
      environment: {
        platform: process.platform,
        nodeVersion: process.version,
        username: os.userInfo().username,
        homedir: os.homedir(),
        cwd: process.cwd()
      },
      git: {} as Record<string, any>
    }
    
    // Check if git is installed
    try {
      const { stdout: gitVersion } = await execPromise('git --version')
      results.git.version = gitVersion.trim()
    } catch (error) {
      results.git.version = `Error: ${(error as Error).message}`
    }
    
    // Check repository status
    try {
      const { stdout: gitStatus } = await execPromise('git status')
      results.git.status = gitStatus.trim()
    } catch (error) {
      results.git.status = `Error: ${(error as Error).message}`
    }
    
    // Check git remotes
    try {
      const { stdout: gitRemotes } = await execPromise('git remote -v')
      results.git.remotes = gitRemotes.trim()
    } catch (error) {
      results.git.remotes = `Error: ${(error as Error).message}`
    }
    
    // Check git user configuration
    try {
      const { stdout: gitUser } = await execPromise('git config user.name')
      const { stdout: gitEmail } = await execPromise('git config user.email')
      results.git.user = {
        name: gitUser.trim(),
        email: gitEmail.trim()
      }
    } catch (error) {
      results.git.user = `Error: ${(error as Error).message}`
    }
    
    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check git configuration',
      details: (error as Error).message
    }, { status: 500 })
  }
} 