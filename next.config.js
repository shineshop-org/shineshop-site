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
	experimental: {
		// Ensure app directory is used
		appDir: true,
	}
}

module.exports = nextConfig 