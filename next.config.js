const withPWA = require('@ducanh2912/next-pwa').default({
    dest: 'public',
});

const { withPlausibleProxy } = require('next-plausible');

module.exports = withPWA({
    experimental: {
        serverActions: true,
        webVitalsAttribution: ['CLS', 'LCP', 'FCP', 'FID', 'INP', 'TTFB'],
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'img.clerk.com',
            },
            {
                protocol: 'https',
                hostname: 'images.clerk.dev',
            },
        ],
    },
});

module.exports = withPlausibleProxy()(
    withPWA({
        experimental: {
            serverActions: true,
            webVitalsAttribution: ['CLS', 'LCP', 'FCP', 'FID', 'INP', 'TTFB'],
        },
        images: {
            remotePatterns: [
                {
                    protocol: 'https',
                    hostname: 'img.clerk.com',
                },
                {
                    protocol: 'https',
                    hostname: 'images.clerk.dev',
                },
            ],
        },
    }),
);
