import { Metadata } from 'next';
import PlausibleProvider from 'next-plausible';

import './globals.css';
import Providers from '@/providers';

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

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
            <head>
                <PlausibleProvider
                    domain="chat.jedwards.cc"
                    trackOutboundLinks={true}
                />
            </head>
            <body className="h-screen w-screen overflow-hidden bg-background text-foreground transition-colors">
                <Providers>
                    <div className="relative flex h-full w-full flex-col">
                        {children}
                    </div>
                </Providers>
            </body>
        </html>
    );
}
