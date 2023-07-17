'use client';

import { ThemeProvider } from 'next-themes';

import Dialogs from '@/components/Dialogs';
import { ChatProvider } from './ChatProvider';

export default function Providers({
    children,
    userId,
    history,
}: {
    children: React.ReactNode;
    userId: string | null;
    history: SaveData | null;
}) {
    return (
        <ThemeProvider>
            {userId ? (
                <ChatProvider history={history}>
                    {children}
                    <Dialogs />
                </ChatProvider>
            ) : (
                children
            )}
        </ThemeProvider>
    );
}
