import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
    publicRoutes: ['/', '/share/:path', '/api/og'],
});

export const config = {
    matcher: [
        '/((?!.*\\..*|_next).*)',
        '/',
        '/(api|trpc)(.*)',
        '/!share/:path',
    ],
};
