'use client';

import { ThemeProvider } from 'next-themes';
import { UIProvider } from './UIProvider';
import { NextAuthProvider } from './AuthProvider';
import { ChatProvider } from './ChatProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class">
            <NextAuthProvider>
                <UIProvider>
                    <ChatProvider>{children}</ChatProvider>
                </UIProvider>
            </NextAuthProvider>
        </ThemeProvider>
    );
}
