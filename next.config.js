const withPWA = require('@ducanh2912/next-pwa').default({
    dest: 'public',
});

const { withPlausibleProxy } = require('next-plausible');

module.exports = withPWA(
    withPlausibleProxy()({
        experimental: {
            serverActions: true,
            webVitalsAttribution: ['CLS', 'LCP', 'FCP', 'FID', 'INP', 'TTFB'],
        },
        images: {
            remotePatterns: [
                {
                    protocol: 'https',
                    hostname: 'avatars.githubusercontent.com',
                },
            ],
        },
    }),
);
