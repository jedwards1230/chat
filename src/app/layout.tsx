import { Suspense } from 'react';
import './globals.css';
import Providers from '@/providers';
import { Metadata } from 'next';
import { ClerkProvider, auth } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/react';
import { ChatProvider } from '@/providers/ChatProvider';
import supabase from '@/lib/supabase';
import { getCloudData } from '@/utils/server';

const APP_NAME = 'Chat';
const APP_DEFAULT_TITLE = 'Chat';
const APP_TITLE_TEMPLATE = 'Chat | %s';
const APP_DESCRIPTION = 'Chat';

export const metadata: Metadata = {
    metadataBase: new URL('http://localhost:3000'),
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

    // check if userId in users table in supabase
    const { data, error } = await supabase
        .from('users')
        .select('userid')
        .eq('userid', userId);

    if (data?.length === 0) {
        // if not, add it
        const { data, error } = await supabase
            .from('users')
            .insert([{ userid: userId }]);
    }

    const { config, threads } = await getCloudData();

    return (
        <ClerkProvider>
            <html
                lang="en"
                className="overflow-hidden"
                suppressHydrationWarning={true}
            >
                <body className="overflow-hidden bg-neutral-100 transition-colors dark:bg-neutral-900 dark:text-neutral-100">
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
                                savedConfig={config}
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
