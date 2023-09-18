'use client';

import { ThemeProvider } from 'next-themes';
import { UIProvider } from './UIProvider';
import { NextAuthProvider } from './AuthProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class">
            <NextAuthProvider>
                <UIProvider>{children}</UIProvider>
            </NextAuthProvider>
        </ThemeProvider>
    );
}
