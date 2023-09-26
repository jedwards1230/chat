import { Metadata } from 'next';
import PlausibleProvider from 'next-plausible';

import './globals.css';
import Providers from '@/providers';
import { ChatProvider } from '@/providers/ChatProvider';
import supabase from '@/lib/supabase.server';
import {
    getCharacterListByUserId,
    getThreadListByUserId,
} from '@/utils/server/supabase';
import { auth } from '@/auth';

export const runtime = 'edge';

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
    const session = await auth();
    const userId = session?.user?.email;

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
        <html lang="en" suppressHydrationWarning={true}>
            <head>
                <PlausibleProvider
                    domain="chat.jedwards.cc"
                    trackOutboundLinks={true}
                />
            </head>
            <body className="w-screen h-screen overflow-hidden transition-colors bg-background text-foreground">
                <Providers>
                    <ChatProvider
                        threadList={threads}
                        characterList={characterList}
                    >
                        <div className="relative flex flex-col w-full h-full">
                            {children}
                        </div>
                    </ChatProvider>
                </Providers>
            </body>
        </html>
    );
}
