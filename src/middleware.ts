import { authMiddleware } from '@clerk/nextjs';

// TODO: api routes should be auth verified
export default authMiddleware({
    publicRoutes: ['/', '/:path*', '/api/:path*', '/share/:path', '/api/og'],
});

export const config = {
    matcher: [
        '/((?!.*\\..*|_next).*)',
        '/',
        '/(api|trpc)(.*)',
        '/!share/:path',
    ],
};
