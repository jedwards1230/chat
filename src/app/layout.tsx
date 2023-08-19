import { Suspense } from 'react';
import { Metadata } from 'next';
import { ClerkProvider, auth } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/react';

import './globals.css';
import Providers from '@/providers';
import { ChatProvider } from '@/providers/ChatProvider';
import supabase from '@/lib/supabase.server';
import {
    getCharacterListByUserId,
    getThreadListByUserId,
} from '@/utils/server/supabase';

const APP_NAME = 'Chat';
const APP_DEFAULT_TITLE = 'Chat';
const APP_TITLE_TEMPLATE = 'Chat | %s';
const APP_DESCRIPTION = 'Chat';

export const metadata: Metadata = {
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
    ),
    applicationName: APP_NAME,
    title: {
        default: APP_DEFAULT_TITLE,
        template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    manifest: '/manifest.json',
    themeColor: '#262626',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: APP_DEFAULT_TITLE,
        // startUpImage: [],
    },
    formatDetection: {
        telephone: false,
    },
    openGraph: {
        url: '/api/og',
        images: ['/api/og'],
        type: 'website',
        siteName: APP_NAME,
        title: {
            default: APP_DEFAULT_TITLE,
            template: APP_TITLE_TEMPLATE,
        },
        description: APP_DESCRIPTION,
    },
    twitter: {
        card: 'summary',
        title: {
            default: APP_DEFAULT_TITLE,
            template: APP_TITLE_TEMPLATE,
        },
        description: APP_DESCRIPTION,
    },
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = auth();

    const { data, error } = await supabase
        .from('users')
        .select('userid')
        .eq('userid', userId);

    if (data?.length === 0) {
        const { data, error } = await supabase
            .from('users')
            .insert([{ userid: userId }]);
    }

    const [threads, characterList] = await Promise.all([
        getThreadListByUserId(userId!),
        getCharacterListByUserId(userId!),
    ]);

    return (
        <ClerkProvider>
            <html lang="en" suppressHydrationWarning={true}>
                <body className="bg-neutral-100 transition-colors dark:bg-neutral-900 dark:text-neutral-100">
                    <Suspense
                        fallback={
                            <div className="flex h-full w-full items-center justify-center">
                                <p>Loading...</p>
                            </div>
                        }
                    >
                        <Providers>
                            <ChatProvider
                                threadList={threads}
                                characterList={characterList}
                            >
                                <div className="relative flex h-full w-full flex-col">
                                    {children}
                                </div>
                            </ChatProvider>
                        </Providers>
                    </Suspense>
                    <Analytics />
                </body>
            </html>
        </ClerkProvider>
    );
}
