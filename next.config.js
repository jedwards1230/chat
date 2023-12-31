const withPWA = require('@ducanh2912/next-pwa').default({
    dest: 'public',
});

const { withPlausibleProxy } = require('next-plausible');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(
    withPWA(
        withPlausibleProxy()({
            images: {
                remotePatterns: [
                    {
                        protocol: 'https',
                        hostname: 'avatars.githubusercontent.com',
                    },
                ],
            },
        }),
    ),
);
