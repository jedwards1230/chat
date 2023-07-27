'use client';

import { ThemeProvider } from 'next-themes';
import { UIProvider } from './UIProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <UIProvider>{children}</UIProvider>
        </ThemeProvider>
    );
}
