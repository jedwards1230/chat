const withPWA = require("@ducanh2912/next-pwa").default({
	dest: "public",
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = withPWA({
	...nextConfig,
	experimental: {
		serverActions: true,
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.clerk.dev",
			},
		],
	},
});
