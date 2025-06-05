const fs = require('fs')
const path = require('path')

// Function to copy directory recursively, excluding certain patterns
function copyDir(src, dest, excludePatterns = []) {
	// Create destination directory if it doesn't exist
	if (!fs.existsSync(dest)) {
		fs.mkdirSync(dest, { recursive: true })
	}

	const entries = fs.readdirSync(src, { withFileTypes: true })

	for (const entry of entries) {
		const srcPath = path.join(src, entry.name)
		const destPath = path.join(dest, entry.name)

		// Check if should exclude
		const shouldExclude = excludePatterns.some(pattern => {
			if (typeof pattern === 'string') {
				return entry.name === pattern
			}
			return pattern.test(srcPath)
		})

		if (shouldExclude) {
			console.log(`Skipping: ${srcPath}`)
			continue
		}

		if (entry.isDirectory()) {
			copyDir(srcPath, destPath, excludePatterns)
		} else {
			// Check file size before copying
			const stats = fs.statSync(srcPath)
			const fileSizeMB = stats.size / (1024 * 1024)
			
			if (fileSizeMB > 25) {
				console.log(`Skipping large file (${fileSizeMB.toFixed(2)} MB): ${srcPath}`)
				continue
			}

			fs.copyFileSync(srcPath, destPath)
		}
	}
}

// Main build process
console.log('Building for Cloudflare Pages...')

// Create output directory
const outDir = 'out'
if (fs.existsSync(outDir)) {
	fs.rmSync(outDir, { recursive: true })
}
fs.mkdirSync(outDir)

// Copy .next directory, excluding cache and other unnecessary files
console.log('Copying .next directory...')
copyDir('.next', outDir, [
	'cache',           // Exclude cache directory entirely
	'trace',           // Exclude trace files
	/\.pack$/,         // Exclude webpack pack files
	/\.map$/,          // Exclude source maps in production
	'BUILD_ID',        // Not needed for static export
	'build-manifest.json',
	'react-loadable-manifest.json'
])

// Copy important files to root of output directory
const importantFiles = ['_redirects', '_routes.json']
for (const file of importantFiles) {
	if (fs.existsSync(file)) {
		fs.copyFileSync(file, path.join(outDir, file))
		console.log(`Copied ${file} to output directory`)
	}
}

// Also copy them to static directory for Next.js
const staticDir = path.join(outDir, 'static')
if (fs.existsSync(staticDir)) {
	for (const file of importantFiles) {
		if (fs.existsSync(file)) {
			const destPath = path.join(staticDir, file)
			if (!fs.existsSync(destPath)) {
				fs.copyFileSync(file, destPath)
				console.log(`Copied ${file} to static directory`)
			}
		}
	}
}

console.log('Build completed successfully!') 