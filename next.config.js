/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development'
const isDeployment = process.env.CF_PAGES === '1' || process.env.CLOUDFLARE === '1'

const nextConfig = {
	// Configure for Cloudflare Pages deployment
	// Use static export for Cloudflare Pages, but keep RSC functionality through next-on-pages adapter
	...(isDeployment && { output: 'export' }),
	
	// Make sure we have a longer fetch timeout for RSC payloads
	experimental: {
		fetchCacheKeyPrefix: 'v1',
		optimizePackageImports: ['react', 'react-dom', 'lucide-react'],
	},
	
	// External packages that should be handled by server components
	serverExternalPackages: [],
	
	distDir: '.next',
	images: {
		unoptimized: true,
		domains: ['ik.imagekit.io', 'images.unsplash.com', 'img.vietqr.io'],
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
		minimumCacheTTL: 0,
		disableStaticImages: false,
		dangerouslyAllowSVG: true,
		contentDispositionType: 'attachment',
		contentSecurityPolicy: "default-src 'self'; img-src 'self' https://ik.imagekit.io https://images.unsplash.com https://img.vietqr.io data:; connect-src 'self' https://ik.imagekit.io https://images.unsplash.com https://img.vietqr.io; script-src 'self';",
	},
	// Disable features not supported in static export
	trailingSlash: true,
	skipTrailingSlashRedirect: true,
	
	// Add redirects configuration - only used in development mode
	...(!isDeployment && {
		async redirects() {
			return [
				{
					source: '/sheet',
					destination: 'https://docs.google.com/spreadsheets/d/1ZYv6Q5JaDyc_geHP67g9F3PUNjpSbc31b3u4GR_o93o/edit?gid=1592107766#gid=1592107766',
					permanent: true,
				},
			];
		},
		
		// Add rewrites to handle 404s for RSC files - only used in development mode
		async rewrites() {
			return {
				beforeFiles: [
					// Handle missing RSC files
					{
						source: '/:path*\\.txt',
						destination: '/api/empty-response',
					},
				],
			};
		},
	}),
	
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
	
	// Keep build consistent for Cloudflare deployments
	generateBuildId: async () => {
		return 'stable-build-id'
	},
	
	// Headers for caching - modified for Cloudflare compatibility
	headers: async () => {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=3600, s-maxage=86400',
					},
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff',
					},
				],
			},
		];
	},
	
	// Simplified webpack config for better compatibility
	webpack: (config) => {
		return config;
	},
}

export default nextConfig 