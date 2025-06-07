/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development'
const isDeployment = process.env.CF_PAGES === '1' || process.env.CLOUDFLARE === '1'

const nextConfig = {
	// Configure for Cloudflare Pages deployment
	// Only use static export for production deployment, not development
	...(isDeployment && { output: 'export' }),
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
	skipTrailingSlashRedirect: true,
	
	// Disable source maps in production to reduce build size
	productionBrowserSourceMaps: false,
	
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
	
	// Disable caching to force fresh build
	onDemandEntries: {
		// Keep entries in memory for much shorter time
		maxInactiveAge: 0,
	},
	
	// Force page rebuilds on each deployment with timestamp
	generateBuildId: async () => {
		return `build-${Date.now()}`
	},
	
	// Ensure all dependencies are included in the build
	experimental: {
		// Include data dependencies in the build
		outputFileTracingIncludes: {
			'/**': ['./app/lib/**/*']
		}
	},
	
	// Disable build cache
	swcMinify: true, // Enable SWC minifier but without caching
	webpack: (config, { dev, isServer }) => {
		// Disable webpack caching in production
		if (!dev) {
			config.cache = false;
		}
		return config;
	},
}

module.exports = nextConfig 