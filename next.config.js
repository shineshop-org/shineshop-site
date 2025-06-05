/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development'
const isDeployment = process.env.CF_PAGES === '1' || process.env.CLOUDFLARE === '1'
const { copyFileSync, existsSync } = require('fs')
const { join } = require('path')

// This function copies important files to the output directory
const copyImportantFiles = () => {
	const files = ['_redirects', '_routes.json']
	const outputDir = '.next'
	
	files.forEach(file => {
		if (existsSync(file)) {
			try {
				copyFileSync(file, join(outputDir, file))
				console.log(`Copied ${file} to ${outputDir}`)
			} catch (err) {
				console.error(`Error copying ${file}:`, err)
			}
		}
	})
}

const nextConfig = {
	// Configure for Cloudflare Pages deployment
	output: 'standalone',
	distDir: '.next',
	images: {
		unoptimized: true,
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
			},
			{
				protocol: 'https',
				hostname: 'img.vietqr.io',
			},
			{
				protocol: 'https',
				hostname: 'ik.imagekit.io',
			},
		],
	},
	// Disable features not supported in static export
	trailingSlash: true,
	
	// Add ESLint configuration to ignore errors during build
	eslint: {
		// Warning: This allows production builds to successfully complete even if
		// your project has ESLint errors.
		ignoreDuringBuilds: true,
	},
	typescript: {
		// !! WARN !!
		// Dangerously allow production builds to successfully complete even if
		// your project has type errors.
		ignoreBuildErrors: true,
	},
	// Copy important files after build
	onBuildComplete: copyImportantFiles
}

module.exports = nextConfig 