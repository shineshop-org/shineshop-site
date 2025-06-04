/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'export',
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
	// Add experimental rewrites for static hosting (Cloudflare Pages)
	async exportPathMap(defaultPathMap, { dev, dir, outDir, distDir, buildId }) {
		return {
			...defaultPathMap,
			// Handle any path like /service/2fa/* by serving the 2FA page
			'/service/2fa/dummy-path': { page: '/service/2fa' },
		};
	},
}

module.exports = nextConfig 