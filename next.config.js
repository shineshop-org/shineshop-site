/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development'
const isDeployment = process.env.CF_PAGES === '1' || process.env.CLOUDFLARE === '1'

const nextConfig = {
	// Use standalone in development for middleware support, export for production deployment
	output: isDev ? undefined : 'export',
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
	}
}

module.exports = nextConfig 