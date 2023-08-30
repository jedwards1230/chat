'use client';

import { ThemeProvider } from 'next-themes';
import { UIProvider } from './UIProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class">
            <UIProvider>{children}</UIProvider>
        </ThemeProvider>
    );
}
