// This script sets the GITHUB_TOKEN environment variable for development
// Run it with: node scripts/set-github-token.js YOUR_GITHUB_TOKEN

const fs = require('fs');
const path = require('path');

// Get the token from command line arguments
const token = process.argv[2];

if (!token) {
  console.error('Please provide a GitHub token as an argument');
  console.error('Usage: node scripts/set-github-token.js YOUR_GITHUB_TOKEN');
  process.exit(1);
}

// Create or update .env.local file
const envFilePath = path.join(process.cwd(), '.env.local');
const envContent = `GITHUB_TOKEN=${token}\n`;

fs.writeFileSync(envFilePath, envContent);

console.log('.env.local file created with GITHUB_TOKEN');
console.log('Restart your Next.js development server to apply changes'); 