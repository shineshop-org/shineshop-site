import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import os from 'os'

// Configure as force-static for compatibility with static exports
export const dynamic = 'force-static'

const execPromise = promisify(exec)

// Function to check if git is installed and repository is configured
async function checkGitSetup() {
  try {
    // Check if git is installed
    await execPromise('git --version')
    
    // Check if we're in a git repository
    await execPromise('git rev-parse --is-inside-work-tree', { cwd: process.cwd() })
    
    // Check remote configuration
    const { stdout: remoteOutput } = await execPromise('git remote -v', { cwd: process.cwd() })
    
    return {
      success: true,
      gitInfo: {
        remotes: remoteOutput
      }
    }
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    }
  }
}

// Function to check if stderr contains only harmless warnings
function isHarmlessWarning(stderr: string): boolean {
  // Check if it's just line ending warnings (CRLF)
  if (stderr.includes('warning: in the working copy') && 
      (stderr.includes('CRLF') || stderr.includes('LF'))) {
    return true
  }

  // Check if it contains only hint messages
  if (stderr.trim().startsWith('hint:')) {
    return true
  }

  // Check for other harmless git warnings
  const harmlessPatterns = [
    'warning: LF will be replaced by CRLF',
    'warning: CRLF will be replaced by LF',
    'hint:',
    'warning: in the working copy'
  ]
  
  // Check if stderr only contains harmless patterns
  return harmlessPatterns.some(pattern => stderr.includes(pattern)) && 
         !stderr.includes('error:') && 
         !stderr.includes('fatal:');
}

// Function to check if git push was successful
function isSuccessfulPush(command: string, stderr: string): boolean {
  // If it's not a push command, this doesn't apply
  if (!command.includes('git push')) {
    return false
  }
  
  // Common successful push patterns
  const successPatterns = [
    // Pattern when changes are pushed
    /To .*\n.*[a-f0-9]+\.\.[a-f0-9]+ +\w+ -> \w+/,
    // Pattern when everything is up to date
    /Everything up-to-date/,
    // Pattern for GitHub URLs
    /To https:\/\/github\.com\//
  ]
  
  // Check for common error patterns
  const errorPatterns = [
    'error:',
    'fatal:',
    'Permission denied',
    'could not read Username',
    'Authentication failed',
    'could not read Password'
  ]
  
  // If any error patterns are present, it's not successful
  if (errorPatterns.some(pattern => stderr.includes(pattern))) {
    return false
  }
  
  // Check for success patterns
  return successPatterns.some(pattern => 
    typeof pattern === 'string' 
      ? stderr.includes(pattern) || stderr.includes(pattern) 
      : pattern.test(stderr)
  )
}

export async function POST(request: NextRequest) {
  try {
    // First, check if git is properly set up
    const gitSetup = await checkGitSetup()
    if (!gitSetup.success) {
      return NextResponse.json(
        { error: 'Git is not properly configured', details: gitSetup.error },
        { status: 500 }
      )
    }
    
    // Parse the request body
    const { commands } = await request.json()
    
    if (!Array.isArray(commands) || commands.length === 0) {
      return NextResponse.json(
        { error: 'Invalid commands format. Expected array of command strings.' },
        { status: 400 }
      )
    }

    // Use the commands directly without token authentication
    const results = []
    
    // Execute each command sequentially
    for (const command of commands) {
      try {
        console.log(`Executing command: ${command}`)
        
        const { stdout, stderr } = await execPromise(command, {
          cwd: process.cwd(),
        })
        
        results.push({
          command,
          success: true,
          stdout,
          stderr: stderr || ''
        })
        
        // Only treat as error if stderr contains actual errors, not just warnings
        // Or if it's a git push command, check specifically if it was successful
        if (stderr && 
            !stderr.includes('Warning') && 
            !stderr.includes('hint:') && 
            !isHarmlessWarning(stderr) && 
            !(command.includes('git push') && isSuccessfulPush(command, stderr))) {
          
          console.error(`Command '${command}' error:`, stderr)
          return NextResponse.json(
            { 
              error: `Command failed: ${command}`, 
              details: stderr,
              results
            },
            { status: 500 }
          )
        }
        
        console.log(`Command '${command}' output:`, stdout)
      } catch (error) {
        const errorMessage = (error as Error).message
        
        console.error(`Command exception:`, errorMessage)
        return NextResponse.json(
          { 
            error: 'Command failed with exception', 
            details: errorMessage,
            results
          },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Git commands executed successfully',
      results
    })
  } catch (error) {
    console.error('Error executing git commands:', error)
    return NextResponse.json(
      { error: 'Failed to execute git commands', details: (error as Error).message },
      { status: 500 }
    )
  }
} 